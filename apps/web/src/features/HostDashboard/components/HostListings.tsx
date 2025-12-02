import React, { useState } from 'react';
import { Listing, ListingStatus, BookingType } from '@fiilar/types';
import { useLocale } from '@fiilar/ui';
import { Home, UserCheck, MapPin, DollarSign, Users, Briefcase, AlertTriangle, Edit3, Trash2, Plus, Eye, Star, Filter } from 'lucide-react';
import { cn } from '@fiilar/utils';

interface HostListingsProps {
    listings: Listing[];
    onEdit: (listing: Listing) => void;
    onDelete: (id: string, status: ListingStatus) => void;
    onCreate: () => void;
    onPreview: (id: string) => void;
    searchTerm?: string;
}

type FilterType = 'ALL' | 'LIVE' | 'PENDING' | 'OFF_MARKET';

const HostListings: React.FC<HostListingsProps> = ({ listings, onEdit, onDelete, onCreate, onPreview, searchTerm = '' }) => {
    const { locale } = useLocale();
    const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');

    // Filter out deleted listings - hosts shouldn't see these (only admins for audit purposes)
    const activeListings = listings.filter(l => l.status !== ListingStatus.DELETED);

    // Apply search filter
    const searchFilteredListings = activeListings.filter(listing => {
        if (!searchTerm.trim()) return true;
        const search = searchTerm.toLowerCase().trim();
        return (
            listing.title.toLowerCase().includes(search) ||
            listing.description?.toLowerCase().includes(search) ||
            listing.location?.toLowerCase().includes(search) ||
            listing.address?.toLowerCase().includes(search) ||
            listing.tags?.some(tag => tag.toLowerCase().includes(search))
        );
    });

    const filteredListings = searchFilteredListings.filter(listing => {
        if (activeFilter === 'ALL') return true;
        if (activeFilter === 'LIVE') return listing.status === ListingStatus.LIVE;
        if (activeFilter === 'PENDING') return listing.status === ListingStatus.PENDING_APPROVAL || listing.status === ListingStatus.PENDING_KYC;
        if (activeFilter === 'OFF_MARKET') return listing.status === ListingStatus.DRAFT || listing.status === ListingStatus.REJECTED;
        return true;
    }).sort((a, b) => {
        // Sort by createdAt descending (newest first)
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
    });

    const liveCount = searchFilteredListings.filter(l => l.status === ListingStatus.LIVE).length;
    const pendingCount = searchFilteredListings.filter(l => l.status === ListingStatus.PENDING_APPROVAL || l.status === ListingStatus.PENDING_KYC).length;
    const offMarketCount = searchFilteredListings.filter(l => l.status === ListingStatus.DRAFT || l.status === ListingStatus.REJECTED).length;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Your Listings</h2>
                    <p className="text-gray-500 text-sm mt-1">Manage your properties and view their status</p>
                </div>
                <button
                    onClick={onCreate}
                    className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-brand-600/20 hover:shadow-brand-600/30 hover:-translate-y-0.5"
                >
                    <Plus size={18} />
                    <span>Create Listing</span>
                </button>
            </div>

            {/* Filters */}
            {activeListings.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                    <button
                        onClick={() => setActiveFilter('ALL')}
                        className={cn(
                            "px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                            activeFilter === 'ALL'
                                ? "bg-gray-900 text-white shadow-md"
                                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                        )}
                    >
                        All Listings ({searchFilteredListings.length})
                    </button>
                    <button
                        onClick={() => setActiveFilter('LIVE')}
                        className={cn(
                            "px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2",
                            activeFilter === 'LIVE'
                                ? "bg-green-600 text-white shadow-md shadow-green-600/20"
                                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                        )}
                    >
                        {activeFilter === 'LIVE' && <span className="w-2 h-2 bg-white rounded-full animate-pulse" />}
                        Live ({liveCount})
                    </button>
                    <button
                        onClick={() => setActiveFilter('PENDING')}
                        className={cn(
                            "px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                            activeFilter === 'PENDING'
                                ? "bg-yellow-500 text-white shadow-md shadow-yellow-500/20"
                                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                        )}
                    >
                        Pending ({pendingCount})
                    </button>
                    <button
                        onClick={() => setActiveFilter('OFF_MARKET')}
                        className={cn(
                            "px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                            activeFilter === 'OFF_MARKET'
                                ? "bg-gray-600 text-white shadow-md"
                                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                        )}
                    >
                        Off Market ({offMarketCount})
                    </button>
                </div>
            )}

            {activeListings.length === 0 ? (
                <div className="glass-card rounded-3xl p-12 text-center border-dashed border-2 border-gray-300 bg-gray-50/50">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <Home size={32} className="text-gray-400" />
                    </div>
                    <h3 className="font-bold text-gray-900 text-xl mb-2">No listings yet</h3>
                    <p className="text-gray-500 mb-8 max-w-md mx-auto">Start earning by listing your apartment, studio, or event space on Fiilar. It only takes a few minutes.</p>
                    <button
                        onClick={onCreate}
                        className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-xl font-medium inline-flex items-center gap-2 transition-all shadow-lg shadow-brand-600/20 hover:shadow-brand-600/30 hover:-translate-y-0.5"
                    >
                        <Plus size={20} />
                        Create your first listing
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredListings.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                            <Filter className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium">No listings match this filter</p>
                            <button onClick={() => setActiveFilter('ALL')} className="text-brand-600 text-sm font-medium mt-2 hover:underline">Clear filters</button>
                        </div>
                    ) : (
                        filteredListings.map(listing => (
                            <div key={listing.id} className="glass-card rounded-2xl p-4 flex flex-col md:flex-row gap-5 group hover:border-brand-200 transition-all duration-300 relative overflow-hidden">
                                {/* Active Pulse Indicator */}
                                {listing.status === ListingStatus.LIVE && (
                                    <div className="absolute top-0 left-0 w-1 h-full bg-green-500" />
                                )}

                                {/* Image Section */}
                                <div className="w-full md:w-48 h-48 md:h-32 rounded-xl bg-gray-100 overflow-hidden shrink-0 relative shadow-sm group-hover:shadow-md transition-all">
                                    <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    {listing.requiresIdentityVerification && (
                                        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg shadow-sm flex items-center gap-1.5" title="ID Required">
                                            <UserCheck size={12} className="text-blue-600" />
                                            <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wide">ID Req</span>
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-lg text-white text-xs font-medium flex items-center gap-1">
                                        <Star size={10} className="fill-white" /> {listing.rating || 'New'}
                                    </div>

                                    {/* View Count Overlay */}
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 pt-6 flex items-center gap-1 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <Eye size={12} /> {listing.viewCount || 0} views
                                    </div>
                                </div>

                                {/* Content Section */}
                                <div className="flex-1 min-w-0 py-1">
                                    <div className="flex items-start justify-between gap-4 mb-2">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-brand-600 transition-colors">{listing.title}</h3>
                                                {listing.status === ListingStatus.LIVE && (
                                                    <span className="relative flex h-2.5 w-2.5">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1">
                                                <MapPin size={14} className="text-gray-400" />
                                                {listing.location}
                                            </p>
                                        </div>
                                        <span className={cn(
                                            "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border whitespace-nowrap",
                                            listing.status === ListingStatus.LIVE ? 'bg-green-50 text-green-700 border-green-200' :
                                                listing.status === ListingStatus.PENDING_APPROVAL ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                                    listing.status === ListingStatus.REJECTED ? 'bg-red-50 text-red-700 border-red-200' :
                                                        'bg-gray-100 text-gray-500 border-gray-200'
                                        )}>
                                            {listing.status.replace('_', ' ')}
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3 mt-4">
                                        <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 text-sm font-medium text-gray-700">
                                            <DollarSign size={14} className="text-gray-400" />
                                            {locale.currencySymbol}{listing.price}
                                            <span className="text-gray-400 font-normal">/{listing.priceUnit === BookingType.HOURLY ? 'hr' : 'day'}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 text-sm font-medium text-gray-700">
                                            <Users size={14} className="text-gray-400" />
                                            {listing.capacity || 1} Guests
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 text-sm font-medium text-gray-700">
                                            <Briefcase size={14} className="text-gray-400" />
                                            {listing.type}
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 text-sm font-medium text-blue-700">
                                            <Eye size={14} className="text-blue-500" />
                                            {listing.viewCount || 0}
                                        </div>
                                    </div>

                                    {listing.rejectionReason && (
                                        <div className="mt-4 text-sm bg-red-50 text-red-800 p-3 rounded-xl border border-red-100 flex items-start gap-2">
                                            <AlertTriangle size={16} className="shrink-0 mt-0.5 text-red-600" />
                                            <span><strong>Action Required:</strong> {listing.rejectionReason}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Actions Section */}
                                <div className="flex md:flex-col items-center gap-2 self-end md:self-center w-full md:w-auto mt-2 md:mt-0 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-5">
                                    <button
                                        onClick={() => onEdit(listing)}
                                        className="flex-1 md:flex-none w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-brand-600 transition-colors"
                                    >
                                        <Edit3 size={16} />
                                        <span>Edit</span>
                                    </button>
                                    <button
                                        onClick={() => onPreview(listing.id)}
                                        className="flex-1 md:flex-none w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                                    >
                                        <Eye size={16} />
                                        <span>Preview</span>
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDelete(listing.id, listing.status);
                                        }}
                                        className="flex-1 md:flex-none w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                        <span>Delete</span>
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default HostListings;
