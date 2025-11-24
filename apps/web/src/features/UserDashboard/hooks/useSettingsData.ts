import { useState } from 'react';
import { User } from '@fiilar/types';

interface UseSettingsDataProps {
    user: User | null;
    onUpdateUser?: (updates: Partial<User>) => void;
}

export type SettingsTab = 'account' | 'support' | 'about' | 'feedback';

export const useSettingsData = ({ user, onUpdateUser }: UseSettingsDataProps) => {
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

    // Feedback State
    const [feedbackRating, setFeedbackRating] = useState(0);
    const [feedbackCategory, setFeedbackCategory] = useState('general');
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

    // Delete Account State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    // Toast State
    const [showSavedToast, setShowSavedToast] = useState(false);

    // Notification Preferences
    const [notifications, setNotifications] = useState(() => {
        const saved = localStorage.getItem('notification_preferences');
        return saved ? JSON.parse(saved) : {
            bookings: true,
            messages: true,
            damageReports: true,
            reviews: true,
            updates: true,
            marketing: false
        };
    });

    const updateNotificationPref = (key: string, value: boolean) => {
        const updated = { ...notifications, [key]: value };
        setNotifications(updated);
        localStorage.setItem('notification_preferences', JSON.stringify(updated));

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
        if (deleteConfirmText !== 'DELETE') {
            alert('Please type DELETE to confirm');
            return;
        }

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

    return {
        activeTab,
        setActiveTab,
        formData,
        setFormData,
        isEditing,
        setIsEditing,
        isSaving,
        feedbackRating,
        setFeedbackRating,
        feedbackCategory,
        setFeedbackCategory,
        feedbackMessage,
        setFeedbackMessage,
        feedbackSubmitted,
        showDeleteModal,
        setShowDeleteModal,
        deleteConfirmText,
        setDeleteConfirmText,
        isDeleting,
        showSavedToast,
        notifications,
        updateNotificationPref,
        handleSaveProfile,
        handleFeedbackSubmit,
        handleDeleteAccount
    };
};
