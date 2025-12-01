import React from 'react';
import { Listing, User, ListingStatus, SpaceType } from '@fiilar/types';
import ListingCard from '../components/ListingCard';
import AdvancedSearch from '../components/AdvancedSearch';
import { filterListings, parseNaturalLanguageQuery, SearchFilters } from '@fiilar/search';
import { Home as HomeIcon, Camera, Users, Music, Briefcase, Sun, Search, Plus, X, SlidersHorizontal, TrendingUp, ArrowRight } from 'lucide-react';
import { Button } from '@fiilar/ui';

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
}

const categories = [
    { id: 'All', label: 'All', icon: null },
    { id: SpaceType.APARTMENT, label: 'Apartments', icon: HomeIcon },
    { id: SpaceType.STUDIO, label: 'Studios', icon: Camera },
    { id: SpaceType.CONFERENCE, label: 'Conference', icon: Users },
    { id: SpaceType.EVENT_CENTER, label: 'Events', icon: Music },
    { id: SpaceType.CO_WORKING, label: 'Co-working', icon: Briefcase },
    { id: SpaceType.OPEN_SPACE, label: 'Open Air', icon: Sun },
];

const Home: React.FC<HomeProps> = ({
    listings,
    user,
    activeCategory,
    setActiveCategory,
    searchTerm,
    onBecomeHostClick
}) => {

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
        const parsedFilters = parseNaturalLanguageQuery(searchTerm);

        // Reset to defaults and apply new parsed filters
        // We clear 'searchTerm' here so the raw natural language string doesn't 
        // cause the text-based filter to fail (e.g. "Apartment in Lagos" shouldn't fail 
        // just because the title doesn't contain that exact sentence)
        setFilters({
            ...initialFilters,
            ...parsedFilters,
            searchTerm: ''
        });
    }, [searchTerm]);

    const handleFilterChange = (newFilters: SearchFilters) => {
        setFilters(newFilters);
    };

    const displayListings = React.useMemo(() => {
        // First apply category filter if selected (unless it's 'All')
        let filtered = listings;
        if (activeCategory !== 'All') {
            filtered = filtered.filter(l => l.type === activeCategory);
        }

        // Then apply advanced filters
        return filterListings(filtered, filters)
            .filter(l => l.status === ListingStatus.LIVE)
            .sort((a, b) => {
                // Sort by createdAt descending (newest first)
                const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return dateB - dateA;
            });
    }, [listings, activeCategory, filters]);

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

    const renderListingsWithPromo = () => {
        const items: React.ReactNode[] = [];
        let promoAdded = false;

        if (displayListings.length === 0 && !user) {
            return (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                    <HomeIcon size={48} className="text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900">No matches found</h3>
                    <p className="text-gray-500 mb-8">Try selecting a different category.</p>
                    <Button onClick={onBecomeHostClick} variant="primary" className="bg-black hover:bg-gray-800">
                        Become a Host
                    </Button>
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

            if (!user && !promoAdded && (index === 3 || (displayListings.length < 4 && index === displayListings.length - 1))) {
                items.push(
                    <button
                        key="promo"
                        onClick={onBecomeHostClick}
                        className="group cursor-pointer flex flex-col gap-3 bg-white p-3 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 text-left h-full"
                        aria-label="Become a host and earn income"
                    >
                        <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100 border border-gray-200 w-full group-hover:border-brand-200 transition-colors">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform group-hover:shadow-md">
                                    <Plus size={24} className="text-brand-600" />
                                </div>
                            </div>
                        </div>
                        <div className="mt-1">
                            <h3 className="font-medium text-base text-gray-900 leading-tight truncate">Become a Host</h3>
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
                            <div className="text-sm font-bold text-gray-900">Where to?</div>
                            <div className="text-[11px] text-gray-500 font-medium">Anywhere • Any week • Add guests</div>
                        </div>
                        <div className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 bg-white text-gray-900">
                            <SlidersHorizontal size={16} strokeWidth={2} />
                        </div>
                    </button>

                    {/* Mobile Categories */}
                    <div className="flex items-center gap-6 overflow-x-auto no-scrollbar pb-3 -mx-4 px-4">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={(e) => {
                                    setActiveCategory(cat.id);
                                    e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                                }}
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
                        {/* Desktop Categories */}
                        <div className={`hidden lg:flex sticky top-20 z-30 flex-1 items-center gap-2 sm:gap-3 lg:gap-0 overflow-x-auto py-2 sm:py-3 no-scrollbar rounded-full bg-white/80 backdrop-blur-md border border-white/20 px-2 sm:px-4 lg:justify-between lg:w-full lg:mx-0 lg:bg-white lg:border-gray-100 lg:shadow-faint lg:shadow-none hover:shadow-lg transition-all duration-300 mb-8 ${isHeaderVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}`}>
                            {categories.map((cat, index) => (
                                <React.Fragment key={cat.id}>
                                    <button
                                        data-category={cat.id}
                                        onClick={(e) => {
                                            setActiveCategory(cat.id);
                                            e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                                        }}
                                        className={`flex items-center gap-1.5 sm:gap-2 ${cat.id === 'All' ? 'pl-4 pr-3 sm:px-4' : 'px-3 sm:px-4'} py-1.5 sm:py-2 rounded-full whitespace-nowrap transition-all duration-200 text-xs sm:text-sm hover:scale-105 active:scale-95 ${activeCategory === cat.id
                                            ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                                            : 'bg-white/50 backdrop-blur-sm text-gray-700 hover:bg-white/80 border border-gray-200/50 lg:bg-transparent lg:border-0 lg:hover:bg-gray-50'
                                            }`}
                                    >
                                        {cat.icon ? <cat.icon size={16} className="sm:w-[18px] sm:h-[18px]" strokeWidth={1.5} /> : <Search size={16} className="sm:w-[18px] sm:h-[18px]" strokeWidth={1.5} />}
                                        <span className="font-medium">{cat.label}</span>
                                    </button>
                                    {index < categories.length - 1 && (
                                        <div className="hidden lg:block h-5 w-px bg-gray-200 shrink-0 mx-2"></div>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>

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
