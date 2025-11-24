import React from 'react';
import { User } from '@fiilar/types';
import { Upload } from 'lucide-react';

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
                        <label htmlFor="account-email" className="block text-sm font-semibold text-gray-900 mb-2">Email</label>
                        <input
                            id="account-email"
                            type="email"
                            value={isEditing ? formData.email : (user?.email || '')}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder={isEditing ? "+1 (555) 000-0000" : "Not set"}
                            className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 ${isEditing ? 'border-gray-300 bg-white' : 'border-transparent bg-gray-50'}`}
                            readOnly={!isEditing}
                        />
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
