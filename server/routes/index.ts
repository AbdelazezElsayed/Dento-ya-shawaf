import { Router } from 'express';
import { createServer, type Server } from 'http';
import type { Express } from 'express';
import mongoose from 'mongoose';

import authRoutes from './auth.routes';
import clinicsRoutes from './clinics.routes';
import doctorsRoutes from './doctors.routes';
import patientsRoutes from './patients.routes';
import appointmentsRoutes from './appointments.routes';
import paymentsRoutes from './payments.routes';
import aiRoutes from './ai.routes';
import dashboardRoutes from './dashboard.routes';
import adminRoutes from './admin.routes';
import ratingsRoutes from './ratings.routes';
import notificationsRoutes from './notifications.routes';

export function registerRoutes(app: Express): Server {
    const router = Router();

    // SERVER HEALTH CHECK (for Docker/Uptime)
    router.get('/health', (req, res) => {
        const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV,
            database: mongoStatus
        });
    });

    // STARTUP VALIDATION: Check required environment variables
    const requiredEnvVars = ['MONGODB_URI', 'SESSION_SECRET'];
    if (process.env.NODE_ENV === 'production') {
        // Enforce extra variables in production
        requiredEnvVars.push('ALLOWED_ORIGINS');
        // Note: GEMINI_API_KEY is not strictly required for server start, but needed for AI features
    }

    const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    if (missingVars.length > 0) {
        console.error('❌ CRITICAL ERROR: Missing required environment variables:');
        missingVars.forEach(v => console.error(`   - ${v}`));
        if (process.env.NODE_ENV === 'production') {
            console.error('   Server exiting due to missing configuration.');
            process.exit(1);
        } else {
            console.warn('   Running in development mode - keys may be missing but server will continue.');
        }
    }

    // Mount all route modules
    router.use('/auth', authRoutes);
    router.use('/clinics', clinicsRoutes);
    router.use('/doctors', doctorsRoutes);
    router.use('/patients', patientsRoutes);
    router.use('/appointments', appointmentsRoutes);
    router.use('/', paymentsRoutes); // Contains /visit-sessions, /payments, /patient/:id/balance, /clinic-prices
    router.use('/ai', aiRoutes);
    router.use('/dashboard', dashboardRoutes);
    router.use('/admin', adminRoutes); // Admin-only routes
    router.use('/ratings', ratingsRoutes); // Rating and review routes
    router.use('/notifications', notificationsRoutes); // User notifications

    // Also keep doctor today appointments at original path for compatibility
    router.get('/doctor/today-appointments', async (req, res) => {
        res.redirect('/api/v1/appointments/doctor/today');
    });

    // Mount versioned API routes at /api/v1/
    app.use('/api/v1', router);

    // Backward compatibility: /api/ redirects to /api/v1/
    app.use('/api', router);

    const httpServer = createServer(app);
    return httpServer;
}

export default registerRoutes;
