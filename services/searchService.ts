// Search and Filter Utility Functions
// Handles filtering logic for listings based on search criteria

import { Listing, SpaceType, BookingType } from '../types';
import { SearchFilters } from '../components/AdvancedSearch';

/**
 * Filter listings based on search criteria
 */
export const filterListings = (
    listings: Listing[],
    filters: SearchFilters
): Listing[] => {
    return listings.filter(listing => {
        // Search term (title, description, tags, location)
        if (filters.searchTerm) {
            const searchLower = filters.searchTerm.toLowerCase();
            const matchesSearch =
                listing.title.toLowerCase().includes(searchLower) ||
                listing.description.toLowerCase().includes(searchLower) ||
                listing.location.toLowerCase().includes(searchLower) ||
                listing.tags.some(tag => tag.toLowerCase().includes(searchLower));

            if (!matchesSearch) return false;
        }

        // Location filter
        if (filters.location) {
            const locationLower = filters.location.toLowerCase();
            if (!listing.location.toLowerCase().includes(locationLower)) {
                return false;
            }
        }

        // Price range filter
        if (listing.price < filters.priceMin || listing.price > filters.priceMax) {
            return false;
        }

        // Space type filter
        if (filters.spaceType !== 'all' && listing.type !== filters.spaceType) {
            return false;
        }

        // Booking type filter
        if (filters.bookingType !== 'all' && listing.priceUnit !== filters.bookingType) {
            return false;
        }

        // Guest count filter (capacity)
        if (filters.guestCount > 1) {
            if (!listing.capacity || listing.capacity < filters.guestCount) {
                return false;
            }
        }

        // Date availability filter
        if (filters.dateFrom && filters.dateTo) {
            // Check if listing has availability for the date range
            // This is a simplified check - in production you'd check actual bookings
            if (!listing.availability) {
                return false; // No availability data
            }

            // For now, just check if the listing has any availability defined
            // In production, you'd check against actual bookings
            const hasAvailability = Object.keys(listing.availability).length > 0;
            if (!hasAvailability) {
                return false;
            }
        }

        return true;
    });
};

/**
 * Sort listings by relevance, price, or rating
 */
export const sortListings = (
    listings: Listing[],
    sortBy: 'relevance' | 'price-low' | 'price-high' | 'rating'
): Listing[] => {
    const sorted = [...listings];

    switch (sortBy) {
        case 'price-low':
            return sorted.sort((a, b) => a.price - b.price);

        case 'price-high':
            return sorted.sort((a, b) => b.price - a.price);

        case 'rating':
            // Would need to fetch ratings - for now just return as is
            return sorted;

        case 'relevance':
        default:
            // Keep original order (most recent first)
            return sorted;
    }
};

/**
 * Calculate distance between two locations (simplified)
 * In production, use Google Maps Distance Matrix API or similar
 */
export const calculateDistance = (
    location1: string,
    location2: string
): number => {
    // This is a mock implementation
    // In production, you would use:
    // - Google Maps Distance Matrix API
    // - Mapbox Distance API
    // - Or calculate using lat/long coordinates

    // For now, return a random distance for demo purposes
    return Math.random() * 50; // 0-50 km
};

/**
 * Get location suggestions (autocomplete)
 * In production, integrate with Google Places API
 */
export const getLocationSuggestions = (query: string): string[] => {
    // Mock suggestions - in production use Google Places Autocomplete
    const commonLocations = [
        'Lagos, Nigeria',
        'Abuja, Nigeria',
        'Port Harcourt, Nigeria',
        'Ibadan, Nigeria',
        'Kano, Nigeria',
        'Lekki, Lagos',
        'Victoria Island, Lagos',
        'Ikeja, Lagos',
        'Wuse, Abuja',
        'Maitama, Abuja'
    ];

    if (!query) return [];

    return commonLocations.filter(loc =>
        loc.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);
};

/**
 * Check if listing is available for date range
 */
export const isAvailableForDates = (
    listing: Listing,
    dateFrom: string,
    dateTo: string,
    bookedDates: string[] = []
): boolean => {
    if (!listing.availability) return false;

    const start = new Date(dateFrom);
    const end = new Date(dateTo);

    // Check each date in the range
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];

        // Check if date is booked
        if (bookedDates.includes(dateStr)) {
            return false;
        }

        // Check if listing has availability for this date
        if (!listing.availability[dateStr] || listing.availability[dateStr].length === 0) {
            return false;
        }
    }

    return true;
};
