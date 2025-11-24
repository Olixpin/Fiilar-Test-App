import React from 'react';
import { Listing, User, ListingStatus, SpaceType } from '@fiilar/types';
import ListingCard from '../components/ListingCard';
import AdvancedSearch, { SearchFilters } from '../components/AdvancedSearch';
import { filterListings, parseNaturalLanguageQuery } from '../../../services/searchService';
import { Home as HomeIcon, Camera, Users, Music, Briefcase, Sun, Search, Plus, X, SlidersHorizontal } from 'lucide-react';
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

const Home: React.FC<HomeProps> = ({
    listings,
    user,
    activeCategory,
    setActiveCategory,
    searchTerm,
    onBecomeHostClick
}) => {
    const categories = [
        { id: 'All', label: 'All', icon: null },
        { id: SpaceType.APARTMENT, label: 'Apartments', icon: HomeIcon },
        { id: SpaceType.STUDIO, label: 'Studios', icon: Camera },
        { id: SpaceType.CONFERENCE, label: 'Conference', icon: Users },
        { id: SpaceType.EVENT_CENTER, label: 'Events', icon: Music },
        { id: SpaceType.CO_WORKING, label: 'Co-working', icon: Briefcase },
        { id: SpaceType.OPEN_SPACE, label: 'Open Air', icon: Sun },
    ];

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
    const loadMoreRef = React.useRef<HTMLDivElement>(null);

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
        return filterListings(filtered, filters).filter(l => l.status === ListingStatus.LIVE);
    }, [listings, activeCategory, filters]);

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

        visibleListings.forEach((l, index) => {
            items.push(<ListingCard key={l.id} listing={l} />);

            if (!user && !promoAdded && (index === 1 || (displayListings.length < 2 && index === displayListings.length - 1))) {
                items.push(
                    <button
                        key="promo"
                        onClick={onBecomeHostClick}
                        className="group cursor-pointer flex flex-col gap-2 h-full text-left"
                        aria-label="Become a host and earn income"
                    >
                        <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-50 border border-gray-200 flex flex-col items-center justify-center text-center p-6 hover:bg-gray-100 transition-colors">
                            <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Plus size={24} className="text-brand-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">Become a Host</h3>
                            <p className="text-gray-500 text-sm mb-4 leading-tight">Earn extra income by sharing your space.</p>
                        </div>
                        <div className="mt-1 opacity-0">Placeholder</div>
                    </button>
                );
                promoAdded = true;
            }
        });

        if (!user && !promoAdded && displayListings.length === 0) return null;

        return items;
    };

    return (
        <div className="pt-6 pb-20">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-8">
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
                        {/* Categories */}
                        <div className="flex items-center gap-2 sm:gap-3 lg:gap-0 overflow-x-auto py-3 sm:py-3 mb-4 sm:mb-6 no-scrollbar sticky top-[72px] sm:top-20 bg-white z-30 pl-4 pr-4 sm:pr-0 lg:justify-between lg:px-4 w-full lg:border lg:border-gray-200 lg:rounded-full lg:shadow-sm">
                            {/* Mobile Filter Button */}
                            <button
                                onClick={() => setShowMobileFilters(true)}
                                className="lg:hidden flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 font-medium text-xs sm:text-sm whitespace-nowrap transition-all"
                            >
                                <SlidersHorizontal size={16} className="sm:w-[18px] sm:h-[18px]" strokeWidth={1.5} />
                                <span>Filters</span>
                            </button>
                            {categories.map((cat, idx) => (
                                <React.Fragment key={cat.id}>
                                    <button
                                        data-category={cat.id}
                                        onClick={() => {
                                            setActiveCategory(cat.id);
                                            setTimeout(() => {
                                                const btn = document.querySelector(`button[data-category="${cat.id}"]`);
                                                btn?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                                            }, 0);
                                        }}
                                        className={`flex items-center gap-1.5 sm:gap-2 ${idx === 0 ? 'pl-4 pr-3 sm:px-4' : 'px-3 sm:px-4'} py-1.5 sm:py-2 rounded-full whitespace-nowrap transition-all duration-200 text-xs sm:text-sm hover:scale-105 active:scale-95 ${activeCategory === cat.id
                                            ? 'bg-brand-600 text-white shadow-md'
                                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 lg:bg-transparent lg:border-0 lg:hover:bg-gray-50'
                                            }`}
                                    >
                                        {cat.icon ? <cat.icon size={16} className="sm:w-[18px] sm:h-[18px]" strokeWidth={1.5} /> : <Search size={16} className="sm:w-[18px] sm:h-[18px]" strokeWidth={1.5} />}
                                        <span className="font-medium">{cat.label}</span>
                                    </button>
                                    {idx < categories.length - 1 && (
                                        <div className="hidden lg:block h-5 w-px bg-gray-200 shrink-0 mx-2" />
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
