import React, { useState } from 'react';
import { Listing } from '@fiilar/types';
import StepWrapper from './StepWrapper';
import { MapPin, Search, Lock, Shield } from 'lucide-react';
import { InfoBox } from '../../../../../components/common';

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

    const canContinue = !!newListing.location && newListing.location.trim().length >= 3 
        && !!newListing.address && newListing.address.trim().length >= 10;

    return (
        <StepWrapper
            title="Where is your space located?"
            subtitle="Enter your location and address details"
            currentStep={currentStep}
            totalSteps={totalSteps}
            phaseName="Property Basics"
            onNext={onNext}
            onBack={onBack}
            canContinue={canContinue}
        >
            <div className="space-y-6">
                {/* Section 1: Public Location */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">1</div>
                        <h3 className="font-semibold text-gray-900">Public Location <span className="text-red-500">*</span></h3>
                        <span className="text-xs text-gray-500">(visible to everyone)</span>
                    </div>

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
                                <p className="text-xs text-gray-500">Guests will see this general area</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Divider */}
                <div className="h-px bg-gray-200 w-full" />

                {/* Section 2: Private Address */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">2</div>
                        <h3 className="font-semibold text-gray-900">Private Address <span className="text-red-500">*</span></h3>
                        <span className="text-xs text-gray-500">(shared after booking)</span>
                    </div>

                    {/* Privacy Notice */}
                    <InfoBox variant="info" icon={<Lock size={18} />}>
                        <div>
                            <p className="font-medium text-blue-900">Your exact address is private</p>
                            <p className="text-xs text-blue-700 mt-1">
                                We only share it with confirmed guests to protect your privacy.
                            </p>
                        </div>
                    </InfoBox>

                    {/* Full Address Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full address <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Shield size={18} className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={newListing.address || ''}
                                onChange={(e) => setNewListing(prev => ({ ...prev, address: e.target.value }))}
                                placeholder="e.g. 15 Admiralty Way, Lekki Phase 1, Lagos"
                                className={`w-full pl-12 pr-4 py-3 text-base border-2 rounded-xl focus:border-gray-900 focus:ring-0 outline-none transition-colors ${
                                    newListing.address && newListing.address.trim().length >= 10
                                        ? 'border-gray-200'
                                        : 'border-gray-200'
                                }`}
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            Include street number, street name, and any landmarks (minimum 10 characters)
                        </p>
                    </div>

                    {/* Access Instructions */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Access instructions <span className="text-gray-400 font-normal">(optional)</span>
                        </label>
                        <textarea
                            value={newListing.accessInfo || ''}
                            onChange={(e) => setNewListing(prev => ({ ...prev, accessInfo: e.target.value }))}
                            placeholder="e.g. Ring the bell at gate A, security will direct you to the building"
                            rows={3}
                            className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:ring-0 outline-none transition-colors resize-none"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            Help guests find your space easily
                        </p>
                    </div>
                </div>
            </div>
        </StepWrapper>
    );
};

export default StepLocation;
