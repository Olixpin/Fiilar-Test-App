import React from 'react';
import { Listing, User, ListingStatus, SpaceType } from '../types';
import ListingCard from './ListingCard';
import { Home as HomeIcon, Camera, Users, Music, Briefcase, Sun, Search, Plus } from 'lucide-react';

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

    const displayListings = listings.filter(l => {
        const matchesStatus = l.status === ListingStatus.LIVE;
        const matchesCategory = activeCategory === 'All' || l.type === activeCategory;
        const matchesSearch = !searchTerm ||
            l.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
            l.title.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesCategory && matchesSearch;
    });

    const renderListingsWithPromo = () => {
        const items: React.ReactNode[] = [];
        let promoAdded = false;

        if (displayListings.length === 0 && !user) {
            return (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                    <HomeIcon size={48} className="text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900">No matches found</h3>
                    <p className="text-gray-500 mb-8">Try selecting a different category.</p>
                    <button onClick={onBecomeHostClick} className="bg-black text-white px-6 py-3 rounded-lg font-semibold">
                        Become a Host
                    </button>
                </div>
            );
        }

        displayListings.forEach((l, index) => {
            items.push(<ListingCard key={l.id} listing={l} />);

            if (!user && !promoAdded && (index === 1 || (displayListings.length < 2 && index === displayListings.length - 1))) {
                items.push(
                    <div
                        key="promo"
                        onClick={onBecomeHostClick}
                        className="group cursor-pointer flex flex-col gap-2 h-full"
                    >
                        <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-50 border border-gray-200 flex flex-col items-center justify-center text-center p-6 hover:bg-gray-100 transition-colors">
                            <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Plus size={24} className="text-brand-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">Become a Host</h3>
                            <p className="text-gray-500 text-sm mb-4 leading-tight">Earn extra income by sharing your space.</p>
                        </div>
                        <div className="mt-1 opacity-0">Placeholder</div>
                    </div>
                );
                promoAdded = true;
            }
        });

        if (!user && !promoAdded && displayListings.length === 0) return null;

        return items;
    };

    return (
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 pb-20">
            {/* Categories Bar - Sticky Top */}
            <div className="flex items-center gap-8 overflow-x-auto pb-2 mb-6 no-scrollbar sticky top-[80px] bg-white z-30 pt-6">
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`flex flex-col items-center min-w-[64px] gap-2 group cursor-pointer transition-colors relative pb-3 ${activeCategory === cat.id ? 'text-black' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-lg p-1'}`}
                    >
                        {cat.icon ? <cat.icon size={24} strokeWidth={activeCategory === cat.id ? 2 : 1.5} /> : <Search size={24} strokeWidth={1.5} />}
                        <span className={`text-xs font-medium whitespace-nowrap ${activeCategory === cat.id ? 'font-bold' : ''}`}>{cat.label}</span>
                        {activeCategory === cat.id && (
                            <span className="absolute bottom-0 w-full h-0.5 bg-black animate-in fade-in zoom-in duration-200" />
                        )}
                    </button>
                ))}
            </div>

            {/* Listings Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10 animate-in fade-in duration-500">
                {renderListingsWithPromo()}
            </div>
        </div>
    );
};

export default Home;
