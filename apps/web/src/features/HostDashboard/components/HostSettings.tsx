import React, { useState } from 'react';
import { User as UserIcon, Settings as SettingsIcon, HelpCircle, Info, MessageSquare, Phone, Mail, MessageCircle, Star, Check, AlertTriangle, Trash2, FileText, Shield, Upload } from 'lucide-react';
import { User } from '@fiilar/types';

interface HostSettingsProps {
    user: User | null;
    onUpdateUser?: (updates: Partial<User>) => void;
}

type SettingsTab = 'account' | 'support' | 'about' | 'feedback';

const HostSettings: React.FC<HostSettingsProps> = ({ user, onUpdateUser }) => {
    const [activeTab, setActiveTab] = useState<SettingsTab>('account');
    
    // Profile Form State
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        bio: user?.bio || '',
        phone: user?.phone || ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [feedbackRating, setFeedbackRating] = useState(0);
    const [feedbackCategory, setFeedbackCategory] = useState('general');
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [showSavedToast, setShowSavedToast] = useState(false);
    const [notifications, setNotifications] = useState(() => {
        const saved = localStorage.getItem('host_notification_preferences');
        return saved ? JSON.parse(saved) : {
            newBookings: true,
            messages: true,
            reviews: true,
            updates: true,
            marketing: false
        };
    });

    const updateNotificationPref = (key: string, value: boolean) => {
        const updated = { ...notifications, [key]: value };
        setNotifications(updated);
        localStorage.setItem('host_notification_preferences', JSON.stringify(updated));
        
        // Show success toast
        setShowSavedToast(true);
        setTimeout(() => setShowSavedToast(false), 2000);
    };

    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            if (onUpdateUser) {
                onUpdateUser(formData);
            }
            
            setIsEditing(false);
            setShowSavedToast(true);
            setTimeout(() => setShowSavedToast(false), 2000);
        } catch (error) {
            console.error('Failed to update profile', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleFeedbackSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In production, this would send to your backend
        console.log('Feedback submitted:', { rating: feedbackRating, category: feedbackCategory, message: feedbackMessage });
        setFeedbackSubmitted(true);
        setTimeout(() => {
            setFeedbackSubmitted(false);
            setFeedbackRating(0);
            setFeedbackCategory('general');
            setFeedbackMessage('');
        }, 3000);
    };

    const handleDeleteAccount = () => {
        setIsDeleting(true);

        // In production, this would:
        // 1. Cancel all upcoming bookings
        // 2. Notify hosts/guests
        // 3. Delete user data from backend
        // 4. Clear local storage
        // 5. Redirect to home page

        setTimeout(() => {
            localStorage.clear();
            window.location.href = '/';
        }, 1500);
    };

    const tabs = [
        { id: 'account' as SettingsTab, label: 'Account', icon: UserIcon },
        { id: 'support' as SettingsTab, label: 'Support', icon: HelpCircle },
        { id: 'about' as SettingsTab, label: 'About', icon: Info },
        { id: 'feedback' as SettingsTab, label: 'Feedback', icon: MessageSquare },
    ];

    return (
        <div className="max-w-6xl mx-auto relative">
            {/* Success Toast */}
            {showSavedToast && (
                <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 fade-in">
                    <div className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
                        <Check size={20} />
                        <span className="font-medium">Preferences saved</span>
                    </div>
                </div>
            )}

            <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-brand-100 rounded-lg text-brand-600">
                    <SettingsIcon size={32} />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Host Settings</h1>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Sidebar Navigation */}
                <div className="md:w-64 shrink-0">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-2">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === tab.id
                                        ? 'bg-brand-50 text-brand-700 font-semibold'
                                        : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    <Icon size={20} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1">
                    {/* Account Settings */}
                    {activeTab === 'account' && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 mb-1">Host Profile</h2>
                                    <p className="text-gray-600 text-sm">Manage your host profile and preferences</p>
                                </div>
                                {!isEditing ? (
                                    <button 
                                        onClick={() => setIsEditing(true)}
                                        className="text-brand-600 font-medium text-sm hover:text-brand-700"
                                    >
                                        Edit Profile
                                    </button>
                                ) : (
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => setIsEditing(false)}
                                            className="text-gray-600 font-medium text-sm hover:text-gray-800 px-3 py-1.5"
                                            disabled={isSaving}
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            onClick={handleSaveProfile}
                                            disabled={isSaving}
                                            className="bg-brand-600 text-white font-medium text-sm px-4 py-1.5 rounded-lg hover:bg-brand-700 disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {isSaving ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Profile Picture */}
                            <div className="flex items-center gap-6 pb-6 border-b border-gray-200">
                                <div className="relative group">
                                    <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden">
                                        {user?.avatar ? (
                                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-brand-100 text-brand-600 text-2xl font-bold">
                                                {user?.name?.charAt(0) || 'U'}
                                            </div>
                                        )}
                                    </div>
                                    {isEditing && (
                                        <button 
                                            className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                            aria-label="Upload profile picture"
                                            title="Upload profile picture"
                                        >
                                            <Upload size={20} className="text-white" />
                                        </button>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Profile Picture</h3>
                                    <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="account-name" className="block text-sm font-semibold text-gray-900 mb-2">Name</label>
                                        <input
                                            id="account-name"
                                            type="text"
                                            value={isEditing ? formData.name : (user?.name || '')}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 ${isEditing ? 'border-gray-300 bg-white' : 'border-transparent bg-gray-50'}`}
                                            readOnly={!isEditing}
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="account-email" className="block text-sm font-semibold text-gray-900 mb-2">Email</label>
                                        <input
                                            id="account-email"
                                            type="email"
                                            value={isEditing ? formData.email : (user?.email || '')}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                            className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 ${isEditing ? 'border-gray-300 bg-white' : 'border-transparent bg-gray-50'}`}
                                            readOnly={!isEditing}
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="account-phone" className="block text-sm font-semibold text-gray-900 mb-2">Phone</label>
                                        <input
                                            id="account-phone"
                                            type="tel"
                                            value={isEditing ? formData.phone : (user?.phone || '')}
                                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                            placeholder={isEditing ? "+1 (555) 000-0000" : "Not set"}
                                            className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 ${isEditing ? 'border-gray-300 bg-white' : 'border-transparent bg-gray-50'}`}
                                            readOnly={!isEditing}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="account-bio" className="block text-sm font-semibold text-gray-900 mb-2">Host Bio</label>
                                    <textarea
                                        id="account-bio"
                                        value={isEditing ? formData.bio : (user?.bio || '')}
                                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                        placeholder={isEditing ? "Tell guests a bit about yourself..." : "No bio yet"}
                                        rows={3}
                                        className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none ${isEditing ? 'border-gray-300 bg-white' : 'border-transparent bg-gray-50'}`}
                                        readOnly={!isEditing}
                                    />
                                </div>

                                <div className="pt-4 border-t border-gray-200">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Notification Preferences</h3>
                                    <div className="space-y-3">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                className="w-4 h-4 text-brand-600 rounded" 
                                                checked={notifications.newBookings}
                                                onChange={(e) => updateNotificationPref('newBookings', e.target.checked)}
                                            />
                                            <span className="text-sm text-gray-700">Email notifications for new booking requests</span>
                                        </label>
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                className="w-4 h-4 text-brand-600 rounded" 
                                                checked={notifications.messages}
                                                onChange={(e) => updateNotificationPref('messages', e.target.checked)}
                                            />
                                            <span className="text-sm text-gray-700">Email notifications for guest messages</span>
                                        </label>
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                className="w-4 h-4 text-brand-600 rounded" 
                                                checked={notifications.reviews}
                                                onChange={(e) => updateNotificationPref('reviews', e.target.checked)}
                                            />
                                            <span className="text-sm text-gray-700">Email notifications for new reviews</span>
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

                                {/* Delete Account Section */}
                                <div className="pt-6 border-t border-gray-200">
                                    <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                                        <div className="flex items-start gap-3 mb-4">
                                            <AlertTriangle size={24} className="text-red-600 shrink-0 mt-0.5" />
                                            <div>
                                                <h3 className="text-sm font-semibold text-red-900 mb-2">Delete Host Account</h3>
                                                <p className="text-sm text-red-700 leading-relaxed">
                                                    Permanently delete your host account and all listings. This action cannot be undone.
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setShowDeleteModal(true)}
                                            className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition text-sm"
                                        >
                                            Delete My Account
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Delete Confirmation Modal */}
                            {showDeleteModal && (
                                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                                <AlertTriangle size={24} className="text-red-600" />
                                            </div>
                                            <h2 className="text-xl font-bold text-gray-900">Delete Account?</h2>
                                        </div>

                                        <div className="space-y-4 mb-6">
                                            <p className="text-gray-700 font-medium">This will permanently:</p>
                                            <ul className="space-y-2 text-sm text-gray-600">
                                                <li className="flex items-start gap-2">
                                                    <span className="block w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0"></span>
                                                    Remove your profile and account information
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="block w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0"></span>
                                                    Delete all your listings and photos
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="block w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0"></span>
                                                    Cancel any upcoming bookings (guests will be refunded)
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="block w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0"></span>
                                                    Delete all messages and conversations
                                                </li>
                                            </ul>

                                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                                                <p className="text-sm font-semibold text-yellow-900 mb-1">⚠️ This action cannot be undone</p>
                                                <p className="text-xs text-yellow-700">All your data will be permanently deleted from our servers.</p>
                                            </div>
                                        </div>

                                        <div className="mb-6">
                                            <label htmlFor="delete-confirm-input" className="block text-sm font-semibold text-gray-900 mb-2">
                                                Type <span className="text-red-600 font-mono">DELETE</span> to confirm
                                            </label>
                                            <input
                                                id="delete-confirm-input"
                                                type="text"
                                                value={deleteConfirmText}
                                                onChange={(e) => setDeleteConfirmText(e.target.value)}
                                                placeholder="Type DELETE here"
                                                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                            />
                                        </div>

                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => {
                                                    setShowDeleteModal(false);
                                                    setDeleteConfirmText('');
                                                }}
                                                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
                                                disabled={isDeleting}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleDeleteAccount}
                                                disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                                                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                            >
                                                {isDeleting ? (
                                                    <>
                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                        Deleting...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Trash2 size={16} />
                                                        Delete Forever
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Support Section */}
                    {activeTab === 'support' && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                                <h2 className="text-xl font-bold text-gray-900 mb-2">Host Support</h2>
                                <p className="text-gray-600 text-sm mb-6">Get help with your listings and bookings</p>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* WhatsApp */}
                                    <a
                                        href="https://wa.me/1234567890?text=Hi, I need help with my listing"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex flex-col items-center p-6 border-2 border-green-200 bg-green-50 rounded-xl hover:border-green-300 hover:bg-green-100 transition group"
                                    >
                                        <MessageCircle size={32} className="text-green-600 mb-3" />
                                        <h3 className="font-semibold text-gray-900 mb-1">WhatsApp</h3>
                                        <p className="text-xs text-gray-600 text-center">Chat with host support</p>
                                    </a>

                                    {/* Phone */}
                                    <a
                                        href="tel:+1234567890"
                                        className="flex flex-col items-center p-6 border-2 border-blue-200 bg-blue-50 rounded-xl hover:border-blue-300 hover:bg-blue-100 transition group"
                                    >
                                        <Phone size={32} className="text-blue-600 mb-3" />
                                        <h3 className="font-semibold text-gray-900 mb-1">Call Us</h3>
                                        <p className="text-xs text-gray-600 text-center">Priority Host Line</p>
                                    </a>

                                    {/* Email */}
                                    <a
                                        href="mailto:host-support@fiilar.com"
                                        className="flex flex-col items-center p-6 border-2 border-purple-200 bg-purple-50 rounded-xl hover:border-purple-300 hover:bg-purple-100 transition group"
                                    >
                                        <Mail size={32} className="text-purple-600 mb-3" />
                                        <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                                        <p className="text-xs text-gray-600 text-center">host-support@fiilar.com</p>
                                    </a>
                                </div>
                            </div>

                            {/* FAQ */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Host FAQs</h3>
                                <div className="space-y-3">
                                    <details className="group">
                                        <summary className="cursor-pointer font-medium text-gray-900 hover:text-brand-600 transition">
                                            How do I get paid?
                                        </summary>
                                        <p className="text-sm text-gray-600 mt-2 pl-4">Payouts are processed 24 hours after the guest checks in. Make sure your bank details are up to date in the Payouts tab.</p>
                                    </details>
                                    <details className="group">
                                        <summary className="cursor-pointer font-medium text-gray-900 hover:text-brand-600 transition">
                                            How do I handle cancellations?
                                        </summary>
                                        <p className="text-sm text-gray-600 mt-2 pl-4">Your cancellation policy determines the refund amount. You can view the policy for each booking in the Bookings tab.</p>
                                    </details>
                                    <details className="group">
                                        <summary className="cursor-pointer font-medium text-gray-900 hover:text-brand-600 transition">
                                            Can I decline a booking request?
                                        </summary>
                                        <p className="text-sm text-gray-600 mt-2 pl-4">Yes, you can decline requests that don't fit your schedule or criteria. However, frequent declines may affect your listing visibility.</p>
                                    </details>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* About Section */}
                    {activeTab === 'about' && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-6">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 mb-4">About Fiilar for Hosts</h2>
                                <p className="text-gray-700 leading-relaxed">
                                    Fiilar empowers hosts to share their unique spaces and earn income. We provide the tools and support you need to succeed.
                                </p>
                            </div>

                            <div className="grid grid-cols-3 gap-4 py-6 border-y border-gray-200">
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-brand-600">10K+</p>
                                    <p className="text-sm text-gray-600 mt-1">Active Hosts</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-brand-600">$5M+</p>
                                    <p className="text-sm text-gray-600 mt-1">Paid to Hosts</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-brand-600">98%</p>
                                    <p className="text-sm text-gray-600 mt-1">Satisfaction</p>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold text-gray-900 mb-3">Our Commitment</h3>
                                <p className="text-gray-700 leading-relaxed">
                                    We are committed to building a safe and trusted community. We verify all guests and provide host protection programs.
                                </p>
                            </div>

                            <div className="pt-6 border-t border-gray-200">
                                <h3 className="font-semibold text-gray-900 mb-4">Legal & Privacy</h3>
                                <div className="flex flex-wrap gap-4">
                                    <a href="#" className="flex items-center gap-2 text-brand-600 hover:text-brand-700 text-sm font-medium">
                                        <FileText size={16} />
                                        Host Terms
                                    </a>
                                    <a href="#" className="flex items-center gap-2 text-brand-600 hover:text-brand-700 text-sm font-medium">
                                        <Shield size={16} />
                                        Privacy Policy
                                    </a>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-200">
                                <p className="text-xs text-gray-500">Version 1.0.0 • © 2024 Fiilar. All rights reserved.</p>
                            </div>
                        </div>
                    )}

                    {/* Feedback Section */}
                    {activeTab === 'feedback' && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-2">Host Feedback</h2>
                            <p className="text-gray-600 text-sm mb-6">Help us improve the hosting experience</p>

                            {feedbackSubmitted ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Check size={32} className="text-green-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Thank you!</h3>
                                    <p className="text-gray-600">Your feedback has been submitted successfully.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleFeedbackSubmit} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 mb-3">How would you rate your hosting experience?</label>
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map((rating) => (
                                                <button
                                                    key={rating}
                                                    type="button"
                                                    onClick={() => setFeedbackRating(rating)}
                                                    className="transition-transform hover:scale-110"
                                                    title={`${rating} stars`}
                                                >
                                                    <Star
                                                        size={36}
                                                        className={rating <= feedbackRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="feedback-category" className="block text-sm font-semibold text-gray-900 mb-2">Category</label>
                                        <select
                                            id="feedback-category"
                                            value={feedbackCategory}
                                            onChange={(e) => setFeedbackCategory(e.target.value)}
                                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
                                        >
                                            <option value="general">General Feedback</option>
                                            <option value="bug">Bug Report</option>
                                            <option value="feature">Feature Request</option>
                                            <option value="improvement">Improvement Suggestion</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="feedback-message" className="block text-sm font-semibold text-gray-900 mb-2">Your Feedback</label>
                                        <textarea
                                            id="feedback-message"
                                            value={feedbackMessage}
                                            onChange={(e) => setFeedbackMessage(e.target.value)}
                                            placeholder="Tell us what you think..."
                                            rows={6}
                                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                                            required
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={feedbackRating === 0 || !feedbackMessage.trim()}
                                        className="w-full px-6 py-3 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Submit Feedback
                                    </button>
                                </form>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HostSettings;
