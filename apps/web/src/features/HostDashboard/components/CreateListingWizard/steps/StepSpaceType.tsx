import React from 'react';
import { Listing, SpaceType, PricingModel, BookingType } from '@fiilar/types';
import StepWrapper from './StepWrapper';
import SelectionCard from '../common/SelectionCard';
import { Home, Building2, Users, Mic2, Briefcase, TreePine } from 'lucide-react';

interface StepSpaceTypeProps {
    newListing: Partial<Listing>;
    setNewListing: React.Dispatch<React.SetStateAction<Partial<Listing>>>;
    currentStep: number;
    totalSteps: number;
    onNext: () => void;
    onBack?: () => void;
}

const SPACE_TYPES = [
    {
        value: SpaceType.APARTMENT,
        label: 'Apartment',
        description: 'A self-contained unit',
        icon: Home,
        defaultPricing: PricingModel.NIGHTLY
    },
    {
        value: SpaceType.STUDIO,
        label: 'Studio',
        description: 'Creative or recording space',
        icon: Mic2,
        defaultPricing: PricingModel.HOURLY
    },
    {
        value: SpaceType.CONFERENCE,
        label: 'Conference Room',
        description: 'Meeting or presentation space',
        icon: Building2,
        defaultPricing: PricingModel.HOURLY
    },
    {
        value: SpaceType.EVENT_CENTER,
        label: 'Event Center',
        description: 'Venue for events & parties',
        icon: Users,
        defaultPricing: PricingModel.DAILY
    },
    {
        value: SpaceType.CO_WORKING,
        label: 'Co-working Space',
        description: 'Shared workspace',
        icon: Briefcase,
        defaultPricing: PricingModel.HOURLY
    },
    {
        value: SpaceType.OPEN_SPACE,
        label: 'Open Space',
        description: 'Outdoor or open area',
        icon: TreePine,
        defaultPricing: PricingModel.HOURLY
    },
];

const StepSpaceType: React.FC<StepSpaceTypeProps> = ({
    newListing,
    setNewListing,
    currentStep,
    totalSteps,
    onNext,
    onBack,
}) => {
    const handleSelect = (type: SpaceType, defaultPricing: PricingModel) => {
        const priceUnit = defaultPricing === PricingModel.HOURLY ? BookingType.HOURLY : BookingType.DAILY;

        let bookingConfig: any = {};
        if (defaultPricing === PricingModel.HOURLY) {
            bookingConfig = {
                operatingHours: { start: '09:00', end: '18:00' },
                bufferMinutes: 30,
                minHoursBooking: 1
            };
        } else if (defaultPricing === PricingModel.NIGHTLY) {
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
            type,
            pricingModel: defaultPricing,
            priceUnit,
            bookingConfig
        }));
    };

    const canContinue = !!newListing.type;

    return (
        <StepWrapper
            title="What type of space are you listing?"
            subtitle="Choose the category that best describes your space"
            currentStep={currentStep}
            totalSteps={totalSteps}
            phaseName="Property Basics"
            onNext={onNext}
            onBack={onBack}
            canContinue={canContinue}
            showBack={!!onBack}
        >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {SPACE_TYPES.map((type) => (
                    <SelectionCard
                        key={type.value}
                        title={type.label}
                        description={type.description}
                        icon={type.icon}
                        isSelected={newListing.type === type.value}
                        onClick={() => handleSelect(type.value, type.defaultPricing)}
                    />
                ))}
            </div>
        </StepWrapper>
    );
};

export default StepSpaceType;
