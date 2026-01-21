import { Router } from 'express';
import { storage } from '../storage';
import { requireAuth } from '../middleware/auth';
import logger from '../utils/logger';

const router = Router();

// Get all notifications for the current user
router.get('/', requireAuth, async (req, res) => {
    try {
        const userId = req.session.userId!;
        const unreadOnly = req.query.unreadOnly === 'true';

        const notifications = await storage.getNotifications(userId, unreadOnly);
        res.json(notifications);
    } catch (err: any) {
        logger.error('Error fetching notifications:', err);
        res.status(500).json({
            message: 'فشل في تحميل الإشعارات',
            messageEn: 'Failed to fetch notifications',
            error: err.message
        });
    }
});

// Get unread notification count
router.get('/count/unread', requireAuth, async (req, res) => {
    try {
        const userId = req.session.userId!;
        const count = await storage.getUnreadNotificationCount(userId);
        res.json({ count });
    } catch (err: any) {
        logger.error('Error fetching notification count:', err);
        res.status(500).json({
            message: 'فشل في تحميل عدد الإشعارات',
            messageEn: 'Failed to fetch notification count',
            error: err.message
        });
    }
});

// Mark a notification as read
router.patch('/:id/read', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.session.userId!;

        // Verify notification belongs to user
        const notification = await storage.getNotificationById(id);
        if (!notification) {
            return res.status(404).json({
                message: 'الإشعار غير موجود',
                messageEn: 'Notification not found'
            });
        }

        if (notification.userId !== userId) {
            return res.status(403).json({
                message: 'غير مصرح لك بالوصول لهذا الإشعار',
                messageEn: 'Access denied'
            });
        }

        const updatedNotification = await storage.markNotificationAsRead(id);
        res.json(updatedNotification);
    } catch (err: any) {
        logger.error(`Error marking notification ${req.params.id} as read:`, err);
        res.status(400).json({
            message: 'فشل في تحديث الإشعار',
            messageEn: 'Failed to update notification',
            error: err.message
        });
    }
});

// Mark all notifications as read
router.patch('/read-all', requireAuth, async (req, res) => {
    try {
        const userId = req.session.userId!;
        await storage.markAllNotificationsAsRead(userId);
        res.json({
            message: 'تم تحديد جميع الإشعارات كمقروءة',
            messageEn: 'All notifications marked as read'
        });
    } catch (err: any) {
        logger.error('Error marking all notifications as read:', err);
        res.status(500).json({
            message: 'فشل في تحديث الإشعارات',
            messageEn: 'Failed to update notifications',
            error: err.message
        });
    }
});

// Delete a notification
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.session.userId!;

        // Verify notification belongs to user
        const notification = await storage.getNotificationById(id);
        if (!notification) {
            return res.status(404).json({
                message: 'الإشعار غير موجود',
                messageEn: 'Notification not found'
            });
        }

        if (notification.userId !== userId) {
            return res.status(403).json({
                message: 'غير مصرح لك بحذف هذا الإشعار',
                messageEn: 'Access denied'
            });
        }

        await storage.deleteNotification(id);
        res.json({
            message: 'تم حذف الإشعار بنجاح',
            messageEn: 'Notification deleted successfully'
        });
    } catch (err: any) {
        logger.error(`Error deleting notification ${req.params.id}:`, err);
        res.status(400).json({
            message: 'فشل في حذف الإشعار',
            messageEn: 'Failed to delete notification',
            error: err.message
        });
    }
});

export default router;
