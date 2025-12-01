import React, { useMemo } from 'react';
import { Listing, PricingModel, SpaceType } from '@fiilar/types';
import StepWrapper from './StepWrapper';
import { Repeat, Zap, Clock, MessageSquare, Check, AlertTriangle } from 'lucide-react';

interface StepBookingRulesProps {
    newListing: Partial<Listing>;
    setNewListing: React.Dispatch<React.SetStateAction<Partial<Listing>>>;
    currentStep: number;
    totalSteps: number;
    onNext: () => void;
    onBack: () => void;
}

// Thresholds for recommending manual approval
const INSTANT_BOOK_THRESHOLDS = {
    HIGH_PRICE: 100000,        // ₦100k+ per day/night/hour
    HIGH_CAUTION_FEE: 50000,   // ₦50k+ caution fee
};

const RESPONSE_TIMES = [
    { value: 'Within 1 hour', label: 'Within 1 hour', icon: '⚡' },
    { value: 'Within 2 hours', label: 'Within 2 hours', icon: '🕐' },
    { value: 'Within 4 hours', label: 'Within 4 hours', icon: '🕓' },
    { value: 'Within 12 hours', label: 'Within 12 hours', icon: '🕛' },
    { value: 'Within 24 hours', label: 'Within 24 hours', icon: '📅' },
];

