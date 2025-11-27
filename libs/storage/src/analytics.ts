/**
 * Analytics Service
 * 
 * Tracks listing views, bookings, and calculates trending scores.
 * All data is stored in localStorage following the existing pattern.
 */

import { Listing, AnalyticsEvent, ListingAnalytics } from '@fiilar/types';
import { STORAGE_KEYS } from './constants';

// ============================================================================
// ANALYTICS EVENTS
// ============================================================================

/**
 * Get all analytics events from localStorage
 */
export const getAnalyticsEvents = (): AnalyticsEvent[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.ANALYTICS_EVENTS);
  return stored ? JSON.parse(stored) : [];
};

/**
 * Save analytics events to localStorage
 */
const saveAnalyticsEvents = (events: AnalyticsEvent[]): void => {
  localStorage.setItem(STORAGE_KEYS.ANALYTICS_EVENTS, JSON.stringify(events));
};

/**
 * Track an analytics event
 */
export const trackEvent = (
  type: AnalyticsEvent['type'],
  listingId: string,
  userId?: string,
  metadata?: Record<string, any>
): AnalyticsEvent => {
  const event: AnalyticsEvent = {
    id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    listingId,
    userId,
    timestamp: new Date().toISOString(),
    metadata,
  };

  const events = getAnalyticsEvents();
  events.push(event);
  
  // Keep only last 30 days of events to prevent localStorage bloat
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const filtered = events.filter(e => new Date(e.timestamp) > thirtyDaysAgo);
  
  saveAnalyticsEvents(filtered);
  
  // Update listing analytics immediately for responsiveness
  updateListingAnalytics(listingId);
  
  return event;
};

/**
 * Track a listing view
 */
export const trackListingView = (listingId: string, userId?: string): void => {
  trackEvent('VIEW', listingId, userId);
};

/**
 * Track a booking
 */
export const trackBooking = (listingId: string, userId: string, bookingId?: string): void => {
  trackEvent('BOOKING', listingId, userId, { bookingId });
};

/**
 * Track favorite/unfavorite
 */
export const trackFavorite = (listingId: string, userId: string, isFavoriting: boolean): void => {
  trackEvent(isFavoriting ? 'FAVORITE' : 'UNFAVORITE', listingId, userId);
};

/**
 * Track share action
 */
export const trackShare = (listingId: string, userId?: string, platform?: string): void => {
  trackEvent('SHARE', listingId, userId, { platform });
};

// ============================================================================
// LISTING ANALYTICS
// ============================================================================

/**
 * Get all listing analytics from localStorage
 */
export const getAllListingAnalytics = (): Record<string, ListingAnalytics> => {
  const stored = localStorage.getItem(STORAGE_KEYS.LISTING_ANALYTICS);
  return stored ? JSON.parse(stored) : {};
};

/**
 * Get analytics for a specific listing
 */
export const getListingAnalytics = (listingId: string): ListingAnalytics | null => {
  const all = getAllListingAnalytics();
  return all[listingId] || null;
};

/**
 * Save listing analytics
 */
const saveListingAnalytics = (analytics: Record<string, ListingAnalytics>): void => {
  localStorage.setItem(STORAGE_KEYS.LISTING_ANALYTICS, JSON.stringify(analytics));
};

/**
 * Calculate trending score for a listing
 * 
 * Formula weights:
 * - Bookings (last 7 days): 10 points each
 * - Views (last 7 days): 0.1 points each  
 * - Favorites: 2 points each
 * - Review score: rating × reviewCount × 0.5
 * - New listing boost: +20 if < 14 days old
 * - Time decay: scores reduce over time
 */
export const calculateTrendingScore = (
  listingId: string,
  listing?: Listing
): number => {
  const events = getAnalyticsEvents();
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  // Filter events for this listing
  const listingEvents = events.filter(e => e.listingId === listingId);
  
  // Count events in last 7 days
  const recentEvents = listingEvents.filter(e => new Date(e.timestamp) > sevenDaysAgo);
  
  const viewsLast7Days = recentEvents.filter(e => e.type === 'VIEW').length;
  const bookingsLast7Days = recentEvents.filter(e => e.type === 'BOOKING').length;
  
  // Total favorites (favorites - unfavorites)
  const favorites = listingEvents.filter(e => e.type === 'FAVORITE').length;
  const unfavorites = listingEvents.filter(e => e.type === 'UNFAVORITE').length;
  const netFavorites = Math.max(0, favorites - unfavorites);
  
  // Calculate base score
  let score = 0;
  score += bookingsLast7Days * 10;    // Bookings are most valuable
  score += viewsLast7Days * 0.1;      // Views have smaller weight
  score += netFavorites * 2;          // Favorites show interest
  
  // Add review bonus if listing data available
  if (listing?.rating && listing?.reviewCount) {
    score += listing.rating * listing.reviewCount * 0.5;
  }
  
  // New listing boost (if created in last 14 days)
  // We'd need createdAt on listing - for now skip this
  
  // Conversion rate bonus
  const totalViews = listingEvents.filter(e => e.type === 'VIEW').length;
  const totalBookings = listingEvents.filter(e => e.type === 'BOOKING').length;
  if (totalViews > 10) {
    const conversionRate = totalBookings / totalViews;
    score += conversionRate * 50; // High conversion = popular listing
  }
  
  return Math.round(score * 100) / 100;
};

