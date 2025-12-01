import React, { useState } from 'react';
import { Listing } from '@fiilar/types';
import StepWrapper from './StepWrapper';
import { Plus, X, FileText, Check } from 'lucide-react';

interface StepHouseRulesProps {
    newListing: Partial<Listing>;
    setNewListing: React.Dispatch<React.SetStateAction<Partial<Listing>>>;
    currentStep: number;
    totalSteps: number;
    onNext: () => void;
    onBack: () => void;
}

const COMMON_RULES = [
    'No smoking',
    'No parties or events',
    'No pets',
    'Quiet hours after 10 PM',
    'No unregistered guests',
    'Check-in after 3 PM',
    'Check-out before 11 AM',
    'Keep the space clean',
    'No illegal activities',
    'Respect neighbors',
];

const StepHouseRules: React.FC<StepHouseRulesProps> = ({
    newListing,
    setNewListing,
    currentStep,
    totalSteps,
    onNext,
    onBack,
}) => {
    const [customRule, setCustomRule] = useState('');
    const rules = newListing.houseRules || [];

    const toggleRule = (rule: string) => {
        const isSelected = rules.includes(rule);
        const updated = isSelected
            ? rules.filter(r => r !== rule)
            : [...rules, rule];
        setNewListing(prev => ({ ...prev, houseRules: updated }));
    };

    const addCustomRule = () => {
        const rule = customRule.trim();
        if (!rule) return;
        if (rules.some(r => r.toLowerCase() === rule.toLowerCase())) return;
        
        setNewListing(prev => ({
            ...prev,
            houseRules: [...(prev.houseRules || []), rule]
        }));
        setCustomRule('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addCustomRule();
        }
    };

    return (
        <StepWrapper
            title="Set your house rules"
            subtitle="Let guests know what's expected"
            currentStep={currentStep}
            totalSteps={totalSteps}
            phaseName="Policies"
            onNext={onNext}
            onBack={onBack}
            canContinue={true}
        >
            <div className="space-y-6">
                {/* Selected Rules */}
                {rules.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {rules.map((rule) => (
                            <span
                                key={rule}
                                className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-900 text-white rounded-full text-sm font-medium"
                            >
                                {rule}
                                <button
                                    onClick={() => toggleRule(rule)}
                                    className="hover:bg-white/20 rounded-full p-0.5"
                                    title={`Remove ${rule}`}
                                    aria-label={`Remove ${rule}`}
                                >
                                    <X size={14} />
                                </button>
                            </span>
                        ))}
                    </div>
                )}

                {/* Custom Rule Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Add a custom rule
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={customRule}
                            onChange={(e) => setCustomRule(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="e.g. No shoes inside"
                            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:ring-0 outline-none transition-colors"
                        />
                        <button
                            onClick={addCustomRule}
                            disabled={!customRule.trim()}
                            className={`px-4 py-3 rounded-xl font-medium transition-all ${
                                customRule.trim()
                                    ? 'bg-gray-900 text-white hover:bg-gray-800'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                            title="Add custom rule"
                            aria-label="Add custom rule"
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                </div>

                {/* Common Rules */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Common rules
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {COMMON_RULES.map((rule) => {
                            const isSelected = rules.includes(rule);
                            return (
                                <button
                                    key={rule}
                                    onClick={() => toggleRule(rule)}
                                    className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                                        isSelected
                                            ? 'border-gray-900 bg-gray-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                                        isSelected ? 'bg-gray-900 border-gray-900' : 'border-gray-300'
                                    }`}>
                                        {isSelected && <Check size={12} className="text-white" />}
                                    </div>
                                    <span className={`text-sm ${isSelected ? 'text-gray-900 font-medium' : 'text-gray-700'}`}>
                                        {rule}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Info Note */}
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                    <FileText size={18} className="text-gray-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-600">
                        Clear rules help set expectations and reduce issues. Guests will see these before booking.
                    </p>
                </div>
            </div>
        </StepWrapper>
    );
};

export default StepHouseRules;
