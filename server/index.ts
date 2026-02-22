import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import session from "express-session";
import MongoStore from "connect-mongo";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { connectMongoDB } from "./mongodb";

const app = express();
const isProduction = process.env.NODE_ENV === 'production';

// ============================================
// SECURITY MIDDLEWARE
// ============================================

// Helmet - Security headers
// Helmet - Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Needed for Vite/React dev
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'", isProduction ? "" : "ws://localhost:*:*", "https://*.googleapis.com"], // Allow WS for Vite HMR
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: isProduction ? [] : null,
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: isProduction
    ? process.env.ALLOWED_ORIGINS?.split(',')
    : true,
  credentials: true,
}));

// Rate limiting - General API
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: { message: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting - Auth routes (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 login attempts per window
  message: { message: 'Too many login attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting - AI routes (prevent API abuse)
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 AI requests per hour
  message: { message: 'AI request limit reached, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiters
app.use('/api/', generalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);
app.use('/api/ai/', aiLimiter);
app.use('/api/v1/ai/', aiLimiter);

// ============================================
// BODY PARSING
// ============================================

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}

app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  },
  limit: '10mb', // For X-ray image uploads
}));
app.use(express.urlencoded({ extended: false }));

// ============================================
// SESSION CONFIGURATION (MongoDB Auth)
// ============================================

const sessionSecret = process.env.SESSION_SECRET;
// SECURITY: Enforce strong session secret in production
if (!sessionSecret || sessionSecret.length < 64) {
  if (isProduction) {
    console.error('❌ CRITICAL: SESSION_SECRET is missing or too short (min 64 chars) in production!');
    console.error('   Generate a strong secret with: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"');
    process.exit(1);
  }
  console.warn('⚠️  SESSION_SECRET is missing or too short. Using fallback for development only.');
}

app.set("trust proxy", 1);
const sessionConfig = session({
  secret: sessionSecret || 'dev-fallback-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    ttl: 7 * 24 * 60 * 60, // 7 days
    collectionName: 'sessions',
  }),
  cookie: {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
});
app.use(sessionConfig);
app.set('session-middleware', sessionConfig); // Store for WebSocket


// ============================================
// REQUEST LOGGING
// ============================================

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// ============================================
// SERVER STARTUP
// ============================================

(async () => {
  await connectMongoDB();

  const server = await registerRoutes(app);

  // Global error handler - must be registered AFTER routes
  // Uses our custom error handler for production-safe error responses
  const { errorHandlerMiddleware } = await import('./utils/errorHandler');
  app.use(errorHandlerMiddleware);

  // Setup Vite for development or serve static for production
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Initialize WebSocket
  const { initializeWebSocket } = await import('./websocket');
  const sessionMiddleware = app.get('session-middleware'); // Get from app settings
  if (!sessionMiddleware) {
    console.warn('⚠️  Session middleware not found, WebSocket may have auth issues');
  }
  const websocket = initializeWebSocket(server, sessionMiddleware || session);
  (global as any).websocketServer = websocket;

  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
    log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    log(`WebSocket: Enabled ✓`);
  });
})();
