import React, { useState } from 'react';
import { Role } from '@fiilar/types';
import { X } from 'lucide-react';
import { useToast, Form } from '@fiilar/ui';
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
        <div className="min-h-screen flex relative bg-gray-900">
            <style>{`
                @keyframes slideDown {
                    0% { transform: translateY(-100%); }
                    100% { transform: translateY(100%); }
                }
            `}</style>
            {/* Global Background Image */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2000&auto=format&fit=crop"
                    alt="Modern Living Space"
                    className="w-full h-full object-cover opacity-80 scale-105 hover:scale-100 transition-transform duration-[20s]"
                />
                <div className="absolute inset-0 bg-black/70" />
            </div>

            {/* Left Side - Text (Transparent) */}
            <div className="hidden lg:flex lg:w-1/2 relative z-10 flex-col justify-end p-16 text-white">
                {/* Animated Background Elements for Left Side */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl animate-pulse duration-[3000ms]" />
                    <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl animate-pulse duration-[5000ms] delay-1000" />
                </div>

                <div className="mb-8 relative">
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/20 shadow-lg shadow-brand-900/20">
                        <img src="https://drive.google.com/thumbnail?id=11AM3I7DLtyDpwgduNdtbUaZXJUYpvruC&sz=w400" className="w-10 h-10 object-contain" alt="Logo" />
                    </div>
                    <h1 className="text-5xl font-bold mb-6 leading-tight tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/70">
                        Share your space,<br />earn extra income.
                    </h1>
                    <p className="text-lg text-gray-400 leading-relaxed max-w-md">
                        Join thousands of hosts who are turning their extra space into a new income stream.
                    </p>
                </div>
                <div className="flex gap-2">
                    <div className="h-1 w-12 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
                    <div className="h-1 w-2 bg-white/20 rounded-full"></div>
                    <div className="h-1 w-2 bg-white/20 rounded-full"></div>
                </div>
            </div>

            {/* Right Side - Form (Full Glass Pane) */}
            <div className="flex-1 flex flex-col justify-center px-4 sm:px-12 lg:px-24 relative z-10 bg-white/20 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.1)] overflow-hidden">
                {/* Moving Gradient Left Border */}
                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-brand-500 to-transparent opacity-80 animate-pulse"></div>

                {/* Animated Gradient Line */}
                <div className="absolute left-0 top-0 w-[2px] h-full overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-[50%] bg-gradient-to-b from-transparent via-white to-transparent animate-[slideDown_3s_linear_infinite]"></div>
                </div>

                {/* Subtle Red Glow at the edge */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-[60%] bg-brand-500/20 blur-md"></div>

                <button
                    onClick={onBack}
                    className="absolute top-4 right-4 sm:top-8 sm:right-8 p-2 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white"
                    title="Close"
                >
                    <X size={24} />
                </button>

                <div className="max-w-[420px] w-full mx-auto relative">
                    <div className="mt-2">
                        {step === 0 && (
                            <LoginOptions
                                onEmailLogin={() => handleStepChange(1)}
                                onGoogleLogin={() => onLogin(Role.HOST, 'google', 'alex.taylor@gmail.example.com', {
                                    firstName: 'Alex',
                                    lastName: 'Taylor',
                                    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AlexTaylor'
                                })}
                                title="Become a Host"
                                subtitle="Enter your details to start hosting."
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
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HostOnboarding;
