import React from 'react';
import { Mail, X, RefreshCw } from 'lucide-react';
import { resendVerificationEmail } from '../services/emailService';

interface EmailVerificationBannerProps {
    userId: string;
    userEmail: string;
    onDismiss?: () => void;
}

const EmailVerificationBanner: React.FC<EmailVerificationBannerProps> = ({ userId, userEmail, onDismiss }) => {
    const [isResending, setIsResending] = React.useState(false);
    const [resendSuccess, setResendSuccess] = React.useState(false);

    const handleResend = () => {
        setIsResending(true);
        const success = resendVerificationEmail(userId);

        if (success) {
            setResendSuccess(true);
            setTimeout(() => {
                setResendSuccess(false);
                setIsResending(false);
            }, 3000);
        } else {
            setIsResending(false);
            alert('Failed to resend verification email. Please try again.');
        }
    };

    return (
        <div className="bg-yellow-50 border-b border-yellow-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1">
                        <div className="shrink-0">
                            <Mail size={20} className="text-yellow-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-yellow-900">
                                Please verify your email address
                            </p>
                            <p className="text-xs text-yellow-700 mt-0.5">
                                We sent a verification link to <span className="font-semibold">{userEmail}</span>.
                                Check your inbox and click the link to verify your account.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {resendSuccess ? (
                            <span className="text-sm font-medium text-green-600 flex items-center gap-1">
                                <Mail size={16} />
                                Email sent!
                            </span>
                        ) : (
                            <button
                                onClick={handleResend}
                                disabled={isResending}
                                className="text-sm font-medium text-yellow-700 hover:text-yellow-900 underline disabled:opacity-50 flex items-center gap-1"
                            >
                                {isResending ? (
                                    <>
                                        <RefreshCw size={14} className="animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    'Resend email'
                                )}
                            </button>
                        )}

                        {onDismiss && (
                            <button
                                onClick={onDismiss}
                                className="text-yellow-600 hover:text-yellow-800 p-1"
                                aria-label="Dismiss"
                                title="Dismiss"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmailVerificationBanner;
