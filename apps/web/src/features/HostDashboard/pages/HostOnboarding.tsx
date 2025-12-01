import React, { useState } from 'react';
import { Role } from '@fiilar/types';
import { X } from 'lucide-react';
import { useToast, Form } from '@fiilar/ui';
import { Link } from 'react-router-dom';
import LoginOptions from '../../Auth/components/Login/LoginOptions';
import EmailLogin from '../../Auth/components/Login/EmailLogin';
import OtpVerification from '../../Auth/components/Login/OtpVerification';
import { sendVerificationEmail, verifyEmailOtp } from '@fiilar/storage';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

interface HostOnboardingProps {
    onLogin: (
        role: Role,
        provider: 'email' | 'google' | 'phone',
        identifier?: string,
        profileData?: { firstName?: string; lastName?: string; avatar?: string }
    ) => void;
    onBack: () => void;
}

const HostOnboarding: React.FC<HostOnboardingProps> = ({ onLogin, onBack }) => {
    const [step, setStep] = useState(0);
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { showToast } = useToast();

    // Form Schema
    const emailSchema = z.object({
        email: z.string().email({ message: "Please enter a valid email address" }),
    });

    // Form
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

    const handleVerify = async (codeOverride?: string) => {
        setIsLoading(true);
        setError(null);

        // Simulate network request
        setTimeout(() => {
            const code = codeOverride || otp;
            const email = emailForm.getValues().email;
            const result = verifyEmailOtp(email, code);
            if (result.success) {
                onLogin(Role.HOST, 'email', email);
            } else {
                setError(result.message || 'Invalid verification code');
                setIsLoading(false);
            }
        }, 1500);
    };

    const handleResend = () => {
        const code = sendVerificationEmail(emailForm.getValues().email, 'mock-token', '');
        showToast({ message: `Demo Code: ${code}`, type: 'info', duration: 5000 });
    };

    return (
        <div className="min-h-[100dvh] w-full flex flex-col lg:flex-row relative bg-gray-900 lg:h-[100dvh] lg:overflow-hidden">
            <style>{`
                @keyframes slideDown {
                    0% { transform: translateY(-100%); }
                    100% { transform: translateY(100%); }
                }
            `}</style>
            {/* Global Background Image - Fixed for Parallax feel */}
            <div className="fixed inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2000&auto=format&fit=crop"
                    alt="Modern Living Space"
                    className="w-full h-full object-cover opacity-80 scale-105 hover:scale-100 transition-transform duration-[20s]"
                />
                <div className="absolute inset-0 bg-black/70" />
            </div>

            {/* Close Button - Fixed Position for Perfect UX */}
            <button
                onClick={onBack}
                className="fixed top-6 right-6 z-50 p-2.5 bg-black/20 backdrop-blur-md rounded-full text-white/90 hover:bg-black/40 hover:text-white transition-all border border-white/10 shadow-lg active:scale-95"
                title="Close"
            >
                <X size={24} />
            </button>

            {/* Left Side - Text (Visible on Mobile now) */}
            <div className="flex-none lg:flex-1 flex w-full lg:w-1/2 relative z-10 flex-col justify-end px-6 pt-24 pb-8 lg:p-16 text-white">
                {/* Animated Background Elements for Left Side */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl animate-pulse duration-[3000ms]" />
                    <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl animate-pulse duration-[5000ms] delay-1000" />
                </div>

                <div className="relative">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 lg:mb-6 border border-white/20 shadow-lg shadow-brand-900/20">
                        <img src="https://drive.google.com/thumbnail?id=11AM3I7DLtyDpwgduNdtbUaZXJUYpvruC&sz=w400" className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 object-contain" alt="Logo" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 lg:mb-6 leading-tight tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/70">
                        Share your space,<br className="hidden sm:block" /><span className="sm:hidden"> </span>earn extra income.
                    </h1>
                    <p className="text-base lg:text-lg text-gray-300 lg:text-gray-400 leading-relaxed max-w-md">
                        Join thousands of hosts who are turning their extra space into a new income stream.
                    </p>
                </div>
                <div className="hidden sm:flex gap-2 mt-4">
                    <div className="h-1 w-12 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
                    <div className="h-1 w-2 bg-white/20 rounded-full"></div>
                    <div className="h-1 w-2 bg-white/20 rounded-full"></div>
                </div>
            </div>

            {/* Right Side - Form Container */}
            <div className="shrink-0 w-full lg:flex-1 lg:h-full flex flex-col justify-center relative z-10 lg:bg-white/20 lg:backdrop-blur-xl lg:shadow-[0_4px_30px_rgba(0,0,0,0.1)] lg:overflow-hidden px-6 pb-12 lg:p-0">

                {/* Desktop-only Decorations */}
                <div className="hidden lg:block">
                    {/* Moving Gradient Left Border */}
                    <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-brand-500 to-transparent opacity-80 animate-pulse"></div>
                    {/* Animated Gradient Line */}
                    <div className="absolute left-0 top-0 w-[2px] h-full overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-[50%] bg-gradient-to-b from-transparent via-white to-transparent animate-[slideDown_3s_linear_infinite]"></div>
                    </div>
                    {/* Subtle Red Glow at the edge */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-[60%] bg-brand-500/20 blur-md"></div>
                </div>

                {/* Form Wrapper - Glass Card on Mobile, Transparent on Desktop */}
                <div className="w-full max-w-[420px] lg:mx-auto relative bg-white/10 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-4 sm:p-6 lg:bg-transparent lg:backdrop-blur-none lg:border-0 lg:shadow-none lg:p-0 lg:rounded-none">
                    <div>
                        {step === 0 && (
                            <LoginOptions
                                onEmailLogin={(email) => {
                                    if (email) {
                                        // Email provided from input - skip to OTP step
                                        emailForm.setValue('email', email);
                                        const code = sendVerificationEmail(email, 'mock-token', '');
                                        showToast({ message: `Demo Code: ${code}`, type: 'info', duration: 5000 });
                                        handleStepChange(2);
                                    } else {
                                        // No email - go to email entry step
                                        handleStepChange(1);
                                    }
                                }}
                                onGoogleLogin={() => onLogin(Role.HOST, 'google', 'alex.taylor@gmail.example.com', {
                                    firstName: 'Alex',
                                    lastName: 'Taylor',
                                    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AlexTaylor'
                                })}
                                title="Become a Host"
                                subtitle="Enter your email to start hosting."
                                variant="glass-dark"
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
                                        handleStepChange(2);
                                    })}
                                    variant="glass-dark"
                                />
                            </Form>
                        )}

                        {step === 2 && (
                            <OtpVerification
                                target={emailForm.getValues().email}
                                type="email"
                                otp={otp}
                                setOtp={setOtp}
                                onBack={() => handleStepChange(1)}
                                onVerify={(code) => handleVerify(code)}
                                onResend={() => handleResend()}
                                isLoading={isLoading}
                                error={error}
                                variant="glass-dark"
                            />
                        )}

                        {/* Switch to Guest Login */}
                        {step === 0 && (
                            <div className="mt-6 pt-4 border-t border-white/10 text-center">
                                <p className="text-xs sm:text-sm text-white/60">
                                    Looking to book a space?{' '}
                                    <Link to="/login" className="text-white font-semibold hover:text-brand-300 hover:underline transition-colors">
                                        Sign in as Guest
                                    </Link>
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HostOnboarding;
