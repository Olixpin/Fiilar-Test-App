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
    onUserUpdate?: () => void;
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
    handleDeleteAccount,
    onUserUpdate
}) => {
    return (
        <div className="space-y-8">
            <div className="flex justify-between items-start border-b border-gray-100 pb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">Account Settings</h2>
                    <p className="text-gray-500">Manage your personal information and security preferences.</p>
                </div>
                {!isEditing ? (
                    <Button
                        onClick={() => setIsEditing(true)}
                        variant="outline"
                        className="rounded-xl"
                    >
                        Edit Profile
                    </Button>
                ) : (
                    <div className="flex gap-3">
                        <Button
                            onClick={() => setIsEditing(false)}
                            variant="ghost"
                            disabled={isSaving}
                            className="rounded-xl"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSaveProfile}
                            disabled={isSaving}
                            variant="primary"
                            className="rounded-xl"
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
                onUserUpdate={onUserUpdate}
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
