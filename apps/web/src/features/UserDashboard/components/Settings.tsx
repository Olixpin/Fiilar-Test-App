import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import { User } from '@fiilar/types';
import { useSettingsData } from '../hooks/useSettingsData';
import { SuccessToast } from './Settings/SuccessToast';
import { SettingsSidebar } from './Settings/SettingsSidebar';
import { AccountSettings } from './Settings/AccountSettings';
import { SupportSection } from './Settings/SupportSection';
import { AboutSection } from './Settings/AboutSection';
import { FeedbackSection } from './Settings/FeedbackSection';

interface SettingsProps {
    user: User | null;
    onUpdateUser?: (updates: Partial<User>) => void;
    onLogout?: () => void;
}

const Settings: React.FC<SettingsProps> = ({ user, onUpdateUser, onLogout }) => {
    const {
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
    } = useSettingsData({ user, onUpdateUser });

    return (
        <div className="relative h-full">
            <SuccessToast show={showSavedToast} />

            {/* Header - Only show on mobile since sidebar handles nav on desktop */}
            <div className="flex md:hidden items-center gap-3 mb-6">
                <div className="p-2 bg-brand-100 rounded-lg text-brand-600">
                    <SettingsIcon size={24} />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            </div>

            <div className="flex flex-col md:flex-row gap-12 h-full">
                <SettingsSidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={onLogout} />

                <div className="flex-1">
                    {activeTab === 'account' && (
                        <AccountSettings
                            user={user}
                            formData={formData}
                            setFormData={setFormData}
                            isEditing={isEditing}
                            setIsEditing={setIsEditing}
                            isSaving={isSaving}
                            handleSaveProfile={handleSaveProfile}
                            notifications={notifications}
                            updateNotificationPref={updateNotificationPref}
                            showDeleteModal={showDeleteModal}
                            setShowDeleteModal={setShowDeleteModal}
                            deleteConfirmText={deleteConfirmText}
                            setDeleteConfirmText={setDeleteConfirmText}
                            isDeleting={isDeleting}
                            handleDeleteAccount={handleDeleteAccount}
                            onUserUpdate={onUpdateUser}
                        />
                    )}

                    {activeTab === 'support' && <SupportSection />}

                    {activeTab === 'about' && <AboutSection />}

                    {activeTab === 'feedback' && (
                        <FeedbackSection
                            feedbackRating={feedbackRating}
                            setFeedbackRating={setFeedbackRating}
                            feedbackCategory={feedbackCategory}
                            setFeedbackCategory={setFeedbackCategory}
                            feedbackMessage={feedbackMessage}
                            setFeedbackMessage={setFeedbackMessage}
                            feedbackSubmitted={feedbackSubmitted}
                            handleFeedbackSubmit={handleFeedbackSubmit}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;

