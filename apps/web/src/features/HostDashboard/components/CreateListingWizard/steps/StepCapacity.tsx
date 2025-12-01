import React from 'react';
import { Listing } from '@fiilar/types';
import StepWrapper from './StepWrapper';
import { Users, Minus, Plus, Info } from 'lucide-react';

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
    const capacity = newListing.capacity || 1;
    const includedGuests = newListing.includedGuests || 1;

    const updateCapacity = (value: number) => {
        const newCapacity = Math.max(1, Math.min(50, value));
        setNewListing(prev => ({
            ...prev,
            capacity: newCapacity,
            // Keep includedGuests within bounds
            includedGuests: Math.min(prev.includedGuests || 1, newCapacity)
        }));
    };

    const updateIncludedGuests = (value: number) => {
        const newIncluded = Math.max(1, Math.min(capacity, value));
        setNewListing(prev => ({
            ...prev,
            includedGuests: newIncluded
        }));
    };

    const canContinue = capacity >= 1;

    return (
        <StepWrapper
            title="How many guests can your space accommodate?"
            subtitle="Set the maximum capacity for your space"
            currentStep={currentStep}
            totalSteps={totalSteps}
            phaseName="Property Basics"
            onNext={onNext}
            onBack={onBack}
            canContinue={canContinue}
        >
            <div className="space-y-6">
                {/* Maximum Capacity */}
                <div className="p-5 sm:p-6 bg-white border-2 border-gray-200 rounded-2xl">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                                <Users size={24} className="text-gray-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Maximum guests</h3>
                                <p className="text-sm text-gray-500">The most guests you can host</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center justify-end gap-4">
                            <button
                                onClick={() => updateCapacity(capacity - 1)}
                                disabled={capacity <= 1}
                                className={`w-11 h-11 rounded-full border-2 flex items-center justify-center transition-all ${
                                    capacity <= 1
                                        ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                                        : 'border-gray-300 text-gray-600 hover:border-gray-900 hover:text-gray-900'
                                }`}
                                title="Decrease maximum guests"
                                aria-label="Decrease maximum guests"
                            >
                                <Minus size={18} />
                            </button>
                            <span className="text-2xl font-bold text-gray-900 w-12 text-center">{capacity}</span>
                            <button
                                onClick={() => updateCapacity(capacity + 1)}
                                disabled={capacity >= 50}
                                className={`w-11 h-11 rounded-full border-2 flex items-center justify-center transition-all ${
                                    capacity >= 50
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

                {/* Included in Base Price - Optional Advanced Setting */}
                <div className="p-5 sm:p-6 bg-gray-50 border border-gray-200 rounded-2xl">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium text-gray-700">Base price covers how many guests?</h3>
                                <span className="text-[10px] font-medium text-gray-400 bg-gray-200 px-1.5 py-0.5 rounded">Optional</span>
                            </div>
                            <p className="text-sm text-gray-500">
                                {includedGuests === capacity 
                                    ? "Your base price covers all guests — no extra fees"
                                    : `First ${includedGuests} guest${includedGuests > 1 ? 's' : ''} included, then charge extra per person`
                                }
                            </p>
                        </div>
                        
                        <div className="flex items-center justify-end gap-4">
                            <button
                                onClick={() => updateIncludedGuests(includedGuests - 1)}
                                disabled={includedGuests <= 1}
                                className={`w-11 h-11 rounded-full border-2 flex items-center justify-center transition-all ${
                                    includedGuests <= 1
                                        ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                                        : 'border-gray-300 text-gray-600 hover:border-gray-900 hover:text-gray-900'
                                }`}
                                title="Decrease included guests"
                                aria-label="Decrease included guests"
                            >
                                <Minus size={18} />
                            </button>
                            <span className="text-2xl font-bold text-gray-900 w-12 text-center">{includedGuests}</span>
                            <button
                                onClick={() => updateIncludedGuests(includedGuests + 1)}
                                disabled={includedGuests >= capacity}
                                className={`w-11 h-11 rounded-full border-2 flex items-center justify-center transition-all ${
                                    includedGuests >= capacity
                                        ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                                        : 'border-gray-300 text-gray-600 hover:border-gray-900 hover:text-gray-900'
                                }`}
                                title="Increase included guests"
                                aria-label="Increase included guests"
                            >
                                <Plus size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Info Note */}
                {includedGuests < capacity && (
                    <div className="flex items-start gap-3 p-4 bg-brand-50 rounded-xl border border-brand-100">
                        <Info size={20} className="text-brand-600 shrink-0 mt-0.5" />
                        <p className="text-sm text-brand-800">
                            <strong>Example:</strong> If your base price is ₦10,000 and you set an extra guest fee of ₦2,000, 
                            a booking for {capacity} guests would cost ₦{(10000 + (capacity - includedGuests) * 2000).toLocaleString()}.
                        </p>
                    </div>
                )}
            </div>
        </StepWrapper>
    );
};

export default StepCapacity;
