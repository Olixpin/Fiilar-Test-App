
import React, { useState } from 'react';
import { Role } from '@fiilar/types';
import { X } from 'lucide-react';
import { useToast, Form } from '@fiilar/ui';
import { Link } from 'react-router-dom';
import LoginOptions from '../components/Login/LoginOptions';
import EmailLogin from '../components/Login/EmailLogin';
import OtpVerification from '../components/Login/OtpVerification';
import GoogleAccountPicker from '../components/Login/GoogleAccountPicker';
import { sendVerificationEmail, verifyEmailOtp, getUserById } from '@fiilar/storage';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

interface LoginProps {
    onLogin: (
        role: Role,
        provider?: 'email' | 'google' | 'phone',
        identifier?: string,
        profileData?: { firstName?: string; lastName?: string; avatar?: string }
    ) => void;
    onBack: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onBack }) => {
    const [step, setStep] = useState(0);
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showGooglePicker, setShowGooglePicker] = useState(false);
    const { showToast } = useToast();

    // Form Schemas
    const emailSchema = z.object({
        email: z.string().email({ message: "Please enter a valid email address" }),
    });


    // Forms
    const emailForm = useForm<z.infer<typeof emailSchema>>({
        resolver: zodResolver(emailSchema),
        defaultValues: {
            email: "",
        },
    });


    const handleStepChange = (newStep: number) => {
        setStep(newStep);
        setOtp(''); // Clear OTP when changing steps
        setError(null);
        setIsLoading(false);
    };

    const handleVerify = async (provider: 'email' | 'phone', codeOverride?: string) => {
        setIsLoading(true);
        setError(null);

        // Simulate network request
        setTimeout(() => {
            const code = codeOverride || otp;

            if (provider === 'email') {
                const email = emailForm.getValues().email;
                const result = verifyEmailOtp(email, code);
                if (result.success) {
                    // Fetch user to get correct role
                    const user = getUserById(result.userId || '');
                    const role = user ? user.role : Role.USER;
                    onLogin(role, provider, email);
                } else {
                    setError(result.message || 'Invalid verification code');
                    setIsLoading(false);
                }
            }
        }, 1500);
    };

    const handleResend = (provider: 'email' | 'phone') => {
        // Simulate resending code
        if (provider === 'email') {
            const code = sendVerificationEmail(emailForm.getValues().email, 'mock-token', '');
            showToast({ message: `Demo Code: ${code}`, type: 'info', duration: 5000 });
        }
    };

    return (
        <div className="min-h-[100dvh] flex bg-white relative">
            {/* Mobile Background Gradient - Subtle premium feel */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gray-50 via-white to-white lg:hidden pointer-events-none" />

            {/* Left Side - Visual (Desktop Only) */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900 overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop"
                    alt="Modern Interior"
                    className="absolute inset-0 w-full h-full object-cover opacity-80 scale-105 hover:scale-100 transition-transform duration-[20s]"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent" />

                <div className="relative z-10 flex flex-col justify-end p-16 text-white h-full max-w-2xl">
                    <div className="mb-8">
                        <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/20">
                            <img src="https://drive.google.com/thumbnail?id=11AM3I7DLtyDpwgduNdtbUaZXJUYpvruC&sz=w400" className="w-10 h-10 object-contain" alt="Logo" />
                        </div>
                        <h1 className="text-5xl font-bold mb-6 leading-tight tracking-tight">Unlock spaces that<br />inspire creativity.</h1>
                        <p className="text-lg text-gray-300 leading-relaxed">Join a community of creators, professionals, and hosts connecting through unique spaces every day.</p>
                    </div>
                    <div className="flex gap-2">
                        <div className="h-1 w-12 bg-white rounded-full"></div>
                        <div className="h-1 w-2 bg-white/30 rounded-full"></div>
                        <div className="h-1 w-2 bg-white/30 rounded-full"></div>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-24 relative z-10 overflow-y-auto py-8 lg:py-0">
                <button
                    onClick={onBack}
                    className="absolute top-4 right-4 sm:top-8 sm:right-8 p-2 hover:bg-gray-50 rounded-full transition-colors text-gray-400 hover:text-gray-900"
                    title="Close"
                >
                    <X size={24} />
                </button>

                <div className="max-w-[420px] w-full mx-auto">
                    {step === 0 && (
                        <LoginOptions
                            onEmailLogin={(email) => {
                                if (email) {
                                    // Email provided from input - skip to OTP step
                                    emailForm.setValue('email', email);
                                    const code = sendVerificationEmail(email, 'mock-token', '');
                                    showToast({ message: `Demo Code: ${code}`, type: 'info', duration: 5000 });
                                    handleStepChange(3);
                                } else {
                                    // No email - go to email entry step
                                    handleStepChange(1);
                                }
                            }}
                            onGoogleLogin={() => setShowGooglePicker(true)}
                        />
                    )}

                    {step === 1 && (
                        <Form {...emailForm}>
                            <EmailLogin
                                form={emailForm}
                                onBack={() => handleStepChange(0)}
                                onContinue={emailForm.handleSubmit((data) => {
                                    const code = sendVerificationEmail(data.email, 'mock-token', '');
                                    showToast({ message: `Demo Code: ${code}`, type: 'info', duration: 5000 });
                                    handleStepChange(3);
                                })}
                            />
                        </Form>
                    )}


                    {step === 3 && (
                        <OtpVerification
                            target={emailForm.getValues().email}
                            type="email"
                            otp={otp}
                            setOtp={setOtp}
                            onBack={() => handleStepChange(1)}
                            onVerify={(code) => handleVerify('email', code)}
                            onResend={() => handleResend('email')}
                            isLoading={isLoading}
                            error={error}
                        />
                    )}

                    {/* Switch to Host Login */}
                    {step === 0 && (
                        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                            <p className="text-sm text-gray-500">
                                Want to list your space?{' '}
                                <Link to="/login-host" className="text-brand-600 font-semibold hover:text-brand-700 hover:underline transition-colors">
                                    Host Your Space
                                </Link>
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Google Account Picker */}
            <GoogleAccountPicker
                isOpen={showGooglePicker}
                onClose={() => setShowGooglePicker(false)}
                onSelectAccount={(role, email, profileData) => {
                    onLogin(role, 'google', email, profileData);
                }}
            />
        </div>
    );
};

export default Login;