/**
 * Update analytics for a single listing
 */
export const updateListingAnalytics = (listingId: string, listing?: Listing): ListingAnalytics => {
  const events = getAnalyticsEvents();
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const listingEvents = events.filter(e => e.listingId === listingId);
  const recentEvents = listingEvents.filter(e => new Date(e.timestamp) > sevenDaysAgo);
  
  const viewCount = listingEvents.filter(e => e.type === 'VIEW').length;
  const bookingCount = listingEvents.filter(e => e.type === 'BOOKING').length;
  const favorites = listingEvents.filter(e => e.type === 'FAVORITE').length;
  const unfavorites = listingEvents.filter(e => e.type === 'UNFAVORITE').length;
  const favoriteCount = Math.max(0, favorites - unfavorites);
  
  const viewsLast7Days = recentEvents.filter(e => e.type === 'VIEW').length;
  const bookingsLast7Days = recentEvents.filter(e => e.type === 'BOOKING').length;
  
  const analytics: ListingAnalytics = {
    listingId,
    viewCount,
    bookingCount,
    favoriteCount,
    conversionRate: viewCount > 0 ? bookingCount / viewCount : 0,
    viewsLast7Days,
    bookingsLast7Days,
    trendingScore: calculateTrendingScore(listingId, listing),
    lastCalculated: now.toISOString(),
  };
  
  const all = getAllListingAnalytics();
  all[listingId] = analytics;
  saveListingAnalytics(all);
  
  return analytics;
};

/**
 * Recalculate analytics for all listings
 */
export const recalculateAllAnalytics = (listings: Listing[]): void => {
  const analytics: Record<string, ListingAnalytics> = {};
  
  listings.forEach(listing => {
    analytics[listing.id] = {
      listingId: listing.id,
      viewCount: 0,
      bookingCount: 0,
      favoriteCount: 0,
      conversionRate: 0,
      viewsLast7Days: 0,
      bookingsLast7Days: 0,
      trendingScore: calculateTrendingScore(listing.id, listing),
      lastCalculated: new Date().toISOString(),
    };
  });
  
  // Update with actual event data
  const events = getAnalyticsEvents();
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  events.forEach(event => {
    if (!analytics[event.listingId]) return;
    
    const isRecent = new Date(event.timestamp) > sevenDaysAgo;
    
    switch (event.type) {
      case 'VIEW':
        analytics[event.listingId].viewCount++;
        if (isRecent) analytics[event.listingId].viewsLast7Days++;
        break;
      case 'BOOKING':
        analytics[event.listingId].bookingCount++;
        if (isRecent) analytics[event.listingId].bookingsLast7Days++;
        break;
      case 'FAVORITE':
        analytics[event.listingId].favoriteCount++;
        break;
      case 'UNFAVORITE':
        analytics[event.listingId].favoriteCount = Math.max(0, analytics[event.listingId].favoriteCount - 1);
        break;
    }
  });
  
  // Recalculate trending scores and conversion rates
  Object.keys(analytics).forEach(listingId => {
    const a = analytics[listingId];
    a.conversionRate = a.viewCount > 0 ? a.bookingCount / a.viewCount : 0;
    a.trendingScore = calculateTrendingScore(listingId, listings.find(l => l.id === listingId));
  });
  
  saveListingAnalytics(analytics);
};

// ============================================================================
// TRENDING LISTINGS
// ============================================================================

/**
 * Get trending listings sorted by trending score
 */
export const getTrendingListings = (listings: Listing[], limit: number = 10): Listing[] => {
  const analytics = getAllListingAnalytics();
  
  // Create scores map (fallback to rating-based score if no analytics)
  const scores: Record<string, number> = {};
  
  listings.forEach(listing => {
    if (analytics[listing.id]) {
      scores[listing.id] = analytics[listing.id].trendingScore;
    } else {
      // Fallback score based on rating and reviews
      const rating = listing.rating || 0;
      const reviews = listing.reviewCount || 0;
      scores[listing.id] = rating * reviews * 0.5 + (listing.viewCount || 0) * 0.1;
    }
  });
  
  // Sort by score descending
  const sorted = [...listings].sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0));
  
  return sorted.slice(0, limit);
};

/**
 * Get most viewed listings
 */
export const getMostViewedListings = (listings: Listing[], limit: number = 10): Listing[] => {
  const analytics = getAllListingAnalytics();
  
  const sorted = [...listings].sort((a, b) => {
    const aViews = analytics[a.id]?.viewCount || a.viewCount || 0;
    const bViews = analytics[b.id]?.viewCount || b.viewCount || 0;
    return bViews - aViews;
  });
  
  return sorted.slice(0, limit);
};

