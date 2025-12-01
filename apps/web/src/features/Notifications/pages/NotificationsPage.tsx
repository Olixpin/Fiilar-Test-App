
import React, { useState, useEffect } from 'react';
import { Bell, Check, Trash2, AlertTriangle, Calendar, MessageSquare, Star, Info, Settings, Wallet } from 'lucide-react';
import { Notification } from '@fiilar/types';
import { getNotifications, markAllNotificationsAsRead, markNotificationAsRead, clearAllNotifications } from '@fiilar/notifications';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, ConfirmDialog } from '@fiilar/ui';

interface NotificationsPageProps {
    userId: string;
}

const NotificationsPage: React.FC<NotificationsPageProps> = ({ userId }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [filter, setFilter] = useState<'all' | 'unread' | 'urgent'>('all');
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    
    // Determine if we're in host dashboard based on current URL
    const isHostDashboard = location.pathname.includes('/host/');

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
        setShowClearConfirm(true);
    };

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.read) {
            handleMarkAsRead(notification.id);
        }

        // Navigate based on notification type
        // Navigate based on notification type
        import('@fiilar/storage').then(({ getCurrentUser }) => {
            const user = getCurrentUser();
            const isHost = user?.role === 'HOST';

            if (notification.type === 'booking') {
                if (isHost) {
                    navigate(`/host/dashboard?view=bookings&bookingId=${notification.metadata?.bookingId || ''}`);
                } else {
                    navigate(`/dashboard?tab=bookings&bookingId=${notification.metadata?.bookingId || ''}`);
                }
            } else if (notification.type === 'damage_report' && notification.metadata?.reportId) {
                if (isHost) {
                    // Navigate to notifications view in host dashboard for now, as specific damage report view might not exist
                    navigate(`/host/dashboard?view=notifications&reportId=${notification.metadata.reportId}`);
                } else {
                    navigate(`/dashboard?tab=notifications&reportId=${notification.metadata.reportId}`);
                }
            } else if (notification.type === 'review') {
                if (isHost) {
                    navigate('/host/dashboard?view=listings');
                } else {
                    navigate(`/listing/${notification.metadata?.listingId}`);
                }
            } else if (notification.type === 'payment' || notification.type === 'payout') {
                if (isHost) {
                    navigate('/host/dashboard?view=payouts');
                } else {
                    navigate('/dashboard?tab=payments');
                }
            } else if (notification.metadata?.link) {
                // Intercept generic links for hosts if they point to user dashboard
                if (isHost && notification.metadata.link.startsWith('/dashboard')) {
                    const target = notification.metadata.link.replace('/dashboard', '/host/dashboard').replace('tab=', 'view=');
                    navigate(target);
                } else {
                    navigate(notification.metadata.link);
                }
            }
        });
    };

    const getIcon = (notification: Notification) => {
        if (notification.severity === 'urgent') {
            return <AlertTriangle size={24} className="text-red-600" />;
        }

        switch (notification.type) {
            case 'damage_report':
                return <AlertTriangle size={24} className="text-red-600" />;
            case 'booking':
                return <Calendar size={24} className="text-blue-600" />;
            case 'message':
                return <MessageSquare size={24} className="text-purple-600" />;
            case 'review':
                return <Star size={24} className="text-yellow-600" />;
            case 'platform_update':
                if (notification.title.includes('Wallet') || notification.message.includes('wallet')) {
                    return <Wallet size={24} className="text-green-600" />;
                }
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
        if (filter === 'urgent') return n.severity === 'urgent' || n.severity === 'warning';
        return true;
    });

    const unreadCount = notifications.filter(n => !n.read).length;
    const urgentCount = notifications.filter(n => n.severity === 'urgent' || n.severity === 'warning').length;

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
        <div>
            {/* Header */}
            <div className="mb-8 flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
                    <p className="text-gray-600">Stay updated with your bookings, messages, and platform updates</p>
                </div>
                <Button
                    onClick={() => navigate(isHostDashboard ? '/host/dashboard?view=settings' : '/dashboard?tab=settings')}
                    variant="outline"
                    size="sm"
                    leftIcon={<Settings size={16} />}
                >
                    Preferences
                </Button>
            </div>

            {/* Filter Bar */}
            <div className="mb-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex gap-2 flex-wrap">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition ${filter === 'all'
                                ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            All ({notifications.length})
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition ${filter === 'unread'
                                ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            Unread ({unreadCount})
                        </button>
                        <button
                            onClick={() => setFilter('urgent')}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition ${filter === 'urgent'
                                ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            Urgent ({urgentCount})
                        </button>
                    </div>

                    {unreadCount > 0 && (
                        <Button
                            onClick={handleMarkAllAsRead}
                            variant="ghost"
                            size="sm"
                            leftIcon={<Check size={16} />}
                        >
                            Mark all as read
                        </Button>
                    )}
                    {notifications.length > 0 && (
                        <Button
                            onClick={handleClearAll}
                            variant="ghost"
                            size="sm"
                            leftIcon={<Trash2 size={16} />}
                            className="hover:text-red-600"
                        >
                            Clear all
                        </Button>
                    )}
                </div>
            </div>

            {/* Notifications List */}
            {filteredNotifications.length === 0 ? (
                <div className="py-20 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Bell size={32} className="text-gray-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications</h3>
                    <p className="text-gray-500">You're all caught up!</p>
                </div>
            ) : (
                Object.entries(groupedNotifications).map(([label, notifs]) => (
                    <div key={label} className="mb-8">
                        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 pl-2">{label}</h2>
                        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                            {notifs.map((notification, idx) => (
                                <div
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`p-6 cursor-pointer transition hover:bg-gray-50 group ${!notification.read ? 'bg-blue-50/30' : ''
                                        } ${idx !== notifs.length - 1 ? 'border-b border-gray-100' : ''}`}
                                >
                                    <div className="flex gap-4">
                                        <div className="shrink-0 mt-1">
                                            {getIcon(notification)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4 mb-1">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className={`font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>{notification.title}</h3>
                                                        {!notification.read && (
                                                            <div className="w-2 h-2 bg-brand-600 rounded-full"></div>
                                                        )}
                                                    </div>
                                                    <p className="text-gray-600 leading-relaxed text-sm">{notification.message}</p>
                                                </div>
                                                {getSeverityBadge(notification.severity)}
                                            </div>

                                            <div className="flex items-center justify-between mt-3">
                                                <span className="text-xs text-gray-400 font-medium">
                                                    {new Date(notification.createdAt).toLocaleTimeString('en-US', {
                                                        hour: 'numeric',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    {notification.actionRequired && (
                                                        <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full">
                                                            Action Required
                                                        </span>
                                                    )}
                                                    <button
                                                        onClick={(e) => handleDeleteNotification(notification.id, e)}
                                                        className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-gray-200 rounded-lg transition text-gray-400 hover:text-red-600"
                                                        title="Delete notification"
                                                    >
                                                        <Trash2 size={14} />
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

            {/* Clear All Confirmation Dialog */}
            <ConfirmDialog
                isOpen={showClearConfirm}
                title="Clear All Notifications?"
                message="This will permanently delete all your notifications. This action cannot be undone."
                confirmText="Clear All"
                cancelText="Cancel"
                variant="danger"
                onConfirm={() => {
                    clearAllNotifications(userId);
                    loadNotifications();
                    setShowClearConfirm(false);
                }}
                onCancel={() => setShowClearConfirm(false)}
            />
        </div>
    );
};

export default NotificationsPage;
