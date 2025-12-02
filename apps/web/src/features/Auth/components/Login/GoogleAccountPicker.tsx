import React from 'react';
import { X, Check, Plus } from 'lucide-react';
import { Role } from '@fiilar/types';

interface MockGoogleAccount {
    email: string;
    firstName: string;
    lastName: string;
    avatar: string;
    role: Role;
}

// Mock Google accounts for demo purposes
// Matches the test users in QA documentation
const MOCK_GOOGLE_ACCOUNTS: MockGoogleAccount[] = [
    {
        email: 'jessica.chen@demo.com',
        firstName: 'Jessica',
        lastName: 'Chen',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
        role: Role.HOST, // Primary host for testing
    },
    {
        email: 'alex.rivera@demo.com',
        firstName: 'Alex',
        lastName: 'Rivera',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
        role: Role.USER, // Primary guest for testing
    },
    {
        email: 'marcus.johnson@demo.com',
        firstName: 'Marcus',
        lastName: 'Johnson',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
        role: Role.USER, // Secondary guest
    },
    {
        email: 'sarah.williams@demo.com',
        firstName: 'Sarah',
        lastName: 'Williams',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
        role: Role.USER, // For testing guest-to-host conversion
    },
    {
        email: 'admin@fiilar.com',
        firstName: 'Admin',
        lastName: 'User',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
        role: Role.ADMIN, // Admin for dispute resolution
    },
];

interface GoogleAccountPickerProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectAccount: (
        role: Role,
        email: string,
        profileData: { firstName: string; lastName: string; avatar: string }
    ) => void;
    defaultRole?: Role;
}

const GoogleAccountPicker: React.FC<GoogleAccountPickerProps> = ({
    isOpen,
    onClose,
    onSelectAccount,
    defaultRole,
}) => {
    if (!isOpen) return null;

    const handleSelectAccount = (account: MockGoogleAccount) => {
        // Use the default role if provided (e.g., HOST for host onboarding), otherwise use account's role
        const effectiveRole = defaultRole || account.role;
        onSelectAccount(effectiveRole, account.email, {
            firstName: account.firstName,
            lastName: account.lastName,
            avatar: account.avatar,
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />
            
            {/* Modal */}
            <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 pb-4 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <img 
                            src="https://www.svgrepo.com/show/475656/google-color.svg" 
                            alt="Google" 
                            className="w-6 h-6"
                        />
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">Choose an account</h2>
                    <p className="text-sm text-gray-500 mt-1">to continue to Fiilar</p>
                </div>

                {/* Account List */}
                <div className="max-h-80 overflow-y-auto">
                    {MOCK_GOOGLE_ACCOUNTS.map((account) => (
                        <button
                            key={account.email}
                            onClick={() => handleSelectAccount(account)}
                            className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors text-left group"
                        >
                            <img
                                src={account.avatar}
                                alt={`${account.firstName} ${account.lastName}`}
                                className="w-10 h-10 rounded-full object-cover"
                            />
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">
                                    {account.firstName} {account.lastName}
                                </p>
                                <p className="text-sm text-gray-500 truncate">
                                    {account.email}
                                </p>
                            </div>
                            {account.role === Role.HOST && (
                                <span className="text-[10px] font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
                                    Host
                                </span>
                            )}
                            {account.role === Role.ADMIN && (
                                <span className="text-[10px] font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                                    Admin
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-100 p-4">
                    <button
                        onClick={onClose}
                        className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors"
                    >
                        <Plus size={16} />
                        Use another account
                    </button>
                    <p className="text-[10px] text-gray-400 text-center mt-3">
                        This is a demo. In production, this would use real Google OAuth.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default GoogleAccountPicker;
