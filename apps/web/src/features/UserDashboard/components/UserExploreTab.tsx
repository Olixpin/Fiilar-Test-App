import React, { useState, useEffect, useMemo } from 'react';
import { Listing, ListingStatus } from '@fiilar/types';
import { getSpaceRecommendations } from '../../../services/aiService';
import { getTrendingListings, getMostViewedListings, generateMockAnalytics, getAllListingAnalytics } from '@fiilar/storage';
import ListingCard from '../../Listings/components/ListingCard';
import { Sparkles, Search, ArrowRight, Briefcase, Camera, Music, Users, Coffee, Building2, X, TrendingUp, Eye, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UserExploreTabProps {
  listings: Listing[];
  initialSearchQuery?: string;
}

const categories = [
  { name: 'Office', icon: Briefcase, color: 'bg-blue-100 text-blue-600' },
  { name: 'Studio', icon: Camera, color: 'bg-purple-100 text-purple-600' },
  { name: 'Event', icon: Music, color: 'bg-pink-100 text-pink-600' },
  { name: 'Meeting', icon: Users, color: 'bg-orange-100 text-orange-600' },
  { name: 'Coworking', icon: Coffee, color: 'bg-amber-100 text-amber-600' },
  { name: 'Industrial', icon: Building2, color: 'bg-slate-100 text-slate-600' },
];

const suggestedSearches = [
  "Quiet studio for recording",
  "Large hall for wedding reception",
  "Cozy apartment for weekend",
  "Modern office for team meeting"
];

const ListingSkeleton = () => (
  <div className="flex flex-col h-full animate-pulse">
    <div className="bg-gray-200 rounded-xl h-64 w-full mb-4"></div>
    <div className="space-y-3">
      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      <div className="flex gap-2 pt-2">
        <div className="h-8 bg-gray-200 rounded w-20"></div>
        <div className="h-8 bg-gray-200 rounded w-20"></div>
      </div>
    </div>
  </div>
);

export const UserExploreTab: React.FC<UserExploreTabProps> = ({ listings, initialSearchQuery }) => {
  const navigate = useNavigate();
  const [preference, setPreference] = useState(initialSearchQuery || '');
  const [recommendations, setRecommendations] = useState<{ listing: Listing, reason: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [trendingSpaces, setTrendingSpaces] = useState<Listing[]>([]);
  const [mostViewed, setMostViewed] = useState<Listing[]>([]);
  const [activeSection, setActiveSection] = useState<'trending' | 'popular'>('trending');

  // Memoize active listings to prevent infinite loop in useEffect
  const activeListings = useMemo(
    () => listings.filter(l => l.status === ListingStatus.LIVE),
    [listings]
  );

  // Initialize trending data
  useEffect(() => {
    if (activeListings.length === 0) return;

    const analytics = getAllListingAnalytics();

    // If no analytics exist, generate mock data for demo
    if (Object.keys(analytics).length === 0) {
      generateMockAnalytics(activeListings);
    }

    // Get trending and most viewed
    const trending = getTrendingListings(activeListings, 6);
    const viewed = getMostViewedListings(activeListings, 6);

    setTrendingSpaces(trending);
    setMostViewed(viewed);
  }, [activeListings]);

  // Trigger search if initialSearchQuery is provided
  useEffect(() => {
    if (initialSearchQuery) {
      handleSearch(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  const handleSearch = async (query?: string) => {
    const searchText = query || preference;
    if (!searchText.trim()) return;

    if (query) setPreference(query);

    setIsLoading(true);
    setHasSearched(true);
    try {
      const recs = await getSpaceRecommendations(searchText, activeListings);

      // Map IDs back to full objects
      const fullRecs = recs.map(r => {
        const found = activeListings.find(l => l.id === r.listingId);
        return found ? { listing: found, reason: r.reason } : null;
      }).filter(Boolean) as { listing: Listing, reason: string }[];

      setRecommendations(fullRecs);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const clearSearch = () => {
    setPreference('');
    setRecommendations([]);
    setHasSearched(false);
  };

  return (
    <div className="space-y-12 pb-12">
      {/* AI Search Hero */}
      <div className="bg-brand-50 p-8 md:p-12 rounded-4xl text-gray-900 shadow-sm relative overflow-hidden animate-in zoom-in-95 duration-700">
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 backdrop-blur-sm border border-brand-100 text-sm font-medium text-brand-700 mb-6">
            <Sparkles size={14} className="text-brand-500" />
            Powered by Claude Sonnet 4.5
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-black">
            Find your perfect space instantly
          </h2>
          <p className="mb-8 text-lg text-black max-w-2xl mx-auto">
            Describe what you need—whether it's a quiet studio, a large event hall, or a cozy apartment.
          </p>

          <div className="relative max-w-2xl mx-auto group mb-8">
            <div className="absolute -inset-1 bg-linear-to-r from-brand-400 via-brand-500 to-brand-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
            <div className="relative flex flex-col sm:flex-row gap-2 bg-white p-2 rounded-2xl shadow-sm ring-1 ring-transparent focus-within:ring-4 focus-within:ring-brand-100 focus-within:border-brand-200 transition-all duration-300">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={preference}
                  onChange={(e) => setPreference(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Describe your ideal space..."
                  aria-label="Describe your ideal space"
                  className="w-full h-full bg-transparent text-gray-900 placeholder-gray-400 px-4 py-3 sm:py-0 text-base sm:text-lg outline-none rounded-xl"
                />
                {preference && (
                  <button
                    onClick={() => setPreference('')}
                    aria-label="Clear search"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              <button
                onClick={() => handleSearch()}
                disabled={isLoading}
                className="bg-brand-600 text-white px-6 sm:px-8 py-3 rounded-xl font-semibold hover:bg-brand-700 transition-colors shadow-sm disabled:opacity-80 disabled:cursor-not-allowed flex items-center gap-2 justify-center whitespace-nowrap"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Search size={20} />
                    <span>Find Spaces</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Suggested Searches */}
          <div className="flex flex-wrap justify-center gap-2">
            {suggestedSearches.map((term) => (
              <button
                key={term}
                onClick={() => handleSearch(term)}
                className="px-3 py-1.5 bg-white/50 hover:bg-white border border-brand-100 rounded-full text-sm text-gray-600 hover:text-brand-700 transition-all duration-200"
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        {/* Decorative Elements (very subtle) */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-brand-500/6 rounded-full -translate-y-1/3 translate-x-1/4 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-brand-400/5 rounded-full translate-y-1/3 -translate-x-1/4 blur-3xl"></div>
      </div>

      {/* Categories Section */}
      {!recommendations.length && !isLoading && !hasSearched && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => handleSearch(`Find me a ${cat.name.toLowerCase()} space`)}
                className="flex flex-col items-center justify-center p-4 bg-white border border-gray-100 rounded-2xl hover:shadow-md hover:border-brand-100 transition-all duration-200 group"
              >
                <div className={`w-12 h-12 ${cat.color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200`}>
                  <cat.icon size={24} />
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="flex items-center gap-2">
            <Sparkles className="text-brand-600 animate-pulse" size={24} />
            <h3 className="text-2xl font-bold text-gray-900">Finding the best matches...</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <ListingSkeleton key={i} />
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {!isLoading && recommendations.length > 0 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="text-brand-600" size={24} />
              <h3 className="text-2xl font-bold text-gray-900">Recommended for you</h3>
            </div>
            <button
              onClick={clearSearch}
              className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1"
            >
              <X size={14} /> Clear Search
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recommendations.map((item, index) => (
              <div key={item.listing.id} className="flex flex-col h-full group">
                <div className="relative">
                  <ListingCard listing={item.listing} priority={true} batchReady={true} index={index} />
                  <div className="absolute -bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm p-4 rounded-xl border border-brand-100 shadow-lg transform transition-all group-hover:-translate-y-1">
                    <div className="flex items-start gap-2">
                      <Sparkles size={16} className="text-brand-600 mt-1 shrink-0" />
                      <p className="text-sm text-gray-600 leading-relaxed">
                        <span className="font-semibold text-brand-900">Why:</span> {item.reason}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="h-12"></div> {/* Spacer for the absolute box */}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Results State */}
      {!isLoading && hasSearched && recommendations.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-300 animate-in fade-in">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No matches found</h3>
          <p className="text-gray-500 mb-6">We couldn't find any spaces matching your description.</p>
          <button
            onClick={clearSearch}
            className="text-brand-600 font-semibold hover:text-brand-700"
          >
            Clear search and browse all
          </button>
        </div>
      )}

      {/* Standard Listing Grid (Fallback or Browse) */}
      {!isLoading && !hasSearched && (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          {/* Section Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-xl w-fit">
              <button
                onClick={() => setActiveSection('trending')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeSection === 'trending'
                  ? 'bg-white text-brand-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                <Flame size={16} className={activeSection === 'trending' ? 'text-orange-500' : ''} />
                Trending
              </button>
              <button
                onClick={() => setActiveSection('popular')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeSection === 'popular'
                  ? 'bg-white text-brand-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                <Eye size={16} className={activeSection === 'popular' ? 'text-blue-500' : ''} />
                Most Viewed
              </button>
            </div>
            <button
              onClick={() => navigate('/')}
              className="text-brand-600 font-semibold hover:text-brand-700 flex items-center gap-1 text-sm"
            >
              View all <ArrowRight size={16} />
            </button>
          </div>

          {/* Trending Spaces */}
          {activeSection === 'trending' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <TrendingUp size={14} className="text-orange-500" />
                <span>Based on recent bookings, views & favorites</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {trendingSpaces.length > 0 ? (
                  trendingSpaces.map((listing, index) => (
                    <div key={listing.id} className="relative">
                      {index < 3 && (
                        <div className="absolute -top-2 -left-2 z-10 w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-white text-xs font-bold">#{index + 1}</span>
                        </div>
                      )}
                      <ListingCard listing={listing} priority={true} batchReady={true} index={index} />
                    </div>
                  ))
                ) : (
                  activeListings.slice(0, 6).map(l => (
                    <ListingCard key={l.id} listing={l} />
                  ))
                )}
              </div>
            </div>
          )}

          {/* Most Viewed */}
          {activeSection === 'popular' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Eye size={14} className="text-blue-500" />
                <span>Spaces getting the most attention right now</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {mostViewed.length > 0 ? (
                  mostViewed.map((listing, index) => (
                    <div key={listing.id} className="relative">
                      {index < 3 && (
                        <div className="absolute -top-2 -left-2 z-10 w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                          <Eye size={14} className="text-white" />
                        </div>
                      )}
                      <ListingCard listing={listing} priority={true} batchReady={true} index={index} />
                    </div>
                  ))
                ) : (
                  activeListings.slice(0, 6).map((l, index) => (
                    <ListingCard key={l.id} listing={l} priority={true} batchReady={true} index={index} />
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
