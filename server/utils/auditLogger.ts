import { AuditLogModel } from '../mongodb';
import logger from './logger';

export interface AuditLogParams {
    userId: string;
    action: string;
    entityType: string;
    entityId?: string | null;
    previousData?: any;
    newData?: any;
    ipAddress?: string;
    userAgent?: string;
}

/**
 * Logs a sensitive action to the database
 */
export async function logAudit(params: AuditLogParams) {
    try {
        await AuditLogModel.create({
            ...params,
            timestamp: new Date()
        });
    } catch (err) {
        logger.error('Failed to create audit log:', err);
        // We don't throw here to avoid breaking the main operation if logging fails
    }
}
