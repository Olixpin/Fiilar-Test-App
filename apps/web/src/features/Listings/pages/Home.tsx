import React from 'react';
import { Listing, User, ListingStatus, SpaceType, SpaceCategory, SPACE_TYPE_CATEGORIES } from '@fiilar/types';
import ListingCard from '../components/ListingCard';
import AdvancedSearch from '../components/AdvancedSearch';
import { filterListings, parseNaturalLanguageQuery, SearchFilters } from '@fiilar/search';
import { 
    Briefcase, 
    Search, 
    Plus, 
    X, 
    SlidersHorizontal, 
    TrendingUp, 
    ArrowRight, 
    MapPin, 
    PartyPopper,
    Clapperboard,
    Bed,
    Sparkles,
    ChevronDown
} from 'lucide-react';
import { Button } from '@fiilar/ui';
import useUserLocation, { calculateDistance } from '../../../hooks/useUserLocation';

const ListingSkeleton = () => (
    <div className="flex flex-col gap-2 animate-pulse">
        <div className="aspect-square bg-gray-200 rounded-xl w-full"></div>
        <div className="space-y-2 mt-1">
            <div className="flex justify-between">
                <div className="h-5 bg-gray-200 rounded w-2/3"></div>
                <div className="h-4 bg-gray-200 rounded w-8"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3 mt-1"></div>
        </div>
    </div>
);

interface HomeProps {
    listings: Listing[];
    user: User | null;
    activeCategory: string;
    setActiveCategory: (category: string) => void;
    searchTerm: string;
    onBecomeHostClick: () => void;
    /** If true, show all listings including user's own (for host dashboard explore) */
    showOwnListings?: boolean;
}

// Category tabs based on Fiilar Space categories
const categories = [
    { id: 'All', label: 'All', icon: null },
    { id: SpaceCategory.WORK_PRODUCTIVITY, label: 'Work', icon: Briefcase },
    { id: SpaceCategory.EVENT_SOCIAL, label: 'Events', icon: PartyPopper },
    { id: SpaceCategory.CREATIVE_PRODUCTION, label: 'Creative', icon: Clapperboard },
    { id: SpaceCategory.STAY_ACCOMMODATION, label: 'Stay', icon: Bed },
    { id: SpaceCategory.SPECIALTY, label: 'Specialty', icon: Sparkles },
];

// Subcategories for each parent category (for hover dropdown)
const SUBCATEGORIES: Record<string, { type: SpaceType; label: string }[]> = {
    [SpaceCategory.WORK_PRODUCTIVITY]: [
        { type: SpaceType.CO_WORKING, label: 'Co-working Space' },
        { type: SpaceType.PRIVATE_OFFICE, label: 'Private Office' },
        { type: SpaceType.MEETING_ROOM, label: 'Meeting Room' },
        { type: SpaceType.TRAINING_ROOM, label: 'Training Room' },
    ],
    [SpaceCategory.EVENT_SOCIAL]: [
        { type: SpaceType.EVENT_HALL, label: 'Event Hall' },
        { type: SpaceType.BANQUET_HALL, label: 'Banquet Hall' },
        { type: SpaceType.OUTDOOR_VENUE, label: 'Outdoor Venue' },
        { type: SpaceType.LOUNGE_ROOFTOP, label: 'Lounge & Rooftop' },
    ],
    [SpaceCategory.CREATIVE_PRODUCTION]: [
        { type: SpaceType.PHOTO_STUDIO, label: 'Photo Studio' },
        { type: SpaceType.RECORDING_STUDIO, label: 'Recording Studio' },
        { type: SpaceType.FILM_STUDIO, label: 'Film Studio' },
    ],
    [SpaceCategory.STAY_ACCOMMODATION]: [
        { type: SpaceType.BOUTIQUE_HOTEL, label: 'Boutique Hotel' },
        { type: SpaceType.SERVICED_APARTMENT, label: 'Serviced Apartment' },
        { type: SpaceType.SHORT_TERM_RENTAL, label: 'Short-term Rental' },
    ],
    [SpaceCategory.SPECIALTY]: [
        { type: SpaceType.POP_UP_RETAIL, label: 'Pop-up & Retail' },
        { type: SpaceType.SHOWROOM, label: 'Showroom' },
        { type: SpaceType.KITCHEN_CULINARY, label: 'Kitchen & Culinary' },
        { type: SpaceType.WAREHOUSE, label: 'Warehouse' },
        { type: SpaceType.ART_GALLERY, label: 'Art Gallery' },
        { type: SpaceType.DANCE_STUDIO, label: 'Dance Studio' },
        { type: SpaceType.GYM_FITNESS, label: 'Gym & Fitness' },
        { type: SpaceType.PRAYER_MEDITATION, label: 'Prayer & Meditation' },
        { type: SpaceType.TECH_HUB, label: 'Tech Hub' },
        { type: SpaceType.GAMING_LOUNGE, label: 'Gaming Lounge' },
        { type: SpaceType.CONFERENCE_CENTER, label: 'Conference Center' },
    ],
};

