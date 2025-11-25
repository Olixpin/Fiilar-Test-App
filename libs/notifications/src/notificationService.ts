import { Notification } from '@fiilar/types';

const STORAGE_KEYS = {
    NOTIFICATIONS: 'fiilar_notifications',
};

/**
 * Get all notifications for a user
 */
export const getNotifications = (userId: string): Notification[] => {
    const n = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    const notifications: Notification[] = n ? JSON.parse(n) : [];
    return notifications
        .filter(notif => notif.userId === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

/**
 * Get unread notification count
 */
export const getUnreadCount = (userId: string): number => {
    const notifications = getNotifications(userId);
    return notifications.filter(n => !n.read).length;
};

/**
 * Add a new notification
 */
export const addNotification = (notification: Omit<Notification, 'id' | 'createdAt'>): void => {
    const n = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    const notifications: Notification[] = n ? JSON.parse(n) : [];

    const newNotification: Notification = {
        ...notification,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString()
    };

    notifications.push(newNotification);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
};

/**
 * Mark a single notification as read
 */
export const markNotificationAsRead = (notificationId: string) => {
    const n = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    const notifications: Notification[] = n ? JSON.parse(n) : [];

    const idx = notifications.findIndex(notif => notif.id === notificationId);
    if (idx >= 0) {
        notifications[idx].read = true;
        localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    }
};

/**
 * Mark all notifications as read for a user
 */
export const markAllNotificationsAsRead = (userId: string) => {
    const n = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    const notifications: Notification[] = n ? JSON.parse(n) : [];

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
    }
};

/**
 * Clear all notifications for a user
 */
export const clearAllNotifications = (userId: string) => {
    const n = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    const notifications: Notification[] = n ? JSON.parse(n) : [];

    // Keep notifications that don't belong to this user
    const remainingNotifications = notifications.filter(notif => notif.userId !== userId);

    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(remainingNotifications));
};
