import { Listing, SpaceType, BookingType } from '@fiilar/types';

// We need to define SearchFilters interface here or import it if it was in a component
// The original file imported it from '../features/Listings/components/AdvancedSearch'
// Since we are moving this to a lib, we should probably define it here or in @fiilar/types
// For now, I will define it here to avoid circular dependencies with the app

export interface SearchFilters {
    searchTerm: string;
    location: string;
    priceMin?: number;
    priceMax?: number;
    spaceType: SpaceType | 'all';
    bookingType: BookingType | 'all';
    guestCount: number;
    dateFrom: string;
    dateTo: string;
}

/**
 * Filter listings based on search criteria
 */
export const filterListings = (
    listings: Listing[],
    filters: SearchFilters
): Listing[] => {
    return listings.filter(listing => {
        // Search term (title, description, tags, location)
        // Matches if ANY word in the search term is found in any field
        if (filters.searchTerm) {
            const searchTerms = filters.searchTerm.toLowerCase().split(/\s+/).filter(t => t.length >= 2);
            
            if (searchTerms.length > 0) {
                const searchableText = [
                    listing.title,
                    listing.description,
                    listing.location,
                    listing.address || '',
                    ...(listing.tags || []),
                    listing.type || ''
                ].join(' ').toLowerCase();
                
                // Match if ANY search term is found (OR logic for flexibility)
                const matchesSearch = searchTerms.some(term => searchableText.includes(term));
                if (!matchesSearch) return false;
            }
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
 * Parse natural language query into structured filters
 * e.g. "studio in Lagos under $100 for 5 people"
 * 
 * This function extracts structured filters AND keeps remaining words as searchTerm
 * for flexible text-based matching. This makes search more intuitive - users don't
 * need to use exact keywords.
 */
export const parseNaturalLanguageQuery = (query: string): Partial<SearchFilters> => {
    const filters: Partial<SearchFilters> = {};
    const lowerQuery = query.toLowerCase();
    let remainingQuery = query; // Track what's left after extracting structured filters
    
    console.log('Parsing query:', query);

    // Helper to remove matched text from remainingQuery
    const removeFromRemaining = (pattern: RegExp | string) => {
        if (typeof pattern === 'string') {
            remainingQuery = remainingQuery.replace(new RegExp(pattern, 'gi'), ' ');
        } else {
            remainingQuery = remainingQuery.replace(pattern, ' ');
        }
    };

    // 1. Parse Space Type
    const spaceTypePatterns: [RegExp, SpaceType][] = [
        [/\b(apartment|flat)\b/i, SpaceType.APARTMENT],
        [/\bstudio\b/i, SpaceType.STUDIO],
        [/\b(conference|meeting\s*room)\b/i, SpaceType.CONFERENCE],
        [/\b(event\s*center|event\s*space|party\s*hall|hall|venue)\b/i, SpaceType.EVENT_CENTER],
        [/\b(co-?working|coworking|office|desk|workspace)\b/i, SpaceType.CO_WORKING],
        [/\b(open\s*space|garden|outdoor|rooftop)\b/i, SpaceType.OPEN_SPACE],
    ];

    for (const [pattern, spaceType] of spaceTypePatterns) {
        if (pattern.test(lowerQuery)) {
            filters.spaceType = spaceType;
            removeFromRemaining(pattern);
            break;
        }
    }

    // 2. Parse Price
    // "under $100", "less than 100", "cheap" (<50), "luxury" (>200), "$100", "100 dollars", "budget 500"

    // Check for explicit "under/below/budget" patterns first
    const maxPricePattern = /(?:under|less than|below|budget|max)\s*:?\s*(?:[\$\₦\£\€]|currency)?\s*(\d+)/i;
    const maxPriceMatch = lowerQuery.match(maxPricePattern);
    if (maxPriceMatch) {
        filters.priceMax = parseInt(maxPriceMatch[1]);
        removeFromRemaining(maxPricePattern);
    } else {
        // Fallback: check for just "$100" or "100 dollars" and assume it's a max price preference
        const simplePricePattern = /(?:[\$\₦\£\€])(\d+)|(\d+)\s*(?:dollars|usd|naira)/i;
        const simplePriceMatch = lowerQuery.match(simplePricePattern);
        if (simplePriceMatch) {
            filters.priceMax = parseInt(simplePriceMatch[1] || simplePriceMatch[2]);
            removeFromRemaining(simplePricePattern);
        }
    }

    if (lowerQuery.includes('cheap') || lowerQuery.includes('affordable')) {
        filters.priceMax = 50;
        removeFromRemaining(/\b(cheap|affordable)\b/i);
    }

    if (lowerQuery.includes('luxury') || lowerQuery.includes('expensive') || lowerQuery.includes('premium')) {
        filters.priceMin = 200;
        removeFromRemaining(/\b(luxury|expensive|premium)\b/i);
    }

    // 3. Parse Guests & Size
    // "5 people", "for 10", "2 guests", "for 20 people"
    const guestPattern = /(?:for|with)\s*(\d+)(?:\s*(?:people|guests|persons))?|(\d+)\s*(?:people|guests|persons)/i;
    const guestMatch = lowerQuery.match(guestPattern);
    if (guestMatch) {
        const count = parseInt(guestMatch[1] || guestMatch[2]);
        if (!isNaN(count) && count > 0) {
            filters.guestCount = count;
            removeFromRemaining(guestPattern);
        }
    }

    // Size keywords
    if (lowerQuery.includes('large') || lowerQuery.includes('huge') || lowerQuery.includes('big') || lowerQuery.includes('spacious')) {
        filters.guestCount = Math.max(filters.guestCount || 0, 20);
        removeFromRemaining(/\b(large|huge|big|spacious)\b/i);
    } else if (lowerQuery.includes('small') || lowerQuery.includes('tiny') || lowerQuery.includes('cozy') || lowerQuery.includes('intimate')) {
        filters.guestCount = Math.max(filters.guestCount || 0, 2);
        removeFromRemaining(/\b(small|tiny|cozy|intimate)\b/i);
    }

    // 4. Parse Location
    // "in Lagos", "at Ikeja", "near Lekki", "Lagos for 20 people"
    // First try with preposition pattern: "in Lagos", "at Ikeja"
    const locationWithPrepPattern = /\b(?:in|at|near)\s+([a-zA-Z][a-zA-Z\-]{1,20})(?:\s|,|$)/i;
    const locationWithPrepMatch = lowerQuery.match(locationWithPrepPattern);
    if (locationWithPrepMatch) {
        const location = locationWithPrepMatch[1].trim();
        // Filter out common words that aren't locations
        const stopWords = ['the', 'a', 'an', 'for', 'with', 'people', 'guests', 'persons', 'under', 'below', 'budget'];
        if (!stopWords.includes(location.toLowerCase()) && location.length > 1) {
            filters.location = location;
            removeFromRemaining(new RegExp(`\\b(?:in|at|near)\\s+${location.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i'));
        }
    }

    // 5. Parse Duration / Booking Type
    if (/\b(daily|per\s*day|night|nightly|week|weekly)\b/i.test(lowerQuery)) {
        filters.bookingType = BookingType.DAILY;
        removeFromRemaining(/\b(daily|per\s*day|night|nightly|week|weekly)\b/i);
    } else if (/\b(hourly|per\s*hour|hour)\b/i.test(lowerQuery)) {
        filters.bookingType = BookingType.HOURLY;
        removeFromRemaining(/\b(hourly|per\s*hour|hour)\b/i);
    }

    // 6. Parse Dates (Simple)
    const today = new Date();
    if (lowerQuery.includes('tomorrow')) {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        filters.dateFrom = tomorrow.toISOString().split('T')[0];
        filters.dateTo = tomorrow.toISOString().split('T')[0];
        removeFromRemaining(/\btomorrow\b/i);
    } else if (lowerQuery.includes('next week')) {
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        filters.dateFrom = nextWeek.toISOString().split('T')[0];
        const endNextWeek = new Date(nextWeek);
        endNextWeek.setDate(endNextWeek.getDate() + 1);
        filters.dateTo = endNextWeek.toISOString().split('T')[0];
        removeFromRemaining(/\bnext\s*week\b/i);
    } else if (lowerQuery.includes('today')) {
        filters.dateFrom = today.toISOString().split('T')[0];
        filters.dateTo = today.toISOString().split('T')[0];
        removeFromRemaining(/\btoday\b/i);
    } else if (lowerQuery.includes('this weekend')) {
        const dayOfWeek = today.getDay();
        const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7;
        const saturday = new Date(today);
        saturday.setDate(today.getDate() + daysUntilSaturday);
        const sunday = new Date(saturday);
        sunday.setDate(saturday.getDate() + 1);
        filters.dateFrom = saturday.toISOString().split('T')[0];
        filters.dateTo = sunday.toISOString().split('T')[0];
        removeFromRemaining(/\bthis\s*weekend\b/i);
    }

    // 7. Clean up remaining query and use as searchTerm for flexible matching
    // This allows users to search for anything not covered by structured filters
    remainingQuery = remainingQuery
        .replace(/\s+/g, ' ')  // Collapse multiple spaces
        .replace(/\b(for|with|in|at|near|and|or|the|a|an)\b/gi, ' ')  // Remove common stop words
        .trim();

    // If there's meaningful remaining text, use it as searchTerm for text-based matching
    // This enables searching by title, description, tags, etc.
    if (remainingQuery.length >= 2) {
        filters.searchTerm = remainingQuery;
    }

    console.log('Parsed filters:', filters);
    return filters;
};
