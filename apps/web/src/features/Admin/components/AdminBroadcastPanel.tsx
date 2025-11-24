import React, { useState } from 'react';
import { Megaphone, Send, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { addNotification, getAllUsers } from '../../../services/storage';

interface AdminBroadcastPanelProps {
    adminId: string;
}

const AdminBroadcastPanel: React.FC<AdminBroadcastPanelProps> = ({ adminId }) => {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState<'info' | 'warning' | 'urgent'>('info');
    const [actionRequired, setActionRequired] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleBroadcast = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim() || !message.trim()) {
            alert('Please fill in all fields');
            return;
        }

        setIsSending(true);

        try {
            // Get all users
            const users = getAllUsers();

            // Create notification for each user
            users.forEach(user => {
                addNotification({
                    userId: user.id,
                    type: 'platform_update',
                    title: title.trim(),
                    message: message.trim(),
                    severity,
                    read: false,
                    actionRequired,
                    metadata: {
                        link: '/dashboard?tab=notifications',
                        senderId: adminId
                    }
                });
            });

            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                setTitle('');
                setMessage('');
                setSeverity('info');
                setActionRequired(false);
            }, 3000);
        } catch (error) {
            alert('Failed to send broadcast');
            console.error(error);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-8 flex items-start gap-4">
                <div className="p-3 bg-brand-50 rounded-xl">
                    <Megaphone className="w-8 h-8 text-brand-600" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Broadcast</h1>
                    <p className="text-gray-600">Send platform-wide announcements to all users</p>
                </div>
            </div>

            {success ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={32} className="text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Broadcast Sent!</h3>
                    <p className="text-gray-600">All users have been notified</p>
                </div>
            ) : (
                <form onSubmit={handleBroadcast} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Announcement Title *
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., New Feature Release"
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
                            required
                        />
                    </div>

                    {/* Message */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Message *
                        </label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Write your announcement..."
                            rows={6}
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                            required
                        />
                    </div>

                    {/* Severity */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Severity Level
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                type="button"
                                onClick={() => setSeverity('info')}
                                className={`p-4 rounded-xl border-2 transition ${severity === 'info'
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <Info size={24} className="mx-auto mb-2 text-blue-600" />
                                <p className="text-sm font-medium">Info</p>
                            </button>
                            <button
                                type="button"
                                onClick={() => setSeverity('warning')}
                                className={`p-4 rounded-xl border-2 transition ${severity === 'warning'
                                        ? 'border-yellow-500 bg-yellow-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <AlertTriangle size={24} className="mx-auto mb-2 text-yellow-600" />
                                <p className="text-sm font-medium">Warning</p>
                            </button>
                            <button
                                type="button"
                                onClick={() => setSeverity('urgent')}
                                className={`p-4 rounded-xl border-2 transition ${severity === 'urgent'
                                        ? 'border-red-500 bg-red-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <AlertTriangle size={24} className="mx-auto mb-2 text-red-600" />
                                <p className="text-sm font-medium">Urgent</p>
                            </button>
                        </div>
                    </div>

                    {/* Action Required */}
                    <div>
                        <label className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={actionRequired}
                                onChange={(e) => setActionRequired(e.target.checked)}
                                className="w-4 h-4 text-brand-600 rounded"
                            />
                            <span className="text-sm font-medium text-gray-700">
                                Mark as "Action Required"
                            </span>
                        </label>
                        <p className="text-xs text-gray-500 mt-1 ml-7">
                            Users will see this notification as requiring immediate attention
                        </p>
                    </div>

                    {/* Warning */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-sm font-semibold text-yellow-900 mb-1">⚠️ Broadcast to All Users</p>
                        <p className="text-xs text-yellow-700">
                            This will send a notification to every user on the platform. Use responsibly.
                        </p>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isSending}
                        className="w-full px-6 py-3 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isSending ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Sending...
                            </>
                        ) : (
                            <>
                                <Send size={18} />
                                Send Broadcast
                            </>
                        )}
                    </button>
                </form>
            )}
        </div>
    );
};

export default AdminBroadcastPanel;
