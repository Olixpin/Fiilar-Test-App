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
}

const Settings: React.FC<SettingsProps> = ({ user, onUpdateUser }) => {
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
        <div className="max-w-6xl mx-auto relative">
            <SuccessToast show={showSavedToast} />

            <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-brand-100 rounded-lg text-brand-600">
                    <SettingsIcon size={32} />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                <SettingsSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

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

