import React, { useState, useEffect } from 'react';
import { Listing } from '@fiilar/types';
import { Button, Input, Select } from '@fiilar/ui';
import { Plus } from 'lucide-react';

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
    { name: 'Iron', icon: 'Scissors' },
    // Accessibility
    { name: 'Wheelchair Accessible', icon: 'Accessibility' },
    { name: 'Step-free Access', icon: 'Footprints' },
    { name: 'Elevator', icon: 'ArrowUpCircle' },
    { name: 'Wide Doorways', icon: 'Maximize' }
];

const AmenitiesSelector: React.FC<AmenitiesSelectorProps> = ({ newListing, setNewListing }) => {
    // Initialize available amenities with presets + any custom ones already in newListing
    const [availableAmenities, setAvailableAmenities] = useState<{ name: string; icon: string }[]>(PRESET_AMENITIES);

    // Sync available amenities when newListing changes (e.g. loading draft)
    useEffect(() => {
        if (newListing.amenities) {
            const customAmenities = newListing.amenities.filter(
                a => !PRESET_AMENITIES.some(p => p.name === a.name)
            );

            setAvailableAmenities(prev => {
                const uniqueCustom = customAmenities.filter(
                    c => !prev.some(p => p.name === c.name)
                );
                return [...prev, ...uniqueCustom];
            });
        }
    }, [newListing.amenities]);

    const [customName, setCustomName] = useState('');
    const [customIcon, setCustomIcon] = useState('Star');
    const [error, setError] = useState<string | null>(null);

    const toggleAmenity = (amenity: { name: string; icon: string }) => {
        const current = newListing.amenities || [];
        const isSelected = current.some(a => a.name === amenity.name);
        const updated = isSelected
            ? current.filter(a => a.name !== amenity.name)
            : [...current, { name: amenity.name, icon: amenity.icon }];
        setNewListing({ ...newListing, amenities: updated });
    };

    const addCustomAmenity = () => {
        const name = customName.trim();
        if (!name) return;

        // Check for duplicates (case-insensitive)
        const isDuplicate = availableAmenities.some(
            a => a.name.toLowerCase() === name.toLowerCase()
        );

        if (isDuplicate) {
            setError('This amenity already exists.');
            return;
        }

        const newAmenity = { name, icon: customIcon };

        // Add to available list
        setAvailableAmenities(prev => [...prev, newAmenity]);

        // Auto-select it
        setNewListing(prev => ({
            ...prev,
            amenities: [...(prev.amenities || []), newAmenity]
        }));

        // Reset input and error
        setCustomName('');
        setCustomIcon('Star');
        setError(null);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addCustomAmenity();
        }
    };

    return (
        <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
                Select Amenities
            </label>

            {/* Amenities Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                {availableAmenities.map((amenity) => {
                    const isSelected = newListing.amenities?.some(a => a.name === amenity.name);
                    return (
                        <button
                            key={amenity.name}
                            onClick={() => toggleAmenity(amenity)}
                            className={`p-3 rounded-xl border text-sm font-medium transition-all text-left flex items-center gap-2 relative overflow-hidden group
                                ${isSelected
                                    ? 'bg-brand-50/50 border-brand-500 text-brand-700 shadow-md shadow-brand-500/10'
                                    : 'bg-white/50 border-gray-200 text-gray-600 hover:border-brand-300 hover:bg-white/80'
                                }`}
                        >
                            <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors
                                ${isSelected ? 'bg-brand-500 border-brand-500' : 'border-gray-300 bg-white group-hover:border-brand-300'}
                            `}>
                                {isSelected && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                            </div>
                            <span className="truncate">{amenity.name}</span>
                        </button>
                    );
                })}
            </div>

            {/* Custom Amenity Input */}
            <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-200/60 backdrop-blur-sm">
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Plus size={16} className="text-brand-600" />
                    Add Custom Amenity
                </h4>
                <div className="flex flex-col gap-2">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 relative">
                            <Input
                                placeholder="Amenity Name (e.g. Hot Tub)"
                                value={customName}
                                onChange={(e) => {
                                    setCustomName(e.target.value);
                                    if (error) setError(null);
                                }}
                                onKeyDown={handleKeyDown}
                                variant="glass"
                                inputSize="md"
                                fullWidth
                                className={`bg-white ${error ? '!border-red-500 focus:!border-red-500 !ring-red-200' : ''}`}
                            />
                            {error && (
                                <p className="absolute -bottom-6 left-0 text-xs text-red-500 font-medium animate-in slide-in-from-top-1 fade-in duration-200">
                                    {error}
                                </p>
                            )}
                        </div>
                        <div className="w-full sm:w-48">
                            <Select
                                value={customIcon}
                                onChange={(e) => setCustomIcon(e.target.value)}
                                variant="glass"
                                aria-label="Custom amenity icon"
                                className="bg-white"
                            >
                                <option value="Star">Star (Default)</option>
                                <option value="Zap">Power</option>
                                <option value="Coffee">Coffee</option>
                                <option value="Music">Music</option>
                                <option value="Video">Video</option>
                                <option value="Shield">Security</option>
                                <option value="Sun">Outdoor</option>
                            </Select>
                        </div>
                        <Button
                            size="md"
                            onClick={addCustomAmenity}
                            disabled={!customName.trim()}
                            className="shrink-0 shadow-sm"
                            variant="primary"
                        >
                            Add
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AmenitiesSelector;
