import React, { useState, useRef } from 'react';
import { User } from '@fiilar/types';
import { Button, useToast, TextArea } from '@fiilar/ui';
import { Camera, X, FileText, ShieldCheck } from 'lucide-react';
import { saveUser } from '@fiilar/storage';

interface BaseModalProps {
    user: User;
    isOpen: boolean;
    onClose: () => void;
    onUpdateUser: (user: User) => void;
}

// Avatar Upload Modal
export const AvatarUploadModal: React.FC<BaseModalProps> = ({ user, isOpen, onClose, onUpdateUser }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { showToast } = useToast();

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                showToast({ message: 'Image must be less than 5MB', type: 'error' });
                return;
            }
            const reader = new FileReader();
            reader.onload = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        if (!previewUrl) return;
        
        setIsUploading(true);
        try {
            const updatedUser = { ...user, avatar: previewUrl };
            saveUser(updatedUser);
            onUpdateUser(updatedUser);
            showToast({ message: 'Profile picture updated!', type: 'success' });
            onClose();
        } catch {
            showToast({ message: 'Failed to update profile picture', type: 'error' });
        } finally {
            setIsUploading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white rounded-t-[32px] sm:rounded-[32px] shadow-2xl w-full sm:max-w-md h-auto max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom sm:zoom-in-95 duration-300 relative">
                {/* Drag indicator for mobile */}
                <div className="sm:hidden flex justify-center pt-3 pb-1">
                    <div className="w-10 h-1 bg-gray-300 rounded-full" />
                </div>
                
                <button
                    onClick={onClose}
                    aria-label="Close modal"
                    className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-900"
                >
                    <X size={20} />
                </button>

                <div className="p-6 sm:p-8">
                    <div className="flex flex-col items-center text-center mb-6">
                        <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center mb-4">
                            <Camera className="text-brand-600" size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Update Profile Picture</h2>
                        <p className="text-gray-500">Add a photo so guests can recognize you</p>
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        aria-label="Upload profile picture"
                    />

                    <div className="flex flex-col items-center gap-4 mb-6">
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="w-32 h-32 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-brand-500 hover:bg-brand-50 transition-all overflow-hidden"
                        >
                            {previewUrl || user.avatar ? (
                                <img 
                                    src={previewUrl || user.avatar} 
                                    alt="Preview" 
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <Camera size={32} className="text-gray-400" />
                            )}
                        </div>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="text-sm font-medium text-brand-600 hover:text-brand-700"
                        >
                            {previewUrl || user.avatar ? 'Change Photo' : 'Select Photo'}
                        </button>
                    </div>

                    <div className="flex gap-3">
                        <Button variant="outline" onClick={onClose} className="flex-1">
                            Cancel
                        </Button>
                        <Button 
                            variant="primary" 
                            onClick={handleSave} 
                            disabled={!previewUrl}
                            isLoading={isUploading}
                            className="flex-1"
                        >
                            Save Photo
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Bio Edit Modal
export const BioEditModal: React.FC<BaseModalProps> = ({ user, isOpen, onClose, onUpdateUser }) => {
    const [bio, setBio] = useState(user.bio || '');
    const [isSaving, setIsSaving] = useState(false);
    const { showToast } = useToast();

    const handleSave = async () => {
        if (bio.length < 10) {
            showToast({ message: 'Bio must be at least 10 characters', type: 'error' });
            return;
        }
        
        setIsSaving(true);
        try {
            const updatedUser = { ...user, bio };
            saveUser(updatedUser);
            onUpdateUser(updatedUser);
            showToast({ message: 'Bio updated successfully!', type: 'success' });
            onClose();
        } catch {
            showToast({ message: 'Failed to update bio', type: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white rounded-t-[32px] sm:rounded-[32px] shadow-2xl w-full sm:max-w-md h-auto max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom sm:zoom-in-95 duration-300 relative">
                {/* Drag indicator for mobile */}
                <div className="sm:hidden flex justify-center pt-3 pb-1">
                    <div className="w-10 h-1 bg-gray-300 rounded-full" />
                </div>
                
                <button
                    onClick={onClose}
                    aria-label="Close modal"
                    className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-900"
                >
                    <X size={20} />
                </button>

                <div className="p-6 sm:p-8">
                    <div className="flex flex-col items-start text-left mb-6">
                        <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center mb-4">
                            <FileText className="text-brand-600" size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Write Your Bio</h2>
                        <p className="text-gray-500">Tell guests a little about yourself. What makes you a great host?</p>
                    </div>

                    <div className="mb-6">
                        <TextArea
                            value={bio}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBio(e.target.value)}
                            placeholder="I love hosting guests and showing them the best of my city..."
                            rows={5}
                            className="w-full resize-none"
                        />
                        <p className={`text-xs mt-2 ${bio.length < 10 ? 'text-amber-600' : 'text-gray-400'}`}>
                            {bio.length}/10 minimum characters
                        </p>
                    </div>

                    <div className="flex gap-3 pb-6 sm:pb-0">
                        <Button variant="outline" onClick={onClose} className="flex-1">
                            Cancel
                        </Button>
                        <Button 
                            variant="primary" 
                            onClick={handleSave} 
                            disabled={bio.length < 10}
                            isLoading={isSaving}
                            className="flex-1"
                        >
                            Save Bio
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// KYC Verification Modal (simplified prompt to go to verify page)
export const KYCPromptModal: React.FC<BaseModalProps & { onNavigateToVerify: () => void }> = ({ 
    isOpen, 
    onClose, 
    onNavigateToVerify 
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white rounded-t-[32px] sm:rounded-[32px] shadow-2xl w-full sm:max-w-md h-auto max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom sm:zoom-in-95 duration-300 relative">
                {/* Drag indicator for mobile */}
                <div className="sm:hidden flex justify-center pt-3 pb-1">
                    <div className="w-10 h-1 bg-gray-300 rounded-full" />
                </div>
                
                <button
                    onClick={onClose}
                    aria-label="Close modal"
                    className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-900"
                >
                    <X size={20} />
                </button>

                <div className="p-6 sm:p-8">
                    <div className="flex flex-col items-center text-center mb-6">
                        <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center mb-4">
                            <ShieldCheck className="text-brand-600" size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Identity</h2>
                        <p className="text-gray-500">
                            Identity verification helps build trust with guests and keeps our community safe.
                        </p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 mb-6">
                        <h3 className="font-medium text-gray-900 mb-2">What you'll need:</h3>
                        <ul className="text-sm text-gray-600 space-y-2">
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                                A valid government-issued ID
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                                A clear selfie for face matching
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                                About 5 minutes of your time
                            </li>
                        </ul>
                    </div>

                    <div className="flex gap-3 pb-6 sm:pb-0">
                        <Button variant="outline" onClick={onClose} className="flex-1">
                            Later
                        </Button>
                        <Button 
                            variant="primary" 
                            onClick={() => {
                                onClose();
                                onNavigateToVerify();
                            }}
                            className="flex-1"
                        >
                            Start Verification
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
