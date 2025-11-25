import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button, useToast } from '@fiilar/ui';
import { OTPInput } from '../../../../components/OTPInput';

interface OtpVerificationProps {
    target: string;
    type: 'email' | 'phone';
    otp: string;
    setOtp: (value: string) => void;
    onBack: () => void;
    onVerify: (code?: string) => void;
    onResend: () => void;
    isLoading?: boolean;
    error?: string | null;
    variant?: 'default' | 'glass' | 'glass-dark';
}

const OtpVerification: React.FC<OtpVerificationProps> = ({
    target,
    type,
    otp,
    setOtp,
    onBack,
    onVerify,
    onResend,
    isLoading = false,
    error,
    variant = 'default'
}) => {
    const [timeLeft, setTimeLeft] = useState(30);
    const [canResend, setCanResend] = useState(false);
    const isGlass = variant === 'glass' || variant === 'glass-dark';
    const { showToast } = useToast();

    useEffect(() => {
        if (error) {
            showToast({ message: error, type: 'error' });
        }
    }, [error, showToast]);

    useEffect(() => {
        if (timeLeft > 0) {
            const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timerId);
        } else {
            setCanResend(true);
        }
    }, [timeLeft]);

    const handleResendClick = () => {
        if (!canResend) return;
        onResend();
        setTimeLeft(30);
        setCanResend(false);
    };

    return (
        <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <button
                onClick={onBack}
                className={`mb-8 flex items-center text-sm font-medium transition-colors group ${isGlass ? 'text-white/60 hover:text-white bg-white/5 px-3 py-1.5 rounded-lg hover:bg-white/10' : 'text-gray-500 hover:text-gray-900'}`}
            >
                <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                {type === 'email' ? 'Change email' : 'Change number'}
            </button>

            <div className="mb-10">
                <h2 className={`text-3xl font-bold mb-4 ${isGlass ? 'text-white' : 'text-gray-900'}`}>
                    {type === 'email' ? 'Verify your email' : 'Verify your number'}
                </h2>
                <p className={`${isGlass ? 'text-white/80' : 'text-gray-500'} text-lg`}>
                    We sent a 6-digit code to <span className={`font-semibold ${isGlass ? 'text-white' : 'text-gray-900'}`}>
                        {target}
                    </span>
                </p>
            </div>

            <div className="mb-6">
                <OTPInput
                    length={6}
                    value={otp}
                    onChange={setOtp}
                    onComplete={(code) => {
                        // Optional: Auto-submit
                        onVerify(code);
                    }}
                    onSubmit={() => onVerify()}
                    variant={variant}
                />
            </div>



            {!error && <div className="mb-8"></div>}

            <Button
                onClick={() => onVerify()}
                variant={isGlass ? 'glass-dark' : 'primary'}
                size="lg"
                disabled={isLoading || otp.length !== 6}
                className={`w-full h-12 flex items-center justify-center gap-2 ${isGlass ? 'disabled:opacity-50 disabled:cursor-not-allowed' : 'shadow-lg shadow-brand-600/20 disabled:opacity-50 disabled:cursor-not-allowed'}`}
            >
                {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                {isLoading ? 'Verifying...' : 'Verify & Login'}
            </Button>

            <p className={`mt-6 text-center text-sm ${isGlass ? 'text-white/60' : 'text-gray-500'}`}>
                Didn't receive the code?{' '}
                <button
                    onClick={handleResendClick}
                    disabled={!canResend || isLoading}
                    className={`font-semibold transition-colors ${canResend
                        ? (isGlass ? 'text-white hover:underline cursor-pointer' : 'text-brand-600 hover:underline cursor-pointer')
                        : (isGlass ? 'text-white/40 cursor-not-allowed' : 'text-gray-400 cursor-not-allowed')
                        }`}
                >
                    {canResend ? 'Resend' : `Resend in ${timeLeft}s`}
                </button>
            </p>
        </div>
    );
};

export default OtpVerification;
