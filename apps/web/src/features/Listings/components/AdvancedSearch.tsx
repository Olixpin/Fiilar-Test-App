import React, { useState } from 'react';
import { Search, MapPin, DollarSign, Calendar, Users, Home, SlidersHorizontal, X } from 'lucide-react';
import { SpaceType, BookingType } from '@fiilar/types';
import { useLocale } from '../../../contexts/LocaleContext';

export interface SearchFilters {
    searchTerm: string;
    location: string;
    priceMin?: number;
    priceMax?: number;
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
    const { locale } = useLocale();
    const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);
    // showFilters was redundant with isExpanded, so we'll rely on isExpanded for visibility toggling
    // const [showFilters, setShowFilters] = useState(false); 

    // Sync local state when parent filters change (e.g. from AI search)
    React.useEffect(() => {
        setLocalFilters(filters);
    }, [filters]);

    const handleChange = (key: keyof SearchFilters, value: any) => {
        const updated = { ...localFilters, [key]: value };
        setLocalFilters(updated);
        onFilterChange(updated);
    };

    const handleReset = () => {
        const resetFilters: SearchFilters = {
            searchTerm: '',
            location: '',
            priceMin: undefined,
            priceMax: undefined,
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
        localFilters.priceMin !== undefined,
        localFilters.priceMax !== undefined,
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
        <div
            className={`bg-white border border-gray-100 overflow-hidden transition-all duration-300 flex flex-col lg:sticky lg:top-20 self-start w-full hover:shadow-lg ${isExpanded ? 'lg:w-80 rounded-2xl' : 'lg:w-16 rounded-full'}`}
        >

            {/* Toggle Button - Hidden on mobile when in modal */}
            <div className={`lg:flex items-center hidden ${isExpanded ? 'p-4 justify-between border-b border-gray-100' : 'p-3 justify-center'}`}>
                {isExpanded && <h2 className="text-lg font-bold font-display">Filters</h2>}
                <div className="flex items-center gap-2">
                    {isExpanded && onClose && (
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"
                            title="Close"
                        >
                            <X size={20} />
                        </button>
                    )}
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className={`p-2 hover:bg-gray-100 rounded-full text-gray-600 hover:text-black transition-colors relative`}
                    >
                        <SlidersHorizontal size={20} />
                        {activeFilterCount > 0 && !isExpanded && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-600 text-white text-[8px] font-bold flex items-center justify-center rounded-full">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Collapsed Summary Tooltip (Desktop) */}
            {!isExpanded && (
                <div className="hidden lg:flex absolute left-full ml-4 top-0 bg-white border border-gray-200 shadow-xl text-sm p-3 rounded-xl whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity pointer-events-none z-50 items-center gap-1">
                    <span className="text-gray-500">Searching for</span>
                    {getSpaceTypeLabel()}
                    <span className="text-gray-500">in</span>
                    {getLocationLabel()}
                </div>
            )}

            {/* Scrollable Content - Always visible on mobile */}
            <div className={`flex-1 overflow-y-auto p-4 lg:p-4 space-y-4 lg:space-y-6 ${!isExpanded ? 'hidden lg:hidden' : ''}`}>

                {/* Search Term Input (New Feature) */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        value={localFilters.searchTerm}
                        onChange={(e) => handleChange('searchTerm', e.target.value)}
                        placeholder="Search keywords..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20 text-sm"
                    />
                </div>

                {/* Natural Language Sentence - Desktop Only */}
                <div className="hidden lg:block text-xl font-medium text-gray-900 leading-relaxed font-display">
                    <span className="text-gray-400">I'm looking for </span>

                    <div className="relative inline-block mx-1 group">
                        <select
                            value={localFilters.spaceType}
                            onChange={(e) => handleChange('spaceType', e.target.value)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            aria-label="Select space type"
                        >
                            {SPACE_TYPES.map(type => (
                                <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                        </select>
                        {getSpaceTypeLabel()}
                    </div>

                    <span className="text-gray-400"> in </span>

                    <div className="relative inline-block mx-1 min-w-20">
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
                        <label htmlFor="mobile-space-type" className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <Home size={16} /> Space Type
                        </label>
                        <div className="relative">
                            <select
                                id="mobile-space-type"
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
                        <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <MapPin size={16} /> Location
                        </label>
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
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-gray-800 uppercase tracking-wide flex items-center gap-2">
                            <DollarSign size={16} className="text-gray-600" /> Price Range
                        </label>
                        <div className="flex items-center">
                            <div className="relative flex-1 group">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-600 transition-colors font-medium z-10">{locale.currencySymbol}</span>
                                <input
                                    type="number"
                                    value={localFilters.priceMin ?? ''}
                                    onChange={(e) => handleChange('priceMin', e.target.value ? Number(e.target.value) : undefined)}
                                    className="w-full pl-7 pr-3 py-2.5 bg-white border-2 border-gray-200 rounded-l-xl border-r-0 font-medium text-gray-900 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100 focus:z-10 hover:border-gray-300 transition-all placeholder-gray-400 text-sm"
                                    placeholder="Min"
                                />
                            </div>
                            <div className="relative flex-1 group">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-600 transition-colors font-medium z-10">{locale.currencySymbol}</span>
                                <input
                                    type="number"
                                    value={localFilters.priceMax ?? ''}
                                    onChange={(e) => handleChange('priceMax', e.target.value ? Number(e.target.value) : undefined)}
                                    className="w-full pl-7 pr-3 py-2.5 bg-white border-2 border-gray-200 rounded-r-xl font-medium text-gray-900 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100 focus:z-10 hover:border-gray-300 transition-all placeholder-gray-400 text-sm"
                                    placeholder="Max"
                                />
                            </div>
                        </div>

                        {/* Quick Select Price Ranges */}
                        <div className="flex flex-wrap gap-2">
                            {[
                                { label: 'Any', min: undefined, max: undefined },
                                { label: `${locale.currencySymbol}0-50`, min: 0, max: 50 },
                                { label: `${locale.currencySymbol}50-100`, min: 50, max: 100 },
                                { label: `${locale.currencySymbol}100-200`, min: 100, max: 200 },
                                { label: `${locale.currencySymbol}200+`, min: 200, max: undefined }
                            ].map((range, idx) => {
                                const isActive = localFilters.priceMin === range.min && localFilters.priceMax === range.max;
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            const updated = { ...localFilters, priceMin: range.min, priceMax: range.max };
                                            setLocalFilters(updated);
                                            onFilterChange(updated);
                                        }}
                                        className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${
                                            isActive 
                                                ? 'bg-brand-600 text-white border-brand-600' 
                                                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        {range.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-gray-800 uppercase tracking-wide flex items-center gap-2">
                            <Calendar size={16} className="text-gray-600" /> When
                        </label>
                        <div className="space-y-3">
                            <div>
                                <label htmlFor="check-in-date" className="text-xs text-gray-600 mb-1.5 block font-semibold">Check-in</label>
                                <input
                                    id="check-in-date"
                                    type="date"
                                    value={localFilters.dateFrom}
                                    onChange={(e) => handleChange('dateFrom', e.target.value)}
                                    className="w-full bg-white border-2 border-gray-200 rounded-xl py-2.5 px-3 text-sm font-medium focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100 hover:border-gray-300 transition-all text-gray-900"
                                />
                            </div>
                            <div>
                                <label htmlFor="check-out-date" className="text-xs text-gray-600 mb-1.5 block font-semibold">Check-out</label>
                                <input
                                    id="check-out-date"
                                    type="date"
                                    value={localFilters.dateTo}
                                    onChange={(e) => handleChange('dateTo', e.target.value)}
                                    className="w-full bg-white border-2 border-gray-200 rounded-xl py-2.5 px-3 text-sm font-medium focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100 hover:border-gray-300 transition-all text-gray-900"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-gray-800 uppercase tracking-wide flex items-center gap-2">
                            <Users size={16} className="text-gray-600" /> Details
                        </label>
                        <div className="space-y-3">
                            <div>
                                <label htmlFor="duration-select" className="text-xs text-gray-600 mb-1.5 block font-semibold">Duration</label>
                                <div className="relative">
                                    <select
                                        id="duration-select"
                                        value={localFilters.bookingType}
                                        onChange={(e) => handleChange('bookingType', e.target.value)}
                                        className="w-full py-2.5 px-3 pr-10 bg-white border-2 border-gray-200 rounded-xl font-medium focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100 hover:border-gray-300 transition-all appearance-none text-gray-900 text-sm cursor-pointer"
                                    >
                                        <option value="all">Any</option>
                                        <option value={BookingType.HOURLY}>Hourly</option>
                                        <option value={BookingType.DAILY}>Daily</option>
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <path d="M6 9l6 6 6-6" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-600 mb-1.5 block font-semibold">Guests</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={localFilters.guestCount}
                                    onChange={(e) => handleChange('guestCount', Number(e.target.value))}
                                    className="w-full py-2.5 px-3 bg-white border-2 border-gray-200 rounded-xl font-medium focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100 hover:border-gray-300 transition-all placeholder-gray-400 text-sm text-gray-900"
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
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all text-sm"
                >
                    Reset Filters
                </button>
            </div>
        </div>
    );
};

export default AdvancedSearch;
