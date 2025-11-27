import React from 'react';
import { User } from '@fiilar/types';
import { Upload } from 'lucide-react';
import { PhoneInput } from '../../../../components/common/PhoneInput';

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
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({ user, formData, setFormData, isEditing }) => {
    return (
        <>
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
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 ${isEditing ? 'border-gray-300 bg-white' : 'border-transparent bg-gray-50'}`}
                            readOnly={!isEditing}
                        />
                    </div>

                    <div>
                        <label htmlFor="account-email" className="block text-sm font-semibold text-gray-900 mb-2">
                            Email
                            <span className="ml-2 text-xs font-normal text-gray-500">(Contact support to change)</span>
                        </label>
                        <div className="relative">
                            <input
                                id="account-email"
                                type="email"
                                value={user?.email || ''}
                                className="w-full border border-transparent bg-gray-100 text-gray-500 rounded-xl px-4 py-3 focus:outline-none cursor-not-allowed"
                                readOnly
                                disabled
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="account-phone" className="block text-sm font-semibold text-gray-900 mb-2">
                            Phone
                            {user?.phone && <span className="ml-2 text-xs font-normal text-gray-500">(Contact support to change)</span>}
                        </label>
                        {user?.phone ? (
                            <div className="relative">
                                <input
                                    id="account-phone"
                                    type="tel"
                                    value={user.phone}
                                    className="w-full border border-transparent bg-gray-100 text-gray-500 rounded-xl px-4 py-3 focus:outline-none cursor-not-allowed"
                                    readOnly
                                    disabled
                                />
                            </div>
                        ) : (
                            <PhoneInput
                                id="account-phone"
                                value={isEditing ? formData.phone : ''}
                                onChange={(val) => setFormData({ ...formData, phone: val })}
                                readOnly={!isEditing}
                                className={!isEditing ? 'border-transparent bg-gray-50' : ''}
                            />
                        )}
                    </div>
                </div>

                <div>
                    <label htmlFor="account-bio" className="block text-sm font-semibold text-gray-900 mb-2">Bio</label>
                    <textarea
                        id="account-bio"
                        value={isEditing ? formData.bio : (user?.bio || '')}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        placeholder={isEditing ? "Tell us a bit about yourself..." : "No bio yet"}
                        rows={3}
                        className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none ${isEditing ? 'border-gray-300 bg-white' : 'border-transparent bg-gray-50'}`}
                        readOnly={!isEditing}
                    />
                </div>
            </div>
        </>
    );
};
