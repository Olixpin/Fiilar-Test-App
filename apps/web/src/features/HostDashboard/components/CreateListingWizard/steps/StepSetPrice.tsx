import React, { useState, useMemo } from 'react';
import { Listing, PricingModel } from '@fiilar/types';
import StepWrapper from './StepWrapper';
import { Users, Shield, ChevronDown, ChevronUp, Info, AlertTriangle } from 'lucide-react';

// Validation limits - keep in sync with useListingForm.ts VALIDATION_RULES
const PRICE_LIMITS = {
    MIN_PRICE: 1000,                         // Minimum ₦1,000
    MAX_PRICE_CAP: 50_000_000,               // Max ₦50 million
    CAUTION_FEE_MAX_RATIO: 1.5,              // Max 1.5x base price
    EXTRA_GUEST_MAX_RATIO: 0.5,              // Max 0.5x base price
    CAUTION_FEE_MAX_CAP: 5_000_000,          // Absolute max ₦5 million
    EXTRA_GUEST_MAX_CAP: 50_000,             // Absolute max ₦50k
};

interface StepSetPriceProps {
    newListing: Partial<Listing>;
    setNewListing: React.Dispatch<React.SetStateAction<Partial<Listing>>>;
    currentStep: number;
    totalSteps: number;
    onNext: () => void;
    onBack: () => void;
}

