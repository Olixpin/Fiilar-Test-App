import React from 'react';
import { Listing } from '@fiilar/types';
import StepWrapper from './StepWrapper';
import { Lock, MapPin } from 'lucide-react';

interface StepAddressProps {
    newListing: Partial<Listing>;
    setNewListing: React.Dispatch<React.SetStateAction<Partial<Listing>>>;
    currentStep: number;
    totalSteps: number;
    onNext: () => void;
    onBack: () => void;
}

const StepAddress: React.FC<StepAddressProps> = ({
    newListing,
    setNewListing,
    currentStep,
    totalSteps,
    onNext,
    onBack,
}) => {
    const canContinue = true; // Address is optional but recommended

    return (
        <StepWrapper
            title="Confirm your address"
            subtitle="Your exact address is only shared after a booking is confirmed"
            currentStep={currentStep}
            totalSteps={totalSteps}
            phaseName="Property Basics"
            onNext={onNext}
            onBack={onBack}
            canContinue={canContinue}
        >
            <div className="space-y-6">
                {/* Privacy Notice */}
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <Lock size={20} className="text-blue-600 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-blue-900">Your address is private</p>
                        <p className="text-xs text-blue-700 mt-1">
                            We only share the exact address with confirmed guests to protect your privacy.
                        </p>
                    </div>
                </div>

                {/* Public Location Display */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">Public location (visible to everyone)</p>
                    <p className="font-medium text-gray-900 flex items-center gap-2">
                        <MapPin size={16} className="text-gray-400" />
                        {newListing.location || 'Not set'}
                    </p>
                </div>

                {/* Private Address Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full address (private)
                    </label>
                    <textarea
                        value={newListing.address || ''}
                        onChange={(e) => setNewListing(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="e.g. 15 Admiralty Way, Lekki Phase 1, Lagos"
                        rows={3}
                        className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:ring-0 outline-none transition-colors resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                        Include street number, street name, and any landmarks
                    </p>
                </div>

                {/* Access Instructions */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Access instructions (optional)
                    </label>
                    <textarea
                        value={newListing.accessInfo || ''}
                        onChange={(e) => setNewListing(prev => ({ ...prev, accessInfo: e.target.value }))}
                        placeholder="e.g. Ring the bell at gate A, security will direct you to the building"
                        rows={3}
                        className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:ring-0 outline-none transition-colors resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                        Help guests find your space easily
                    </p>
                </div>
            </div>
        </StepWrapper>
    );
};

export default StepAddress;
