import React from 'react';
import { Listing, User } from '@fiilar/types';
import { Button } from '@fiilar/ui';
import { ShieldCheck, Upload, FileText, CheckCircle, AlertCircle, ArrowRight, Lock } from 'lucide-react';

interface ListingVerificationProps {
    newListing: Partial<Listing>;
    setStep: (step: number) => void;
    handleProofUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    user: User;
    onExit?: () => void;
}

const ListingVerification: React.FC<ListingVerificationProps> = ({
    newListing, setStep, handleProofUpload, user, onExit
}) => {
    const addressUploaded = !!newListing.proofOfAddress;
    const identityVerified = !!user.kycVerified;
    const canContinue = !!(addressUploaded && identityVerified);

    return (
        <div className="space-y-8 animate-in slide-in-from-right duration-500">
            {/* Header with Trust Badge */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        Verify Your Listing
                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full border border-blue-200 font-medium">Required</span>
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">To ensure safety and trust, we need to verify your identity and property ownership.</p>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-100 text-xs font-bold shadow-sm">
                    <Lock size={14} /> Secure & Encrypted
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Identity Verification Card */}
                <div className={`
                    glass-card p-6 rounded-3xl border transition-all duration-500 relative overflow-hidden group hover:shadow-xl
                    ${identityVerified ? 'border-green-200 bg-green-50/30' : 'border-white/40 shadow-lg shadow-brand-900/5 hover:border-brand-300'}
                `}>
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-2xl transition-colors duration-300 ${identityVerified ? 'bg-green-100 text-green-600' : 'bg-brand-50 text-brand-600 group-hover:bg-brand-100 group-hover:text-brand-700'}`}>
                                <ShieldCheck size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900">Identity Verification</h4>
                                <p className="text-xs text-gray-500 mt-0.5">Government ID, Passport, or Driver's License</p>
                            </div>
                        </div>
                        {identityVerified && <CheckCircle className="text-green-500 animate-in zoom-in" size={24} />}
                    </div>

                    <div className="space-y-4">
                        {identityVerified ? (
                            <div className="w-full border-2 border-green-200 bg-green-50/50 rounded-2xl p-8 text-center">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <ShieldCheck size={24} className="text-green-600" />
                                </div>
                                <p className="text-sm font-bold text-green-800">Identity Verified</p>
                                <p className="text-xs text-green-600">Your account is fully verified</p>
                            </div>
                        ) : (
                            <div className="w-full border-2 border-dashed border-gray-200 bg-white/50 hover:bg-brand-50/30 hover:border-brand-400 rounded-2xl p-8 text-center transition-all duration-300">
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                                    <AlertCircle size={24} className="text-gray-500 group-hover:text-brand-600" />
                                </div>
                                <p className="text-sm font-bold text-gray-700 group-hover:text-brand-700">Verification Required</p>
                                <p className="text-xs text-gray-500 mb-4">Please verify your account identity first</p>
                                <Button variant="outline" size="sm" onClick={() => window.open('/settings/verification', '_blank')} className="hover:bg-white">
                                    Verify Identity
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Proof of Address Card */}
                <div className={`
                    glass-card p-6 rounded-3xl border transition-all duration-500 relative overflow-hidden group hover:shadow-xl
                    ${addressUploaded ? 'border-green-200 bg-green-50/30' : 'border-white/40 shadow-lg shadow-brand-900/5 hover:border-brand-300'}
                `}>
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-2xl transition-colors duration-300 ${addressUploaded ? 'bg-green-100 text-green-600' : 'bg-brand-50 text-brand-600 group-hover:bg-brand-100 group-hover:text-brand-700'}`}>
                                <FileText size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900">Proof of Ownership</h4>
                                <p className="text-xs text-gray-500 mt-0.5">Utility Bill, Deed, or Lease Agreement</p>
                            </div>
                        </div>
                        {addressUploaded && <CheckCircle className="text-green-500 animate-in zoom-in" size={24} />}
                    </div>

                    <div className="space-y-4">
                        <label className={`
                            block w-full border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 relative
                            ${addressUploaded
                                ? 'border-green-300 bg-green-50/50 hover:bg-green-100/50'
                                : 'border-gray-200 hover:border-brand-400 hover:bg-brand-50/30 bg-white/50'}
                        `}>
                            <input
                                type="file"
                                accept="image/*,.pdf"
                                className="hidden"
                                onChange={handleProofUpload}
                            />
                            {addressUploaded ? (
                                <div className="space-y-2">
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <FileText size={24} className="text-green-600" />
                                    </div>
                                    <p className="text-sm font-bold text-green-800">Document Uploaded</p>
                                    <p className="text-xs text-green-600">Click to replace</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                                        <Upload size={20} className="text-gray-500 group-hover:text-brand-600" />
                                    </div>
                                    <p className="text-sm font-bold text-gray-700 group-hover:text-brand-700">Upload Proof</p>
                                    <p className="text-xs text-gray-400">JPG, PNG or PDF (Max 5MB)</p>
                                </div>
                            )}
                        </label>
                    </div>
                </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 flex gap-3 items-start backdrop-blur-sm">
                <AlertCircle className="text-blue-600 shrink-0 mt-0.5" size={20} />
                <div>
                    <h4 className="text-sm font-bold text-blue-900">Why do we need this?</h4>
                    <p className="text-xs text-blue-800 mt-1 leading-relaxed">
                        To maintain a safe community, we verify every host. Your documents are encrypted and stored securely.
                        They are only used for verification purposes and will never be shared publicly.
                    </p>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center pt-6 border-t border-white/20">
                <Button
                    onClick={() => setStep(3)}
                    variant="ghost"
                    size="lg"
                    className="text-gray-500 hover:text-gray-900"
                >
                    Back
                </Button>
                <Button
                    onClick={() => setStep(5)}
                    disabled={!canContinue}
                    variant="primary"
                    size="lg"
                    className="shadow-xl shadow-brand-500/20 hover:shadow-brand-500/40 transition-all hover:scale-[1.02] relative overflow-hidden group"
                    rightIcon={<ArrowRight size={18} />}
                >
                    <span className="relative z-10">Continue to Review</span>
                    {/* Shine effect */}
                    <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-0"></div>
                </Button>
            </div>
        </div>
    );
};

export default ListingVerification;
