import logger from './logger';

/**
 * Custom Application Error
 * Extends built-in Error with additional metadata
 */
export interface AppError extends Error {
    statusCode?: number;
    isOperational?: boolean;
    code?: string;
    messageEn?: string;  // English version of error message for bilingual support
}

/**
 * Create a custom application error
 * @param message - Error message (user-facing)
 * @param statusCode - HTTP status code (default: 500)
 * @param code - Error code for client identification
 * @returns AppError instance
 */
export function createError(
    message: string,
    statusCode: number = 500,
    code?: string
): AppError {
    const error: AppError = new Error(message);
    error.statusCode = statusCode;
    error.isOperational = true;  // Mark as expected/operational error
    error.code = code;
    return error;
}

/**
 * Sanitize error for client response
 * Prevents leaking stack traces and internal details in production
 * @param err - Error object to sanitize
 * @param isDevelopment - Whether running in development mode
 * @returns Sanitized error response object
 */
export function sanitizeError(err: any, isDevelopment: boolean = false) {
    const statusCode = err.statusCode || 500;

    // Development: Full error details for debugging
    if (isDevelopment) {
        return {
            success: false,
            message: err.message,
            messageEn: err.messageEn || err.message,
            statusCode,
            code: err.code,
            stack: err.stack,
            ...(err.errors && { errors: err.errors }) // Validation errors
        };
    }

    // Production: Sanitize error details
    if (err.isOperational) {
        // Known/expected errors: safe to show message
        return {
            success: false,
            message: err.message,
            messageEn: err.messageEn || err.message,
            statusCode,
            code: err.code
        };
    }

    // Unknown/unexpected errors: generic message + log details
    logger.error('Unexpected error:', {
        message: err.message,
        stack: err.stack,
        statusCode
    });

    return {
        success: false,
        message: 'حدث خطأ في الخادم. يرجى المحاولة لاحقاً.',
        messageEn: 'An internal server error occurred. Please try again later.',
        statusCode: 500,
        code: 'INTERNAL_ERROR'
    };
}

/**
 * Express error handler middleware
 * Use this as the last middleware in your Express app
 * 
 * Example usage in server/index.ts:
 * ```
 * import { errorHandlerMiddleware } from './utils/errorHandler';
 * app.use(errorHandlerMiddleware);
 * ```
 */
export function errorHandlerMiddleware(err: any, req: any, res: any, next: any) {
    const isDev = process.env.NODE_ENV !== 'production';
    const sanitized = sanitizeError(err, isDev);

    // Log all errors (even operational ones)
    if (!err.isOperational || isDev) {
        logger.error('Error handled by middleware:', {
            url: req.url,
            method: req.method,
            error: err.message,
            stack: err.stack,
            user: req.session?.userId
        });
    }

    res.status(sanitized.statusCode).json(sanitized);
}

/**
 * Common HTTP error creators
 */
export const errors = {
    badRequest: (message: string = 'طلب غير صالح', messageEn: string = 'Bad request') => {
        const err = createError(message, 400, 'BAD_REQUEST');
        err.messageEn = messageEn;
        return err;
    },

    unauthorized: (message: string = 'غير مصرح', messageEn: string = 'Unauthorized') => {
        const err = createError(message, 401, 'UNAUTHORIZED');
        err.messageEn = messageEn;
        return err;
    },

    forbidden: (message: string = 'ممنوع', messageEn: string = 'Forbidden') => {
        const err = createError(message, 403, 'FORBIDDEN');
        err.messageEn = messageEn;
        return err;
    },

    notFound: (resource: string = 'Resource') => {
        const message = `${resource} غير موجود`;
        const messageEn = `${resource} not found`;
        const err = createError(message, 404, 'NOT_FOUND');
        err.messageEn = messageEn;
        return err;
    },

    conflict: (message: string = 'تعارض في البيانات', messageEn: string = 'Data conflict') => {
        const err = createError(message, 409, 'CONFLICT');
        err.messageEn = messageEn;
        return err;
    },

    internalServer: (message: string = 'خطأ في الخادم', messageEn: string = 'Internal server error') => {
        const err = createError(message, 500, 'INTERNAL_ERROR');
        err.messageEn = messageEn;
        return err;
    },

    serviceUnavailable: (service: string = 'Service') => {
        const message = `${service} غير متاح حالياً`;
        const messageEn = `${service} is currently unavailable`;
        const err = createError(message, 503, 'SERVICE_UNAVAILABLE');
        err.messageEn = messageEn;
        return err;
    }
};

/**
 * Async route wrapper
 * Automatically catches errors in async route handlers and passes to error middleware
 * 
 * Example usage:
 * ```
 * router.get('/users', asyncHandler(async (req, res) => {
 *   const users = await storage.getUsers();
 *   res.json(users);
 * }));
 * ```
 */
export function asyncHandler(fn: Function) {
    return (req: any, res: any, next: any) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
