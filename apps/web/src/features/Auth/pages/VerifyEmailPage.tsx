import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import { verifyEmailToken, VerificationResult } from '../../../services/emailService';

const VerifyEmailPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [result, setResult] = useState<VerificationResult | null>(null);
    const [isVerifying, setIsVerifying] = useState(true);

    useEffect(() => {
        const token = searchParams.get('token');

        if (!token) {
            setResult({
                success: false,
                message: 'No verification token provided'
            });
            setIsVerifying(false);
            return;
        }

        // Verify the token
        setTimeout(() => {
            const verificationResult = verifyEmailToken(token);
            setResult(verificationResult);
            setIsVerifying(false);
        }, 1500); // Small delay for better UX
    }, [searchParams]);

    const handleContinue = () => {
        navigate('/dashboard');
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
                                Verifying your email...
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
                    ) : (
                        <>
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <XCircle size={32} className="text-red-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                Verification Failed
                            </h2>
                            <p className="text-gray-600 mb-6">
                                {result?.message || 'Something went wrong'}
                            </p>
                            <div className="space-y-3">
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="w-full bg-brand-600 text-white py-3 rounded-xl font-semibold hover:bg-brand-700 transition"
                                >
                                    Go to Dashboard
                                </button>
                                <button
                                    onClick={() => navigate('/')}
                                    className="w-full border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition"
                                >
                                    Back to Home
                                </button>
                            </div>
                        </>
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
