/**
 * HostListingGrid Component
 * 
 * Displays a grid of the host's public listings.
 * Reuses the existing ListingCard component for consistency.
 */

import React, { useState, useMemo } from 'react';
import { PublicListing, SpaceType } from '@fiilar/types';
import ListingCard from '../../Listings/components/ListingCard';
import { Filter, Grid, List, SlidersHorizontal } from 'lucide-react';

interface HostListingGridProps {
  listings: PublicListing[];
  hostName?: string;
}

export const HostListingGrid: React.FC<HostListingGridProps> = ({
  listings,
  hostName,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<SpaceType | 'all'>('all');
  const [sortBy, setSortBy] = useState<'default' | 'price-low' | 'price-high' | 'rating'>('default');

  // Derive unique categories from listings
  const categories = useMemo(() => {
    const uniqueTypes = new Set(listings.map(l => l.type).filter(Boolean));
    return Array.from(uniqueTypes) as SpaceType[];
  }, [listings]);

  // Filter listings by category
  const filteredListings = selectedCategory === 'all'
    ? listings
    : listings.filter(l => l.type === selectedCategory);

  // Sort listings
  const sortedListings = [...filteredListings].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      default:
        return 0;
    }
  });

  // Convert PublicListing to Listing format for ListingCard
  const toListingFormat = (publicListing: PublicListing) => ({
    ...publicListing,
    hostId: '', // Not needed for display
    status: 'Live' as const,
    tags: [],
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Filters */}
      {categories.length > 1 && (
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600 font-medium">Filter:</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-brand-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({listings.length})
              </button>
              
              {categories.map(category => {
                const count = listings.filter(l => l.type === category).length;
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedCategory === category
                        ? 'bg-brand-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category} ({count})
                  </button>
                );
              })}
            </div>

            {/* Sort Dropdown */}
            <div className="ml-auto flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-gray-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="default">Default</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Showing {sortedListings.length} {sortedListings.length === 1 ? 'space' : 'spaces'}
          {selectedCategory !== 'all' && ` in ${selectedCategory}`}
        </p>
      </div>

      {/* Listings Grid */}
      {sortedListings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedListings.map((listing, index) => (
            <ListingCard
              key={listing.id}
              listing={toListingFormat(listing)}
              priority={index < 8}
              index={index}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Grid className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No spaces found</h3>
          <p className="text-gray-500">
            {selectedCategory !== 'all' 
              ? 'Try selecting a different category'
              : 'This host has no available spaces at the moment'}
          </p>
        </div>
      )}
    </div>
  );
};

export default HostListingGrid;
