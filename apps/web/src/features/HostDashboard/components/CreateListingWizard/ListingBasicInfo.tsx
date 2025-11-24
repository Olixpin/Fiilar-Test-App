import React from 'react';
import { Listing, SpaceType, BookingType } from '@fiilar/types';
import { Button } from '@fiilar/ui';
import {
    Sparkles, ArrowRight, Home, MapPin, DollarSign, Users, X
} from 'lucide-react';

interface ListingBasicInfoProps {
    newListing: Partial<Listing>;
    setNewListing: React.Dispatch<React.SetStateAction<Partial<Listing>>>;
    setStep: (step: number) => void;
    aiPrompt: string;
    setAiPrompt: (prompt: string) => void;
    isAiGenerating: boolean;
    handleAiAutoFill: () => void;
    showAiInput: boolean;
    setShowAiInput: (show: boolean) => void;
}

const ListingBasicInfo: React.FC<ListingBasicInfoProps> = ({
    newListing, setNewListing, setStep,
    aiPrompt, setAiPrompt, isAiGenerating, handleAiAutoFill, showAiInput, setShowAiInput
}) => {
    return (
        <div className="space-y-8 max-w-3xl mx-auto animate-in slide-in-from-right duration-300">
            {/* AI Auto-Fill - Collapsible */}
            {!showAiInput ? (
                <button
                    onClick={() => setShowAiInput(true)}
                    className="w-full group bg-linear-to-br from-brand-50 to-purple-50 hover:from-brand-100 hover:to-purple-100 p-5 rounded-2xl border-2 border-dashed border-brand-200 hover:border-brand-400 transition-all duration-300"
                >
                    <div className="flex items-center justify-center gap-3">
                        <div className="p-2.5 bg-white rounded-xl shadow-sm text-brand-600 group-hover:scale-110 transition-transform">
                            <Sparkles size={20} />
                        </div>
                        <div className="text-left">
                            <h3 className="font-bold text-gray-900 text-sm">Try AI Auto-Fill</h3>
                            <p className="text-xs text-gray-600">Describe your space and let AI complete the form</p>
                        </div>
                        <ArrowRight className="ml-auto text-brand-600 group-hover:translate-x-1 transition-transform" size={18} />
                    </div>
                </button>
            ) : (
                <div className="bg-linear-to-br from-brand-50 to-purple-50 p-6 rounded-2xl border border-brand-200 shadow-sm animate-in slide-in-from-top duration-300">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-white rounded-xl shadow-sm text-brand-600">
                            <Sparkles size={24} />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-bold text-gray-900">AI Auto-Fill</h3>
                                <Button
                                    onClick={() => setShowAiInput(false)}
                                    variant="ghost"
                                    size="sm"
                                    className="text-gray-400 hover:text-gray-600 p-1 h-auto min-w-0"
                                    title="Close AI Auto-Fill"
                                >
                                    <X size={18} />
                                </Button>
                            </div>
                            <p className="text-sm text-gray-600 mb-4">Describe your place and let AI fill in the details for you.</p>
                            <div className="relative">
                                <textarea
                                    value={aiPrompt}
                                    onChange={(e) => setAiPrompt(e.target.value)}
                                    placeholder="e.g. A modern 2-bedroom apartment in Lekki Phase 1 with a pool, gym, and 24/7 power. Great for families, $150 per night."
                                    className="w-full p-4 pr-12 rounded-xl border-2 border-brand-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none min-h-[100px] bg-white shadow-sm transition-all"
                                />
                                <div className="absolute bottom-3 right-3">
                                    <Button
                                        onClick={handleAiAutoFill}
                                        disabled={!aiPrompt.trim() || isAiGenerating}
                                        isLoading={isAiGenerating}
                                        variant="primary"
                                        size="sm"
                                    >
                                        {!isAiGenerating && <ArrowRight size={18} />}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Basic Information Card */}
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
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Listing Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            className="w-full p-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all hover:border-gray-300"
                            placeholder="e.g. Modern Studio in Lekki Phase 1"
                            value={newListing.title || ''}
                            onChange={(e) => setNewListing({ ...newListing, title: e.target.value })}
                        />
                        <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                            <span>Make it catchy and descriptive</span>
                            {newListing.title && (
                                <span className="ml-auto text-gray-400">{newListing.title.length}/100</span>
                            )}
                        </p>
                    </div>

                    {/* Space Type & Location */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                Space Type <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Home className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                                <select
                                    className="w-full pl-11 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none appearance-none bg-white transition-all hover:border-gray-300 cursor-pointer"
                                    value={newListing.type}
                                    onChange={(e) => setNewListing({ ...newListing, type: e.target.value as SpaceType })}
                                    title="Space Type"
                                >
                                    {Object.values(SpaceType).map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1.5">What type of space are you listing?</p>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                Location <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                                <input
                                    type="text"
                                    className="w-full pl-11 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all hover:border-gray-300"
                                    placeholder="Area or Address"
                                    value={newListing.location || ''}
                                    onChange={(e) => setNewListing({ ...newListing, location: e.target.value })}
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1.5">City, neighborhood, or full address</p>
                        </div>
                    </div>

                    {/* Price & Unit */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                Price <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                                <input
                                    type="number"
                                    className="w-full pl-11 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all hover:border-gray-300"
                                    placeholder="0.00"
                                    value={newListing.price ?? ''}
                                    onChange={(e) => {
                                        const val = parseFloat(e.target.value);
                                        setNewListing({ ...newListing, price: isNaN(val) ? undefined : val });
                                    }}
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1.5">Set your base rate</p>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                Pricing Unit <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <select
                                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none appearance-none bg-white transition-all hover:border-gray-300 cursor-pointer"
                                    value={newListing.priceUnit}
                                    onChange={(e) => setNewListing({ ...newListing, priceUnit: e.target.value as BookingType })}
                                    title="Price Unit"
                                >
                                    <option value={BookingType.DAILY}>Per Night</option>
                                    <option value={BookingType.HOURLY}>Per Hour</option>
                                </select>
                                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1.5">How do you charge guests?</p>
                        </div>
                    </div>

                    {/* Capacity & Included Guests */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                Maximum Capacity <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                                <input
                                    type="number"
                                    min="1"
                                    className="w-full pl-11 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all hover:border-gray-300"
                                    value={newListing.capacity ?? ''}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value);
                                        setNewListing({ ...newListing, capacity: isNaN(val) ? undefined : val });
                                    }}
                                    title="Capacity"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1.5">Maximum number of guests</p>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                Base Price Covers
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    min="1"
                                    className="flex-1 px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all hover:border-gray-300"
                                    value={newListing.includedGuests ?? ''}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value);
                                        setNewListing({ ...newListing, includedGuests: isNaN(val) ? undefined : val });
                                    }}
                                    title="Included Guests"
                                />
                                <span className="text-gray-500 text-sm font-medium">Guests</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1.5">Number of guests included in base price</p>
                        </div>
                    </div>

                    {/* Extra Cost Per Guest */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Extra Cost Per Guest
                        </label>
                        <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-sm">$</span>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                className="w-full pl-9 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all hover:border-gray-300"
                                placeholder="0"
                                value={newListing.pricePerExtraGuest ?? ''}
                                onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    setNewListing({ ...newListing, pricePerExtraGuest: isNaN(val) ? undefined : val });
                                }}
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1.5">Charge per additional guest beyond base price coverage</p>
                    </div>

                    {/* Caution Fee / Security Deposit */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Caution Fee / Security Deposit
                        </label>
                        <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-sm">$</span>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                className="w-full pl-9 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all hover:border-gray-300"
                                placeholder="0.00"
                                value={newListing.cautionFee ?? ''}
                                onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    setNewListing({ ...newListing, cautionFee: isNaN(val) ? undefined : val });
                                }}
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1.5">This amount will be added to the total but is refundable if no damages occur.</p>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            className="w-full p-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none min-h-[140px] transition-all hover:border-gray-300 resize-none"
                            placeholder="Describe your space in detail... What makes it special? What amenities do you offer? What's the neighborhood like?"
                            value={newListing.description || ''}
                            onChange={(e) => setNewListing({ ...newListing, description: e.target.value })}
                        />
                        <div className="flex items-center justify-between mt-1.5">
                            <p className="text-xs text-gray-500">Help guests imagine staying at your place</p>
                            {newListing.description && (
                                <span className="text-xs text-gray-400">{newListing.description.length} characters</span>
                            )}
                        </div>
                    </div>

                    {/* Amenities */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Amenities
                        </label>

                        {/* Default Amenities Selection */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                            {[
                                { name: 'Wifi', icon: 'Wifi' },
                                { name: 'Air Conditioning', icon: 'Wind' },
                                { name: 'Kitchen', icon: 'Utensils' },
                                { name: 'Parking', icon: 'Car' },
                                { name: 'Gym', icon: 'Dumbbell' },
                                { name: 'Pool', icon: 'Waves' },
                                { name: 'Workspace', icon: 'Briefcase' },
                                { name: 'TV', icon: 'Tv' },
                                { name: 'Washer', icon: 'Shirt' },
                                { name: 'Iron', icon: 'Scissors' } // Using Scissors as placeholder or maybe 'Zap'
                            ].map((amenity) => {
                                const isSelected = newListing.amenities?.some(a => a.name === amenity.name);
                                return (
                                    <button
                                        key={amenity.name}
                                        onClick={() => {
                                            const current = newListing.amenities || [];
                                            const updated = isSelected
                                                ? current.filter(a => a.name !== amenity.name)
                                                : [...current, { name: amenity.name, icon: amenity.icon }];
                                            setNewListing({ ...newListing, amenities: updated });
                                        }}
                                        className={`p-3 rounded-xl border-2 text-sm font-medium transition-all text-left flex items-center gap-2
                                            ${isSelected
                                                ? 'border-brand-500 bg-brand-50 text-brand-700'
                                                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                                            }`}
                                    >
                                        {/* We can't easily render dynamic icons here without a map, so we'll just show checkmark for now or use a helper if we had one. 
                                            For simplicity in this file, let's just show the checkmark state. 
                                            Actually, let's try to render the specific icon if we can import them, but that's a lot of imports.
                                            Let's stick to the checkmark for selection state.
                                        */}
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
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        placeholder="Amenity Name (e.g. Hot Tub)"
                                        className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                                        id="custom-amenity-name"
                                    />
                                </div>
                                <div className="w-1/3">
                                    <select
                                        className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                                        id="custom-amenity-icon"
                                    >
                                        <option value="Star">Star (Default)</option>
                                        <option value="Zap">Power</option>
                                        <option value="Coffee">Coffee</option>
                                        <option value="Music">Music</option>
                                        <option value="Video">Video</option>
                                        <option value="Shield">Security</option>
                                        <option value="Sun">Outdoor</option>
                                    </select>
                                </div>
                                <Button
                                    size="sm"
                                    onClick={() => {
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
                                    }}
                                >
                                    Add
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Tags
                        </label>
                        <div className="flex flex-wrap gap-2 mb-3">
                            {newListing.tags?.map((tag) => (
                                <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm font-medium">
                                    #{tag}
                                    <button
                                        onClick={() => setNewListing({ ...newListing, tags: newListing.tags?.filter(t => t !== tag) })}
                                        className="hover:text-red-500"
                                    >
                                        <X size={14} />
                                    </button>
                                </span>
                            ))}
                        </div>
                        <input
                            type="text"
                            className="w-full p-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all hover:border-gray-300"
                            placeholder="Add a tag (e.g. 'Quiet', 'Luxury', 'Beachfront') and press Enter"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const val = e.currentTarget.value.trim();
                                    if (val && !newListing.tags?.includes(val)) {
                                        setNewListing({ ...newListing, tags: [...(newListing.tags || []), val] });
                                        e.currentTarget.value = '';
                                    }
                                }
                            }}
                        />
                        <p className="text-xs text-gray-500 mt-1.5">Press Enter to add tags</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-end items-center pt-4">
                <Button
                    onClick={() => setStep(2)}
                    disabled={!newListing.title || !newListing.location || !newListing.price}
                    variant="primary"
                    size="lg"
                    className="w-full sm:w-auto"
                    rightIcon={<ArrowRight size={18} />}
                >
                    Continue to Photos
                </Button>
            </div>
        </div>
    );
};

export default ListingBasicInfo;