const Home: React.FC<HomeProps> = ({
    listings,
    user,
    activeCategory,
    setActiveCategory,
    searchTerm,
    onBecomeHostClick,
    showOwnListings = false
}) => {
    // User location for distance-based sorting
    const { 
        location: userLocation, 
        isLoading: locationLoading, 
        requestLocation, 
        hasPermission,
        isSupported 
    } = useUserLocation();
    const [sortByDistance, setSortByDistance] = React.useState(false);

    // Enable distance sorting when location becomes available
    React.useEffect(() => {
        if (userLocation && !sortByDistance && hasPermission) {
            setSortByDistance(true);
        }
    }, [userLocation, hasPermission]);

    const [filters, setFilters] = React.useState<SearchFilters>({
        searchTerm: searchTerm,
        location: '',
        priceMin: undefined,
        priceMax: undefined,
        spaceType: 'all',
        bookingType: 'all',
        guestCount: 1,
        dateFrom: '',
        dateTo: ''
    });

    const [showMobileFilters, setShowMobileFilters] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(true);
    const [visibleCount, setVisibleCount] = React.useState(12);

    // Batch image loading tracking - cards reveal together per row (4 cards per batch)
    const BATCH_SIZE = 4;
    const [loadedImages, setLoadedImages] = React.useState<Set<string>>(new Set());
    const [readyBatches, setReadyBatches] = React.useState<Set<number>>(new Set());

    const loadMoreRef = React.useRef<HTMLDivElement>(null);
    const [isHeaderVisible, setIsHeaderVisible] = React.useState(true);
    const lastScrollY = React.useRef(0);
    
    // Hover state for category dropdown
    const [hoveredCategory, setHoveredCategory] = React.useState<string | null>(null);
    const [selectedSubcategory, setSelectedSubcategory] = React.useState<SpaceType | null>(null);
    const [dropdownPosition, setDropdownPosition] = React.useState<{ left: number; top: number } | null>(null);
    const hoverTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
    const categoryButtonRefs = React.useRef<Map<string, HTMLDivElement>>(new Map());

    // Auto-enable distance sorting when location becomes available
    React.useEffect(() => {
        if (userLocation && !sortByDistance) {
            setSortByDistance(true);
        }
    }, [userLocation, sortByDistance]);

    React.useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // Show header if scrolling up or at the top
            // Removed threshold to make it more responsive ("faster to become not visible")
            if (currentScrollY < lastScrollY.current || currentScrollY < 50) {
                setIsHeaderVisible(true);
            } else if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
                setIsHeaderVisible(false);
            }

            lastScrollY.current = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Simulate initial data loading for skeleton demonstration
    React.useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    // Reset pagination when filters change
    React.useEffect(() => {
        setVisibleCount(12);
        setLoadedImages(new Set());
        setReadyBatches(new Set());
    }, [activeCategory, filters, searchTerm]);

    // Sync prop searchTerm with filters and parse natural language
    React.useEffect(() => {
        const initialFilters: SearchFilters = {
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

        if (!searchTerm) {
            setFilters(initialFilters);
            return;
        }

        // Parse natural language query
        // The parser extracts structured filters (location, price, guests, etc.)
        // AND keeps any remaining words as searchTerm for flexible text matching
        const parsedFilters = parseNaturalLanguageQuery(searchTerm);

        // Apply parsed filters - the parser now intelligently keeps
        // unmatched words as searchTerm for text-based search in title/description/tags
        setFilters({
            ...initialFilters,
            ...parsedFilters,
        });
    }, [searchTerm]);

    const handleFilterChange = (newFilters: SearchFilters) => {
        setFilters(newFilters);
        
        // If user sets spaceType in advanced search, check which category it belongs to
        if (newFilters.spaceType !== filters.spaceType) {
            if (newFilters.spaceType === 'all') {
                setActiveCategory('All');
            } else {
                // Map the spaceType to its category
                const category = SPACE_TYPE_CATEGORIES[newFilters.spaceType as SpaceType];
                if (category) {
                    setActiveCategory(category);
                }
            }
        }
    };

    // Filter by category - get all SpaceTypes that belong to the selected category
    const getSpaceTypesForCategory = (category: string): SpaceType[] => {
        if (category === 'All') return [];
        return Object.entries(SPACE_TYPE_CATEGORIES)
            .filter(([_, cat]) => cat === category)
            .map(([spaceType]) => spaceType as SpaceType);
    };

    // No longer sync spaceType with category - we filter by category group instead

    const displayListings = React.useMemo(() => {
        // Apply advanced filters (location, price, dates, etc.)
        let filtered = filterListings(listings, filters)
            .filter(l => l.status === ListingStatus.LIVE);
        
        // Exclude user's own listings when browsing (like Airbnb/Peerspace)
        // Hosts manage their listings in the dashboard, not in the browse view
        if (!showOwnListings && user?.id) {
            filtered = filtered.filter(l => l.hostId !== user.id);
        }
        
        // Apply subcategory filter if a specific subcategory is selected
        if (selectedSubcategory) {
            filtered = filtered.filter(l => l.type === selectedSubcategory);
        } else if (activeCategory !== 'All') {
            // Otherwise apply category filter based on selected tab
            const categorySpaceTypes = getSpaceTypesForCategory(activeCategory);
            filtered = filtered.filter(l => categorySpaceTypes.includes(l.type));
        }
        
        // Sort based on mode
        if (sortByDistance && userLocation) {
            // Sort by distance (listings with coordinates first, then by distance)
            return filtered.sort((a, b) => {
                const distA = a.coordinates ? calculateDistance(userLocation.lat, userLocation.lng, a.coordinates.lat, a.coordinates.lng) : Infinity;
                const distB = b.coordinates ? calculateDistance(userLocation.lat, userLocation.lng, b.coordinates.lat, b.coordinates.lng) : Infinity;
                return distA - distB;
            });
        } else {
            // Sort by createdAt descending (newest first)
            return filtered.sort((a, b) => {
                const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return dateB - dateA;
            });
        }
    }, [listings, filters, activeCategory, selectedSubcategory, sortByDistance, userLocation, showOwnListings, user?.id]);

    // Handle category hover with delay for better UX
    const handleCategoryMouseEnter = (categoryId: string) => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
        }
        if (SUBCATEGORIES[categoryId]) {
            const buttonEl = categoryButtonRefs.current.get(categoryId);
            if (buttonEl) {
                const rect = buttonEl.getBoundingClientRect();
                setDropdownPosition({
                    left: rect.left + rect.width / 2,
                    top: rect.bottom + 8,
                });
            }
            setHoveredCategory(categoryId);
        }
    };

    const handleCategoryMouseLeave = () => {
        hoverTimeoutRef.current = setTimeout(() => {
            setHoveredCategory(null);
            setDropdownPosition(null);
        }, 150);
    };

    const handleSubcategoryClick = (spaceType: SpaceType, category: string) => {
        setSelectedSubcategory(spaceType);
        setActiveCategory(category);
        setHoveredCategory(null);
        setDropdownPosition(null);
    };

    const handleCategoryClick = (categoryId: string) => {
        setActiveCategory(categoryId);
        setSelectedSubcategory(null); // Clear subcategory when clicking category
        setHoveredCategory(null);
        setDropdownPosition(null);
    };

    // Handle image load callback from ListingCard
    const handleImageLoad = React.useCallback((listingId: string) => {
        setLoadedImages(prev => new Set(prev).add(listingId));
    }, []);

    // Check if batches are complete and mark them ready
    React.useEffect(() => {
        const visibleListings = displayListings.slice(0, visibleCount);
        const newReadyBatches = new Set(readyBatches);

        for (let batchIndex = 0; batchIndex * BATCH_SIZE < visibleListings.length; batchIndex++) {
            if (readyBatches.has(batchIndex)) continue; // Already marked ready

            const batchStart = batchIndex * BATCH_SIZE;
            const batchEnd = Math.min(batchStart + BATCH_SIZE, visibleListings.length);
            const batchListings = visibleListings.slice(batchStart, batchEnd);

            // Check if all images in this batch are loaded
            const allLoaded = batchListings.every(l => loadedImages.has(l.id));

            if (allLoaded) {
                newReadyBatches.add(batchIndex);
            }
        }

        if (newReadyBatches.size !== readyBatches.size) {
            setReadyBatches(newReadyBatches);
        }
    }, [loadedImages, displayListings, visibleCount, readyBatches]);

    // Infinite scroll observer
    React.useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setVisibleCount((prev) => prev + 8);
                }
            },
            { rootMargin: '100px' }
        );

        if (loadMoreRef.current) {
            observer.observe(loadMoreRef.current);
        }

        return () => observer.disconnect();
    }, [isLoading, displayListings.length]);

    // Check if any filters are active (excluding spaceType which is handled by category tabs)
    const hasActiveFilters = React.useMemo(() => {
        return (
            activeCategory !== 'All' ||
            filters.location !== '' ||
            filters.priceMin !== undefined ||
            filters.priceMax !== undefined ||
            filters.bookingType !== 'all' ||
            filters.guestCount > 1 ||
            filters.dateFrom !== '' ||
            filters.dateTo !== ''
        );
    }, [filters, activeCategory]);

    // Clear all filters
    const clearAllFilters = () => {
        setActiveCategory('All');
        setFilters({
            searchTerm: '',
            location: '',
            priceMin: undefined,
            priceMax: undefined,
            spaceType: 'all',
            bookingType: 'all',
            guestCount: 1,
            dateFrom: '',
            dateTo: ''
        });
    };

    const renderListingsWithPromo = () => {
        const items: React.ReactNode[] = [];
        let promoAdded = false;

        if (displayListings.length === 0) {
            // Build a more specific message based on active filters
            const getEmptyStateMessage = () => {
                if (filters.location && filters.location.trim()) {
                    return `No spaces found in "${filters.location}". Try searching a different location or clear filters to see all available spaces.`;
                }
                if (hasActiveFilters) {
                    return "Try adjusting your filters or clearing them to see more results.";
                }
                return "There are no spaces available at the moment.";
            };

            return (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                    <Search size={48} className="text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900">
                        {filters.location && filters.location.trim() 
                            ? `No spaces in ${filters.location}` 
                            : "No spaces found"}
                    </h3>
                    <p className="text-gray-500 mb-4 max-w-md">
                        {getEmptyStateMessage()}
                    </p>
                    {hasActiveFilters && (
                        <Button 
                            onClick={clearAllFilters} 
                            variant="outline" 
                            className="mb-4"
                        >
                            Clear All Filters
                        </Button>
                    )}
                    {!user && (
                        <Button onClick={onBecomeHostClick} variant="primary" className="bg-black hover:bg-gray-800">
                            Host Your Space
                        </Button>
                    )}
                </div>
            );
        }

        // Slice the listings for display
        const visibleListings = displayListings.slice(0, visibleCount);

        // First 8 items get priority loading (above the fold)
        const PRIORITY_COUNT = 8;

        visibleListings.forEach((l, index) => {
            const batchIndex = Math.floor(index / BATCH_SIZE);
            const isBatchReady = readyBatches.has(batchIndex);

            items.push(
                <ListingCard
                    key={l.id}
                    listing={l}
                    priority={index < PRIORITY_COUNT}
                    index={index % BATCH_SIZE} // Index within batch for stagger
                    onImageLoad={handleImageLoad}
                    batchReady={isBatchReady}
                />
            );

            // Insert "Host Your Space" promo card at 3rd position (after 2 listings) for non-logged-in users
            if (!user && !promoAdded && (index === 1 || (displayListings.length < 2 && index === displayListings.length - 1))) {
                items.push(
                    <button
                        key="promo"
                        onClick={onBecomeHostClick}
                        className="group cursor-pointer flex flex-col gap-3 bg-white p-3 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 text-left h-full"
                        aria-label="Host your space and earn income"
                    >
                        <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100 border border-gray-200 w-full group-hover:border-brand-200 transition-colors">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform group-hover:shadow-md">
                                    <Plus size={24} className="text-brand-600" />
                                </div>
                            </div>
                        </div>
                        <div className="mt-1">
                            <h3 className="font-medium text-base text-gray-900 leading-tight truncate">Host Your Space</h3>
                            <div className="flex items-center gap-1 text-gray-500 mt-1">
                                <TrendingUp size={14} className="text-brand-600" />
                                <span className="text-sm">Earn extra income</span>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                                <div className="flex items-center gap-1">
                                    <span className="font-medium text-sm text-gray-500">Join Free</span>
                                </div>
                                <div className="text-right flex items-center gap-1 text-brand-600">
                                    <span className="font-bold text-sm">Get Started</span>
                                    <ArrowRight size={14} />
                                </div>
                            </div>
                        </div>
                    </button>
                );
                promoAdded = true;
            }
        });

        if (!user && !promoAdded && displayListings.length === 0) return null;

        return items;
    };

    // Get display text for location
    const getLocationDisplayText = () => {
        if (filters.location) {
            return filters.location;
        }
        if (sortByDistance && userLocation?.displayName) {
            return `Near ${userLocation.displayName}`;
        }
        return 'Where to?';
    };

    return (
        <div className="pb-20 bg-gray-50/50 min-h-screen">
            {/* Mobile Header - Sticky & Premium */}
            <div className={`lg:hidden sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 transition-transform duration-300 ${isHeaderVisible ? 'translate-y-0' : '-translate-y-full'}`}>
                <div className="px-4 pt-3 pb-0">
                    {/* Search Trigger Bar */}
                    <button
                        onClick={() => setShowMobileFilters(true)}
                        className="w-full flex items-center gap-3 bg-white border border-gray-200 shadow-sm rounded-full px-4 py-2.5 mb-3 active:scale-[0.98] transition-transform"
                    >
                        <Search size={20} className="text-gray-900" strokeWidth={2.5} />
                        <div className="flex-1 text-left">
                            <div className="text-sm font-bold text-gray-900 flex items-center gap-1">
                                {sortByDistance && userLocation && !filters.location && (
                                    <MapPin size={14} className="text-brand-600" />
                                )}
                                {getLocationDisplayText()}
                            </div>
                            <div className="text-[11px] text-gray-500 font-medium">
                                {activeCategory !== 'All' ? activeCategory : 'Any type'} • {filters.dateFrom || 'Any date'} • {filters.guestCount > 1 ? `${filters.guestCount} guests` : 'Add guests'}
                            </div>
                        </div>
                        <div className="relative w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 bg-white text-gray-900">
                            <SlidersHorizontal size={16} strokeWidth={2} />
                            {hasActiveFilters && (
                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-brand-600 rounded-full" />
                            )}
                        </div>
                    </button>

                    {/* Mobile Categories */}
                    <div className="flex items-center gap-6 overflow-x-auto no-scrollbar pb-3 -mx-4 px-4">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => handleCategoryClick(cat.id)}
                                className={`flex flex-col items-center gap-1.5 min-w-[64px] transition-all duration-200 group ${activeCategory === cat.id ? 'opacity-100 scale-105' : 'opacity-60 hover:opacity-100'}`}
                            >
                                <div className={`w-7 h-7 flex items-center justify-center rounded-full transition-all ${activeCategory === cat.id ? 'text-black' : 'text-gray-500 group-hover:text-gray-800'}`}>
                                    {cat.icon ? <cat.icon size={24} strokeWidth={activeCategory === cat.id ? 2 : 1.5} /> : <Search size={24} strokeWidth={activeCategory === cat.id ? 2 : 1.5} />}
                                </div>
                                <span className={`text-[10px] font-medium whitespace-nowrap relative ${activeCategory === cat.id ? 'text-black font-bold' : 'text-gray-500'}`}>
                                    {cat.label}
                                    {activeCategory === cat.id && (
                                        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-full h-[2px] bg-black rounded-full" />
                                    )}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Mobile selected subcategory indicator */}
                    {selectedSubcategory && (
                        <div className="lg:hidden flex items-center gap-2 -mx-4 px-4 pb-2">
                            <span className="text-xs text-gray-500">Filter:</span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-brand-50 text-brand-700 rounded-full text-xs font-medium">
                                {selectedSubcategory}
                                <button 
                                    onClick={() => setSelectedSubcategory(null)}
                                    className="hover:bg-brand-100 rounded-full p-0.5"
                                    aria-label="Clear subcategory filter"
                                >
                                    <X size={12} />
                                </button>
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto px-4 sm:px-8 pt-4 lg:pt-6">
                <div className="flex gap-6">
                    {/* Left Sidebar - Advanced Search - Hidden on mobile */}
                    <div className="hidden lg:block">
                        <AdvancedSearch
                            filters={filters}
                            onFilterChange={handleFilterChange}
                        />
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 min-w-0">
                        {/* Desktop Categories with Subcategory Dropdown */}
                        <div className={`hidden lg:flex sticky top-20 z-30 mb-6 transition-all duration-300 items-center gap-0 py-2 no-scrollbar rounded-full bg-white border-gray-100 shadow-faint hover:shadow-lg px-2 justify-between w-full ${isHeaderVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}`}>
                            {categories.map((cat, index) => (
                                <React.Fragment key={cat.id}>
                                    <div 
                                        ref={(el) => { if (el) categoryButtonRefs.current.set(cat.id, el); }}
                                        className="relative group"
                                        onMouseEnter={() => handleCategoryMouseEnter(cat.id)}
                                        onMouseLeave={handleCategoryMouseLeave}
                                    >
                                        <button
                                            data-category={cat.id}
                                            onClick={() => handleCategoryClick(cat.id)}
                                            className={`flex items-center gap-1.5 sm:gap-2 ${cat.id === 'All' ? 'pl-4 pr-3 sm:px-4' : 'px-3 sm:px-4'} py-1.5 sm:py-2 rounded-full whitespace-nowrap transition-all duration-200 text-xs sm:text-sm hover:scale-105 active:scale-95 ${activeCategory === cat.id
                                                ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                                                : 'bg-transparent text-gray-700 hover:bg-gray-50'
                                                }`}
                                        >
                                            {cat.icon ? <cat.icon size={16} className="sm:w-[18px] sm:h-[18px]" strokeWidth={1.5} /> : <Search size={16} className="sm:w-[18px] sm:h-[18px]" strokeWidth={1.5} />}
                                            <span className="font-medium">{cat.label}</span>
                                            {SUBCATEGORIES[cat.id] && (
                                                <ChevronDown size={14} className={`transition-transform duration-200 ${hoveredCategory === cat.id ? 'rotate-180' : ''}`} />
                                            )}
                                        </button>
                                    </div>
                                    {index < categories.length - 1 && (
                                        <div className="hidden lg:block h-5 w-px bg-gray-200 shrink-0 mx-2"></div>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>

                        {/* Subcategory Dropdown - Fixed positioned based on hovered button */}
                        {hoveredCategory && SUBCATEGORIES[hoveredCategory] && dropdownPosition && (
                            <div 
                                className="hidden lg:block fixed z-[100]"
                                style={{
                                    top: `${dropdownPosition.top}px`,
                                    left: `${dropdownPosition.left}px`,
                                    transform: 'translateX(-50%)',
                                }}
                                onMouseEnter={() => handleCategoryMouseEnter(hoveredCategory)}
                                onMouseLeave={handleCategoryMouseLeave}
                            >
                                <div className="bg-white rounded-xl shadow-xl border border-gray-200 py-2 min-w-[220px] animate-in fade-in slide-in-from-top-2 duration-200">
                                    {/* Arrow pointer */}
                                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-l border-t border-gray-200 transform rotate-45" />
                                    
                                    <div className="relative bg-white rounded-xl">
                                        <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100">
                                            {categories.find(c => c.id === hoveredCategory)?.label} Spaces
                                        </div>
                                        <div className="py-1">
                                            {SUBCATEGORIES[hoveredCategory].map((sub) => (
                                                <button
                                                    key={sub.type}
                                                    onClick={() => handleSubcategoryClick(sub.type, hoveredCategory)}
                                                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center justify-between ${
                                                        selectedSubcategory === sub.type ? 'bg-brand-50 text-brand-700 font-medium' : 'text-gray-700'
                                                    }`}
                                                >
                                                    <span>{sub.label}</span>
                                                    {selectedSubcategory === sub.type && (
                                                        <span className="w-2 h-2 bg-brand-600 rounded-full" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="border-t border-gray-100 pt-1">
                                            <button
                                                onClick={() => handleCategoryClick(hoveredCategory)}
                                                className="w-full text-left px-4 py-2.5 text-sm text-brand-600 hover:bg-brand-50 transition-colors font-medium"
                                            >
                                                View all {categories.find(c => c.id === hoveredCategory)?.label}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Selected subcategory indicator */}
                        {selectedSubcategory && (
                            <div className="hidden lg:flex items-center gap-2 mb-4 px-1">
                                <span className="text-sm text-gray-600">Showing:</span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-50 text-brand-700 rounded-full text-sm font-medium">
                                    {selectedSubcategory}
                                    <button 
                                        onClick={() => setSelectedSubcategory(null)}
                                        className="hover:bg-brand-100 rounded-full p-0.5 transition-colors"
                                        aria-label="Clear subcategory filter"
                                    >
                                        <X size={14} />
                                    </button>
                                </span>
                            </div>
                        )}

                        {/* Location-based sorting info & toggle */}
                        {isSupported && (
                            <div className="flex items-center justify-between mb-4 px-1">
                                <div className="flex items-center gap-2">
                                    {userLocation && sortByDistance && (
                                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                            <MapPin size={14} className="text-brand-600" />
                                            <span>Showing spaces near <span className="font-medium text-gray-900">{userLocation.displayName}</span></span>
                                        </div>
                                    )}
                                    {!userLocation && !locationLoading && (
                                        <button
                                            onClick={requestLocation}
                                            className="flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700 font-medium"
                                        >
                                            <MapPin size={14} />
                                            <span>Use my location</span>
                                        </button>
                                    )}
                                    {locationLoading && (
                                        <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                            <div className="w-3.5 h-3.5 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
                                            <span>Detecting location...</span>
                                        </div>
                                    )}
                                </div>
                                {userLocation && (
                                    <button
                                        onClick={() => setSortByDistance(!sortByDistance)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                                            sortByDistance 
                                                ? 'bg-brand-50 text-brand-700 border border-brand-200' 
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    >
                                        <MapPin size={12} />
                                        <span>Near me</span>
                                        {sortByDistance && <span className="w-1.5 h-1.5 bg-brand-600 rounded-full" />}
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Listings Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-8 sm:gap-y-10 animate-in fade-in duration-500">
                            {isLoading ? (
                                // Show 8 skeletons while loading
                                Array.from({ length: 8 }).map((_, i) => (
                                    <ListingSkeleton key={i} />
                                ))
                            ) : (
                                renderListingsWithPromo()
                            )}
                        </div>

                        {/* Sentinel for infinite scroll */}
                        {!isLoading && visibleCount < displayListings.length && (
                            <div ref={loadMoreRef} className="h-20 flex justify-center items-center w-full mt-8">
                                <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Filter Modal */}
            {showMobileFilters && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setShowMobileFilters(false)}
                    />

                    {/* Modal Content */}
                    <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-2xl max-h-[85vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-300">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <h2 className="text-lg font-bold">Filters</h2>
                            <button
                                onClick={() => setShowMobileFilters(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition"
                                title="Close filters"
                                aria-label="Close filters"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Filter Content */}
                        <div className="flex-1 overflow-y-auto">
                            <AdvancedSearch
                                filters={filters}
                                onFilterChange={handleFilterChange}
                            />
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-gray-200 bg-white">
                            <Button
                                onClick={() => setShowMobileFilters(false)}
                                variant="primary"
                                size="lg"
                                className="w-full"
                            >
                                Show Results
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;
