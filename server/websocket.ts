import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import type { Request } from 'express';
import logger from './utils/logger';

declare module 'socket.io' {
    interface Socket {
        userId?: string;
        userType?: string;
    }
}

export function initializeWebSocket(httpServer: HTTPServer, sessionMiddleware: any) {
    const io = new SocketIOServer(httpServer, {
        cors: {
            origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5000', 'http://localhost:5173'],
            credentials: true
        },
        // Connection configuration
        pingTimeout: 60000,
        pingInterval: 25000
    });

    // Authenticate socket connections using session middleware
    io.use((socket, next) => {
        const req = socket.request as Request;

        // Use Express session middleware to authenticate WebSocket
        sessionMiddleware(req, {} as any, () => {
            if (req.session && req.session.userId) {
                socket.userId = req.session.userId;
                socket.userType = req.session.userType;
                logger.info(`WebSocket authenticated: user ${socket.userId} (${socket.userType})`);
                next();
            } else {
                logger.warn('WebSocket authentication failed - no session');
                next(new Error('Unauthorized'));
            }
        });
    });

    io.on('connection', (socket) => {
        logger.info(`WebSocket connected: ${socket.id} (user: ${socket.userId})`);

        // Join user-specific room
        socket.join(`user:${socket.userId}`);

        // Join role-specific rooms
        if (socket.userType) {
            socket.join(`role:${socket.userType}`);
        }

        // Handle client subscribing to specific doctor's queue
        socket.on('subscribe:doctor-queue', (doctorId: string) => {
            socket.join(`doctor-queue:${doctorId}`);
            logger.info(`User ${socket.userId} subscribed to doctor queue: ${doctorId}`);
        });

        // Handle client unsubscribing from doctor queue
        socket.on('unsubscribe:doctor-queue', (doctorId: string) => {
            socket.leave(`doctor-queue:${doctorId}`);
            logger.info(`User ${socket.userId} unsubscribed from doctor queue: ${doctorId}`);
        });

        socket.on('disconnect', () => {
            logger.info(`WebSocket disconnected: ${socket.id}`);
        });
    });

    // Export helper functions for emitting events
    const emitPatientQueueUpdate = (doctorId: string, queueData: any) => {
        io.to(`doctor-queue:${doctorId}`).emit('patient-queue-update', queueData);
        logger.info(`Emitted queue update for doctor ${doctorId}`);
    };

    const emitAppointmentUpdate = (userId: string, appointmentData: any) => {
        io.to(`user:${userId}`).emit('appointment-update', appointmentData);
        logger.info(`Emitted appointment update to user ${userId}`);
    };

    const emitNotification = (userId: string, notification: any) => {
        io.to(`user:${userId}`).emit('notification', notification);
        logger.info(`Emitted notification to user ${userId}`);
    };

    logger.info('✅ WebSocket server initialized');

    return {
        io,
        emitPatientQueueUpdate,
        emitAppointmentUpdate,
        emitNotification
    };
}

export default initializeWebSocket;
