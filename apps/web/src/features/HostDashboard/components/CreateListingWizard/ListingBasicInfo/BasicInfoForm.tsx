import React, { useMemo, useState } from 'react';
import { Listing, SpaceType, BookingType, PricingModel } from '@fiilar/types';
import { Input, Select, TextArea, useLocale } from '@fiilar/ui';
import { Home, Moon, Calendar, Clock, Users, UserPlus, ChevronDown, ChevronUp, Settings2, Shield } from 'lucide-react';

interface BasicInfoFormProps {
    newListing: Partial<Listing>;
    setNewListing: React.Dispatch<React.SetStateAction<Partial<Listing>>>;
}

// Validation rules configuration - based on industry standards (Airbnb, Peerspace)
const VALIDATION_RULES = {
    CAUTION_FEE_MAX_RATIO: 2,
    EXTRA_GUEST_MAX_RATIO: 1,
    MIN_PRICE: 1,
    MIN_CAPACITY: 1,
    MAX_TITLE_LENGTH: 100,
};

const BasicInfoForm: React.FC<BasicInfoFormProps> = ({ newListing, setNewListing }) => {
    const { locale } = useLocale();

    // Track pricing mode with explicit state
    const [pricingMode, setPricingMode] = useState<'flat' | 'tiered'>(() => {
        if ((newListing.pricePerExtraGuest !== undefined && newListing.pricePerExtraGuest > 0) ||
            (newListing.includedGuests !== undefined && newListing.capacity !== undefined &&
                newListing.includedGuests < newListing.capacity)) {
            return 'tiered';
        }
        return 'flat';
    });

    // Collapsible sections state - start closed unless there's existing data
    const [showAdvancedPricing, setShowAdvancedPricing] = useState(() => {
        return (newListing.pricePerExtraGuest !== undefined && newListing.pricePerExtraGuest > 0) ||
            (newListing.cautionFee !== undefined && newListing.cautionFee > 0) ||
            (newListing.includedGuests !== undefined && newListing.capacity !== undefined &&
                newListing.includedGuests < newListing.capacity);
    });

    // Real-time validation for all pricing fields
    const validationErrors = useMemo(() => {
        const errors: Record<string, string> = {};
        const price = newListing.price;
        const cautionFee = newListing.cautionFee;
        const pricePerExtraGuest = newListing.pricePerExtraGuest;
        const capacity = newListing.capacity;
        const includedGuests = newListing.includedGuests;

        if (price !== undefined && price < VALIDATION_RULES.MIN_PRICE) {
            errors.price = `Price must be at least ${locale.currencySymbol}${VALIDATION_RULES.MIN_PRICE}`;
        }

        if (cautionFee !== undefined && cautionFee > 0 && price !== undefined && price > 0) {
            const maxCautionFee = price * VALIDATION_RULES.CAUTION_FEE_MAX_RATIO;
            if (cautionFee > maxCautionFee) {
                errors.cautionFee = `Security deposit seems too high. Maximum recommended: ${locale.currencySymbol}${maxCautionFee.toLocaleString()}`;
            }
        }

        if (pricePerExtraGuest !== undefined && pricePerExtraGuest > 0 && price !== undefined && price > 0) {
            if (pricePerExtraGuest > price) {
                errors.pricePerExtraGuest = `Extra guest fee cannot exceed the base price (${locale.currencySymbol}${price.toLocaleString()})`;
            }
        }

        if (capacity !== undefined && capacity < VALIDATION_RULES.MIN_CAPACITY) {
            errors.capacity = `Capacity must be at least ${VALIDATION_RULES.MIN_CAPACITY} guest`;
        }

        if (includedGuests !== undefined && capacity !== undefined) {
            if (includedGuests > capacity) {
                errors.includedGuests = `Cannot exceed maximum capacity (${capacity} guests)`;
            }
            if (includedGuests < 1) {
                errors.includedGuests = 'At least 1 guest must be included in base price';
            }
        }

        if (newListing.title && newListing.title.length > VALIDATION_RULES.MAX_TITLE_LENGTH) {
            errors.title = `Title cannot exceed ${VALIDATION_RULES.MAX_TITLE_LENGTH} characters`;
        }

        return errors;
    }, [newListing.price, newListing.cautionFee, newListing.pricePerExtraGuest, newListing.capacity, newListing.includedGuests, newListing.title, locale.currencySymbol]);

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-linear-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <Home size={18} className="text-brand-600" />
                    Basic Information
                </h3>
                <p className="text-xs text-gray-600 mt-1">Tell us about your space</p>
            </div>

            <div className="p-6 space-y-6">
                {/* Listing Title */}
                <div className="group">
                    <Input
                        label="Listing Title"
                        placeholder="e.g. Modern Studio in Lekki Phase 1"
                        value={newListing.title || ''}
                        onChange={(e) => setNewListing({ ...newListing, title: e.target.value })}
                        helperText={!validationErrors.title ? "Make it catchy and descriptive" : undefined}
                        error={validationErrors.title}
                        variant="glass"
                        inputSize="md"
                        fullWidth
                    />
                    {newListing.title && (
                        <p className={`text-xs text-right mt-1 ${validationErrors.title ? 'text-red-500' : 'text-gray-400'}`}>
                            {newListing.title.length}/{VALIDATION_RULES.MAX_TITLE_LENGTH}
                        </p>
                    )}
                </div>

                {/* Space Type & Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Select
                        label="Space Type"
                        value={newListing.type}
                        onChange={(e) => setNewListing({ ...newListing, type: e.target.value as SpaceType })}
                        variant="glass"
                        helperText="What type of space are you listing?"
                    >
                        {Object.values(SpaceType).map(t => <option key={t} value={t}>{t}</option>)}
                    </Select>

                    <Input
                        label="Public Location (City/Area)"
                        placeholder="e.g. Lekki, Lagos or Victoria Island, Lagos"
                        value={newListing.location || ''}
                        onChange={(e) => setNewListing({ ...newListing, location: e.target.value })}
                        variant="glass"
                        helperText="Visible to everyone. Use city and area name only."
                        fullWidth
                    />
                </div>

                {/* Private Address */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-start gap-3 mb-3">
                        <Shield size={18} className="text-brand-600 mt-0.5 shrink-0" />
                        <div>
                            <label className="block text-sm font-semibold text-gray-900">Full Address (Private)</label>
                            <p className="text-xs text-gray-500 mt-0.5">This is shared only after a booking is confirmed. Guests won't see this until they pay.</p>
                        </div>
                    </div>
                    <Input
                        placeholder="e.g. 15 Admiralty Way, Lekki Phase 1, Lagos"
                        value={newListing.address || ''}
                        onChange={(e) => setNewListing({ ...newListing, address: e.target.value })}
                        variant="glass"
                        fullWidth
                    />
                    <p className="text-xs text-gray-400 mt-2 italic">Include street number, street name, and any landmarks if helpful</p>
                </div>

                {/* Pricing Model Selection */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">How do guests book your space? <span className="text-red-500">*</span></label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button
                            type="button"
                            onClick={() => setNewListing({
                                ...newListing,
                                pricingModel: PricingModel.NIGHTLY,
                                priceUnit: BookingType.DAILY
                            })}
                            className={`p-4 rounded-xl border transition-all text-left relative overflow-hidden group ${newListing.pricingModel === PricingModel.NIGHTLY
                                ? 'bg-brand-50/50 border-brand-500 shadow-lg shadow-brand-500/10'
                                : 'bg-white/50 border-gray-200 hover:border-brand-300 hover:bg-white/80'
                                }`}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <Moon size={20} className={newListing.pricingModel === PricingModel.NIGHTLY ? 'text-brand-600' : 'text-gray-400'} />
                                <span className="font-bold text-gray-900">Overnight Stays</span>
                            </div>
                            <p className="text-xs text-gray-600">Perfect for apartments, houses, hotels</p>
                            <p className="text-xs text-gray-500 mt-1">Guests book by the night</p>
                        </button>

                        <button
                            type="button"
                            onClick={() => setNewListing({
                                ...newListing,
                                pricingModel: PricingModel.DAILY,
                                priceUnit: BookingType.DAILY
                            })}
                            className={`p-4 rounded-xl border transition-all text-left relative overflow-hidden group ${newListing.pricingModel === PricingModel.DAILY
                                ? 'bg-brand-50/50 border-brand-500 shadow-lg shadow-brand-500/10'
                                : 'bg-white/50 border-gray-200 hover:border-brand-300 hover:bg-white/80'
                                }`}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <Calendar size={20} className={newListing.pricingModel === PricingModel.DAILY ? 'text-brand-600' : 'text-gray-400'} />
                                <span className="font-bold text-gray-900">Full Day Access</span>
                            </div>
                            <p className="text-xs text-gray-600">Perfect for event centers, wedding halls</p>
                            <p className="text-xs text-gray-500 mt-1">Guests book the entire day</p>
                        </button>

                        <button
                            type="button"
                            onClick={() => setNewListing({
                                ...newListing,
                                pricingModel: PricingModel.HOURLY,
                                priceUnit: BookingType.HOURLY
                            })}
                            className={`p-4 rounded-xl border transition-all text-left relative overflow-hidden group ${newListing.pricingModel === PricingModel.HOURLY
                                ? 'bg-brand-50/50 border-brand-500 shadow-lg shadow-brand-500/10'
                                : 'bg-white/50 border-gray-200 hover:border-brand-300 hover:bg-white/80'
                                }`}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <Clock size={20} className={newListing.pricingModel === PricingModel.HOURLY ? 'text-brand-600' : 'text-gray-400'} />
                                <span className="font-bold text-gray-900">By the Hour</span>
                            </div>
                            <p className="text-xs text-gray-600">Perfect for studios, meeting rooms</p>
                            <p className="text-xs text-gray-500 mt-1">Guests book specific hours</p>
                        </button>
                    </div>
                </div>

                {/* Price & Capacity Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                        label={`Price (${locale.currencySymbol})`}
                        type="number"
                        placeholder="0.00"
                        min="1"
                        value={newListing.price ?? ''}
                        onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            setNewListing({ ...newListing, price: isNaN(val) ? undefined : val });
                        }}
                        variant="glass"
                        helperText={!validationErrors.price ? `Per ${newListing.pricingModel === PricingModel.NIGHTLY ? 'night' : newListing.pricingModel === PricingModel.DAILY ? 'day' : 'hour'}` : undefined}
                        error={validationErrors.price}
                        fullWidth
                    />

                    <Input
                        label="Maximum Capacity"
                        type="number"
                        min="1"
                        placeholder="1"
                        value={newListing.capacity ?? ''}
                        onChange={(e) => {
                            const val = parseInt(e.target.value);
                            const updates: Partial<Listing> = { capacity: isNaN(val) ? undefined : val };
                            if (pricingMode === 'flat' && !isNaN(val)) {
                                updates.includedGuests = val;
                            }
                            setNewListing({ ...newListing, ...updates });
                        }}
                        variant="glass"
                        helperText={!validationErrors.capacity ? "Maximum guests allowed" : undefined}
                        error={validationErrors.capacity}
                        fullWidth
                    />
                </div>

                {/* Description */}
                <div>
                    <TextArea
                        label="Description"
                        placeholder="Describe what makes your space special..."
                        value={newListing.description || ''}
                        onChange={(e) => setNewListing({ ...newListing, description: e.target.value })}
                        variant="glass"
                        resize="none"
                        helperText="Help guests imagine staying at your place"
                        rows={4}
                    />
                    {newListing.description && (
                        <p className="text-xs text-gray-400 text-right mt-1">{newListing.description.length} characters</p>
                    )}
                </div>

                {/* Advanced Pricing Options - Collapsible */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <button
                        type="button"
                        onClick={() => setShowAdvancedPricing(!showAdvancedPricing)}
                        className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
                    >
                        <div className="flex items-center gap-2">
                            <Settings2 size={16} className="text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">Advanced Pricing Options</span>
                            <span className="text-xs text-gray-400 font-normal">(Optional)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {(pricingMode === 'tiered' || (newListing.cautionFee && newListing.cautionFee > 0)) && (
                                <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full">
                                    {pricingMode === 'tiered' && newListing.cautionFee && newListing.cautionFee > 0
                                        ? '2 set'
                                        : '1 set'}
                                </span>
                            )}
                            {showAdvancedPricing ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                        </div>
                    </button>

                    {showAdvancedPricing && (
                        <div className="p-4 space-y-5 border-t border-gray-200 bg-white">
                            {/* Guest Pricing Mode Toggle */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">Guest Pricing</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setPricingMode('flat');
                                            setNewListing({
                                                ...newListing,
                                                includedGuests: newListing.capacity || 1,
                                                pricePerExtraGuest: 0
                                            });
                                        }}
                                        className={`p-3 rounded-xl border-2 transition-all text-left ${pricingMode === 'flat'
                                            ? 'border-brand-500 bg-brand-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <Users size={18} className={pricingMode === 'flat' ? 'text-brand-600' : 'text-gray-400'} />
                                            <span className="font-semibold text-gray-900 text-sm">Flat Rate</span>
                                        </div>
                                        <p className="text-xs text-gray-500">Same price for all guests</p>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setPricingMode('tiered');
                                            setNewListing({
                                                ...newListing,
                                                includedGuests: Math.min(newListing.includedGuests || 1, (newListing.capacity || 1) - 1) || 1,
                                                pricePerExtraGuest: newListing.pricePerExtraGuest || undefined
                                            });
                                        }}
                                        className={`p-3 rounded-xl border-2 transition-all text-left ${pricingMode === 'tiered'
                                            ? 'border-brand-500 bg-brand-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <UserPlus size={18} className={pricingMode === 'tiered' ? 'text-brand-600' : 'text-gray-400'} />
                                            <span className="font-semibold text-gray-900 text-sm">Per Guest</span>
                                        </div>
                                        <p className="text-xs text-gray-500">Charge extra per guest</p>
                                    </button>
                                </div>
                            </div>

                            {/* Tiered Pricing Fields */}
                            {pricingMode === 'tiered' && (
                                <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-xl">
                                    <Input
                                        label="Base Price Covers"
                                        type="number"
                                        min="1"
                                        placeholder="1"
                                        value={newListing.includedGuests ?? ''}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value);
                                            setNewListing({ ...newListing, includedGuests: isNaN(val) ? undefined : val });
                                        }}
                                        variant="glass"
                                        helperText={!validationErrors.includedGuests ? "Guests included" : undefined}
                                        error={validationErrors.includedGuests}
                                        fullWidth
                                    />

                                    <Input
                                        label={`Extra Guest Fee (${locale.currencySymbol})`}
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="0"
                                        value={newListing.pricePerExtraGuest ?? ''}
                                        onChange={(e) => {
                                            const val = parseFloat(e.target.value);
                                            setNewListing({ ...newListing, pricePerExtraGuest: isNaN(val) ? undefined : val });
                                        }}
                                        variant="glass"
                                        helperText={!validationErrors.pricePerExtraGuest ? "Per extra guest" : undefined}
                                        error={validationErrors.pricePerExtraGuest}
                                        fullWidth
                                    />
                                </div>
                            )}

                            {/* Security Deposit */}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Shield size={14} className="text-gray-400" />
                                    <label className="text-sm font-medium text-gray-700">Security Deposit</label>
                                </div>
                                <Input
                                    label={`Amount (${locale.currencySymbol})`}
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={newListing.cautionFee ?? ''}
                                    onChange={(e) => {
                                        const val = parseFloat(e.target.value);
                                        setNewListing({ ...newListing, cautionFee: isNaN(val) ? undefined : val });
                                    }}
                                    variant="glass"
                                    helperText={!validationErrors.cautionFee ? "Refundable deposit held during booking" : undefined}
                                    error={validationErrors.cautionFee}
                                    fullWidth
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BasicInfoForm;
