import React from 'react';
import { User } from '@fiilar/types';
import { Button } from '@fiilar/ui';
import { ProfileSection } from './ProfileSection';
import { NotificationPreferences } from './NotificationPreferences';
import { DeleteAccountSection } from './DeleteAccountSection';
import { DeleteAccountModal } from './DeleteAccountModal';

interface AccountSettingsProps {
    user: User | null;
    formData: {
        name: string;
        email: string;
        bio: string;
        phone: string;
    };
    setFormData: (data: any) => void;
    isEditing: boolean;
    setIsEditing: (editing: boolean) => void;
    isSaving: boolean;
    handleSaveProfile: () => void;
    notifications: {
        bookings: boolean;
        messages: boolean;
        damageReports: boolean;
        reviews: boolean;
        updates: boolean;
        marketing: boolean;
    };
    updateNotificationPref: (key: string, value: boolean) => void;
    showDeleteModal: boolean;
    setShowDeleteModal: (show: boolean) => void;
    deleteConfirmText: string;
    setDeleteConfirmText: (text: string) => void;
    isDeleting: boolean;
    handleDeleteAccount: () => void;
}

export const AccountSettings: React.FC<AccountSettingsProps> = ({
    user,
    formData,
    setFormData,
    isEditing,
    setIsEditing,
    isSaving,
    handleSaveProfile,
    notifications,
    updateNotificationPref,
    showDeleteModal,
    setShowDeleteModal,
    deleteConfirmText,
    setDeleteConfirmText,
    isDeleting,
    handleDeleteAccount
}) => {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Account Settings</h2>
                    <p className="text-gray-600 text-sm">Manage your account information and preferences</p>
                </div>
                {!isEditing ? (
                    <Button
                        onClick={() => setIsEditing(true)}
                        variant="ghost"
                    >
                        Edit Profile
                    </Button>
                ) : (
                    <div className="flex gap-2">
                        <Button
                            onClick={() => setIsEditing(false)}
                            variant="ghost"
                            disabled={isSaving}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSaveProfile}
                            disabled={isSaving}
                            variant="primary"
                        >
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                )}
            </div>

            <ProfileSection
                user={user}
                formData={formData}
                setFormData={setFormData}
                isEditing={isEditing}
            />

            <NotificationPreferences
                notifications={notifications}
                updateNotificationPref={updateNotificationPref}
            />

            <DeleteAccountSection setShowDeleteModal={setShowDeleteModal} />

            <DeleteAccountModal
                showDeleteModal={showDeleteModal}
                setShowDeleteModal={setShowDeleteModal}
                deleteConfirmText={deleteConfirmText}
                setDeleteConfirmText={setDeleteConfirmText}
                isDeleting={isDeleting}
                handleDeleteAccount={handleDeleteAccount}
            />
        </div>
    );
};
