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

const Toggle: React.FC<{ checked: boolean; onChange: (checked: boolean) => void }> = ({ checked, onChange }) => (
    <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 ${checked ? 'bg-brand-600' : 'bg-gray-200'
            }`}
    >
        <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'
                }`}
        />
    </button>
);

export const NotificationPreferences: React.FC<NotificationPreferencesProps> = ({ notifications, updateNotificationPref }) => {
    const preferences = [
        { key: 'bookings', label: 'Booking Updates', description: 'Receive emails about new bookings and status changes.' },
        { key: 'messages', label: 'Messages', description: 'Get notified when you receive a new message.' },
        { key: 'damageReports', label: 'Damage Reports', description: 'Alerts for any reported damages or issues.' },
        { key: 'reviews', label: 'Reviews', description: 'Notifications when a guest leaves a review.' },
        { key: 'updates', label: 'Platform Updates', description: 'News about new features and improvements.' },
        { key: 'marketing', label: 'Marketing', description: 'Tips, trends, and special offers.' },
    ];

    return (
        <div className="pt-8 border-t border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Notification Preferences</h3>
            <p className="text-gray-500 text-sm mb-6">Choose what emails you want to receive.</p>

            <div className="space-y-8">
                {preferences.map((pref) => (
                    <div key={pref.key} className="flex items-start justify-between group">
                        <div className="pr-8">
                            <label className="text-sm font-semibold text-gray-900 block cursor-pointer mb-1 group-hover:text-brand-600 transition-colors" onClick={() => updateNotificationPref(pref.key, !notifications[pref.key as keyof typeof notifications])}>
                                {pref.label}
                            </label>
                            <p className="text-sm text-gray-500 leading-relaxed">{pref.description}</p>
                        </div>
                        <Toggle
                            checked={notifications[pref.key as keyof typeof notifications]}
                            onChange={(checked) => updateNotificationPref(pref.key, checked)}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};
