import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, Mail, KeyRound } from 'lucide-react';
import { verifyEmailToken, verifyEmailOtp, VerificationResult } from '@fiilar/storage';
import { Input } from '@fiilar/ui';
import { OTPInput } from '../../../components/OTPInput';

const VerifyEmailPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [result, setResult] = useState<VerificationResult | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);

    // Form state
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');

    useEffect(() => {
        const token = searchParams.get('token');

        // Pre-fill email if logged in
        const storedUser = localStorage.getItem('fiilar_user');
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                if (user.email) setEmail(user.email);
            } catch (e) { }
        }

        if (token) {
            setIsVerifying(true);
            // Verify the token
            setTimeout(() => {
                const verificationResult = verifyEmailToken(token);
                setResult(verificationResult);
                setIsVerifying(false);
            }, 1500); // Small delay for better UX
        }
    }, [searchParams]);

    const handleContinue = () => {
        navigate('/dashboard');
    };

    const handleOtpSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || otp.length !== 6) return;

        setIsVerifying(true);

        setTimeout(() => {
            const verificationResult = verifyEmailOtp(email, otp);
            setResult(verificationResult);
            setIsVerifying(false);
        }, 1000);
    };

    const resetForm = () => {
        setResult(null);
        setOtp('');
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-brand-50 to-white flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                    {isVerifying ? (
                        <>
                            <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Loader2 size={32} className="text-brand-600 animate-spin" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                Verifying...
                            </h2>
                            <p className="text-gray-600">
                                Please wait while we verify your email address
                            </p>
                        </>
                    ) : result?.success ? (
                        <>
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle size={32} className="text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                Email Verified!
                            </h2>
                            <p className="text-gray-600 mb-6">
                                {result.message}
                            </p>
                            <button
                                onClick={handleContinue}
                                className="w-full bg-brand-600 text-white py-3 rounded-xl font-semibold hover:bg-brand-700 transition"
                            >
                                Continue to Dashboard
                            </button>
                        </>
                    ) : result && !result.success ? (
                        <>
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <XCircle size={32} className="text-red-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                Verification Failed
                            </h2>
                            <p className="text-gray-600 mb-6">
                                {result.message}
                            </p>
                            <div className="space-y-3">
                                <button
                                    onClick={resetForm}
                                    className="w-full bg-brand-600 text-white py-3 rounded-xl font-semibold hover:bg-brand-700 transition"
                                >
                                    Try Again
                                </button>
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="w-full border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition"
                                >
                                    Go to Dashboard
                                </button>
                            </div>
                        </>
                    ) : (
                        // Default State: Enter OTP Form
                        <form onSubmit={handleOtpSubmit} className="text-left">
                            <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <KeyRound size={32} className="text-brand-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                                Verify Email
                            </h2>
                            <p className="text-gray-600 mb-6 text-center">
                                Enter the 6-digit code sent to your email address.
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <Input
                                        id="email"
                                        autoComplete="email"
                                        label="Email Address"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email"
                                        required
                                    />
                                </div>
                                <div>
                                    <div className="block text-sm font-medium text-gray-700 mb-3 text-center">
                                        Verification Code
                                    </div>
                                    <OTPInput
                                        length={6}
                                        value={otp}
                                        onChange={setOtp}
                                        onComplete={(code: string) => {
                                            // Auto-submit when complete
                                            if (email) {
                                                setIsVerifying(true);
                                                setTimeout(() => {
                                                    const verificationResult = verifyEmailOtp(email, code);
                                                    setResult(verificationResult);
                                                    setIsVerifying(false);
                                                }, 1000);
                                            }
                                        }}
                                    />
                                    <p className="text-xs text-gray-500 mt-3 text-center">
                                        Enter or paste your 6-digit code
                                    </p>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-brand-600 text-white py-3 rounded-xl font-semibold hover:bg-brand-700 transition mt-2"
                                >
                                    Verify Code
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* Info Box */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <Mail size={20} className="text-blue-600 shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-900">
                            <p className="font-semibold mb-1">Need help?</p>
                            <p className="text-blue-700">
                                If you're having trouble verifying your email, you can request a new verification link from your dashboard settings.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmailPage;
