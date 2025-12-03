import React, { useState, useRef, useCallback } from 'react';
import { Listing, SpaceType, SpaceCategory, PricingModel, BookingType } from '@fiilar/types';
import StepWrapper from './StepWrapper';
import { 
    Briefcase, 
    PartyPopper, 
    Clapperboard, 
    Bed, 
    Sparkles,
    Building2,
    Users,
    GraduationCap,
    Presentation,
    Music,
    TreePine,
    Martini,
    Camera,
    Mic2,
    Film,
    Hotel,
    Home,
    Key,
    Store,
    Eye,
    ChefHat,
    Warehouse,
    Palette,
    Music2,
    Dumbbell,
    Heart,
    Cpu,
    Gamepad2,
    Building,
    Check
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface StepSpaceTypeProps {
    newListing: Partial<Listing>;
    setNewListing: React.Dispatch<React.SetStateAction<Partial<Listing>>>;
    currentStep: number;
    totalSteps: number;
    onNext: () => void;
    onBack?: () => void;
}

// Category definitions with icons
const CATEGORIES = [
    {
        id: SpaceCategory.WORK_PRODUCTIVITY,
        label: 'Work & Productivity',
        description: 'Offices, meeting rooms & work spaces',
        icon: Briefcase
    },
    {
        id: SpaceCategory.EVENT_SOCIAL,
        label: 'Event & Social',
        description: 'Venues for events, parties & gatherings',
        icon: PartyPopper
    },
    {
        id: SpaceCategory.CREATIVE_PRODUCTION,
        label: 'Creative & Production',
        description: 'Studios for photos, videos & recording',
        icon: Clapperboard
    },
    {
        id: SpaceCategory.STAY_ACCOMMODATION,
        label: 'Stay & Accommodation',
        description: 'Hotels, apartments & short-term rentals',
        icon: Bed
    },
    {
        id: SpaceCategory.SPECIALTY,
        label: 'Specialty Spaces',
        description: 'Unique spaces for specific needs',
        icon: Sparkles
    }
];

// Space types grouped by category
interface SpaceTypeOption {
    value: SpaceType;
    label: string;
    description: string;
    icon: LucideIcon;
    defaultPricing: PricingModel;
}

const SPACE_TYPES_BY_CATEGORY: Record<SpaceCategory, SpaceTypeOption[]> = {
    [SpaceCategory.WORK_PRODUCTIVITY]: [
        { value: SpaceType.CO_WORKING, label: 'Co-working Space', description: 'Shared workspace for professionals', icon: Users, defaultPricing: PricingModel.HOURLY },
        { value: SpaceType.PRIVATE_OFFICE, label: 'Private Office', description: 'Dedicated office space', icon: Building2, defaultPricing: PricingModel.HOURLY },
        { value: SpaceType.MEETING_ROOM, label: 'Meeting Room', description: 'Space for meetings & discussions', icon: Presentation, defaultPricing: PricingModel.HOURLY },
        { value: SpaceType.TRAINING_ROOM, label: 'Training & Seminar Room', description: 'Space for training sessions', icon: GraduationCap, defaultPricing: PricingModel.HOURLY },
    ],
    [SpaceCategory.EVENT_SOCIAL]: [
        { value: SpaceType.EVENT_HALL, label: 'Event Hall', description: 'Large venue for events', icon: Music, defaultPricing: PricingModel.DAILY },
        { value: SpaceType.BANQUET_HALL, label: 'Banquet Hall', description: 'Elegant venue for celebrations', icon: Users, defaultPricing: PricingModel.DAILY },
        { value: SpaceType.OUTDOOR_VENUE, label: 'Outdoor Venue', description: 'Open-air event space', icon: TreePine, defaultPricing: PricingModel.DAILY },
        { value: SpaceType.LOUNGE_ROOFTOP, label: 'Lounge & Rooftop', description: 'Trendy social venue', icon: Martini, defaultPricing: PricingModel.HOURLY },
    ],
    [SpaceCategory.CREATIVE_PRODUCTION]: [
        { value: SpaceType.PHOTO_STUDIO, label: 'Photo Studio', description: 'Professional photography space', icon: Camera, defaultPricing: PricingModel.HOURLY },
        { value: SpaceType.RECORDING_STUDIO, label: 'Recording Studio', description: 'Audio recording & podcast space', icon: Mic2, defaultPricing: PricingModel.HOURLY },
        { value: SpaceType.FILM_STUDIO, label: 'Film & Video Studio', description: 'Video production space', icon: Film, defaultPricing: PricingModel.HOURLY },
    ],
    [SpaceCategory.STAY_ACCOMMODATION]: [
        { value: SpaceType.BOUTIQUE_HOTEL, label: 'Boutique Hotel', description: 'Unique hotel experience', icon: Hotel, defaultPricing: PricingModel.NIGHTLY },
        { value: SpaceType.SERVICED_APARTMENT, label: 'Serviced Apartment', description: 'Fully furnished apartment', icon: Home, defaultPricing: PricingModel.NIGHTLY },
        { value: SpaceType.SHORT_TERM_RENTAL, label: 'Short-term Rental', description: 'Vacation or temporary stay', icon: Key, defaultPricing: PricingModel.NIGHTLY },
    ],
    [SpaceCategory.SPECIALTY]: [
        { value: SpaceType.POP_UP_RETAIL, label: 'Pop-up & Retail Space', description: 'Temporary retail location', icon: Store, defaultPricing: PricingModel.DAILY },
        { value: SpaceType.SHOWROOM, label: 'Showroom', description: 'Product display space', icon: Eye, defaultPricing: PricingModel.DAILY },
        { value: SpaceType.KITCHEN_CULINARY, label: 'Kitchen & Culinary', description: 'Commercial or shared kitchen', icon: ChefHat, defaultPricing: PricingModel.HOURLY },
        { value: SpaceType.WAREHOUSE, label: 'Warehouse', description: 'Storage or industrial space', icon: Warehouse, defaultPricing: PricingModel.DAILY },
        { value: SpaceType.ART_GALLERY, label: 'Art Gallery', description: 'Exhibition space for art', icon: Palette, defaultPricing: PricingModel.DAILY },
        { value: SpaceType.DANCE_STUDIO, label: 'Dance Studio', description: 'Space for dance & movement', icon: Music2, defaultPricing: PricingModel.HOURLY },
        { value: SpaceType.GYM_FITNESS, label: 'Gym & Fitness', description: 'Workout & fitness space', icon: Dumbbell, defaultPricing: PricingModel.HOURLY },
        { value: SpaceType.PRAYER_MEDITATION, label: 'Prayer & Meditation', description: 'Quiet spiritual space', icon: Heart, defaultPricing: PricingModel.HOURLY },
        { value: SpaceType.TECH_HUB, label: 'Tech Hub & Innovation Lab', description: 'Tech-focused workspace', icon: Cpu, defaultPricing: PricingModel.HOURLY },
        { value: SpaceType.GAMING_LOUNGE, label: 'Gaming Lounge', description: 'Gaming & esports venue', icon: Gamepad2, defaultPricing: PricingModel.HOURLY },
        { value: SpaceType.CONFERENCE_CENTER, label: 'Conference Center', description: 'Large conference facility', icon: Building, defaultPricing: PricingModel.DAILY },
    ]
};

const StepSpaceType: React.FC<StepSpaceTypeProps> = ({
    newListing,
    setNewListing,
    currentStep,
    totalSteps,
    onNext,
    onBack,
}) => {
    const [activeCategory, setActiveCategory] = useState<SpaceCategory>(SpaceCategory.WORK_PRODUCTIVITY);
    const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

    // Handle category click with scroll-to-center behavior
    const handleCategoryClick = useCallback((categoryId: SpaceCategory) => {
        setActiveCategory(categoryId);
        
        // Scroll the clicked tab to center
        const tabElement = tabRefs.current[categoryId];
        if (tabElement) {
            tabElement.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center'
            });
        }
    }, []);

    const handleSelectType = (type: SpaceType, defaultPricing: PricingModel) => {
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

    // Find the selected type info for display
    const getSelectedTypeInfo = () => {
        if (!newListing.type) return null;
        for (const types of Object.values(SPACE_TYPES_BY_CATEGORY)) {
            const found = types.find(t => t.value === newListing.type);
            if (found) return found;
        }
        return null;
    };

    const selectedTypeInfo = getSelectedTypeInfo();
    const canContinue = !!newListing.type;
    const activeSpaceTypes = SPACE_TYPES_BY_CATEGORY[activeCategory];

    return (
        <StepWrapper
            title="What type of space are you listing?"
            subtitle="Select a category, then choose your space type"
            currentStep={currentStep}
            totalSteps={totalSteps}
            phaseName="Property Basics"
            onNext={onNext}
            onBack={onBack}
            canContinue={canContinue}
            showBack={!!onBack}
        >
            {/* Selected space type indicator */}
            {selectedTypeInfo && (
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl flex items-center gap-3">
                    <div className="p-2.5 bg-blue-100 rounded-xl">
                        <selectedTypeInfo.icon size={24} className="text-blue-600" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900">{selectedTypeInfo.label}</span>
                            <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">Selected</span>
                        </div>
                        <span className="text-sm text-gray-600">{selectedTypeInfo.description}</span>
                    </div>
                </div>
            )}

            {/* Category tabs - horizontal scrollable */}
            <div className="mb-6">
                <div className="flex gap-2 overflow-x-auto overscroll-x-contain pb-2 px-1 scrollbar-hide">
                    {CATEGORIES.map((category) => {
                        const CategoryIcon = category.icon;
                        const isActive = activeCategory === category.id;
                        const spaceTypes = SPACE_TYPES_BY_CATEGORY[category.id];
                        const hasSelectedInCategory = spaceTypes.some(t => t.value === newListing.type);

                        return (
                            <button
                                key={category.id}
                                ref={(el) => { tabRefs.current[category.id] = el; }}
                                onClick={() => handleCategoryClick(category.id)}
                                className={`
                                    flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap transition-all duration-200 flex-shrink-0
                                    ${isActive 
                                        ? 'bg-blue-600 text-white shadow-md' 
                                        : hasSelectedInCategory
                                            ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }
                                `}
                            >
                                <CategoryIcon size={18} />
                                <span className="font-medium text-sm">{category.label}</span>
                                {hasSelectedInCategory && !isActive && (
                                    <Check size={14} className="text-blue-600" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Space types grid for active category */}
            <div className="space-y-2">
                <p className="text-sm text-gray-500 mb-3">
                    {CATEGORIES.find(c => c.id === activeCategory)?.description} • {activeSpaceTypes.length} options
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeSpaceTypes.map((type) => {
                        const TypeIcon = type.icon;
                        const isSelected = newListing.type === type.value;

                        return (
                            <button
                                key={type.value}
                                onClick={() => handleSelectType(type.value, type.defaultPricing)}
                                className={`
                                    p-4 rounded-xl border-2 text-left transition-all duration-200 flex items-start gap-3
                                    ${isSelected 
                                        ? 'border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-200' 
                                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                                    }
                                `}
                            >
                                <div className={`
                                    p-2 rounded-lg flex-shrink-0 transition-colors
                                    ${isSelected ? 'bg-blue-100' : 'bg-gray-100'}
                                `}>
                                    <TypeIcon 
                                        size={20} 
                                        className={isSelected ? 'text-blue-600' : 'text-gray-500'} 
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className={`font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                                            {type.label}
                                        </span>
                                        {isSelected && <Check size={16} className="text-blue-600 flex-shrink-0" />}
                                    </div>
                                    <p className="text-sm text-gray-500 mt-0.5">{type.description}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </StepWrapper>
    );
};

export default StepSpaceType;
