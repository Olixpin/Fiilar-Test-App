import { Listing, Review } from '@fiilar/types';
import { STORAGE_KEYS } from '../constants';

/**
 * Get all listings with aggregated review data
 */
export const getListings = (): Listing[] => {
    const l = localStorage.getItem(STORAGE_KEYS.LISTINGS);
    const listings: Listing[] = l ? JSON.parse(l) : [];

    const r = localStorage.getItem(STORAGE_KEYS.REVIEWS);
    const allReviews: Review[] = r ? JSON.parse(r) : [];

    return listings.map(listing => {
        const listingReviews = allReviews.filter(review => review.listingId === listing.id);
        const reviewCount = listingReviews.length;

        if (reviewCount > 0) {
            const rating = Math.round((listingReviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount) * 10) / 10;
            return {
                ...listing,
                rating,
                reviewCount
            };
        }

        return listing;
    });
};

/**
 * Get a listing by ID
 */
export const getListingById = (id: string): Listing | undefined => {
    const listings = getListings();
    return listings.find(l => l.id === id);
};

/**
 * Save a listing (create or update)
 */
export const saveListing = (listing: Listing) => {
    const listings = getListings();
    const idx = listings.findIndex(l => l.id === listing.id);
    if (idx >= 0) {
        listings[idx] = listing;
    } else {
        listings.push(listing);
    }
    localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(listings));
};

/**
 * Delete a listing by ID
 */
export const deleteListing = (id: string) => {
    const listings = getListings();
    const updatedListings = listings.filter(l => l.id !== id);
    localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(updatedListings));
};
