import React, { useState } from 'react';
import { User } from '@fiilar/types';
import { X, Camera, TrendingUp } from 'lucide-react';

interface ProfileStrengthWidgetProps {
    user: User;
    onAddPhoto: () => void;
}

export const ProfileStrengthWidget: React.FC<ProfileStrengthWidgetProps> = ({
    user,
    onAddPhoto,
}) => {
    const [isDismissed, setIsDismissed] = useState(() => {
        return localStorage.getItem('profileStrengthDismissed') === 'true';
    });

    // Don't show if user has avatar or if dismissed
    if (user.avatar || isDismissed) return null;

    const handleDismiss = () => {
        localStorage.setItem('profileStrengthDismissed', 'true');
        setIsDismissed(true);
    };

    const profileStrength = 30; // Without photo

    return (
        <div className="bg-gradient-to-br from-brand-50 to-purple-50 rounded-2xl p-6 border border-brand-200 mb-6 relative animate-in slide-in-from-top duration-500">
            {/* Dismiss Button */}
            <button
                onClick={handleDismiss}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Dismiss"
            >
                <X size={20} />
            </button>

            {/* Header */}
            <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <TrendingUp size={24} className="text-brand-600" />
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                        Profile Strength: Low
                    </h3>
                    <p className="text-sm text-gray-600">
                        Complete your profile to build trust with guests
                    </p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Completion</span>
                    <span className="font-semibold text-brand-600">{profileStrength}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-brand-500 to-purple-500 transition-all duration-500"
                        style={{ width: `${profileStrength}%` }}
                    />
                </div>
            </div>

            {/* Stats */}
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-2xl">📊</span>
                    <p className="text-gray-700">
                        <span className="font-bold text-brand-600">Hosts with photos</span> get{' '}
                        <span className="font-bold">3x more bookings</span>
                    </p>
                </div>
            </div>

            {/* CTA Button */}
            <button
                onClick={onAddPhoto}
                className="w-full bg-brand-600 text-white py-3 rounded-lg font-semibold hover:bg-brand-700 transition-colors flex items-center justify-center gap-2"
            >
                <Camera size={20} />
                Add Profile Photo
            </button>
        </div>
    );
};
