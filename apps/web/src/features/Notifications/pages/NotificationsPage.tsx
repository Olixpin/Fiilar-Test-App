import React, { useState, useEffect } from 'react';
import { Bell, Check, Trash2, AlertTriangle, Calendar, MessageSquare, Star, Info, Settings } from 'lucide-react';
import { Notification } from '@fiilar/types';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, clearAllNotifications } from '../../../services/storage';
import { useNavigate } from 'react-router-dom';

interface NotificationsPageProps {
    userId: string;
}

const NotificationsPage: React.FC<NotificationsPageProps> = ({ userId }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [filter, setFilter] = useState<'all' | 'unread' | 'urgent'>('all');
    const navigate = useNavigate();

    useEffect(() => {
        loadNotifications();
    }, [userId]);

    const loadNotifications = () => {
        const allNotifications = getNotifications(userId);
        setNotifications(allNotifications);
    };

    const handleDeleteNotification = (notificationId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        // In production, this would call a delete API
        const updated = notifications.filter(n => n.id !== notificationId);
        setNotifications(updated);
    };

    const handleMarkAsRead = (notificationId: string) => {
        markNotificationAsRead(notificationId);
        loadNotifications();
    };

    const handleMarkAllAsRead = () => {
        markAllNotificationsAsRead(userId);
        loadNotifications();
    };

    const handleClearAll = () => {
        if (window.confirm('Are you sure you want to clear all notifications?')) {
            clearAllNotifications(userId);
            loadNotifications();
        }
    };

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.read) {
            handleMarkAsRead(notification.id);
        }

        // Navigate based on notification type
        if (notification.metadata?.link) {
            navigate(notification.metadata.link);
        } else if (notification.type === 'damage_report' && notification.metadata?.reportId) {
            // Will navigate to damage report view
            navigate(`/dashboard?tab=notifications&reportId=${notification.metadata.reportId}`);
        }
    };

    const getIcon = (type: Notification['type'], severity: Notification['severity']) => {
        if (severity === 'urgent') {
            return <AlertTriangle size={24} className="text-red-600" />;
        }

        switch (type) {
            case 'damage_report':
                return <AlertTriangle size={24} className="text-red-600" />;
            case 'booking':
                return <Calendar size={24} className="text-blue-600" />;
            case 'message':
                return <MessageSquare size={24} className="text-purple-600" />;
            case 'review':
                return <Star size={24} className="text-yellow-600" />;
            case 'platform_update':
                return <Info size={24} className="text-brand-600" />;
            default:
                return <Bell size={24} className="text-gray-600" />;
        }
    };

    const getSeverityBadge = (severity: Notification['severity']) => {
        switch (severity) {
            case 'urgent':
                return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">Urgent</span>;
            case 'warning':
                return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">Warning</span>;
            default:
                return null;
        }
    };

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'unread') return !n.read;
        if (filter === 'urgent') return n.severity === 'urgent';
        return true;
    });

    const unreadCount = notifications.filter(n => !n.read).length;
    const urgentCount = notifications.filter(n => n.severity === 'urgent').length;

    // Group notifications by date
    const groupedNotifications = filteredNotifications.reduce((groups, notification) => {
        const date = new Date(notification.createdAt);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        let label = '';
        if (date.toDateString() === today.toDateString()) {
            label = 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            label = 'Yesterday';
        } else if (date > new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)) {
            label = 'This Week';
        } else {
            label = 'Older';
        }
        
        if (!groups[label]) groups[label] = [];
        groups[label].push(notification);
        return groups;
    }, {} as Record<string, Notification[]>);

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8 flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
                    <p className="text-gray-600">Stay updated with your bookings, messages, and platform updates</p>
                </div>
                <button
                    onClick={() => navigate('/dashboard?tab=settings')}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                    <Settings size={16} />
                    Preferences
                </button>
            </div>

            {/* Filter Bar */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex gap-2 flex-wrap">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === 'all'
                                    ? 'bg-brand-100 text-brand-700'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            All ({notifications.length})
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === 'unread'
                                    ? 'bg-brand-100 text-brand-700'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            Unread ({unreadCount})
                        </button>
                        <button
                            onClick={() => setFilter('urgent')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === 'urgent'
                                    ? 'bg-brand-100 text-brand-700'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            Urgent ({urgentCount})
                        </button>
                    </div>

                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllAsRead}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-brand-600 hover:text-brand-700 transition"
                        >
                            <Check size={16} />
                            Mark all as read
                        </button>
                    )}
                    {notifications.length > 0 && (
                        <button
                            onClick={handleClearAll}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-red-600 transition"
                        >
                            <Trash2 size={16} />
                            Clear all
                        </button>
                    )}
                </div>
            </div>

            {/* Notifications List */}
            {filteredNotifications.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                    <Bell size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications</h3>
                    <p className="text-gray-500">You're all caught up!</p>
                </div>
            ) : (
                Object.entries(groupedNotifications).map(([label, notifs]) => (
                    <div key={label} className="mb-8">
                        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{label}</h2>
                        <div className="space-y-3">
                            {notifs.map((notification) => (
                                <div
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer transition hover:shadow-md group ${!notification.read ? 'bg-blue-50 border-blue-200' : ''
                                        }`}
                                >
                                    <div className="flex gap-4">
                                        <div className="shrink-0">
                                            {getIcon(notification.type, notification.severity)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4 mb-2">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                                                {!notification.read && (
                                                    <div className="w-2 h-2 bg-brand-600 rounded-full"></div>
                                                )}
                                            </div>
                                            <p className="text-gray-700 leading-relaxed">{notification.message}</p>
                                        </div>
                                        {getSeverityBadge(notification.severity)}
                                    </div>

                                            <div className="flex items-center justify-between mt-4">
                                                <span className="text-sm text-gray-500">
                                                    {new Date(notification.createdAt).toLocaleTimeString('en-US', {
                                                        hour: 'numeric',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    {notification.actionRequired && (
                                                        <span className="text-sm font-semibold text-red-600">
                                                            Action Required
                                                        </span>
                                                    )}
                                                    <button
                                                        onClick={(e) => handleDeleteNotification(notification.id, e)}
                                                        className="opacity-0 group-hover:opacity-100 p-2 hover:bg-gray-100 rounded-lg transition"
                                                        title="Delete notification"
                                                    >
                                                        <Trash2 size={16} className="text-gray-400 hover:text-red-600" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default NotificationsPage;
