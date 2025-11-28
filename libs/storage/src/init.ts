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

    // Always update mock listings to ensure latest data/images
    // This merges the fresh MOCK_LISTINGS into the stored listings
    MOCK_LISTINGS.forEach((mockListing: Listing) => {
        const index = storedListings.findIndex(l => l.id === mockListing.id);
        if (index >= 0) {
            storedListings[index] = mockListing;
        } else {
            storedListings.push(mockListing);
        }
    });

    // Add bulk generated listings for testing infinite scroll
    if (ENABLE_BULK_LISTINGS) {
        const hasGeneratedListings = storedListings.some(l => l.id.startsWith('generated-'));
        if (!hasGeneratedListings) {
            console.log(`[initStorage] Generating ${BULK_LISTING_COUNT} mock listings for infinite scroll testing...`);
            const generatedListings = generateMockListings(BULK_LISTING_COUNT);
            storedListings = [...storedListings, ...generatedListings];

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

    localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(storedListings));

    // Initialize Users DB if empty
    if (!localStorage.getItem(STORAGE_KEYS.USERS_DB)) {
        localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify([]));
    }
};
