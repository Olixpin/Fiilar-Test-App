import React from 'react';
import { Listing } from '@fiilar/types';
import { Button, Input, Select } from '@fiilar/ui';

interface AmenitiesSelectorProps {
    newListing: Partial<Listing>;
    setNewListing: React.Dispatch<React.SetStateAction<Partial<Listing>>>;
}

const PRESET_AMENITIES = [
    { name: 'Wifi', icon: 'Wifi' },
    { name: 'Air Conditioning', icon: 'Wind' },
    { name: 'Kitchen', icon: 'Utensils' },
    { name: 'Parking', icon: 'Car' },
    { name: 'Gym', icon: 'Dumbbell' },
    { name: 'Pool', icon: 'Waves' },
    { name: 'Workspace', icon: 'Briefcase' },
    { name: 'TV', icon: 'Tv' },
    { name: 'Washer', icon: 'Shirt' },
    { name: 'Iron', icon: 'Scissors' }
];

const AmenitiesSelector: React.FC<AmenitiesSelectorProps> = ({ newListing, setNewListing }) => {
    const toggleAmenity = (amenity: { name: string; icon: string }) => {
        const current = newListing.amenities || [];
        const isSelected = current.some(a => a.name === amenity.name);
        const updated = isSelected
            ? current.filter(a => a.name !== amenity.name)
            : [...current, { name: amenity.name, icon: amenity.icon }];
        setNewListing({ ...newListing, amenities: updated });
    };

    const addCustomAmenity = () => {
        const nameInput = document.getElementById('custom-amenity-name') as HTMLInputElement;
        const iconInput = document.getElementById('custom-amenity-icon') as HTMLSelectElement;
        const name = nameInput.value.trim();
        const icon = iconInput.value;

        if (name && !newListing.amenities?.some(a => a.name === name)) {
            setNewListing({
                ...newListing,
                amenities: [...(newListing.amenities || []), { name, icon }]
            });
            nameInput.value = '';
        }
    };

    return (
        <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
                Amenities
            </label>

            {/* Default Amenities Selection */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                {PRESET_AMENITIES.map((amenity) => {
                    const isSelected = newListing.amenities?.some(a => a.name === amenity.name);
                    return (
                        <button
                            key={amenity.name}
                            onClick={() => toggleAmenity(amenity)}
                            className={`p-3 rounded-xl border-2 text-sm font-medium transition-all text-left flex items-center gap-2
                                ${isSelected
                                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                                }`}
                        >
                            <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0
                                ${isSelected ? 'bg-brand-500 border-brand-500' : 'border-gray-300 bg-white'}
                            `}>
                                {isSelected && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                            </div>
                            {amenity.name}
                        </button>
                    );
                })}
            </div>

            {/* Custom Amenity Input */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Add Custom Amenity</h4>
                <div className="flex gap-2">
                    <Input
                        placeholder="Amenity Name (e.g. Hot Tub)"
                        id="custom-amenity-name"
                        variant="minimal"
                        inputSize="sm"
                        fullWidth
                    />
                    <Select
                        id="custom-amenity-icon"
                        variant="minimal"
                        aria-label="Custom amenity icon"
                    >
                        <option value="Star">Star (Default)</option>
                        <option value="Zap">Power</option>
                        <option value="Coffee">Coffee</option>
                        <option value="Music">Music</option>
                        <option value="Video">Video</option>
                        <option value="Shield">Security</option>
                        <option value="Sun">Outdoor</option>
                    </Select>
                    <Button
                        size="sm"
                        onClick={addCustomAmenity}
                    >
                        Add
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AmenitiesSelector;
