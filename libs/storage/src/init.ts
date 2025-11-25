import { Listing } from '@fiilar/types';
import { STORAGE_KEYS, MOCK_LISTINGS } from './constants';

/**
 * Initialize storage with mock data
 */
export const initStorage = () => {
    const storedListingsStr = localStorage.getItem(STORAGE_KEYS.LISTINGS);
    let storedListings: Listing[] = storedListingsStr ? JSON.parse(storedListingsStr) : [];

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

    localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(storedListings));

    // Initialize Users DB if empty
    if (!localStorage.getItem(STORAGE_KEYS.USERS_DB)) {
        localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify([]));
    }
};
