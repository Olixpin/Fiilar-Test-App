import React from 'react';
import { Listing, PricingModel, BookingType } from '@fiilar/types';
import StepWrapper from './StepWrapper';
import SelectionCard from '../common/SelectionCard';
import { Moon, Sun, Clock } from 'lucide-react';

interface StepPricingModelProps {
    newListing: Partial<Listing>;
    setNewListing: React.Dispatch<React.SetStateAction<Partial<Listing>>>;
    currentStep: number;
    totalSteps: number;
    onNext: () => void;
    onBack: () => void;
    hasActiveBookings?: boolean;
}

const PRICING_MODELS = [
    {
        value: PricingModel.NIGHTLY,
        label: 'Nightly',
        description: 'Charge per night, like a hotel or vacation rental',
        icon: Moon,
        unit: 'per night',
        bestFor: 'Apartments, homes, vacation rentals',
        priceUnit: BookingType.DAILY,
    },
    {
        value: PricingModel.DAILY,
        label: 'Daily',
        description: 'Charge for full-day access, great for events',
        icon: Sun,
        unit: 'per day',
        bestFor: 'Event centers, wedding venues, halls',
        priceUnit: BookingType.DAILY,
    },
    {
        value: PricingModel.HOURLY,
        label: 'Hourly',
        description: 'Charge by the hour for flexible bookings',
        icon: Clock,
        unit: 'per hour',
        bestFor: 'Studios, meeting rooms, co-working spaces',
        priceUnit: BookingType.HOURLY,
    },
];

const StepPricingModel: React.FC<StepPricingModelProps> = ({
    newListing,
    setNewListing,
    currentStep,
    totalSteps,
    onNext,
    onBack,
    hasActiveBookings = false,
}) => {
    const handleSelect = (model: typeof PRICING_MODELS[0]) => {
        if (hasActiveBookings) return;

        let bookingConfig: any = {};
        if (model.value === PricingModel.HOURLY) {
            bookingConfig = {
                operatingHours: { start: '09:00', end: '18:00' },
                bufferMinutes: 30,
                minHoursBooking: 1
            };
        } else if (model.value === PricingModel.NIGHTLY) {
            bookingConfig = {
                checkInTime: '15:00',
                checkOutTime: '11:00',
                allowLateCheckout: false
            };
        } else {
            bookingConfig = {
                accessStartTime: '08:00',
                accessEndTime: '23:00',
                overnightAllowed: false
            };
        }

        setNewListing(prev => ({
            ...prev,
            pricingModel: model.value,
            priceUnit: model.priceUnit,
            bookingConfig
        }));
    };

    const canContinue = !!newListing.pricingModel;

    return (
        <StepWrapper
            title="How do you want to charge?"
            subtitle="Choose how guests will pay for your space"
            currentStep={currentStep}
            totalSteps={totalSteps}
            phaseName="Pricing"
            onNext={onNext}
            onBack={onBack}
            canContinue={canContinue}
        >
            <div className="space-y-4">
                {hasActiveBookings && (
                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 mb-4">
                        <p className="text-sm text-amber-800">
                            <strong>Pricing model is locked</strong> because you have active bookings. Complete or cancel them to change.
                        </p>
                    </div>
                )}

                {PRICING_MODELS.map((model) => (
                    <SelectionCard
                        key={model.value}
                        title={model.label}
                        description={model.description}
                        icon={model.icon}
                        isSelected={newListing.pricingModel === model.value}
                        onClick={() => handleSelect(model)}
                        disabled={hasActiveBookings}
                        footer={
                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                                Best for: {model.bestFor}
                            </p>
                        }
                    />
                ))}
            </div>
        </StepWrapper>
    );
};

export default StepPricingModel;
