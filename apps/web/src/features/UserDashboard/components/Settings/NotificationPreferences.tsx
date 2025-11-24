import React from 'react';

interface NotificationPreferencesProps {
    notifications: {
        bookings: boolean;
        messages: boolean;
        damageReports: boolean;
        reviews: boolean;
        updates: boolean;
        marketing: boolean;
    };
    updateNotificationPref: (key: string, value: boolean) => void;
}

export const NotificationPreferences: React.FC<NotificationPreferencesProps> = ({ notifications, updateNotificationPref }) => {
    return (
        <div className="pt-4 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Notification Preferences</h3>
            <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        className="w-4 h-4 text-brand-600 rounded"
                        checked={notifications.bookings}
                        onChange={(e) => updateNotificationPref('bookings', e.target.checked)}
                    />
                    <span className="text-sm text-gray-700">Email notifications for bookings</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        className="w-4 h-4 text-brand-600 rounded"
                        checked={notifications.messages}
                        onChange={(e) => updateNotificationPref('messages', e.target.checked)}
                    />
                    <span className="text-sm text-gray-700">Email notifications for messages</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        className="w-4 h-4 text-brand-600 rounded"
                        checked={notifications.damageReports}
                        onChange={(e) => updateNotificationPref('damageReports', e.target.checked)}
                    />
                    <span className="text-sm text-gray-700">Email notifications for damage reports</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        className="w-4 h-4 text-brand-600 rounded"
                        checked={notifications.reviews}
                        onChange={(e) => updateNotificationPref('reviews', e.target.checked)}
                    />
                    <span className="text-sm text-gray-700">Email notifications for reviews</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        className="w-4 h-4 text-brand-600 rounded"
                        checked={notifications.updates}
                        onChange={(e) => updateNotificationPref('updates', e.target.checked)}
                    />
                    <span className="text-sm text-gray-700">Platform updates and announcements</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        className="w-4 h-4 text-brand-600 rounded"
                        checked={notifications.marketing}
                        onChange={(e) => updateNotificationPref('marketing', e.target.checked)}
                    />
                    <span className="text-sm text-gray-700">Marketing emails</span>
                </label>
            </div>
        </div>
    );
};
