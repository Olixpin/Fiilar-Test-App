import React, { useState, useRef, useCallback } from 'react';
import { X, Camera, Trash2, ZoomIn, ZoomOut } from 'lucide-react';
import { Button, useToast } from '@fiilar/ui';
import { User } from '@fiilar/types';
import { updateUserProfile } from '@fiilar/storage';

interface ProfilePictureModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    onUpdate: () => void;
}

export const ProfilePictureModal: React.FC<ProfilePictureModalProps> = ({
    isOpen,
    onClose,
    user,
    onUpdate
}) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [zoom, setZoom] = useState(1);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { showToast } = useToast();

    const compressImage = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 800;
                    const MAX_HEIGHT = 800;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', 0.7)); // Compress to JPEG with 0.7 quality
                };
                img.onerror = (error) => reject(error);
            };
            reader.onerror = (error) => reject(error);
        });
    };

    const handleFileSelect = useCallback(async (file: File) => {
        if (!file.type.startsWith('image/')) {
            showToast({ message: 'Please select an image file', type: 'error' });
            return;
        }

        if (file.size > 10 * 1024 * 1024) { // Increased limit since we compress
            showToast({ message: 'Image must be less than 10MB', type: 'error' });
            return;
        }

        try {
            const compressedDataUrl = await compressImage(file);
            setPreviewUrl(compressedDataUrl);
            setZoom(1);
        } catch (error) {
            console.error('Error compressing image:', error);
            showToast({ message: 'Failed to process image', type: 'error' });
        }
    }, [showToast]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileSelect(file);
    }, [handleFileSelect]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFileSelect(file);
    }, [handleFileSelect]);

    const handleSave = useCallback(async () => {
        if (!previewUrl || !user) return;

        setIsUploading(true);
        try {
            const result = updateUserProfile(user.id, { avatar: previewUrl });
            if (result.success) {
                showToast({ message: 'Profile picture updated successfully', type: 'success' });
                onUpdate();
                onClose();
            } else {
                showToast({ message: result.error || 'Failed to update profile picture', type: 'error' });
            }
        } catch (error) {
            console.error('Failed to save profile picture', error);
            showToast({ message: 'Failed to update profile picture', type: 'error' });
        } finally {
            setIsUploading(false);
        }
    }, [previewUrl, user, showToast, onUpdate, onClose]);

    const handleRemove = useCallback(() => {
        if (!user) return;

        try {
            const result = updateUserProfile(user.id, { avatar: '' });
            if (result.success) {
                showToast({ message: 'Profile picture removed', type: 'success' });
                onUpdate();
                onClose();
            } else {
                showToast({ message: result.error || 'Failed to remove profile picture', type: 'error' });
            }
        } catch (error) {
            console.error('Failed to remove profile picture', error);
            showToast({ message: 'Failed to remove profile picture', type: 'error' });
        }
    }, [user, showToast, onUpdate, onClose]);

    const handleClose = useCallback(() => {
        setPreviewUrl(null);
        setZoom(1);
        onClose();
    }, [onClose]);

    if (!isOpen) return null;

    const currentAvatar = previewUrl || user?.avatar;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in zoom-in-95 fade-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Profile Picture</h2>
                    <button
                        onClick={handleClose}
                        className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                        aria-label="Close modal"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Preview Area */}
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <div
                                className={`w-40 h-40 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg transition-transform ${zoom > 1 ? 'scale-110' : zoom < 1 ? 'scale-90' : 'scale-100'}`}
                            >
                                {currentAvatar ? (
                                    <img
                                        src={currentAvatar}
                                        alt="Profile preview"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-brand-100 text-brand-600 text-5xl font-bold">
                                        {user?.name?.charAt(0) || 'U'}
                                    </div>
                                )}
                            </div>
                            {previewUrl && (
                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white rounded-full shadow-md px-2 py-1">
                                    <button
                                        onClick={() => setZoom(prev => Math.max(0.5, prev - 0.1))}
                                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                        title="Zoom out"
                                    >
                                        <ZoomOut size={14} className="text-gray-600" />
                                    </button>
                                    <span className="text-xs text-gray-500 w-10 text-center">
                                        {Math.round(zoom * 100)}%
                                    </span>
                                    <button
                                        onClick={() => setZoom(prev => Math.min(2, prev + 0.1))}
                                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                        title="Zoom in"
                                    >
                                        <ZoomIn size={14} className="text-gray-600" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Upload Area */}
                    <div
                        className={`
                            relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer
                            ${isDragging
                                ? 'border-brand-500 bg-brand-50'
                                : 'border-gray-200 hover:border-brand-300 hover:bg-gray-50'
                            }
                        `}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleInputChange}
                            aria-label="Upload profile picture"
                        />
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-14 h-14 rounded-full bg-brand-100 flex items-center justify-center">
                                <Camera size={24} className="text-brand-600" />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">
                                    {isDragging ? 'Drop image here' : 'Upload a photo'}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    Drag & drop or click to browse
                                </p>
                                <p className="text-xs text-gray-400 mt-2">
                                    PNG, JPG up to 5MB
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
                    {user?.avatar && !previewUrl && (
                        <Button
                            variant="ghost"
                            onClick={handleRemove}
                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                            <Trash2 size={16} className="mr-2" />
                            Remove
                        </Button>
                    )}
                    <div className="flex-1" />
                    <Button
                        variant="ghost"
                        onClick={handleClose}
                    >
                        Cancel
                    </Button>
                    {previewUrl && (
                        <Button
                            variant="primary"
                            onClick={handleSave}
                            disabled={isUploading}
                        >
                            {isUploading ? 'Saving...' : 'Save Photo'}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};
