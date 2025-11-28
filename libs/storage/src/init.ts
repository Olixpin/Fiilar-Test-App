import { Listing, Review } from '@fiilar/types';
import { STORAGE_KEYS, MOCK_LISTINGS } from './constants';
import { generateMockListings, generateMockReviews } from './utils/mockListingGenerator';

// Set to true to generate 200+ listings for infinite scroll testing
const ENABLE_BULK_LISTINGS = true;
const BULK_LISTING_COUNT = 200;

/**
 * Initialize storage with mock data
 */
export const initStorage = () => {
    const storedListingsStr = localStorage.getItem(STORAGE_KEYS.LISTINGS);
    let storedListings: Listing[] = [];
    try {
        storedListings = storedListingsStr ? JSON.parse(storedListingsStr) : [];
    } catch (error) {
        console.error('Failed to parse stored listings, resetting:', error);
        storedListings = [];
    }

    // Debug: Log what we have BEFORE any modifications
    const userListings = storedListings.filter(l => !l.id.startsWith('mock-') && !l.id.startsWith('generated-'));
    console.log('[initStorage] Before modifications:', {
        totalListings: storedListings.length,
        userCreatedListings: userListings.map(l => ({
            id: l.id,
            title: l.title,
            imageCount: l.images?.length || 0,
            firstImage: l.images?.[0]?.substring(0, 80)
        }))
    });

    // Only add mock listings if they don't already exist
    // DO NOT overwrite existing listings - user may have edited them!
    let listingsAdded = false;
    MOCK_LISTINGS.forEach((mockListing: Listing) => {
        const exists = storedListings.some(l => l.id === mockListing.id);
        if (!exists) {
            storedListings.push(mockListing);
            listingsAdded = true;
        }
    });

    // Add bulk generated listings for testing infinite scroll
    let generatedAdded = false;
    if (ENABLE_BULK_LISTINGS) {
        const hasGeneratedListings = storedListings.some(l => l.id.startsWith('generated-'));
        if (!hasGeneratedListings) {
            console.log(`[initStorage] Generating ${BULK_LISTING_COUNT} mock listings for infinite scroll testing...`);
            const generatedListings = generateMockListings(BULK_LISTING_COUNT);
            storedListings = [...storedListings, ...generatedListings];
            generatedAdded = true;

            // Generate reviews for the new listings
            const generatedReviews = generateMockReviews(generatedListings);

            // Get existing reviews
            const storedReviewsStr = localStorage.getItem(STORAGE_KEYS.REVIEWS);
            let storedReviews: Review[] = [];
            try {
                storedReviews = storedReviewsStr ? JSON.parse(storedReviewsStr) : [];
            } catch (error) {
                console.error('Failed to parse stored reviews, resetting:', error);
                storedReviews = [];
            }

            // Add new reviews
            storedReviews = [...storedReviews, ...generatedReviews];
            localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(storedReviews));

            console.log(`[initStorage] Total listings: ${storedListings.length}, Total reviews: ${storedReviews.length}`);
        }
    }

    // Only write back if we actually added something
    if (listingsAdded || generatedAdded) {
        console.log('[initStorage] Writing back to localStorage (added mock/generated listings)');
        localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(storedListings));
    } else {
        console.log('[initStorage] No changes made, skipping localStorage write');
    }

    // Initialize Users DB if empty
    if (!localStorage.getItem(STORAGE_KEYS.USERS_DB)) {
        localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify([]));
    }
};
