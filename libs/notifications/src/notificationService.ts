import { Notification } from '@fiilar/types';
import { safeJSONParse } from '@fiilar/utils';

const STORAGE_KEYS = {
    NOTIFICATIONS: 'fiilar_notifications',
};

/**
 * Notification Service
 * 
 * API ENDPOINTS (for backend implementation):
 * - GET    /api/notifications?userId=xxx - Get user notifications
 * - GET    /api/notifications/unread/count?userId=xxx - Get unread count
 * - POST   /api/notifications - Create notification
 * - PATCH  /api/notifications/:id/read - Mark as read
 * - PATCH  /api/notifications/read-all?userId=xxx - Mark all as read
 * - DELETE /api/notifications?userId=xxx - Clear all for user
 */

/**
 * Get all notifications for a user
 * API: GET /api/notifications?userId=xxx
 */
export const getNotifications = (userId: string): Notification[] => {
    console.log('📤 API CALL: GET /api/notifications', { userId });
    const n = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    const notifications: Notification[] = safeJSONParse(n, []);
    const userNotifs = notifications
        .filter(notif => notif.userId === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    console.log('✅ API RESPONSE: Retrieved', userNotifs.length, 'notifications');
    return userNotifs;
};

/**
 * Get unread notification count
 * API: GET /api/notifications/unread/count?userId=xxx
 */
export const getUnreadCount = (userId: string): number => {
    const notifications = getNotifications(userId);
    const count = notifications.filter(n => !n.read).length;
    console.log('✅ Unread count:', count);
    return count;
};

/**
 * Add a new notification
 * API: POST /api/notifications
 * Body: { userId, type, title, message, ... }
 */
export const addNotification = (notification: Omit<Notification, 'id' | 'createdAt'>): void => {
    console.log('📤 API CALL: POST /api/notifications', {
        userId: notification.userId,
        type: notification.type,
        title: notification.title
    });

    const n = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    const notifications: Notification[] = safeJSONParse(n, []);

    const newNotification: Notification = {
        ...notification,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString()
    };

    notifications.push(newNotification);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));

    console.log('✅ API RESPONSE: Notification created', { id: newNotification.id });

    // Dispatch event for real-time updates
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('fiilar:notification-updated', { detail: { notification: newNotification } }));
    }
};

/**
 * Mark a single notification as read
 * API: PATCH /api/notifications/:id/read
 */
export const markNotificationAsRead = (notificationId: string) => {
    console.log('📤 API CALL: PATCH /api/notifications/' + notificationId + '/read');
    const n = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    const notifications: Notification[] = safeJSONParse(n, []);

    const idx = notifications.findIndex(notif => notif.id === notificationId);
    if (idx >= 0) {
        notifications[idx].read = true;
        localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
        console.log('✅ API RESPONSE: Notification marked as read');
    }
};

/**
 * Mark all notifications as read for a user
 * API: PATCH /api/notifications/read-all?userId=xxx
 */
export const markAllNotificationsAsRead = (userId: string) => {
    console.log('📤 API CALL: PATCH /api/notifications/read-all', { userId });
    const n = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    const notifications: Notification[] = safeJSONParse(n, []);

    let hasUpdates = false;
    const updatedNotifications = notifications.map(notif => {
        if (notif.userId === userId && !notif.read) {
            hasUpdates = true;
            return { ...notif, read: true };
        }
        return notif;
    });

    if (hasUpdates) {
        localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updatedNotifications));
        console.log('✅ API RESPONSE: All notifications marked as read');
    }
};

/**
 * Clear all notifications for a user
 * API: DELETE /api/notifications?userId=xxx
 */
export const clearAllNotifications = (userId: string) => {
    console.log('📤 API CALL: DELETE /api/notifications', { userId });
    const n = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    const notifications: Notification[] = safeJSONParse(n, []);

    // Keep notifications that don't belong to this user
    const remainingNotifications = notifications.filter(notif => notif.userId !== userId);

    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(remainingNotifications));
    console.log('✅ API RESPONSE: Notifications cleared');
};
