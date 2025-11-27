import React, { useState } from 'react';
import { User } from '@fiilar/types';
import { Camera, Mail, Phone, User as UserIcon, FileText } from 'lucide-react';
import { PhoneInput } from '../../../../components/common/PhoneInput';
import { ProfilePictureModal } from './ProfilePictureModal';

interface ProfileSectionProps {
    user: User | null;
    formData: {
        name: string;
        email: string;
        bio: string;
        phone: string;
    };
    setFormData: (data: any) => void;
    isEditing: boolean;
    onUserUpdate?: () => void;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({ user, formData, setFormData, isEditing, onUserUpdate }) => {
    const [showPictureModal, setShowPictureModal] = useState(false);

    return (
        <>
            {/* Profile Picture */}
            <div className="flex items-center gap-8 pb-8 border-b border-gray-200">
                <div className="relative group">
                    <div className="w-24 h-24 rounded-full bg-gray-100 overflow-hidden border-4 border-white shadow-lg ring-1 ring-gray-100">
                        {user?.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-50 to-brand-100 text-brand-600 text-3xl font-bold">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => setShowPictureModal(true)}
                        className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer backdrop-blur-[2px]"
                        aria-label="Change profile picture"
                        title="Change profile picture"
                    >
                        <Camera size={24} className="text-white drop-shadow-md" />
                    </button>
                    <button
                        onClick={() => setShowPictureModal(true)}
                        className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md border border-gray-100 text-gray-600 hover:text-brand-600 transition-colors"
                        aria-label="Change profile picture"
                    >
                        <Camera size={14} />
                    </button>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Profile Picture</h3>
                    <p className="text-sm text-gray-500 mt-1 mb-3">Upload a picture to make your profile stand out.</p>
                    <button
                        onClick={() => setShowPictureModal(true)}
                        className="text-sm font-semibold text-brand-600 hover:text-brand-700 hover:underline decoration-2 underline-offset-2 transition-all"
                    >
                        Change photo
                    </button>
                </div>
            </div>

            <ProfilePictureModal
                isOpen={showPictureModal}
                onClose={() => setShowPictureModal(false)}
                user={user}
                onUpdate={() => onUserUpdate?.()}
            />

            <div className="space-y-6 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label htmlFor="account-name" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <UserIcon size={14} className="text-gray-400" />
                            Full Name
                        </label>
                        <input
                            id="account-name"
                            type="text"
                            value={isEditing ? formData.name : (user?.name || '')}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className={`w-full rounded-xl px-4 py-3 transition-all duration-200 ${isEditing
                                ? 'border border-gray-300 bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 shadow-sm'
                                : 'border border-transparent bg-gray-50 text-gray-600'}`}
                            readOnly={!isEditing}
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="account-email" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <Mail size={14} className="text-gray-400" />
                            Email Address
                        </label>
                        <div className="relative group">
                            <input
                                id="account-email"
                                type="email"
                                value={user?.email || ''}
                                className="w-full border border-transparent bg-gray-50 text-gray-500 rounded-xl px-4 py-3 cursor-not-allowed opacity-75"
                                readOnly
                                disabled
                            />
                            <div className="absolute inset-y-0 right-4 flex items-center">
                                <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-md border border-gray-200">Verified</span>
                            </div>
                        </div>
                        <p className="text-xs text-gray-400 pl-1">Contact support to change your email.</p>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="account-phone" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <Phone size={14} className="text-gray-400" />
                            Phone Number
                        </label>
                        {user?.phone ? (
                            <div className="relative">
                                <input
                                    id="account-phone"
                                    type="tel"
                                    value={user.phone}
                                    className="w-full border border-transparent bg-gray-50 text-gray-500 rounded-xl px-4 py-3 cursor-not-allowed opacity-75"
                                    readOnly
                                    disabled
                                />
                                <div className="absolute inset-y-0 right-4 flex items-center">
                                    <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-md border border-gray-200">Verified</span>
                                </div>
                            </div>
                        ) : (
                            <div className={isEditing ? '' : 'opacity-75 pointer-events-none'}>
                                <PhoneInput
                                    id="account-phone"
                                    value={isEditing ? formData.phone : ''}
                                    onChange={(val) => setFormData({ ...formData, phone: val })}
                                    readOnly={!isEditing}
                                    className={!isEditing ? 'border-transparent bg-gray-50' : ''}
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <label htmlFor="account-bio" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <FileText size={14} className="text-gray-400" />
                        Bio
                    </label>
                    <textarea
                        id="account-bio"
                        value={isEditing ? formData.bio : (user?.bio || '')}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        placeholder={isEditing ? "Tell us a bit about yourself..." : "No bio yet"}
                        rows={4}
                        className={`w-full rounded-xl px-4 py-3 resize-none transition-all duration-200 ${isEditing
                            ? 'border border-gray-300 bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 shadow-sm'
                            : 'border border-transparent bg-gray-50 text-gray-600'}`}
                        readOnly={!isEditing}
                    />
                    {isEditing && (
                        <p className="text-xs text-gray-400 text-right">
                            {formData.bio?.length || 0}/500 characters
                        </p>
                    )}
                </div>
            </div>
        </>
    );
};
