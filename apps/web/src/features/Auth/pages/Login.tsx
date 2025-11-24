import React, { useState } from 'react';
import { Role } from '@fiilar/types';
import { ArrowLeft, X, Mail } from 'lucide-react';

interface LoginProps {
    onLogin: (role: Role, provider?: 'email' | 'google' | 'phone') => void;
    onBack: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onBack }) => {
    const [step, setStep] = useState(0);
    const [email, setEmail] = useState('');

    return (
        <div className="min-h-screen bg-white flex flex-col items-center pt-20 px-4 animate-in slide-in-from-bottom-8 duration-500">
            {step === 0 && (
                <div className="max-w-[480px] w-full bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                        <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition" title="Close">
                            <X size={18} />
                        </button>
                        <span className="font-bold text-base">Log in or sign up</span>
                        <div className="w-8"></div>
                    </div>

                    <div className="p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Welcome to Fiilar</h2>

                        {/* Phone Input */}
                        <div className="mb-3">
                            <div className="border border-gray-300 rounded-t-lg px-3 py-2 relative hover:border-black focus-within:border-black focus-within:border-2 group">
                                <label htmlFor="login-country-select" className="text-xs text-gray-500 block">Country/Region</label>
                                <select id="login-country-select" className="w-full bg-transparent outline-none appearance-none text-gray-900 text-base pt-0.5">
                                    <option>Nigeria (+234)</option>
                                    <option>United States (+1)</option>
                                    <option>United Kingdom (+44)</option>
                                </select>
                                <div className="absolute right-3 top-4 pointer-events-none">
                                    {/* caret */}
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
                                </div>
                            </div>
                            <div className="border border-gray-300 border-t-0 rounded-b-lg px-3 py-2 hover:border-black focus-within:border-black focus-within:border-2">
                                <label htmlFor="login-phone-input" className="text-xs text-gray-500 block">Phone number</label>
                                <input
                                    id="login-phone-input"
                                    type="tel"
                                    className="w-full bg-transparent outline-none text-gray-900 text-base pt-0.5"
                                    placeholder="(555) 555-5555"
                                />
                            </div>
                        </div>

                        <p className="text-[11px] text-gray-500 leading-relaxed mb-5">
                            We'll call or text you to confirm your number. Standard message and data rates apply. <a href="#" className="underline font-medium text-gray-800">Privacy Policy</a>
                        </p>

                        <button
                            onClick={() => setStep(2)}
                            className="w-full bg-linear-to-r from-brand-600 to-brand-700 text-white font-bold text-lg py-3 rounded-lg hover:shadow-lg transition-all active:scale-[0.98]"
                        >
                            Continue
                        </button>

                        <div className="flex items-center gap-4 my-6">
                            <div className="h-px bg-gray-200 flex-1"></div>
                            <span className="text-xs text-gray-500 font-medium">or</span>
                            <div className="h-px bg-gray-200 flex-1"></div>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={() => onLogin(Role.USER, 'google')}
                                className="w-full border border-gray-900 text-gray-900 font-medium py-3 rounded-lg hover:bg-gray-50 transition relative flex items-center justify-between px-4"
                            >
                                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                                <span className="text-center w-full">Continue with Google</span>
                                <div className="w-5"></div>
                            </button>

                            <button
                                onClick={() => setStep(1)}
                                className="w-full border border-gray-900 text-gray-900 font-medium py-3 rounded-lg hover:bg-gray-50 transition relative flex items-center justify-between px-4"
                            >
                                <Mail size={20} />
                                <span className="text-center w-full">Continue with email</span>
                                <div className="w-5"></div>
                            </button>
                        </div>

                        <div className="mt-6 text-center">
                            <button onClick={() => onLogin(Role.ADMIN)} className="text-xs text-gray-300 hover:text-gray-500 underline">Admin Login (Demo)</button>
                        </div>
                    </div>
                </div>
            )}

            {step === 1 && (
                <div className="max-w-[480px] w-full bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                        <button onClick={() => setStep(0)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition" title="Back">
                            <ArrowLeft size={18} />
                        </button>
                        <span className="font-bold text-base">Log in or sign up</span>
                        <div className="w-8"></div>
                    </div>
                    <div className="p-6">
                        <input
                            type="email"
                            autoFocus
                            className="w-full border border-gray-400 rounded-lg p-4 text-lg mb-6 outline-none focus:border-black focus:ring-1 focus:ring-black"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <button
                            onClick={() => onLogin(Role.USER, 'email')}
                            className="w-full bg-brand-600 text-white font-bold text-lg py-3 rounded-lg hover:shadow-lg transition-all"
                        >
                            Continue
                        </button>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="max-w-[480px] w-full bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                        <button onClick={() => setStep(0)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition" title="Back">
                            <ArrowLeft size={18} />
                        </button>
                        <span className="font-bold text-base">Confirm your number</span>
                        <div className="w-8"></div>
                    </div>
                    <div className="p-6">
                        <p className="text-gray-500 mb-6">Enter the code we sent to your phone.</p>
                        <div className="flex gap-3 mb-8">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <input
                                    key={i}
                                    type="text"
                                    className="w-12 h-14 border border-gray-300 rounded-lg text-center text-xl focus:border-black outline-none"
                                    aria-label={`Digit ${i}`}
                                />
                            ))}
                        </div>
                        <button
                            onClick={() => onLogin(Role.USER, 'phone')}
                            className="w-full bg-brand-600 text-white font-bold text-lg py-3 rounded-lg hover:shadow-lg transition-all"
                        >
                            Verify
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Login;
