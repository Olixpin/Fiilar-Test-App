import React, { useMemo } from 'react';
import { Listing, User } from '@fiilar/types';
import StepWrapper from './StepWrapper';
import { Upload, FileCheck, AlertTriangle, CheckCircle, X, Info, FileText } from 'lucide-react';

interface StepVerificationProps {
    newListing: Partial<Listing>;
    setNewListing: React.Dispatch<React.SetStateAction<Partial<Listing>>>;
    currentStep: number;
    totalSteps: number;
    onNext: () => void;
    onBack: () => void;
    handleProofUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    user: User;
    listings: Listing[];
}

const StepVerification: React.FC<StepVerificationProps> = ({
    newListing,
    setNewListing,
    currentStep,
    totalSteps,
    onNext,
    onBack,
    handleProofUpload,
    user,
    listings,
}) => {
    const hasProofOfAddress = !!newListing.proofOfAddress;
    const isUserKycVerified = user?.kycVerified || user?.kycStatus === 'verified';

    // Find other listings by this host at the SAME address with proof of address
    // This is the professional standard - proof of address is address-specific
    const reusableProofs = useMemo(() => {
        if (!newListing.address || !user?.id) return [];
        
        const currentListingId = (newListing as any).id;
        
        // Normalize address for comparison (remove punctuation, extra spaces, case)
        const normalizeAddress = (addr: string) => 
            addr?.toLowerCase()
                .replace(/[.,#\-]/g, ' ')  // Replace punctuation with spaces
                .replace(/\s+/g, ' ')       // Collapse multiple spaces
                .trim() || '';
        
        const currentAddress = normalizeAddress(newListing.address);
        
        return listings
            .filter(l => 
                l.hostId === user.id && 
                l.id !== currentListingId &&
                l.proofOfAddress && 
                normalizeAddress(l.address || '') === currentAddress
            )
            .map(l => ({
                id: l.id,
                title: l.title,
                address: l.address,
                proofOfAddress: l.proofOfAddress
            }));
    }, [listings, newListing.address, user?.id, (newListing as any).id]);

    // Check if host has any other listings with proof (for messaging)
    const hasOtherListingsWithProof = useMemo(() => {
        if (!user?.id) return false;
        const currentListingId = (newListing as any).id;
        return listings.some(l => 
            l.hostId === user.id && 
            l.id !== currentListingId && 
            l.proofOfAddress
        );
    }, [listings, user?.id, (newListing as any).id]);

    const removeProof = () => {
        setNewListing(prev => ({ ...prev, proofOfAddress: '' }));
    };

    const reuseProof = (proof: string) => {
        setNewListing(prev => ({ ...prev, proofOfAddress: proof }));
    };

    // Can continue if user is KYC verified OR has uploaded proof
    const canContinue = isUserKycVerified || hasProofOfAddress;

    return (
        <StepWrapper
            title="Verify your listing"
            subtitle="Build trust with guests by verifying your space"
            currentStep={currentStep}
            totalSteps={totalSteps}
            phaseName="Publish"
            onNext={onNext}
            onBack={onBack}
            canContinue={canContinue}
        >
            <div className="space-y-6">
                {/* User Verification Status */}
                {isUserKycVerified ? (
                    <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
                        <CheckCircle size={20} className="text-green-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium text-green-900">You're verified!</p>
                            <p className="text-sm text-green-700 mt-1">
                                Your identity has been verified. Proof of address is optional but recommended.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
                        <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium text-amber-900">Verification required</p>
                            <p className="text-sm text-amber-700 mt-1">
                                Please upload proof of address to verify this listing.
                            </p>
                        </div>
                    </div>
                )}

                {/* Proof of Address Upload */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Proof of address
                        {isUserKycVerified && <span className="text-gray-400 ml-1">(optional)</span>}
                    </label>

                    {hasProofOfAddress ? (
                        <div className="p-4 bg-white border-2 border-green-200 rounded-xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                        <FileCheck size={24} className="text-green-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">Document uploaded</p>
                                        <p className="text-xs text-gray-500">Utility bill or bank statement</p>
                                    </div>
                                </div>
                                <button
                                    onClick={removeProof}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Remove document"
                                    aria-label="Remove proof of address document"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                            
                            {/* Preview if it's an image */}
                            {newListing.proofOfAddress?.startsWith('data:image') && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <img
                                        src={newListing.proofOfAddress}
                                        alt="Proof of address"
                                        className="w-full max-h-48 object-contain rounded-lg bg-gray-50"
                                    />
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Reuse from existing listing at same address */}
                            {reusableProofs.length > 0 && (
                                <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                                    <div className="flex items-center gap-2 mb-3">
                                        <CheckCircle size={16} className="text-green-600" />
                                        <p className="text-sm font-medium text-green-900">
                                            Same address verified
                                        </p>
                                    </div>
                                    <p className="text-sm text-green-700 mb-3">
                                        You have another listing at this address. Reuse the same document:
                                    </p>
                                    <div className="space-y-2">
                                        {reusableProofs.map((listing) => (
                                            <button
                                                key={listing.id}
                                                onClick={() => reuseProof(listing.proofOfAddress!)}
                                                className="w-full flex items-center gap-3 p-3 bg-white border border-green-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors text-left"
                                            >
                                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                                                    <FileText size={18} className="text-green-600" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-medium text-gray-900 truncate">{listing.title}</p>
                                                    <p className="text-xs text-gray-500">Click to use same document</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Note about address-specific verification */}
                            {!reusableProofs.length && hasOtherListingsWithProof && (
                                <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                                    <Info size={16} className="text-amber-600 shrink-0 mt-0.5" />
                                    <p className="text-sm text-amber-800">
                                        You have verified documents for other addresses. Each property address requires its own proof of address.
                                    </p>
                                </div>
                            )}

                            {/* Upload new option - compact when reuse available */}
                            <label className={`block w-full border-2 border-dashed border-gray-300 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all cursor-pointer ${reusableProofs.length > 0 ? 'p-4' : 'p-8'}`}>
                                <input
                                    type="file"
                                    accept="image/*,.pdf"
                                    className="hidden"
                                    onChange={handleProofUpload}
                                    title="Upload proof of address"
                                    aria-label="Upload proof of address document"
                                />
                                {reusableProofs.length > 0 ? (
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                                            <Upload size={18} className="text-gray-400" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-700">Or upload a different document</p>
                                            <p className="text-xs text-gray-500">If you have a newer utility bill or bank statement</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center text-center">
                                        <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
                                            <Upload size={24} className="text-gray-400" />
                                        </div>
                                        <p className="font-medium text-gray-900 mb-1">
                                            Upload proof of address
                                        </p>
                                        <p className="text-sm text-gray-500 mb-3">
                                            Utility bill, bank statement, or similar
                                        </p>
                                        <span className="text-xs text-gray-400">
                                            JPG, PNG, or PDF up to 10MB
                                        </span>
                                    </div>
                                )}
                            </label>
                        </div>
                    )}
                </div>

                {/* Identity Verification Option */}
                <div className="p-4 border border-gray-200 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">Require guest ID verification</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={newListing.requiresIdentityVerification || false}
                                onChange={(e) => setNewListing(prev => ({
                                    ...prev,
                                    requiresIdentityVerification: e.target.checked
                                }))}
                                className="sr-only peer"
                                title="Require guest ID verification"
                                aria-label="Toggle guest ID verification requirement"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
                        </label>
                    </div>
                    <p className="text-sm text-gray-500">
                        Guests must verify their identity before booking your space
                    </p>
                </div>

                {/* Info Note */}
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                    <Info size={18} className="text-gray-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-600">
                        Verification helps build trust and may increase your bookings. Documents are securely stored and only used for verification purposes.
                    </p>
                </div>
            </div>
        </StepWrapper>
    );
};

export default StepVerification;
