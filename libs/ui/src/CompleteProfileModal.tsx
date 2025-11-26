import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface CompleteProfileModalProps {
    isOpen: boolean;
    onComplete: (firstName: string, lastName: string) => void;
    defaultFirstName?: string;
    defaultLastName?: string;
}

export const CompleteProfileModal: React.FC<CompleteProfileModalProps> = ({
    isOpen,
    onComplete,
    defaultFirstName = '',
    defaultLastName = '',
}) => {
    const [firstName, setFirstName] = useState(defaultFirstName);
    const [lastName, setLastName] = useState(defaultLastName);
    const [error, setError] = useState('');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // Prevent escape key and other keyboard shortcuts
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            // Block Escape key
            if (e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
            }
        };

        document.addEventListener('keydown', handleKeyDown, true);
        return () => document.removeEventListener('keydown', handleKeyDown, true);
    }, [isOpen]);

    if (!isOpen || !mounted) return null;

    const handleSubmit = () => {
        // Validation
        if (!firstName.trim() || firstName.trim().length < 2) {
            setError('First name must be at least 2 characters');
            return;
        }
        if (!lastName.trim() || lastName.trim().length < 2) {
            setError('Last name must be at least 2 characters');
            return;
        }

        onComplete(firstName.trim(), lastName.trim());
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    };

    const modalContent = (
        <div
            className="fixed inset-0 z-[999999] flex items-center justify-center p-4 animate-in fade-in duration-200"
            style={{ backgroundColor: '#f9fafb' }}
            onContextMenu={(e) => e.preventDefault()}
        >

            {/* Modal - Cannot be dismissed */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95 duration-200">
                {/* Welcome Message */}
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">👋</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Welcome to Fiilar!
                    </h2>
                    <p className="text-gray-600">
                        To get started, tell us your name
                    </p>
                </div>

                {/* Form */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            First Name
                        </label>
                        <input
                            type="text"
                            value={firstName}
                            onChange={(e) => {
                                setFirstName(e.target.value);
                                setError('');
                            }}
                            onKeyPress={handleKeyPress}
                            placeholder="John"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                            autoFocus
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Last Name
                        </label>
                        <input
                            type="text"
                            value={lastName}
                            onChange={(e) => {
                                setLastName(e.target.value);
                                setError('');
                            }}
                            onKeyPress={handleKeyPress}
                            placeholder="Doe"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                            required
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    <button
                        onClick={handleSubmit}
                        disabled={!firstName.trim() || !lastName.trim()}
                        className="w-full bg-brand-600 text-white py-3 rounded-lg font-semibold hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Continue to Dashboard
                    </button>
                </div>

                {/* Helper Text */}
                <p className="text-xs text-gray-500 text-center mt-4">
                    This helps us personalize your experience
                </p>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};
