import React from 'react';
import { Listing } from '@fiilar/types';
import StepWrapper from './StepWrapper';
import { Users, Minus, Plus, UserPlus, Info } from 'lucide-react';

// Validation constants
const EXTRA_GUEST_RULES = {
    MAX_EXTRA_PERCENTAGE: 0.5,  // 50% of maxGuests
};

interface StepCapacityProps {
    newListing: Partial<Listing>;
    setNewListing: React.Dispatch<React.SetStateAction<Partial<Listing>>>;
    currentStep: number;
    totalSteps: number;
    onNext: () => void;
    onBack: () => void;
}

const StepCapacity: React.FC<StepCapacityProps> = ({
    newListing,
    setNewListing,
    currentStep,
    totalSteps,
    onNext,
    onBack,
}) => {
    // Use new model fields with fallback to legacy for migration
    const maxGuests = newListing.maxGuests ?? newListing.capacity ?? 1;
    const allowExtraGuests = newListing.allowExtraGuests ?? false;
    const extraGuestLimit = newListing.extraGuestLimit ?? 0;

    // Calculate max allowed extras (50% of maxGuests, rounded up)
    const maxAllowedExtras = Math.ceil(maxGuests * EXTRA_GUEST_RULES.MAX_EXTRA_PERCENTAGE);

    const updateMaxGuests = (value: number) => {
        const newMaxGuests = Math.max(1, Math.min(100, value));
        setNewListing(prev => {
            // Also update legacy field for compatibility
            const currentExtraLimit = prev.extraGuestLimit ?? 0;
            const newMaxExtras = Math.ceil(newMaxGuests * EXTRA_GUEST_RULES.MAX_EXTRA_PERCENTAGE);
            return {
                ...prev,
                maxGuests: newMaxGuests,
                capacity: newMaxGuests, // Keep legacy field in sync
                includedGuests: newMaxGuests, // Legacy: all guests included
                // Auto-adjust extraGuestLimit if it exceeds new max
                extraGuestLimit: Math.min(currentExtraLimit, newMaxExtras)
            };
        });
    };

    const toggleAllowExtraGuests = () => {
        setNewListing(prev => {
            const newAllow = !prev.allowExtraGuests;
            return {
                ...prev,
                allowExtraGuests: newAllow,
                // Reset extra guest settings if toggling off, keep fee for pricing step
                extraGuestLimit: newAllow ? (prev.extraGuestLimit || 1) : 0,
                extraGuestFee: newAllow ? (prev.extraGuestFee || 0) : 0,
                pricePerExtraGuest: newAllow ? (prev.extraGuestFee || 0) : 0, // Legacy sync
            };
        });
    };

    const updateExtraGuestLimit = (value: number) => {
        const newLimit = Math.max(1, Math.min(maxAllowedExtras, value));
        setNewListing(prev => ({
            ...prev,
            extraGuestLimit: newLimit
        }));
    };

    const handleMaxGuestsInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value === '') {
            setNewListing(prev => ({
                ...prev,
                maxGuests: 1,
                capacity: 1,
                includedGuests: 1,
            }));
            return;
        }
        const num = parseInt(value, 10);
        if (!isNaN(num)) {
            updateMaxGuests(num);
        }
    };

    const handleExtraLimitInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value === '') {
            setNewListing(prev => ({ ...prev, extraGuestLimit: 1 }));
            return;
        }
        const num = parseInt(value, 10);
        if (!isNaN(num)) {
            updateExtraGuestLimit(num);
        }
    };

    const canContinue = maxGuests >= 1 && (!allowExtraGuests || extraGuestLimit >= 1);

    const totalPossibleGuests = maxGuests + (allowExtraGuests ? extraGuestLimit : 0);

    return (
        <StepWrapper
            title="How many guests can your space accommodate?"
            subtitle="Set the maximum number of people your space can comfortably host"
            currentStep={currentStep}
            totalSteps={totalSteps}
            phaseName="Property Basics"
            onNext={onNext}
            onBack={onBack}
            canContinue={canContinue}
        >
            <div className="space-y-6">
                {/* Maximum Guests (Base Capacity) */}
                <div className="p-5 sm:p-6 bg-white border-2 border-gray-200 rounded-2xl">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                                <Users size={24} className="text-gray-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Base capacity</h3>
                                <p className="text-sm text-gray-500">Standard number of guests included in your price</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center justify-end gap-3">
                            <button
                                onClick={() => updateMaxGuests(maxGuests - 1)}
                                disabled={maxGuests <= 1}
                                className={`w-11 h-11 rounded-full border-2 flex items-center justify-center transition-all ${
                                    maxGuests <= 1
                                        ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                                        : 'border-gray-300 text-gray-600 hover:border-gray-900 hover:text-gray-900'
                                }`}
                                title="Decrease maximum guests"
                                aria-label="Decrease maximum guests"
                            >
                                <Minus size={18} />
                            </button>
                            <input
                                type="number"
                                min="1"
                                max="100"
                                value={maxGuests}
                                onChange={handleMaxGuestsInputChange}
                                title="Maximum number of guests"
                                aria-label="Maximum number of guests"
                                className="w-16 h-11 text-center text-xl font-bold text-gray-900 border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:ring-0 outline-none transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <button
                                onClick={() => updateMaxGuests(maxGuests + 1)}
                                disabled={maxGuests >= 100}
                                className={`w-11 h-11 rounded-full border-2 flex items-center justify-center transition-all ${
                                    maxGuests >= 100
                                        ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                                        : 'border-gray-300 text-gray-600 hover:border-gray-900 hover:text-gray-900'
                                }`}
                                title="Increase maximum guests"
                                aria-label="Increase maximum guests"
                            >
                                <Plus size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Allow Extra Guests Toggle */}
                <div className="p-5 sm:p-6 bg-gray-50 border border-gray-200 rounded-2xl">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center shrink-0">
                                <UserPlus size={24} className="text-brand-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Allow extra guests?</h3>
                                <p className="text-sm text-gray-500">
                                    Let guests book beyond your base capacity for an additional fee
                                </p>
                            </div>
                        </div>
                        
                        <button
                            onClick={toggleAllowExtraGuests}
                            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${
                                allowExtraGuests ? 'bg-brand-600' : 'bg-gray-200'
                            }`}
                            role="switch"
                            aria-checked={allowExtraGuests}
                            title="Toggle extra guests"
                        >
                            <span
                                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                                    allowExtraGuests ? 'translate-x-5' : 'translate-x-0'
                                }`}
                            />
                        </button>
                    </div>

                    {/* Extra Guest Settings (shown when toggle is on) */}
                    {allowExtraGuests && (
                        <div className="mt-5 pt-5 border-t border-gray-200 space-y-4">
                            {/* Extra Guest Limit */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div>
                                    <h4 className="font-medium text-gray-700">How many extra guests to allow?</h4>
                                    <p className="text-xs text-gray-500">Maximum {maxAllowedExtras} extra (50% of base capacity)</p>
                                </div>
                                <div className="flex items-center justify-end gap-3">
                                    <button
                                        onClick={() => updateExtraGuestLimit(extraGuestLimit - 1)}
                                        disabled={extraGuestLimit <= 1}
                                        className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all ${
                                            extraGuestLimit <= 1
                                                ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                                                : 'border-gray-300 text-gray-600 hover:border-gray-900 hover:text-gray-900'
                                        }`}
                                        title="Decrease extra guest limit"
                                        aria-label="Decrease extra guest limit"
                                    >
                                        <Minus size={14} />
                                    </button>
                                    <input
                                        type="number"
                                        min="1"
                                        max={maxAllowedExtras}
                                        value={extraGuestLimit}
                                        onChange={handleExtraLimitInputChange}
                                        title="Extra guest limit"
                                        aria-label="Extra guest limit"
                                        className="w-14 h-9 text-center text-lg font-bold text-gray-900 border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:ring-0 outline-none transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                    <button
                                        onClick={() => updateExtraGuestLimit(extraGuestLimit + 1)}
                                        disabled={extraGuestLimit >= maxAllowedExtras}
                                        className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all ${
                                            extraGuestLimit >= maxAllowedExtras
                                                ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                                                : 'border-gray-300 text-gray-600 hover:border-gray-900 hover:text-gray-900'
                                        }`}
                                        title="Increase extra guest limit"
                                        aria-label="Increase extra guest limit"
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Summary Info */}
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl">
                    <Info size={18} className="text-blue-600 shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                        {allowExtraGuests ? (
                            <>
                                <p className="font-medium mb-1">Total capacity: {totalPossibleGuests} guests</p>
                                <p>
                                    {maxGuests} guests included in base price, plus up to {extraGuestLimit} extra.
                                </p>
                                <p className="mt-2 text-blue-600">
                                    💡 Don't forget: You'll set the per-guest fee in the Pricing step (required to publish).
                                </p>
                            </>
                        ) : (
                            <p>
                                Your space will accommodate up to <strong>{maxGuests} guest{maxGuests > 1 ? 's' : ''}</strong>, 
                                all included in your base price.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </StepWrapper>
    );
};

export default StepCapacity;