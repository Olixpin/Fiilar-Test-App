import { Listing, Review, BookingType } from '@fiilar/types';
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

        // Ensure default properties are present, especially for mock data or new listings
        const listingWithDefaults = {
            ...listing,
            priceUnit: listing.priceUnit || BookingType.HOURLY,
            location: listing.location || 'Lekki Phase 1, Lagos',
            address: listing.address || 'Plot 5, Admiralty Way, Lekki Phase 1, Lagos',
            coordinates: listing.coordinates || {
                lat: 6.4500,
                lng: 3.5000
            },
            images: listing.images && listing.images.length > 0 ? listing.images : [
                'https://via.placeholder.com/300x200?text=Listing+Image+1',
                'https://via.placeholder.com/300x200?text=Listing+Image+2'
            ]
        };

        if (reviewCount > 0) {
            const rating = Math.round((listingReviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount) * 10) / 10;
            return {
                ...listingWithDefaults,
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
