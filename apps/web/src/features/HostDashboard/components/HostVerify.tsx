import React, { useState } from 'react';
import { User, Booking, Listing } from '@fiilar/types';
import { ShieldCheck, CheckCircle, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { findBookingByGuestCode, verifyHandshake } from '@fiilar/storage';

interface HostVerifyProps {
    user: User;
    listings: Listing[];
    onVerifySuccess: () => void;
}

const HostVerify: React.FC<HostVerifyProps> = ({ user, listings, onVerifySuccess }) => {
    const [code, setCode] = useState('');
    const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
    const [verifiedBooking, setVerifiedBooking] = useState<Booking | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (code.length < 6) return;

        setStatus('verifying');
        setErrorMessage('');
        setVerifiedBooking(null);

        // Simulate network delay for better UX
        await new Promise(resolve => setTimeout(resolve, 800));

        try {
            // 1. Find the booking
            const booking = findBookingByGuestCode(user.id, code.toUpperCase());

            if (!booking) {
                setStatus('error');
                setErrorMessage('Invalid code. No active booking found for this code.');
                return;
            }

            // 2. Verify the handshake
            const result = verifyHandshake(booking.id, code.toUpperCase());

            if (result === true) {
                setStatus('success');
                setVerifiedBooking(booking);
                onVerifySuccess();
            } else if (typeof result === 'object' && result.error) {
                setStatus('error');
                setErrorMessage(result.error);
            } else {
                setStatus('error');
                setErrorMessage('Verification failed. Please try again.');
            }
        } catch (err) {
            setStatus('error');
            setErrorMessage('An unexpected error occurred.');
        }
    };

    const reset = () => {
        setCode('');
        setStatus('idle');
        setVerifiedBooking(null);
        setErrorMessage('');
    };

    const getListingTitle = (listingId: string) => {
        return listings.find(l => l.id === listingId)?.title || 'Unknown Listing';
    };

    return (
        <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900">Verify Guest</h2>
                <p className="text-gray-500 mt-2">Enter the 6-character code provided by the guest to check them in.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                {status === 'success' && verifiedBooking ? (
                    <div className="p-8 text-center animate-in zoom-in-95 duration-300">
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-200">
                            <CheckCircle size={40} strokeWidth={3} />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Verification Successful!</h3>
                        <p className="text-gray-500 mb-8">
                            Guest has been successfully verified and checked in.
                        </p>

                        <div className="bg-gray-50 rounded-xl p-6 text-left mb-8 border border-gray-200">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase">Guest</p>
                                    <p className="font-medium text-gray-900">Guest #{verifiedBooking.userId.slice(-4)}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase">Listing</p>
                                    <p className="font-medium text-gray-900 truncate">{getListingTitle(verifiedBooking.listingId)}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase">Check-in Time</p>
                                    <p className="font-medium text-gray-900">{new Date().toLocaleTimeString()}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase">Status</p>
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                        Active
                                    </span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={reset}
                            className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition flex items-center justify-center gap-2"
                        >
                            Verify Another Guest <ArrowRight size={18} />
                        </button>
                    </div>
                ) : (
                    <div className="p-8">
                        <form onSubmit={handleVerify}>
                            <div className="mb-8">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Guest Handshake Code</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={code}
                                        onChange={(e) => {
                                            const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
                                            setCode(val);
                                            if (status === 'error') setStatus('idle');
                                        }}
                                        placeholder="e.g. A7B29X"
                                        className={`
                      w-full text-center text-4xl font-mono font-bold tracking-widest py-6 border-2 rounded-xl outline-none transition-all
                      ${status === 'error' ? 'border-red-300 bg-red-50 text-red-900 focus:border-red-500' : 'border-gray-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10'}
                    `}
                                    />
                                    {status === 'verifying' && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                            <Loader2 className="animate-spin text-brand-500" size={24} />
                                        </div>
                                    )}
                                </div>
                                {status === 'error' && (
                                    <div className="flex items-center gap-2 mt-3 text-red-600 text-sm font-medium animate-in slide-in-from-top-1">
                                        <AlertCircle size={16} />
                                        {errorMessage}
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={code.length !== 6 || status === 'verifying'}
                                className={`
                  w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-lg
                  ${code.length === 6 && status !== 'verifying'
                                        ? 'bg-brand-600 text-white hover:bg-brand-700 hover:shadow-xl hover:-translate-y-0.5'
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'}
                `}
                            >
                                {status === 'verifying' ? 'Verifying...' : 'Verify Guest'}
                                {!status && <ShieldCheck size={20} />}
                            </button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                            <p className="text-sm text-gray-500">
                                The handshake code ensures that the guest has arrived and checked in safely.
                                Funds are released to escrow upon successful verification.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HostVerify;