const StepBookingRules: React.FC<StepBookingRulesProps> = ({
    newListing,
    setNewListing,
    currentStep,
    totalSteps,
    onNext,
    onBack,
}) => {
    const settings = newListing.settings || { allowRecurring: false, instantBook: false, minDuration: 1 };
    const pricingModel = newListing.pricingModel;

    // Determine if Instant Book should be recommended OFF based on listing characteristics
    const instantBookRecommendation = useMemo(() => {
        const reasons: string[] = [];
        
        // Event centers typically need vetting for logistics
        if (newListing.type === SpaceType.EVENT_CENTER) {
            reasons.push('Event venues often need to discuss logistics before confirming');
        }
        
        // High-value spaces
        if (newListing.price && newListing.price >= INSTANT_BOOK_THRESHOLDS.HIGH_PRICE) {
            reasons.push('High-value listings benefit from guest screening');
        }
        
        // High caution fee indicates valuable space
        if (newListing.cautionFee && newListing.cautionFee >= INSTANT_BOOK_THRESHOLDS.HIGH_CAUTION_FEE) {
            reasons.push('Your security deposit suggests careful guest vetting');
        }
        
        // Daily pricing (events) often need coordination
        if (pricingModel === PricingModel.DAILY) {
            reasons.push('Full-day bookings may need pre-event coordination');
        }
        
        return {
            recommendManualApproval: reasons.length > 0,
            reasons
        };
    }, [newListing.type, newListing.price, newListing.cautionFee, pricingModel]);

    const updateSettings = (field: string, value: boolean | number) => {
        setNewListing(prev => ({
            ...prev,
            settings: {
                ...prev.settings,
                allowRecurring: prev.settings?.allowRecurring || false,
                instantBook: prev.settings?.instantBook || false,
                minDuration: prev.settings?.minDuration || 1,
                [field]: value,
            }
        }));
    };

    const getDurationOptions = () => {
        if (pricingModel === PricingModel.HOURLY) {
            return [
                { value: 1, label: '1 hour' },
                { value: 2, label: '2 hours' },
                { value: 3, label: '3 hours' },
                { value: 4, label: '4 hours' },
                { value: 8, label: '8 hours (Full day)' },
            ];
        } else if (pricingModel === PricingModel.NIGHTLY) {
            return [
                { value: 1, label: '1 night' },
                { value: 2, label: '2 nights' },
                { value: 3, label: '3 nights' },
                { value: 5, label: '5 nights' },
                { value: 7, label: '7 nights (1 week)' },
            ];
        } else {
            return [
                { value: 1, label: '1 day' },
                { value: 2, label: '2 days' },
                { value: 3, label: '3 days' },
                { value: 5, label: '5 days' },
                { value: 7, label: '7 days (1 week)' },
            ];
        }
    };

    return (
        <StepWrapper
            title="Booking rules"
            subtitle="Control how guests can book your space"
            currentStep={currentStep}
            totalSteps={totalSteps}
            phaseName="Pricing"
            onNext={onNext}
            onBack={onBack}
            canContinue={true}
        >
            <div className="space-y-6">
                {/* Instant Book Toggle */}
                <div className={`rounded-2xl p-5 border-2 ${
                    settings.instantBook 
                        ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200'
                        : 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200'
                }`}>
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                settings.instantBook ? 'bg-yellow-100' : 'bg-gray-100'
                            }`}>
                                <Zap size={20} className={settings.instantBook ? 'text-yellow-600' : 'text-gray-500'} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Instant Book</h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    {settings.instantBook 
                                        ? "Guests can book immediately without waiting for approval."
                                        : "You'll review and approve each booking request."}
                                </p>
                                {settings.instantBook && (
                                    <span className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full">
                                        <Zap size={12} /> Gets more bookings
                                    </span>
                                )}
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={settings.instantBook}
                                onChange={() => updateSettings('instantBook', !settings.instantBook)}
                                title="Toggle instant book"
                            />
                            <div className="w-12 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-yellow-500 shadow-inner"></div>
                        </label>
                    </div>
                    
                    {/* Smart recommendation based on listing characteristics */}
                    {instantBookRecommendation.recommendManualApproval && settings.instantBook && (
                        <div className="mt-4 p-3 bg-amber-100 rounded-xl border border-amber-200">
                            <div className="flex items-start gap-2">
                                <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs font-medium text-amber-800">Consider manual approval</p>
                                    <ul className="text-xs text-amber-700 mt-1 space-y-0.5">
                                        {instantBookRecommendation.reasons.map((reason, i) => (
                                            <li key={i}>• {reason}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Encouragement when manual approval is recommended and host turns it off */}
                    {instantBookRecommendation.recommendManualApproval && !settings.instantBook && (
                        <div className="mt-4 p-3 bg-green-50 rounded-xl border border-green-200">
                            <div className="flex items-start gap-2">
                                <Check size={16} className="text-green-600 shrink-0 mt-0.5" />
                                <p className="text-xs text-green-700">
                                    <span className="font-medium">Good choice!</span> Manual approval lets you screen guests and discuss requirements before confirming.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Allow Recurring Bookings Toggle */}
                <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl p-5 border-2 border-purple-200">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                                <Repeat size={20} className="text-purple-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Allow Recurring Bookings</h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    {settings.allowRecurring 
                                        ? "Guests can book multiple consecutive days in one booking."
                                        : "Guests can only book single sessions at a time."}
                                </p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={settings.allowRecurring}
                                onChange={() => updateSettings('allowRecurring', !settings.allowRecurring)}
                                title="Toggle recurring bookings"
                            />
                            <div className="w-12 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-500 shadow-inner"></div>
                        </label>
                    </div>
                </div>

                {/* Minimum Booking Duration */}
                <section className="bg-white rounded-2xl p-5 border-2 border-gray-200">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                            <Clock size={20} className="text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Minimum Booking Duration</h3>
                            <p className="text-sm text-gray-500">Set the shortest booking length allowed</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {getDurationOptions().map((option) => (
                            <button
                                key={option.value}
                                onClick={() => updateSettings('minDuration', option.value)}
                                className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                                    settings.minDuration === option.value
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                }`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    {settings.minDuration === option.value && (
                                        <Check size={14} className="text-blue-600" />
                                    )}
                                    {option.label}
                                </div>
                            </button>
                        ))}
                    </div>
                </section>

                {/* Response Time - Only show if not Instant Book */}
                {!settings.instantBook && (
                    <section className="bg-white rounded-2xl p-5 border-2 border-gray-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                                <MessageSquare size={20} className="text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Your Response Time</h3>
                                <p className="text-sm text-gray-500">How quickly do you typically respond to requests?</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            {RESPONSE_TIMES.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => setNewListing(prev => ({ ...prev, approvalTime: option.value }))}
                                    className={`w-full p-3 rounded-xl border-2 text-left transition-all flex items-center justify-between ${
                                        newListing.approvalTime === option.value
                                            ? 'border-green-500 bg-green-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg">{option.icon}</span>
                                        <span className={`font-medium ${
                                            newListing.approvalTime === option.value ? 'text-green-700' : 'text-gray-700'
                                        }`}>
                                            {option.label}
                                        </span>
                                    </div>
                                    {newListing.approvalTime === option.value && (
                                        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                                            <Check size={12} className="text-white" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-3">
                            💡 Pending booking requests auto-cancel after 24 hours (4 hours for same-day) to protect guests.
                        </p>
                    </section>
                )}

                {/* Summary */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Summary</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                        <p>• {settings.instantBook ? 'Guests can book instantly' : 'You approve each booking'}</p>
                        <p>• {settings.allowRecurring ? 'Multi-day bookings allowed' : 'Single session bookings only'}</p>
                        <p>• Minimum booking: {getDurationOptions().find(o => o.value === settings.minDuration)?.label || '1 hour'}</p>
                        {!settings.instantBook && newListing.approvalTime && (
                            <p>• You respond {newListing.approvalTime.toLowerCase()}</p>
                        )}
                    </div>
                </div>
            </div>
        </StepWrapper>
    );
};

export default StepBookingRules;
