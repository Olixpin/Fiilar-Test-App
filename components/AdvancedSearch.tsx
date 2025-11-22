import React, { useState } from 'react';
import { Search, MapPin, DollarSign, Calendar, Users, Home, SlidersHorizontal, X } from 'lucide-react';
import { SpaceType, BookingType } from '../types';

export interface SearchFilters {
    searchTerm: string;
    location: string;
    priceMin: number;
    priceMax: number;
    spaceType: SpaceType | 'all';
    bookingType: BookingType | 'all';
    guestCount: number;
    dateFrom: string;
    dateTo: string;
}

interface AdvancedSearchProps {
    filters: SearchFilters;
    onFilterChange: (filters: SearchFilters) => void;
    onClose?: () => void;
}

const SPACE_TYPES = [
    { value: 'all', label: 'All Types' },
    { value: SpaceType.APARTMENT, label: 'Apartment' },
    { value: SpaceType.STUDIO, label: 'Studio' },
    { value: SpaceType.CONFERENCE, label: 'Conference Room' },
    { value: SpaceType.EVENT_CENTER, label: 'Event Center' },
    { value: SpaceType.CO_WORKING, label: 'Co-working Space' },
    { value: SpaceType.OPEN_SPACE, label: 'Open Space' }
];

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({ filters, onFilterChange, onClose }) => {
    const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);
    const [showFilters, setShowFilters] = useState(false);

    const handleChange = (key: keyof SearchFilters, value: any) => {
        const updated = { ...localFilters, [key]: value };
        setLocalFilters(updated);
        onFilterChange(updated);
    };

    const handleReset = () => {
        const resetFilters: SearchFilters = {
            searchTerm: '',
            location: '',
            priceMin: 0,
            priceMax: 1000,
            spaceType: 'all',
            bookingType: 'all',
            guestCount: 1,
            dateFrom: '',
            dateTo: ''
        };
        setLocalFilters(resetFilters);
        onFilterChange(resetFilters);
    };

    const [isExpanded, setIsExpanded] = useState(true);

    const activeFilterCount = [
        localFilters.priceMin > 0,
        localFilters.priceMax < 1000,
        localFilters.bookingType !== 'all',
        localFilters.guestCount > 1,
        localFilters.dateFrom,
        localFilters.dateTo
    ].filter(Boolean).length;

    // Helper to get display text
    const getSpaceTypeLabel = () => {
        if (localFilters.spaceType === 'all') return <span className="text-gray-300 border-b-2 border-gray-100 hover:border-gray-900 transition-colors pb-0.5">any space</span>;
        const label = SPACE_TYPES.find(t => t.value === localFilters.spaceType)?.label;
        return <span className="text-black font-bold border-b-2 border-black transition-colors pb-0.5">{label}</span>;
    };

    const getLocationLabel = () => {
        if (!localFilters.location) return <span className="text-gray-300 border-b-2 border-gray-100 hover:border-gray-900 transition-colors pb-0.5">anywhere</span>;
        return <span className="text-black font-bold border-b-2 border-black transition-colors pb-0.5">{localFilters.location}</span>;
    };

    return (
        <div className={`bg-white border border-gray-100 rounded-xl transition-all duration-300 flex flex-col lg:sticky lg:top-[80px] self-start w-full ${isExpanded ? 'lg:w-80' : 'lg:w-16'}`}>

            {/* Toggle Button - Hidden on mobile when in modal */}
            <div className={`border-b border-gray-100 lg:flex items-center hidden ${isExpanded ? 'p-4 justify-between' : 'p-3 justify-center'}`}>
                {isExpanded && <h2 className="text-lg font-bold font-display">Filters</h2>}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={`p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-black transition-colors relative`}
                >
                    <SlidersHorizontal size={20} />
                    {activeFilterCount > 0 && !isExpanded && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-600 text-white text-[8px] font-bold flex items-center justify-center rounded-full">
                            {activeFilterCount}
                        </span>
                    )}
                </button>
            </div>

            {/* Scrollable Content - Always visible on mobile */}
            <div className={`flex-1 overflow-y-auto p-4 lg:p-4 space-y-4 lg:space-y-6 ${!isExpanded ? 'hidden lg:hidden' : ''}`}>

                    {/* Natural Language Sentence - Desktop Only */}
                    <div className="hidden lg:block text-xl font-medium text-gray-900 leading-relaxed font-display">
                        <span className="text-gray-400">I'm looking for </span>

                        <div className="relative inline-block mx-1 group">
                            <select
                                value={localFilters.spaceType}
                                onChange={(e) => handleChange('spaceType', e.target.value)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            >
                                {SPACE_TYPES.map(type => (
                                    <option key={type.value} value={type.value}>{type.label}</option>
                                ))}
                            </select>
                            {getSpaceTypeLabel()}
                        </div>

                        <span className="text-gray-400"> in </span>

                        <div className="relative inline-block mx-1 min-w-[80px]">
                            <input
                                type="text"
                                value={localFilters.location}
                                onChange={(e) => handleChange('location', e.target.value)}
                                placeholder="anywhere"
                                className={`bg-transparent outline-none placeholder-gray-300 text-black font-bold border-b-2 transition-colors pb-0.5 w-full ${localFilters.location ? 'border-black' : 'border-gray-100 focus:border-black'}`}
                            />
                        </div>
                    </div>

                    {/* Mobile-Friendly Space Type & Location */}
                    <div className="lg:hidden space-y-4">
                        <div>
                            <label className="text-sm font-semibold text-gray-700 mb-2 block">Space Type</label>
                            <div className="relative">
                                <select
                                    value={localFilters.spaceType}
                                    onChange={(e) => handleChange('spaceType', e.target.value)}
                                    className="w-full py-3 px-4 pr-10 bg-gray-50 border border-gray-200 rounded-lg font-medium focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20 text-gray-900 appearance-none text-base"
                                >
                                    {SPACE_TYPES.map(type => (
                                        <option key={type.value} value={type.value}>{type.label}</option>
                                    ))}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M6 9l6 6 6-6" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-gray-700 mb-2 block">Location</label>
                            <input
                                type="text"
                                value={localFilters.location}
                                onChange={(e) => handleChange('location', e.target.value)}
                                placeholder="Enter location"
                                className="w-full py-3 px-4 bg-gray-50 border border-gray-200 rounded-lg font-medium focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20 placeholder-gray-400 text-base"
                            />
                        </div>
                    </div>

                    {/* Filters Stack */}
                    <div className="space-y-4 lg:space-y-6 lg:pt-2">
                        {/* Price */}
                        <div className="space-y-2 lg:space-y-3">
                            <label className="text-sm lg:text-sm font-semibold lg:font-bold text-gray-700 lg:text-gray-600 lg:uppercase lg:tracking-widest block">Price Range</label>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 lg:gap-2">
                                    <div className="relative flex-1 group">
                                        <span className="absolute left-3 lg:left-0 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-600 transition-colors text-sm">$</span>
                                        <input
                                            type="number"
                                            value={localFilters.priceMin}
                                            onChange={(e) => handleChange('priceMin', Number(e.target.value))}
                                            className="w-full pl-7 lg:pl-4 py-3 lg:py-2 bg-gray-50 lg:bg-transparent border lg:border-0 border-gray-200 lg:border-b rounded-lg lg:rounded-none font-medium focus:outline-none focus:border-brand-600 lg:focus:border-black focus:ring-2 lg:focus:ring-0 focus:ring-brand-600/20 transition-all placeholder-gray-400 text-sm"
                                            placeholder="Min"
                                        />
                                    </div>
                                    <span className="text-gray-400 text-sm">to</span>
                                    <div className="relative flex-1 group">
                                        <span className="absolute left-3 lg:left-0 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-600 transition-colors text-sm">$</span>
                                        <input
                                            type="number"
                                            value={localFilters.priceMax}
                                            onChange={(e) => handleChange('priceMax', Number(e.target.value))}
                                            className="w-full pl-7 lg:pl-4 py-3 lg:py-2 bg-gray-50 lg:bg-transparent border lg:border-0 border-gray-200 lg:border-b rounded-lg lg:rounded-none font-medium focus:outline-none focus:border-brand-600 lg:focus:border-black focus:ring-2 lg:focus:ring-0 focus:ring-brand-600/20 transition-all placeholder-gray-400 text-sm"
                                            placeholder="Max"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Dates */}
                        <div className="space-y-2 lg:space-y-3">
                            <label className="text-sm lg:text-sm font-semibold lg:font-bold text-gray-700 lg:text-gray-600 lg:uppercase lg:tracking-widest block">When</label>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm lg:text-xs text-gray-600 lg:text-gray-500 mb-2 lg:mb-1 block font-medium">Check-in</label>
                                    <input
                                        type="date"
                                        value={localFilters.dateFrom}
                                        onChange={(e) => handleChange('dateFrom', e.target.value)}
                                        className="w-full bg-gray-50 lg:bg-transparent border lg:border-0 border-gray-200 lg:border-b rounded-lg lg:rounded-none py-3 lg:py-2 px-4 lg:px-0 text-base font-medium focus:outline-none focus:border-brand-600 lg:focus:border-black focus:ring-2 lg:focus:ring-0 focus:ring-brand-600/20 text-gray-900"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm lg:text-xs text-gray-600 lg:text-gray-500 mb-2 lg:mb-1 block font-medium">Check-out</label>
                                    <input
                                        type="date"
                                        value={localFilters.dateTo}
                                        onChange={(e) => handleChange('dateTo', e.target.value)}
                                        className="w-full bg-gray-50 lg:bg-transparent border lg:border-0 border-gray-200 lg:border-b rounded-lg lg:rounded-none py-3 lg:py-2 px-4 lg:px-0 text-base font-medium focus:outline-none focus:border-brand-600 lg:focus:border-black focus:ring-2 lg:focus:ring-0 focus:ring-brand-600/20 text-gray-900"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="space-y-2 lg:space-y-3">
                            <label className="text-sm lg:text-sm font-semibold lg:font-bold text-gray-700 lg:text-gray-600 lg:uppercase lg:tracking-widest block">Details</label>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm lg:text-xs text-gray-600 lg:text-gray-500 mb-2 lg:mb-1 block font-medium">Duration</label>
                                    <div className="relative">
                                        <select
                                            value={localFilters.bookingType}
                                            onChange={(e) => handleChange('bookingType', e.target.value)}
                                            className="w-full py-3 lg:py-2 px-4 lg:px-0 pr-10 lg:pr-0 bg-gray-50 lg:bg-transparent border lg:border-0 border-gray-200 lg:border-b rounded-lg lg:rounded-none font-medium focus:outline-none focus:border-brand-600 lg:focus:border-black focus:ring-2 lg:focus:ring-0 focus:ring-brand-600/20 transition-all appearance-none text-gray-900 text-base"
                                        >
                                            <option value="all">Any</option>
                                            <option value={BookingType.HOURLY}>Hourly</option>
                                            <option value={BookingType.DAILY}>Daily</option>
                                        </select>
                                        <div className="lg:hidden absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M6 9l6 6 6-6" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm lg:text-xs text-gray-600 lg:text-gray-500 mb-2 lg:mb-1 block font-medium">Guests</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={localFilters.guestCount}
                                        onChange={(e) => handleChange('guestCount', Number(e.target.value))}
                                        className="w-full py-3 lg:py-2 px-4 lg:px-0 bg-gray-50 lg:bg-transparent border lg:border-0 border-gray-200 lg:border-b rounded-lg lg:rounded-none font-medium focus:outline-none focus:border-brand-600 lg:focus:border-black focus:ring-2 lg:focus:ring-0 focus:ring-brand-600/20 transition-all placeholder-gray-400 text-base text-gray-900"
                                        placeholder="1"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
            </div>

            {/* Footer Actions - Always visible on mobile */}
            <div className={`p-4 border-t border-gray-100 bg-gray-50 ${!isExpanded ? 'hidden lg:hidden' : ''}`}>
                    <button
                        onClick={handleReset}
                        className="w-full px-4 py-2 border border-gray-200 text-gray-600 rounded-lg font-medium hover:bg-white hover:border-gray-300 transition-all text-sm"
                    >
                        Reset Filters
                    </button>
            </div>
        </div>
    );
};

export default AdvancedSearch;
