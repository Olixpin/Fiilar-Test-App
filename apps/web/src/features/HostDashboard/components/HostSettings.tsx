import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { User as UserIcon, HelpCircle, Info, MessageSquare, Phone, Mail, MessageCircle, Star, Check, AlertTriangle, Trash2, FileText, Shield, Upload, Globe, ChevronRight } from 'lucide-react';
import { User } from '@fiilar/types';
import { Button, useLocale, useToast } from '@fiilar/ui';
import { updateUserProfile, APP_INFO } from '@fiilar/storage';
import { SupportedCountry, LOCALE_CONFIGS } from '@fiilar/utils';
import { PhoneInput } from '../../../components/common/PhoneInput';

interface HostSettingsProps {
    user: User | null;
    onUpdateUser?: (updates: Partial<User>) => void;
}

type SettingsTab = 'account' | 'support' | 'about' | 'feedback';

const HostSettings: React.FC<HostSettingsProps> = ({ user, onUpdateUser }) => {
    const { locale, country } = useLocale();
    const { showToast } = useToast();
    const [searchParams, setSearchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState<SettingsTab>('account');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const editFormRef = useRef<HTMLDivElement>(null);

    // Check if we should auto-start in edit mode (from profile completion)
    const shouldAutoEdit = searchParams.get('edit') === 'true';

    // Profile Form State
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        bio: user?.bio || '',
        phone: user?.phone || ''
    });
    const [isEditing, setIsEditing] = useState(shouldAutoEdit);
    const [isSaving, setIsSaving] = useState(false);

    // Clear the edit param after reading it
    useEffect(() => {
        if (shouldAutoEdit) {
            // Remove the edit param from URL without triggering re-render
            const newParams = new URLSearchParams(searchParams);
            newParams.delete('edit');
            setSearchParams(newParams, { replace: true });
        }
    }, [shouldAutoEdit, searchParams, setSearchParams]);

    // Click outside to close editing mode
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isEditing && editFormRef.current && !editFormRef.current.contains(event.target as Node)) {
                // Don't close if clicking on file input or its label
                const target = event.target as HTMLElement;
                if (target.closest('input[type="file"]') || target.closest('label[for="avatar-upload"]')) {
                    return;
                }
                setIsEditing(false);
                // Reset form to original values when clicking outside
                setFormData({
                    name: user?.name || '',
                    email: user?.email || '',
                    bio: user?.bio || '',
                    phone: user?.phone || ''
                });
            }
        };

        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isEditing) {
                setIsEditing(false);
                // Reset form to original values
                setFormData({
                    name: user?.name || '',
                    email: user?.email || '',
                    bio: user?.bio || '',
                    phone: user?.phone || ''
                });
            }
        };

        if (isEditing) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscKey);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [isEditing, user]);

    // Image compression helper
    const compressImage = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_SIZE = 800;
                    let width = img.width;
                    let height = img.height;

                    if (width > height && width > MAX_SIZE) {
                        height *= MAX_SIZE / width;
                        width = MAX_SIZE;
                    } else if (height > MAX_SIZE) {
                        width *= MAX_SIZE / height;
                        height = MAX_SIZE;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', 0.7));
                };
                img.onerror = reject;
            };
            reader.onerror = reject;
        });
    };

    // Handle profile picture upload
    const handleAvatarChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        if (!file.type.startsWith('image/')) {
            showToast({ message: 'Please select an image file', type: 'error' });
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            showToast({ message: 'Image must be less than 10MB', type: 'error' });
            return;
        }

        try {
            const compressedDataUrl = await compressImage(file);
            const result = updateUserProfile(user.id, { avatar: compressedDataUrl });
            if (result.success && onUpdateUser) {
                onUpdateUser(result.user!);
                showToast({ message: 'Profile picture updated successfully', type: 'success' });
            } else {
                showToast({ message: result.error || 'Failed to update profile picture', type: 'error' });
            }
        } catch (error) {
            console.error('Failed to update avatar:', error);
            showToast({ message: 'Failed to process image', type: 'error' });
        }
    }, [user, onUpdateUser, showToast]);

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
            // Real API call
            if (user) {
                const result = updateUserProfile(user.id, {
                    name: formData.name,
                    bio: formData.bio,
                    phone: formData.phone // Allow saving phone (only editable if previously empty)
                });

                if (result.success && result.user && onUpdateUser) {
                    onUpdateUser(result.user);
                }
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

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Navigation */}
                <div className="md:w-72 shrink-0 space-y-8 border-r border-gray-100 pr-6 hidden md:block">
                    <div className="space-y-2">
                        <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Settings</h3>
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group relative ${isActive
                                        ? 'bg-brand-50 text-brand-700'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                >
                                    <Icon size={20} className={isActive ? 'text-brand-600' : 'text-gray-400 group-hover:text-gray-600'} />
                                    <span className={`font-medium ${isActive ? 'text-brand-900' : 'text-gray-700'}`}>{tab.label}</span>
                                    {isActive && <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-brand-500" />}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 min-w-0">
                    {/* Mobile Tabs (visible only on small screens) */}
                    <div className="md:hidden flex overflow-x-auto gap-2 pb-4 mb-6 no-scrollbar">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${isActive
                                        ? 'bg-brand-600 text-white'
                                        : 'bg-gray-100 text-gray-600'
                                        }`}
                                >
                                    <Icon size={16} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Account Settings */}
                    {activeTab === 'account' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex justify-between items-start border-b border-gray-100 pb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-1">Host Profile</h2>
                                    <p className="text-gray-500">Manage your public profile and account details</p>
                                </div>
                                {!isEditing ? (
                                    <Button
                                        onClick={() => setIsEditing(true)}
                                        variant="outline"
                                        size="sm"
                                    >
                                        Edit Profile
                                    </Button>
                                ) : (
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={() => setIsEditing(false)}
                                            variant="ghost"
                                            size="sm"
                                            disabled={isSaving}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={handleSaveProfile}
                                            disabled={isSaving}
                                            variant="primary"
                                            size="sm"
                                        >
                                            {isSaving ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Profile Picture */}
                            <div className="flex items-center gap-6 pb-8 border-b border-gray-100">
                                <div className="relative group">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                        className="hidden"
                                        id="avatar-upload"
                                        aria-label="Upload profile picture"
                                    />
                                    <div 
                                        className="w-24 h-24 rounded-full bg-gray-100 overflow-hidden ring-4 ring-white shadow-lg cursor-pointer"
                                        onDoubleClick={() => fileInputRef.current?.click()}
                                        title="Double-click to change profile picture"
                                    >
                                        {user?.avatar ? (
                                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-brand-100 text-brand-600 text-3xl font-bold">
                                                {user?.name?.charAt(0) || 'U'}
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                        aria-label="Upload profile picture"
                                        title="Click to change profile picture"
                                    >
                                        <Upload size={24} className="text-white" />
                                    </button>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 text-lg">Profile Picture</h3>
                                    <p className="text-sm text-gray-500 mt-1">This will be displayed on your profile and listings.</p>
                                    <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB • Double-click or hover to change</p>
                                </div>
                            </div>

                            <div className="space-y-6" ref={editFormRef}>
                                {!isEditing && (
                                    <p className="text-xs text-gray-400 italic">💡 Tip: Double-click any field to edit it directly, or click outside to cancel</p>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="account-name" className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                        <input
                                            id="account-name"
                                            type="text"
                                            value={isEditing ? formData.name : (user?.name || '')}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            onDoubleClick={() => !isEditing && setIsEditing(true)}
                                            className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors ${isEditing ? 'border-gray-300 bg-white' : 'border-transparent bg-gray-50 cursor-pointer hover:bg-gray-100'}`}
                                            readOnly={!isEditing}
                                            title={!isEditing ? 'Double-click to edit' : undefined}
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="account-email" className="block text-sm font-medium text-gray-700 mb-2">
                                            Email Address
                                            <span className="text-xs text-gray-400 ml-1">(cannot be changed)</span>
                                        </label>
                                        <input
                                            id="account-email"
                                            type="email"
                                            value={user?.email || ''}
                                            className="w-full border border-transparent bg-gray-50 text-gray-500 rounded-xl px-4 py-3 focus:outline-none cursor-not-allowed"
                                            readOnly
                                            disabled
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="account-phone" className="block text-sm font-medium text-gray-700 mb-2">
                                            Phone Number
                                            {user?.phone && <span className="text-xs text-gray-400 ml-1">(cannot be changed)</span>}
                                        </label>
                                        {user?.phone ? (
                                            <input
                                                id="account-phone"
                                                type="tel"
                                                value={user.phone}
                                                className="w-full border border-transparent bg-gray-50 text-gray-500 rounded-xl px-4 py-3 focus:outline-none cursor-not-allowed"
                                                readOnly
                                                disabled
                                            />
                                        ) : (
                                            <div
                                                onDoubleClick={() => !isEditing && setIsEditing(true)}
                                                title={!isEditing ? 'Double-click to edit' : undefined}
                                            >
                                                <PhoneInput
                                                    id="account-phone"
                                                    value={isEditing ? formData.phone : ''}
                                                    onChange={(val) => setFormData({ ...formData, phone: val })}
                                                    readOnly={!isEditing}
                                                    className={!isEditing ? 'border-transparent bg-gray-50 cursor-pointer hover:bg-gray-100' : ''}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="account-bio" className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                                    <textarea
                                        id="account-bio"
                                        value={isEditing ? formData.bio : (user?.bio || '')}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                        onDoubleClick={() => !isEditing && setIsEditing(true)}
                                        placeholder={isEditing ? "Tell guests a bit about yourself..." : "No bio yet"}
                                        rows={4}
                                        className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none transition-colors ${isEditing ? 'border-gray-300 bg-white' : 'border-transparent bg-gray-50 cursor-pointer hover:bg-gray-100'}`}
                                        readOnly={!isEditing}
                                        title={!isEditing ? 'Double-click to edit' : undefined}
                                    />
                                </div>

                                {/* Currency & Region Settings */}
                                <div className="pt-8 border-t border-gray-100 opacity-60">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Globe size={18} className="text-gray-400" />
                                        <h3 className="text-base font-semibold text-gray-900">Currency & Region</h3>
                                        <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium border border-gray-200">Coming Soon</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pointer-events-none">
                                        {(Object.keys(LOCALE_CONFIGS) as SupportedCountry[]).map((countryCode) => {
                                            const config = LOCALE_CONFIGS[countryCode];
                                            const isSelected = country === countryCode;
                                            return (
                                                <div
                                                    key={countryCode}
                                                    className={`flex items-center gap-3 p-3 rounded-xl border text-left cursor-not-allowed ${isSelected
                                                        ? 'border-gray-300 bg-gray-50'
                                                        : 'border-gray-200 bg-white'
                                                        }`}
                                                >
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isSelected ? 'bg-gray-400 text-white' : 'bg-gray-100 text-gray-400'
                                                        }`}>
                                                        {config.currencySymbol}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`font-medium text-sm truncate ${isSelected ? 'text-gray-600' : 'text-gray-400'}`}>
                                                            {config.countryName}
                                                        </p>
                                                    </div>
                                                    {isSelected && (
                                                        <Check size={16} className="text-gray-400 shrink-0" />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-gray-100">
                                    <h3 className="text-base font-semibold text-gray-900 mb-4">Notification Preferences</h3>
                                    <div className="space-y-4">
                                        {[
                                            { key: 'newBookings', label: 'Email notifications for new booking requests' },
                                            { key: 'messages', label: 'Email notifications for guest messages' },
                                            { key: 'reviews', label: 'Email notifications for new reviews' },
                                            { key: 'updates', label: 'Platform updates and announcements' },
                                            { key: 'marketing', label: 'Marketing emails' }
                                        ].map((item) => (
                                            <label key={item.key} className="flex items-center gap-3 cursor-pointer group">
                                                <div className="relative flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        className="peer sr-only"
                                                        checked={notifications[item.key as keyof typeof notifications]}
                                                        onChange={(e) => updateNotificationPref(item.key, e.target.checked)}
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                                                </div>
                                                <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">{item.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Delete Account Section */}
                                <div className="pt-8 border-t border-gray-100">
                                    <div className="flex items-start justify-between gap-4 p-6 rounded-2xl border border-red-100 bg-red-50/50">
                                        <div>
                                            <h3 className="text-base font-bold text-red-900 mb-1">Delete Host Account</h3>
                                            <p className="text-sm text-red-700 leading-relaxed max-w-xl">
                                                Permanently delete your host account and all listings. This action cannot be undone and will cancel all active bookings.
                                            </p>
                                        </div>
                                        <Button
                                            onClick={() => setShowDeleteModal(true)}
                                            variant="danger"
                                            size="sm"
                                            className="shrink-0"
                                        >
                                            Delete Account
                                        </Button>
                                    </div>
                                </div>

                                {/* Bottom Save Button - shows when editing */}
                                {isEditing && (
                                    <div className="sticky bottom-0 bg-white border-t border-gray-200 -mx-8 px-8 py-4 mt-8 shadow-lg rounded-b-2xl">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm text-gray-500">You have unsaved changes</p>
                                            <div className="flex gap-3">
                                                <Button
                                                    onClick={() => {
                                                        setIsEditing(false);
                                                        setFormData({
                                                            name: user?.name || '',
                                                            email: user?.email || '',
                                                            bio: user?.bio || '',
                                                            phone: user?.phone || ''
                                                        });
                                                    }}
                                                    variant="ghost"
                                                    size="sm"
                                                    disabled={isSaving}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    onClick={handleSaveProfile}
                                                    disabled={isSaving}
                                                    variant="primary"
                                                    size="sm"
                                                >
                                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Delete Confirmation Modal */}
                            {showDeleteModal && (
                                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95 duration-200">
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
                                            <Button
                                                onClick={() => {
                                                    setShowDeleteModal(false);
                                                    setDeleteConfirmText('');
                                                }}
                                                variant="outline"
                                                disabled={isDeleting}
                                                className="flex-1"
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                onClick={handleDeleteAccount}
                                                disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                                                variant="danger"
                                                className="flex-1"
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
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Support Section */}
                    {activeTab === 'support' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-1">Host Support</h2>
                                <p className="text-gray-500">Get help with your listings and bookings</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* WhatsApp */}
                                <a
                                    href="https://wa.me/1234567890?text=Hi, I need help with my listing"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex flex-col items-center p-6 border border-gray-200 rounded-2xl hover:border-green-300 hover:bg-green-50/50 transition group bg-white"
                                >
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <MessageCircle size={24} className="text-green-600" />
                                    </div>
                                    <h3 className="font-semibold text-gray-900 mb-1">WhatsApp</h3>
                                    <p className="text-xs text-gray-500 text-center">Chat with host support</p>
                                </a>

                                {/* Phone */}
                                <a
                                    href="tel:+1234567890"
                                    className="flex flex-col items-center p-6 border border-gray-200 rounded-2xl hover:border-blue-300 hover:bg-blue-50/50 transition group bg-white"
                                >
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <Phone size={24} className="text-blue-600" />
                                    </div>
                                    <h3 className="font-semibold text-gray-900 mb-1">Call Us</h3>
                                    <p className="text-xs text-gray-500 text-center">Priority Host Line</p>
                                </a>

                                {/* Email */}
                                <a
                                    href="mailto:host-support@fiilar.com"
                                    className="flex flex-col items-center p-6 border border-gray-200 rounded-2xl hover:border-purple-300 hover:bg-purple-50/50 transition group bg-white"
                                >
                                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <Mail size={24} className="text-purple-600" />
                                    </div>
                                    <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                                    <p className="text-xs text-gray-500 text-center">host-support@fiilar.com</p>
                                </a>
                            </div>

                            {/* FAQ */}
                            <div className="pt-8 border-t border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900 mb-6">Host FAQs</h3>
                                <div className="space-y-4">
                                    <details className="group border border-gray-200 rounded-xl bg-white open:shadow-sm transition-all">
                                        <summary className="flex items-center justify-between cursor-pointer font-medium text-gray-900 p-4 hover:bg-gray-50 rounded-xl transition-colors">
                                            How do I get paid?
                                            <ChevronRight size={16} className="text-gray-400 group-open:rotate-90 transition-transform" />
                                        </summary>
                                        <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed">
                                            Payouts are processed 24 hours after the guest checks in. Make sure your bank details are up to date in the Payouts tab.
                                        </div>
                                    </details>
                                    <details className="group border border-gray-200 rounded-xl bg-white open:shadow-sm transition-all">
                                        <summary className="flex items-center justify-between cursor-pointer font-medium text-gray-900 p-4 hover:bg-gray-50 rounded-xl transition-colors">
                                            How do I handle cancellations?
                                            <ChevronRight size={16} className="text-gray-400 group-open:rotate-90 transition-transform" />
                                        </summary>
                                        <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed">
                                            Your cancellation policy determines the refund amount. You can view the policy for each booking in the Bookings tab.
                                        </div>
                                    </details>
                                    <details className="group border border-gray-200 rounded-xl bg-white open:shadow-sm transition-all">
                                        <summary className="flex items-center justify-between cursor-pointer font-medium text-gray-900 p-4 hover:bg-gray-50 rounded-xl transition-colors">
                                            Can I decline a booking request?
                                            <ChevronRight size={16} className="text-gray-400 group-open:rotate-90 transition-transform" />
                                        </summary>
                                        <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed">
                                            Yes, you can decline requests that don't fit your schedule or criteria. However, frequent declines may affect your listing visibility.
                                        </div>
                                    </details>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* About Section */}
                    {activeTab === 'about' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">About Fiilar for Hosts</h2>
                                <p className="text-gray-600 leading-relaxed text-lg">
                                    Fiilar empowers hosts to share their unique spaces and earn income. We provide the tools and support you need to succeed.
                                </p>
                            </div>

                            <div className="grid grid-cols-3 gap-4 py-8 border-y border-gray-100">
                                <div className="text-center">
                                    <p className="text-4xl font-bold text-brand-600 mb-1">10K+</p>
                                    <p className="text-sm font-medium text-gray-500">Active Hosts</p>
                                </div>
                                <div className="text-center border-l border-gray-100">
                                    <p className="text-4xl font-bold text-brand-600 mb-1">{locale.currencySymbol}5M+</p>
                                    <p className="text-sm font-medium text-gray-500">Paid to Hosts</p>
                                </div>
                                <div className="text-center border-l border-gray-100">
                                    <p className="text-4xl font-bold text-brand-600 mb-1">98%</p>
                                    <p className="text-sm font-medium text-gray-500">Satisfaction</p>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold text-gray-900 mb-3 text-lg">Our Commitment</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    We are committed to building a safe and trusted community. We verify all guests and provide host protection programs to ensure your peace of mind.
                                </p>
                            </div>

                            <div className="pt-8 border-t border-gray-100">
                                <h3 className="font-semibold text-gray-900 mb-4">Legal & Privacy</h3>
                                <div className="flex flex-wrap gap-6">
                                    <a href="#" className="flex items-center gap-2 text-gray-600 hover:text-brand-600 transition-colors text-sm font-medium">
                                        <FileText size={18} />
                                        Host Terms of Service
                                    </a>
                                    <a href="#" className="flex items-center gap-2 text-gray-600 hover:text-brand-600 transition-colors text-sm font-medium">
                                        <Shield size={18} />
                                        Privacy Policy
                                    </a>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-gray-100">
                                <p className="text-xs text-gray-400">{APP_INFO.VERSION_WITH_COPYRIGHT}</p>
                            </div>
                        </div>
                    )}

                    {/* Feedback Section */}
                    {activeTab === 'feedback' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-1">Host Feedback</h2>
                                <p className="text-gray-500">Help us improve the hosting experience</p>
                            </div>

                            {feedbackSubmitted ? (
                                <div className="text-center py-16 bg-green-50 rounded-2xl border border-green-100">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Check size={32} className="text-green-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Thank you!</h3>
                                    <p className="text-gray-600">Your feedback has been submitted successfully.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleFeedbackSubmit} className="space-y-6 max-w-2xl">
                                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                        <label className="block text-sm font-semibold text-gray-900 mb-4 text-center">How would you rate your hosting experience?</label>
                                        <div className="flex justify-center gap-3">
                                            {[1, 2, 3, 4, 5].map((rating) => (
                                                <button
                                                    key={rating}
                                                    type="button"
                                                    onClick={() => setFeedbackRating(rating)}
                                                    className="transition-transform hover:scale-110 focus:outline-none"
                                                    title={`${rating} stars`}
                                                >
                                                    <Star
                                                        size={40}
                                                        className={rating <= feedbackRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 hover:text-gray-400'}
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="feedback-category" className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                        <select
                                            id="feedback-category"
                                            value={feedbackCategory}
                                            onChange={(e) => setFeedbackCategory(e.target.value)}
                                            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                                        >
                                            <option value="general">General Feedback</option>
                                            <option value="bug">Bug Report</option>
                                            <option value="feature">Feature Request</option>
                                            <option value="improvement">Improvement Suggestion</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="feedback-message" className="block text-sm font-medium text-gray-700 mb-2">Your Feedback</label>
                                        <textarea
                                            id="feedback-message"
                                            value={feedbackMessage}
                                            onChange={(e) => setFeedbackMessage(e.target.value)}
                                            placeholder="Tell us what you think..."
                                            rows={6}
                                            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none bg-white"
                                            required
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={feedbackRating === 0 || !feedbackMessage.trim()}
                                        variant="primary"
                                        className="w-full"
                                        size="lg"
                                    >
                                        Submit Feedback
                                    </Button>
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
