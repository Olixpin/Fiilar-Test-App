import React from 'react';
import { Listing, Amenity } from '@fiilar/types';
import StepWrapper from './StepWrapper';
import { Check, Wifi, Wind, Utensils, Car, Dumbbell, Waves, Briefcase, Tv, Shirt, Accessibility, ArrowUpCircle, Shield, Zap, Droplet, Home, LucideIcon, Gamepad2, BatteryCharging, Circle } from 'lucide-react';

interface StepAmenitiesProps {
    newListing: Partial<Listing>;
    setNewListing: React.Dispatch<React.SetStateAction<Partial<Listing>>>;
    currentStep: number;
    totalSteps: number;
    onNext: () => void;
    onBack: () => void;
}

// Curated amenities with proper icons
const AMENITIES: { name: string; icon: LucideIcon }[] = [
    { name: 'Wifi', icon: Wifi },
    { name: 'Air Conditioning', icon: Wind },
    { name: 'Kitchen', icon: Utensils },
    { name: 'Parking', icon: Car },
    { name: 'Gym', icon: Dumbbell },
    { name: 'Pool', icon: Waves },
    { name: 'Workspace', icon: Briefcase },
    { name: 'TV', icon: Tv },
    { name: 'Washer', icon: Shirt },
    { name: 'Wheelchair Accessible', icon: Accessibility },
    { name: 'Elevator', icon: ArrowUpCircle },
    { name: 'Security', icon: Shield },
    { name: 'Generator', icon: Zap },
    { name: 'Hot Water', icon: Droplet },
    { name: 'Balcony', icon: Home },
    { name: 'Snooker', icon: Circle },
    { name: 'Game Console', icon: Gamepad2 },
    { name: 'Inverter', icon: BatteryCharging },
];

const StepAmenities: React.FC<StepAmenitiesProps> = ({
    newListing,
    setNewListing,
    currentStep,
    totalSteps,
    onNext,
    onBack,
}) => {
    const selectedAmenities = newListing.amenities || [];

    const toggleAmenity = (amenity: { name: string; icon: LucideIcon }) => {
        const isSelected = selectedAmenities.some(a => a.name === amenity.name);
        const amenityData: Amenity = { name: amenity.name, icon: amenity.name };
        const updated = isSelected
            ? selectedAmenities.filter(a => a.name !== amenity.name)
            : [...selectedAmenities, amenityData];
        setNewListing(prev => ({ ...prev, amenities: updated }));
    };

    return (
        <StepWrapper
            title="What amenities do you offer?"
            subtitle="Select all the amenities available at your space"
            currentStep={currentStep}
            totalSteps={totalSteps}
            phaseName="Stand Out"
            onNext={onNext}
            onBack={onBack}
            canContinue={true}
        >
            <div className="space-y-6">
                {/* Selected Count */}
                {selectedAmenities.length > 0 && (
                    <div className="text-sm text-gray-500">
                        <span className="font-medium text-brand-600">{selectedAmenities.length}</span> amenities selected
                    </div>
                )}

                {/* Amenities Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {AMENITIES.map((amenity) => {
                        const isSelected = selectedAmenities.some(a => a.name === amenity.name);
                        const Icon = amenity.icon;
                        return (
                            <button
                                key={amenity.name}
                                onClick={() => toggleAmenity(amenity)}
                                className={`group relative p-4 rounded-xl border-2 text-left transition-all duration-200 ease-out ${isSelected
                                        ? 'border-brand-500 bg-brand-50 shadow-sm ring-1 ring-brand-500/10'
                                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md hover:-translate-y-0.5'
                                    }`}
                            >
                                {/* Checkmark */}
                                <div className={`absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200 ${isSelected
                                        ? 'bg-brand-600 scale-100'
                                        : 'bg-gray-200 scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100'
                                    }`}>
                                    <Check size={12} className="text-white" strokeWidth={3} />
                                </div>
                                
                                {/* Icon & Name */}
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                                        isSelected ? 'bg-brand-100 text-brand-600' : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                                    }`}>
                                        <Icon size={20} />
                                    </div>
                                    <span className={`text-sm font-medium transition-colors ${isSelected ? 'text-brand-700' : 'text-gray-600 group-hover:text-gray-900'
                                        }`}>
                                        {amenity.name}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Tip */}
                <p className="text-xs text-gray-400 text-center pt-2">
                    Missing an amenity? Contact us to suggest new ones.
                </p>
            </div>
        </StepWrapper>
    );
};

export default StepAmenities;
