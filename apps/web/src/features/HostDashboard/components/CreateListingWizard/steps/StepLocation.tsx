import React, { useState } from 'react';
import { Listing } from '@fiilar/types';
import StepWrapper from './StepWrapper';
import { MapPin, Search } from 'lucide-react';

interface StepLocationProps {
    newListing: Partial<Listing>;
    setNewListing: React.Dispatch<React.SetStateAction<Partial<Listing>>>;
    currentStep: number;
    totalSteps: number;
    onNext: () => void;
    onBack: () => void;
}

// Popular locations in Nigeria
const POPULAR_LOCATIONS = [
    'Lekki Phase 1, Lagos',
    'Victoria Island, Lagos',
    'Ikoyi, Lagos',
    'Ikeja GRA, Lagos',
    'Yaba, Lagos',
    'Surulere, Lagos',
    'Abuja, FCT',
    'Wuse 2, Abuja',
    'Port Harcourt, Rivers',
    'Ibadan, Oyo',
];

const StepLocation: React.FC<StepLocationProps> = ({
    newListing,
    setNewListing,
    currentStep,
    totalSteps,
    onNext,
    onBack,
}) => {
    const [searchQuery, setSearchQuery] = useState(newListing.location || '');
    const [showSuggestions, setShowSuggestions] = useState(false);

    const filteredLocations = POPULAR_LOCATIONS.filter(loc =>
        loc.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleLocationSelect = (location: string) => {
        setSearchQuery(location);
        setNewListing(prev => ({ ...prev, location }));
        setShowSuggestions(false);
    };

    const handleInputChange = (value: string) => {
        setSearchQuery(value);
        setNewListing(prev => ({ ...prev, location: value }));
        setShowSuggestions(true);
    };

    const canContinue = !!newListing.location && newListing.location.trim().length >= 3;

    return (
        <StepWrapper
            title="Where is your space located?"
            subtitle="Guests will only see the general area until they book"
            currentStep={currentStep}
            totalSteps={totalSteps}
            phaseName="Property Basics"
            onNext={onNext}
            onBack={onBack}
            canContinue={canContinue}
        >
            <div className="space-y-6">
                {/* Search Input */}
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search size={20} className="text-gray-400" />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => handleInputChange(e.target.value)}
                        onFocus={() => setShowSuggestions(true)}
                        placeholder="Enter a city or neighborhood"
                        className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:border-gray-900 focus:ring-0 outline-none transition-colors"
                    />

                    {/* Suggestions Dropdown */}
                    {showSuggestions && searchQuery && filteredLocations.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-10 max-h-60 overflow-y-auto">
                            {filteredLocations.map((location) => (
                                <button
                                    key={location}
                                    onClick={() => handleLocationSelect(location)}
                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left transition-colors"
                                >
                                    <MapPin size={18} className="text-gray-400 shrink-0" />
                                    <span className="text-gray-900">{location}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Popular Locations */}
                <div>
                    <p className="text-sm text-gray-500 mb-3">Popular locations</p>
                    <div className="flex flex-wrap gap-2">
                        {POPULAR_LOCATIONS.slice(0, 6).map((location) => (
                            <button
                                key={location}
                                onClick={() => handleLocationSelect(location)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                    newListing.location === location
                                        ? 'bg-gray-900 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {location.split(',')[0]}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Location Preview */}
                {newListing.location && (
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center">
                            <MapPin size={20} className="text-brand-600" />
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">{newListing.location}</p>
                            <p className="text-xs text-gray-500">Public location shown to guests</p>
                        </div>
                    </div>
                )}
            </div>
        </StepWrapper>
    );
};

export default StepLocation;
