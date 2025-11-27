import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Listing } from '@fiilar/types';
import ListingCard from '../../Listings/components/ListingCard';
import { Heart, ArrowUpDown, Check, X, Sparkles } from 'lucide-react';
import { cn } from '@fiilar/ui';
import { useBatchedImageLoading } from '../../../hooks/useBatchedImageLoading';

interface UserFavoritesTabProps {
  user: User;
  listings: Listing[];
}

type SortOption = 'price-asc' | 'price-desc' | 'capacity-desc';

export const UserFavoritesTab: React.FC<UserFavoritesTabProps> = ({ user, listings }) => {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState<SortOption>('price-asc');
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  const favoriteListings = listings.filter(l => user.favorites?.includes(l.id));

  const sortedListings = [...favoriteListings].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'capacity-desc':
        return b.capacity - a.capacity;
      default:
        return 0;
    }
  });

  const toggleCompare = (listingId: string) => {
    setSelectedForCompare(prev => {
      if (prev.includes(listingId)) {
        return prev.filter(id => id !== listingId);
      }
      if (prev.length >= 3) return prev; // Max 3
      return [...prev, listingId];
    });
  };

  // Use the batched image loading hook for smooth scroll loading
  const {
    visibleItems,
    handleImageLoad,
    isBatchReady,
    isPriority,
    getBatchIndex,
    loadMoreRef,
    hasMore,
  } = useBatchedImageLoading(sortedListings);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-brand-50 rounded-full border border-brand-100 flex items-center justify-center text-brand-600 shadow-sm">
            <Heart size={24} className="fill-brand-600/10" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Favorites</h2>
            <p className="text-sm font-medium text-gray-500">{favoriteListings.length} saved spaces</p>
          </div>
        </div>

        {favoriteListings.length > 0 && (
          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                aria-label="Sort favorites by"
                className="appearance-none bg-white border border-gray-200 text-gray-700 py-2 pl-4 pr-10 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent cursor-pointer"
                disabled={compareMode}
              >
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="capacity-desc">Capacity: High to Low</option>
              </select>
              <ArrowUpDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            <button
              onClick={() => {
                setCompareMode(!compareMode);
                setSelectedForCompare([]);
              }}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2",
                compareMode
                  ? "bg-brand-600 text-white shadow-sm shadow-brand-500/20"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
              )}
            >
              {compareMode ? <Check size={16} /> : <Sparkles size={16} />}
              {compareMode ? 'Done' : 'Compare'}
            </button>
          </div>
        )}
      </div>

      {favoriteListings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-dashed border-gray-200 text-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
            <Heart size={32} className="text-red-500 fill-red-500/20" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No favorites yet</h3>
          <p className="text-gray-500 max-w-sm mb-8">
            Start exploring spaces and save the ones you love to create your personal collection.
          </p>
          <a
            href="/?tab=explore"
            className="px-6 py-3 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 transition-colors shadow-sm shadow-brand-500/20"
          >
            Browse Spaces
          </a>
        </div>
      ) : compareMode && selectedForCompare.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {selectedForCompare.map(id => {
            const listing = listings.find(l => l.id === id);
            if (!listing) return null;
            return (
              <div key={listing.id} className="bg-white rounded-xl border-2 border-brand-200 p-4 space-y-4 shadow-lg shadow-brand-100">
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
                  <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                  <button
                    onClick={() => toggleCompare(listing.id)}
                    aria-label={`Remove ${listing.title} from comparison`}
                    className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm rounded-full text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 line-clamp-1">{listing.title}</h3>
                  <p className="text-sm text-gray-500">{listing.location}</p>
                </div>
                <div className="space-y-3 pt-3 border-t border-gray-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Price</span>
                    <span className="font-bold text-gray-900">${listing.price} <span className="text-xs font-normal text-gray-400">/{listing.priceUnit === 'Hourly' ? 'hr' : 'day'}</span></span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Capacity</span>
                    <span className="font-medium text-gray-900">{listing.capacity} people</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Rating</span>
                    <span className="font-medium text-gray-900 flex items-center gap-1">★ {listing.rating}</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/listing/${listing.id}`)}
                  className="w-full py-2.5 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition-colors shadow-sm shadow-brand-500/20"
                >
                  Book Now
                </button>
              </div>
            );
          })}
          {selectedForCompare.length < 3 && (
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 text-center">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm">
                <Sparkles size={20} className="text-brand-400" />
              </div>
              <p className="text-sm font-medium text-gray-900">Add another space</p>
              <p className="text-xs text-gray-500 mt-1">Select from your favorites below to compare</p>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {visibleItems.map((l, index) => (
              <div key={l.id} className="relative group">
                <ListingCard 
                  listing={l} 
                  priority={isPriority(index)}
                  index={getBatchIndex(index)}
                  onImageLoad={handleImageLoad}
                  batchReady={isBatchReady(index)}
                />

                {compareMode && (
                  <div
                    className={cn(
                      "absolute inset-0 z-10 rounded-2xl transition-all duration-200 flex items-center justify-center cursor-pointer",
                      selectedForCompare.includes(l.id)
                        ? "bg-brand-900/10 ring-2 ring-brand-500"
                        : "bg-white/0 hover:bg-white/50"
                    )}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleCompare(l.id);
                    }}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-all transform scale-0 group-hover:scale-100",
                      selectedForCompare.includes(l.id)
                        ? "bg-brand-600 text-white scale-100"
                        : "bg-white text-gray-400 border border-gray-200"
                    )}>
                      {selectedForCompare.includes(l.id) ? <Check size={16} /> : <Sparkles size={16} />}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          {/* Infinite scroll trigger */}
          {hasMore && <div ref={loadMoreRef} className="h-10 mt-8" />}
        </>
      )}
    </div>
  );
};
