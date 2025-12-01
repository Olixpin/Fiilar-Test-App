import React, { useState } from 'react';
import { Listing, CancellationPolicy } from '@fiilar/types';
import StepWrapper from './StepWrapper';
import { Shield, Plus, X, Check, AlertTriangle } from 'lucide-react';

interface StepSafetyProps {
    newListing: Partial<Listing>;
    setNewListing: React.Dispatch<React.SetStateAction<Partial<Listing>>>;
    currentStep: number;
    totalSteps: number;
    onNext: () => void;
    onBack: () => void;
    customSafety: string;
    setCustomSafety: (safety: string) => void;
    handleAddCustomSafety: () => void;
    toggleSafetyItem: (item: string) => void;
}

const SAFETY_ITEMS = [
    'Smoke Detector',
    'Carbon Monoxide Detector',
    'Fire Extinguisher',
    'First Aid Kit',
    'Security Camera (Exterior)',
    'Gated Compound',
    '24/7 Security',
    'Emergency Exit',
    'Safe/Lock Box',
    'CCTV Surveillance',
];

const CANCELLATION_POLICIES = [
    {
        value: CancellationPolicy.FLEXIBLE,
        label: 'Flexible',
        description: 'Full refund if cancelled 24 hours before',
        badge: 'Recommended',
    },
    {
        value: CancellationPolicy.MODERATE,
        label: 'Moderate',
        description: 'Full refund if cancelled 5 days before',
        badge: null,
    },
    {
        value: CancellationPolicy.STRICT,
        label: 'Strict',
        description: '50% refund if cancelled 7 days before',
        badge: null,
    },
    {
        value: CancellationPolicy.NON_REFUNDABLE,
        label: 'Non-refundable',
        description: 'No refunds after booking',
        badge: null,
    },
];

const StepSafety: React.FC<StepSafetyProps> = ({
    newListing,
    setNewListing,
    currentStep,
    totalSteps,
    onNext,
    onBack,
    customSafety,
    setCustomSafety,
    handleAddCustomSafety,
    toggleSafetyItem,
}) => {
    const [showCustomInput, setShowCustomInput] = useState(false);
    const safetyItems = newListing.safetyItems || [];
    const cancellationPolicy = newListing.cancellationPolicy || CancellationPolicy.MODERATE;

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddCustomSafety();
            setShowCustomInput(false);
        }
    };

    return (
        <StepWrapper
            title="Safety features & cancellation policy"
            subtitle="Help guests feel safe and set your refund policy"
            currentStep={currentStep}
            totalSteps={totalSteps}
            phaseName="Policies"
            onNext={onNext}
            onBack={onBack}
            canContinue={!!cancellationPolicy}
        >
            <div className="space-y-8">
                {/* Safety Features Section */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <Shield size={20} className="text-green-600" />
                        <h3 className="font-semibold text-gray-900">Safety features</h3>
                    </div>

                    {/* Selected Safety Items */}
                    {safetyItems.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {safetyItems.map((item) => (
                                <span
                                    key={item}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                                >
                                    <Check size={14} />
                                    {item}
                                    <button
                                        onClick={() => toggleSafetyItem(item)}
                                        className="hover:bg-green-200 rounded-full p-0.5 ml-1"
                                        title={`Remove ${item}`}
                                        aria-label={`Remove ${item}`}
                                    >
                                        <X size={14} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Safety Items Grid */}
                    <div className="grid grid-cols-2 gap-2">
                        {SAFETY_ITEMS.filter(item => !safetyItems.includes(item)).map((item) => (
                            <button
                                key={item}
                                onClick={() => toggleSafetyItem(item)}
                                className="flex items-center gap-2 p-3 text-left border border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-colors"
                            >
                                <Plus size={16} className="text-gray-400" />
                                <span className="text-sm text-gray-700">{item}</span>
                            </button>
                        ))}
                    </div>

                    {/* Custom Safety Item */}
                    {showCustomInput ? (
                        <div className="flex gap-2 mt-3">
                            <input
                                type="text"
                                value={customSafety}
                                onChange={(e) => setCustomSafety(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="e.g. Panic Button"
                                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:border-gray-900 focus:ring-0 outline-none"
                                autoFocus
                            />
                            <button
                                onClick={() => {
                                    handleAddCustomSafety();
                                    setShowCustomInput(false);
                                }}
                                className="px-4 py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800"
                            >
                                Add
                            </button>
                            <button
                                onClick={() => setShowCustomInput(false)}
                                className="px-3 py-2.5 text-gray-500 hover:text-gray-700"
                                title="Cancel"
                                aria-label="Cancel adding custom safety feature"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowCustomInput(true)}
                            className="mt-3 text-sm text-brand-600 hover:text-brand-700 font-medium"
                        >
                            + Add custom safety feature
                        </button>
                    )}
                </div>

                {/* Cancellation Policy Section */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle size={20} className="text-amber-600" />
                        <h3 className="font-semibold text-gray-900">Cancellation policy</h3>
                    </div>

                    <div className="space-y-3">
                        {CANCELLATION_POLICIES.map((policy) => {
                            const isSelected = cancellationPolicy === policy.value;
                            return (
                                <button
                                    key={policy.value}
                                    onClick={() => setNewListing(prev => ({ ...prev, cancellationPolicy: policy.value }))}
                                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                                        isSelected
                                            ? 'border-gray-900 bg-gray-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-semibold text-gray-900">{policy.label}</span>
                                        <div className="flex items-center gap-2">
                                            {policy.badge && (
                                                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                                    {policy.badge}
                                                </span>
                                            )}
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                                isSelected ? 'border-gray-900 bg-gray-900' : 'border-gray-300'
                                            }`}>
                                                {isSelected && <Check size={12} className="text-white" />}
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-500">{policy.description}</p>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </StepWrapper>
    );
};

export default StepSafety;
