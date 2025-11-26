import React, { useState } from 'react';
import { User } from '@fiilar/types';

interface CompleteProfileProps {
    user: User;
    onComplete: (firstName: string, lastName: string) => void;
}

const CompleteProfile: React.FC<CompleteProfileProps> = ({ onComplete }) => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!firstName.trim() || firstName.trim().length < 2) {
            setError('First name must be at least 2 characters');
            return;
        }
        if (!lastName.trim() || lastName.trim().length < 2) {
            setError('Last name must be at least 2 characters');
            return;
        }

        setIsLoading(true);
        onComplete(firstName.trim(), lastName.trim());
    };

    return (
        <div className="min-h-screen flex bg-white">
            {/* Left Side - Visual (Desktop Only) */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900 overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop"
                    alt="Modern Interior"
                    className="absolute inset-0 w-full h-full object-cover opacity-80 scale-105 hover:scale-100 transition-transform duration-[20s]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                <div className="relative z-10 flex flex-col justify-end p-16 text-white h-full max-w-2xl">
                    <div className="mb-8">
                        <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/20">
                            <img src="https://drive.google.com/thumbnail?id=11AM3I7DLtyDpwgduNdtbUaZXJUYpvruC&sz=w400" className="w-10 h-10 object-contain" alt="Logo" />
                        </div>
                        <h1 className="text-5xl font-bold mb-6 leading-tight tracking-tight">Almost there!</h1>
                        <p className="text-lg text-gray-300 leading-relaxed">Just a few more details to personalize your Fiilar experience.</p>
                    </div>
                    <div className="flex gap-2">
                        <div className="h-1 w-2 bg-white/30 rounded-full"></div>
                        <div className="h-1 w-12 bg-white rounded-full"></div>
                        <div className="h-1 w-2 bg-white/30 rounded-full"></div>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex flex-col justify-center px-4 sm:px-12 lg:px-24 relative bg-white">
                <div className="max-w-[420px] w-full mx-auto">
                    {/* Welcome Message */}
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-4xl">👋</span>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-3">
                            Welcome to Fiilar!
                        </h2>
                        <p className="text-gray-600">
                            Let's get to know you better
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    First Name
                                </label>
                                <input
                                    id="firstName"
                                    name="firstName"
                                    autoComplete="given-name"
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => {
                                        setFirstName(e.target.value);
                                        setError('');
                                    }}
                                    placeholder="John"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all outline-none"
                                    autoFocus
                                    required
                                    disabled={isLoading}
                                />
                            </div>

                            <div>
                                <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    Last Name
                                </label>
                                <input
                                    id="lastName"
                                    name="lastName"
                                    autoComplete="family-name"
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => {
                                        setLastName(e.target.value);
                                        setError('');
                                    }}
                                    placeholder="Doe"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all outline-none"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-center gap-2 text-red-600 text-sm">
                                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={!firstName.trim() || !lastName.trim() || isLoading}
                            className="w-full bg-brand-600 text-white py-3.5 rounded-xl font-bold text-lg hover:bg-brand-700 active:scale-[0.98] transition-all shadow-lg shadow-brand-600/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                        >
                            {isLoading ? 'Completing...' : 'Continue to Dashboard'}
                        </button>
                    </form>

                    {/* Helper Text */}
                    <p className="text-xs text-gray-400 text-center mt-6">
                        This helps us personalize your experience on Fiilar
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CompleteProfile;