/**
 * Get most booked listings
 */
export const getMostBookedListings = (listings: Listing[], limit: number = 10): Listing[] => {
  const analytics = getAllListingAnalytics();
  
  const sorted = [...listings].sort((a, b) => {
    const aBookings = analytics[a.id]?.bookingCount || a.bookingCount || 0;
    const bBookings = analytics[b.id]?.bookingCount || b.bookingCount || 0;
    return bBookings - aBookings;
  });
  
  return sorted.slice(0, limit);
};

/**
 * Get rising listings (highest score increase in last 7 days)
 */
export const getRisingListings = (listings: Listing[], limit: number = 10): Listing[] => {
  const analytics = getAllListingAnalytics();
  
  // Rising = high recent activity relative to total
  const risingScores: Record<string, number> = {};
  
  listings.forEach(listing => {
    const a = analytics[listing.id];
    if (a && a.viewCount > 0) {
      // Recent activity as percentage of total
      const recentActivityRatio = (a.viewsLast7Days + a.bookingsLast7Days * 10) / (a.viewCount + a.bookingCount * 10 || 1);
      risingScores[listing.id] = recentActivityRatio * a.trendingScore;
    } else {
      risingScores[listing.id] = 0;
    }
  });
  
  const sorted = [...listings].sort((a, b) => (risingScores[b.id] || 0) - (risingScores[a.id] || 0));
  
  return sorted.slice(0, limit);
};

// ============================================================================
// MOCK DATA GENERATION
// ============================================================================

/**
 * Generate mock analytics data for demo purposes
 * Instead of storing individual events (which exceeds localStorage quota),
 * we directly generate aggregated analytics data
 */
export const generateMockAnalytics = (listings: Listing[]): void => {
  const now = new Date();
  const analytics: Record<string, ListingAnalytics> = {};
  
  listings.forEach(listing => {
    // Generate random popularity metrics
    const popularity = Math.random(); // 0-1 popularity factor
    
    // Generate realistic counts (stored as aggregates, not individual events)
    const totalViews = Math.floor(popularity * 500 + 10); // 10-510 total views
    const last7DaysViews = Math.floor(totalViews * 0.3 + Math.random() * 20); // ~30% in last 7 days
    const last30DaysViews = Math.floor(totalViews * 0.7 + Math.random() * 50);
    
    const totalBookings = Math.floor(popularity * totalViews * 0.05); // 0-5% conversion
    const last7DaysBookings = Math.floor(totalBookings * 0.25 + Math.random() * 2);
    const last30DaysBookings = Math.floor(totalBookings * 0.6 + Math.random() * 3);
    
    const favoritesCount = Math.floor(popularity * 30); // 0-30 favorites
    
    // Use listing's existing rating or generate one
    const rating = listing.rating || 3.5 + Math.random() * 1.5; // 3.5-5.0
    const reviewCount = listing.reviewCount || Math.floor(popularity * 50);
    
    // Calculate trending score using our formula
    const conversionRate = last7DaysViews > 0 ? last7DaysBookings / last7DaysViews : 0;
    const trendingScore = 
      (last7DaysBookings * 10) + 
      (last7DaysViews * 0.1) + 
      (favoritesCount * 2) + 
      (rating * reviewCount * 0.5) + 
      (conversionRate * 50);
    
    analytics[listing.id] = {
      listingId: listing.id,
      totalViews,
      viewsLast7Days: last7DaysViews,
      viewsLast30Days: last30DaysViews,
      totalBookings,
      bookingsLast7Days: last7DaysBookings,
      bookingsLast30Days: last30DaysBookings,
      favoritesCount,
      conversionRate,
      averageViewDuration: 30 + Math.random() * 90, // 30-120 seconds
      lastUpdated: now.toISOString(),
      trendingScore,
    };
  });
  
  // Save aggregated analytics directly (much smaller than individual events)
  localStorage.setItem(STORAGE_KEYS.LISTING_ANALYTICS, JSON.stringify(analytics));
  
  // Clear any old events to free up space
  localStorage.removeItem(STORAGE_KEYS.ANALYTICS_EVENTS);
  
  console.log(`✅ Generated mock analytics for ${listings.length} listings`);
};

/**
 * Clear all analytics data
 */
export const clearAnalytics = (): void => {
  localStorage.removeItem(STORAGE_KEYS.ANALYTICS_EVENTS);
  localStorage.removeItem(STORAGE_KEYS.LISTING_ANALYTICS);
  console.log('🗑️ Cleared all analytics data');
};

// Expose to window for easy console access
if (typeof window !== 'undefined') {
  (window as any).generateMockAnalytics = generateMockAnalytics;
  (window as any).clearAnalytics = clearAnalytics;
  (window as any).getTrendingListings = getTrendingListings;
  (window as any).getListingAnalytics = getListingAnalytics;
}
