import React from 'react';
import { Settings as SettingsIcon, ChevronLeft } from 'lucide-react';
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

    const [mobileView, setMobileView] = React.useState<'menu' | 'content'>('menu');

    const handleTabChange = (tab: any) => {
        setActiveTab(tab);
        setMobileView('content');
    };

    const handleBackToMenu = () => {
        setMobileView('menu');
    };

    // Get label for current tab
    const getTabLabel = () => {
        switch (activeTab) {
            case 'account': return 'Account Settings';
            case 'support': return 'Support';
            case 'feedback': return 'Feedback';
            case 'about': return 'About';
            default: return 'Settings';
        }
    };

    return (
        <div className="relative h-full">
            <SuccessToast show={showSavedToast} />

            {/* Mobile Header - Menu View */}
            <div className={`flex md:hidden items-center gap-3 mb-6 ${mobileView === 'content' ? 'hidden' : 'flex'}`}>
                <div className="p-2 bg-brand-100 rounded-lg text-brand-600">
                    <SettingsIcon size={24} />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            </div>

            {/* Mobile Header - Content View */}
            <div className={`flex md:hidden items-center gap-3 mb-6 ${mobileView === 'menu' ? 'hidden' : 'flex'}`}>
                <button
                    onClick={handleBackToMenu}
                    className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ChevronLeft size={24} className="text-gray-600" />
                </button>
                <h1 className="text-xl font-bold text-gray-900">{getTabLabel()}</h1>
            </div>

            <div className="flex flex-col md:flex-row gap-12 h-full">
                <div className={`${mobileView === 'content' ? 'hidden md:block' : 'block'} w-full md:w-auto`}>
                    <SettingsSidebar
                        activeTab={activeTab}
                        setActiveTab={handleTabChange}
                        onLogout={onLogout}
                    />
                </div>

                <div className={`flex-1 ${mobileView === 'menu' ? 'hidden md:block' : 'block'}`}>
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
                            onUserUpdate={() => onUpdateUser?.({})}
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