const StepSetPrice: React.FC<StepSetPriceProps> = ({
    newListing,
    setNewListing,
    currentStep,
    totalSteps,
    onNext,
    onBack,
}) => {
    const [showAdvanced, setShowAdvanced] = useState(
        Boolean((newListing.cautionFee && newListing.cautionFee > 0) ||
        (newListing.pricePerExtraGuest && newListing.pricePerExtraGuest > 0))
    );

    const pricingModel = newListing.pricingModel || PricingModel.DAILY;
    const priceLabel = pricingModel === PricingModel.HOURLY ? 'hour' : 
                       pricingModel === PricingModel.NIGHTLY ? 'night' : 'day';

    const price = newListing.price || 0;
    const cautionFee = newListing.cautionFee || 0;
    const pricePerExtraGuest = newListing.pricePerExtraGuest || 0;
    const capacity = newListing.capacity || 1;
    const includedGuests = newListing.includedGuests || 1;

    // Calculate validation warnings
    const validationWarnings = useMemo(() => {
        const warnings: { field: string; message: string; severity: 'error' | 'warning' }[] = [];
        
        // Base price validation
        if (price > 0 && price < PRICE_LIMITS.MIN_PRICE) {
            warnings.push({
                field: 'price',
                message: `Minimum price is ₦${PRICE_LIMITS.MIN_PRICE.toLocaleString()}`,
                severity: 'error'
            });
        }
        if (price > PRICE_LIMITS.MAX_PRICE_CAP) {
            warnings.push({
                field: 'price',
                message: `Maximum price is ₦${PRICE_LIMITS.MAX_PRICE_CAP.toLocaleString()}`,
                severity: 'error'
            });
        }
        
        // Caution fee validation
        const maxCautionByRatio = price * PRICE_LIMITS.CAUTION_FEE_MAX_RATIO;
        const maxCaution = Math.min(maxCautionByRatio, PRICE_LIMITS.CAUTION_FEE_MAX_CAP);
        if (cautionFee > maxCaution && price > 0) {
            if (cautionFee > PRICE_LIMITS.CAUTION_FEE_MAX_CAP) {
                warnings.push({
                    field: 'cautionFee',
                    message: `Maximum caution fee is ₦${PRICE_LIMITS.CAUTION_FEE_MAX_CAP.toLocaleString()}`,
                    severity: 'error'
                });
            } else {
                warnings.push({
                    field: 'cautionFee',
                    message: `Caution fee shouldn't exceed ${PRICE_LIMITS.CAUTION_FEE_MAX_RATIO}x your base price (max ₦${maxCautionByRatio.toLocaleString()})`,
                    severity: 'warning'
                });
            }
        }
        
        // Extra guest fee validation
        const maxExtraByRatio = price * PRICE_LIMITS.EXTRA_GUEST_MAX_RATIO;
        const maxExtra = Math.min(maxExtraByRatio, PRICE_LIMITS.EXTRA_GUEST_MAX_CAP);
        if (pricePerExtraGuest > maxExtra && price > 0) {
            if (pricePerExtraGuest > PRICE_LIMITS.EXTRA_GUEST_MAX_CAP) {
                warnings.push({
                    field: 'pricePerExtraGuest',
                    message: `Maximum extra guest fee is ₦${PRICE_LIMITS.EXTRA_GUEST_MAX_CAP.toLocaleString()}`,
                    severity: 'error'
                });
            } else {
                warnings.push({
                    field: 'pricePerExtraGuest',
                    message: `Extra guest fee shouldn't exceed your base price (max ₦${maxExtraByRatio.toLocaleString()})`,
                    severity: 'warning'
                });
            }
        }
        
        return warnings;
    }, [price, cautionFee, pricePerExtraGuest]);

    const hasErrors = validationWarnings.some(w => w.severity === 'error');
    const canContinue = price >= PRICE_LIMITS.MIN_PRICE && !hasErrors;
    
    // Helper to get warnings for a specific field
    const getFieldWarning = (field: string) => validationWarnings.find(w => w.field === field);

    // Calculate what a guest would pay
    const serviceFeeRate = 0.10; // 10% service fee
    const estimatedServiceFee = Math.round(price * serviceFeeRate);
    const estimatedTotal = price + estimatedServiceFee;

    return (
        <StepWrapper
            title="Set your price"
            subtitle="You can adjust your price anytime"
            currentStep={currentStep}
            totalSteps={totalSteps}
            phaseName="Pricing"
            onNext={onNext}
            onBack={onBack}
            canContinue={canContinue}
        >
            <div className="space-y-6">
                {/* Main Price Input */}
                <div className={`p-6 bg-white border-2 rounded-2xl ${
                    getFieldWarning('price')?.severity === 'error' ? 'border-red-300' : 'border-gray-200'
                }`}>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Base price per {priceLabel}
                    </label>
                    <div className="flex items-center gap-2">
                        <span className="text-3xl font-bold text-gray-400">₦</span>
                        <input
                            type="number"
                            value={price || ''}
                            onChange={(e) => setNewListing(prev => ({ 
                                ...prev, 
                                price: Math.max(0, parseInt(e.target.value) || 0) 
                            }))}
                            placeholder="0"
                            min="1"
                            className="text-4xl sm:text-5xl font-bold text-gray-900 w-full outline-none bg-transparent"
                        />
                    </div>
                    <p className="text-sm text-gray-500 mt-2">per {priceLabel}</p>
                    {getFieldWarning('price') && (
                        <div className={`flex items-center gap-2 mt-3 text-sm ${
                            getFieldWarning('price')?.severity === 'error' ? 'text-red-600' : 'text-amber-600'
                        }`}>
                            <AlertTriangle size={16} />
                            <span>{getFieldWarning('price')?.message}</span>
                        </div>
                    )}
                    {price > 0 && !getFieldWarning('price') && (
                        <p className="text-xs text-green-600 mt-2">
                            ✓ Valid price range (₦{PRICE_LIMITS.MIN_PRICE.toLocaleString()} - ₦{PRICE_LIMITS.MAX_PRICE_CAP.toLocaleString()})
                        </p>
                    )}
                </div>

                {/* Guest sees */}
                {price > 0 && (
                    <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-sm text-gray-600 mb-2">What guests will see:</p>
                        <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                                <span>Your price</span>
                                <span>₦{price.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Service fee</span>
                                <span>₦{estimatedServiceFee.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between font-semibold text-gray-900 pt-2 border-t border-gray-200 mt-2">
                                <span>Guest total</span>
                                <span>₦{estimatedTotal.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Advanced Options Toggle */}
                <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="w-full flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                    <span className="font-medium text-gray-700">Advanced pricing options</span>
                    {showAdvanced ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                </button>

                {/* Advanced Options */}
                {showAdvanced && (
                    <div className="space-y-4 animate-in slide-in-from-top-2">
                        {/* Caution Fee */}
                        <div className={`p-4 border-2 rounded-xl ${
                            getFieldWarning('cautionFee')?.severity === 'error' ? 'border-red-300' :
                            getFieldWarning('cautionFee')?.severity === 'warning' ? 'border-amber-300' : 'border-gray-200'
                        }`}>
                            <div className="flex items-center gap-2 mb-2">
                                <Shield size={18} className="text-gray-400" />
                                <label className="text-sm font-medium text-gray-700">
                                    Caution / Security Deposit
                                </label>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-lg text-gray-400">₦</span>
                                <input
                                    type="number"
                                    value={cautionFee || ''}
                                    onChange={(e) => setNewListing(prev => ({ 
                                        ...prev, 
                                        cautionFee: Math.max(0, parseInt(e.target.value) || 0) 
                                    }))}
                                    placeholder="0"
                                    min="0"
                                    className="text-xl font-semibold text-gray-900 w-full outline-none bg-transparent"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Refundable deposit to cover potential damages</p>
                            {getFieldWarning('cautionFee') && (
                                <div className={`flex items-center gap-2 mt-2 text-xs ${
                                    getFieldWarning('cautionFee')?.severity === 'error' ? 'text-red-600' : 'text-amber-600'
                                }`}>
                                    <AlertTriangle size={14} />
                                    <span>{getFieldWarning('cautionFee')?.message}</span>
                                </div>
                            )}
                            {!getFieldWarning('cautionFee') && price > 0 && (
                                <p className="text-xs text-gray-400 mt-2">
                                    Suggested max: ₦{Math.min(price * PRICE_LIMITS.CAUTION_FEE_MAX_RATIO, PRICE_LIMITS.CAUTION_FEE_MAX_CAP).toLocaleString()}
                                </p>
                            )}
                        </div>

                        {/* Extra Guest Fee */}
                        {includedGuests < capacity && (
                            <div className={`p-4 border-2 rounded-xl ${
                                getFieldWarning('pricePerExtraGuest')?.severity === 'error' ? 'border-red-300' :
                                getFieldWarning('pricePerExtraGuest')?.severity === 'warning' ? 'border-amber-300' : 'border-gray-200'
                            }`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <Users size={18} className="text-gray-400" />
                                    <label className="text-sm font-medium text-gray-700">
                                        Price per extra guest
                                    </label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-lg text-gray-400">₦</span>
                                    <input
                                        type="number"
                                        value={pricePerExtraGuest || ''}
                                        onChange={(e) => setNewListing(prev => ({ 
                                            ...prev, 
                                            pricePerExtraGuest: Math.max(0, parseInt(e.target.value) || 0) 
                                        }))}
                                        placeholder="0"
                                        min="0"
                                        className="text-xl font-semibold text-gray-900 w-full outline-none bg-transparent"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    For guests beyond {includedGuests} (up to {capacity} total)
                                </p>
                                {getFieldWarning('pricePerExtraGuest') && (
                                    <div className={`flex items-center gap-2 mt-2 text-xs ${
                                        getFieldWarning('pricePerExtraGuest')?.severity === 'error' ? 'text-red-600' : 'text-amber-600'
                                    }`}>
                                        <AlertTriangle size={14} />
                                        <span>{getFieldWarning('pricePerExtraGuest')?.message}</span>
                                    </div>
                                )}
                                {!getFieldWarning('pricePerExtraGuest') && price > 0 && (
                                    <p className="text-xs text-gray-400 mt-2">
                                        Suggested max: ₦{Math.min(price * PRICE_LIMITS.EXTRA_GUEST_MAX_RATIO, PRICE_LIMITS.EXTRA_GUEST_MAX_CAP).toLocaleString()}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Info Note */}
                        <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl">
                            <Info size={18} className="text-blue-600 shrink-0 mt-0.5" />
                            <p className="text-sm text-blue-800">
                                Your base price includes {includedGuests} guest{includedGuests > 1 ? 's' : ''}. 
                                You can adjust the number of included guests in the capacity settings.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </StepWrapper>
    );
};

export default StepSetPrice;
