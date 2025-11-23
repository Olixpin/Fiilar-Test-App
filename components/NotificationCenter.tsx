import React, { useState, useEffect } from 'react';
import { Bell, X, AlertTriangle, Info, MessageSquare, Calendar, Star, CheckCircle } from 'lucide-react';
import { Notification } from '../types';
import { getNotifications, markNotificationAsRead, getUnreadCount } from '../services/storage';
import { useNavigate } from 'react-router-dom';

interface NotificationCenterProps {
    userId: string;
    onClose: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ userId, onClose }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const navigate = useNavigate();

    useEffect(() => {
        loadNotifications();
    }, [userId]);

    const loadNotifications = () => {
        const allNotifications = getNotifications(userId);
        setNotifications(allNotifications);
    };

    const handleMarkAsRead = (notificationId: string) => {
        markNotificationAsRead(notificationId);
        loadNotifications();
    };

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.read) {
            handleMarkAsRead(notification.id);
        }

        // Navigate based on notification type
        if (notification.metadata?.link) {
            navigate(notification.metadata.link);
            onClose();
        } else if (notification.type === 'damage_report' && notification.metadata?.reportId) {
            navigate(`/dashboard?tab=notifications&reportId=${notification.metadata.reportId}`);
            onClose();
        }
    };

    const getIcon = (type: Notification['type'], severity: Notification['severity']) => {
        if (severity === 'urgent') {
            return <AlertTriangle size={20} className="text-red-600" />;
        }

        switch (type) {
            case 'damage_report':
                return <AlertTriangle size={20} className="text-red-600" />;
            case 'booking':
                return <Calendar size={20} className="text-blue-600" />;
            case 'message':
                return <MessageSquare size={20} className="text-purple-600" />;
            case 'review':
                return <Star size={20} className="text-yellow-600" />;
            case 'platform_update':
                return <Info size={20} className="text-brand-600" />;
            default:
                return <Bell size={20} className="text-gray-600" />;
        }
    };

    const getSeverityColor = (severity: Notification['severity']) => {
        switch (severity) {
            case 'urgent':
                return 'bg-red-50 border-red-200';
            case 'warning':
                return 'bg-yellow-50 border-yellow-200';
            default:
                return 'bg-white border-gray-200';
        }
    };

    const filteredNotifications = filter === 'unread'
        ? notifications.filter(n => !n.read)
        : notifications;

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 max-h-[600px] flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-lg transition"
                        title="Close"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition ${filter === 'all'
                                ? 'bg-brand-100 text-brand-700'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        All ({notifications.length})
                    </button>
                    <button
                        onClick={() => setFilter('unread')}
                        className={`flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition ${filter === 'unread'
                                ? 'bg-brand-100 text-brand-700'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        Unread ({unreadCount})
                    </button>
                </div>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
                {filteredNotifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                        <Bell size={48} className="mb-3 opacity-20" />
                        <p className="text-sm">No notifications</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {filteredNotifications.map((notification) => (
                            <div
                                key={notification.id}
                                onClick={() => handleNotificationClick(notification)}
                                className={`p-4 cursor-pointer transition ${notification.read ? 'bg-white hover:bg-gray-50' : 'bg-blue-50 hover:bg-blue-100'
                                    } ${getSeverityColor(notification.severity)}`}
                            >
                                <div className="flex gap-3">
                                    <div className="shrink-0 mt-0.5">
                                        {getIcon(notification.type, notification.severity)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <h4 className="font-semibold text-gray-900 text-sm">
                                                {notification.title}
                                            </h4>
                                            {!notification.read && (
                                                <div className="w-2 h-2 bg-brand-600 rounded-full shrink-0 mt-1"></div>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                            {notification.message}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-500">
                                                {new Date(notification.createdAt).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: 'numeric',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                            {notification.actionRequired && (
                                                <span className="text-xs font-medium text-red-600">
                                                    Action Required
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
                <div className="p-3 border-t border-gray-200">
                    <button
                        onClick={() => {
                            navigate('/dashboard?tab=notifications');
                            onClose();
                        }}
                        className="w-full text-center text-sm font-medium text-brand-600 hover:text-brand-700 transition"
                    >
                        View All Notifications
                    </button>
                </div>
            )}
        </div>
    );
};

export default NotificationCenter;
