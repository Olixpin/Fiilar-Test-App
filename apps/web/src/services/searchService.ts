// Search and Filter Utility Functions
// Handles filtering logic for listings based on search criteria

import { Listing, SpaceType, BookingType } from '@fiilar/types';
import { SearchFilters } from '../features/Listings/components/AdvancedSearch';

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
        if (filters.priceMin !== undefined && listing.price < filters.priceMin) {
            return false;
        }
        if (filters.priceMax !== undefined && listing.price > filters.priceMax) {
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
    _location1: string,
    _location2: string
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

/**
 * Parse natural language query into structured filters
 * e.g. "studio in Lagos under $100 for 5 people"
 */
export const parseNaturalLanguageQuery = (query: string): Partial<SearchFilters> => {
    const filters: Partial<SearchFilters> = {};
    const lowerQuery = query.toLowerCase();
    console.log('Parsing query:', query);

    // 1. Parse Space Type
    if (lowerQuery.includes('apartment') || lowerQuery.includes('flat')) filters.spaceType = SpaceType.APARTMENT;
    else if (lowerQuery.includes('studio')) filters.spaceType = SpaceType.STUDIO;
    else if (lowerQuery.includes('conference') || lowerQuery.includes('meeting')) filters.spaceType = SpaceType.CONFERENCE;
    else if (lowerQuery.includes('event') || lowerQuery.includes('party') || lowerQuery.includes('hall')) filters.spaceType = SpaceType.EVENT_CENTER;
    else if (lowerQuery.includes('co-working') || lowerQuery.includes('office') || lowerQuery.includes('desk')) filters.spaceType = SpaceType.CO_WORKING;
    else if (lowerQuery.includes('open space') || lowerQuery.includes('garden') || lowerQuery.includes('outdoor')) filters.spaceType = SpaceType.OPEN_SPACE;

    // 2. Parse Price
    // "under $100", "less than 100", "cheap" (<50), "luxury" (>200), "$100", "100 dollars", "budget 500"

    // Check for explicit "under/below/budget" patterns first
    const maxPriceMatch = lowerQuery.match(/(?:under|less than|below|budget|max)\s*:?\s*(?:[\$\₦\£\€]|currency)?\s*(\d+)/);
    if (maxPriceMatch) {
        filters.priceMax = parseInt(maxPriceMatch[1]);
    } else {
        // Fallback: check for just "$100" or "100 dollars" and assume it's a max price preference
        // unless it's clearly a "min" (which we'll handle separately if needed)
        const simplePriceMatch = lowerQuery.match(/(?:[\$\₦\£\€])(\d+)|(\d+)\s*(?:dollars|usd|naira)/);
        if (simplePriceMatch) {
            filters.priceMax = parseInt(simplePriceMatch[1] || simplePriceMatch[2]);
        }
    }

    if (lowerQuery.includes('cheap') || lowerQuery.includes('budget') || lowerQuery.includes('affordable')) {
        filters.priceMax = 50; // Arbitrary "cheap" threshold
    }

    if (lowerQuery.includes('luxury') || lowerQuery.includes('expensive') || lowerQuery.includes('premium')) {
        filters.priceMin = 200; // Arbitrary "luxury" threshold
    }

    // 3. Parse Guests & Size
    // "5 people", "for 10", "2 guests"
    const guestMatch = lowerQuery.match(/(?:for|with)\s*(\d+)|(\d+)\s*(?:people|guests|persons)/);
    if (guestMatch) {
        const count = parseInt(guestMatch[1] || guestMatch[2]);
        if (!isNaN(count)) filters.guestCount = count;
    }

    // Size keywords
    if (lowerQuery.includes('large') || lowerQuery.includes('huge') || lowerQuery.includes('big')) {
        filters.guestCount = Math.max(filters.guestCount || 0, 20);
    } else if (lowerQuery.includes('small') || lowerQuery.includes('tiny') || lowerQuery.includes('cozy')) {
        filters.guestCount = Math.max(filters.guestCount || 0, 2); // Ensure at least 2 for small
    }

    // 4. Parse Location
    // "in Lagos", "at Ikeja"
    const locationMatch = lowerQuery.match(/(?:in|at|near)\s+([a-zA-Z\s]+?)(?:\s+(?:under|for|with|below|less|next|tomorrow|$)|$)/);
    if (locationMatch) {
        const location = locationMatch[1].trim();
        if (!['the', 'a', 'an'].includes(location)) {
            filters.location = location;
        }
    }

    // 5. Parse Duration / Booking Type
    if (lowerQuery.includes('daily') || lowerQuery.includes('day') || lowerQuery.includes('night') || lowerQuery.includes('week')) {
        filters.bookingType = BookingType.DAILY;
    } else if (lowerQuery.includes('hourly') || lowerQuery.includes('hour')) {
        filters.bookingType = BookingType.HOURLY;
    }

    // 6. Parse Dates (Simple)
    const today = new Date();
    if (lowerQuery.includes('tomorrow')) {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        filters.dateFrom = tomorrow.toISOString().split('T')[0];
        filters.dateTo = tomorrow.toISOString().split('T')[0];
    } else if (lowerQuery.includes('next week')) {
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        filters.dateFrom = nextWeek.toISOString().split('T')[0];
        const endNextWeek = new Date(nextWeek);
        endNextWeek.setDate(endNextWeek.getDate() + 1); // Default 1 day
        filters.dateTo = endNextWeek.toISOString().split('T')[0];
    }

    console.log('Parsed filters:', filters);
    return filters;
};
