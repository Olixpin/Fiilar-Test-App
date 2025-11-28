import { Listing, Review, BookingType, Role } from '@fiilar/types';
import { safeJSONParse } from '@fiilar/utils';
import { STORAGE_KEYS } from '../constants';
import { authorizeListingModification, getAuthenticatedUser } from '../security/authorization';
import { logAuditEvent } from '../security/authSecurity';

/**
 * Get all listings with aggregated review data
 */
export const getListings = (): Listing[] => {
    const l = localStorage.getItem(STORAGE_KEYS.LISTINGS);
    const listings: Listing[] = safeJSONParse(l, []);

    const r = localStorage.getItem(STORAGE_KEYS.REVIEWS);
    const allReviews: Review[] = safeJSONParse(r, []);

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

        return listingWithDefaults;
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
 * Get raw listings from localStorage without transformations
 * Used internally for save operations to avoid baking in defaults
 */
const getRawListings = (): Listing[] => {
    const l = localStorage.getItem(STORAGE_KEYS.LISTINGS);
    return safeJSONParse(l, []);
};

/**
 * Save a listing (create or update)
 * SECURITY: For updates, validates that the current user owns the listing or is an admin
 * For new listings, validates that user is a host
 */
export const saveListing = (listing: Listing): { success: boolean; error?: string } => {
    // Use raw listings to avoid baking in transformed defaults
    const rawListings = getRawListings();
    const idx = rawListings.findIndex(l => l.id === listing.id);
    const isUpdate = idx >= 0;
    
    console.log('💾 saveListing called:', {
        listingId: listing.id,
        isUpdate,
        imageCount: listing.images?.length || 0,
        title: listing.title
    });

    if (isUpdate) {
        // SECURITY CHECK: Verify user is authorized to modify this listing
        const authCheck = authorizeListingModification(listing.id);
        if (!authCheck.authorized) {
            console.error('🚨 SECURITY: Unauthorized listing modification attempt', {
                listingId: listing.id,
                error: authCheck.error
            });
            return { success: false, error: authCheck.error };
        }
        rawListings[idx] = listing;
    } else {
        // For new listings, verify user is a host or admin
        const currentUser = getAuthenticatedUser();
        if (!currentUser) {
            logAuditEvent({
                action: 'SECURITY_VIOLATION',
                success: false,
                metadata: { type: 'UNAUTHENTICATED_LISTING_CREATE' }
            });
            return { success: false, error: 'Not authenticated' };
        }

        if (currentUser.role !== Role.HOST && currentUser.role !== Role.ADMIN) {
            logAuditEvent({
                action: 'SECURITY_VIOLATION',
                userId: currentUser.id,
                success: false,
                metadata: {
                    type: 'UNAUTHORIZED_LISTING_CREATE',
                    role: currentUser.role
                }
            });
            return { success: false, error: 'Only hosts can create listings' };
        }

        // Ensure the listing hostId matches the current user (except for admins)
        if (currentUser.role !== Role.ADMIN && listing.hostId !== currentUser.id) {
            logAuditEvent({
                action: 'SECURITY_VIOLATION',
                userId: currentUser.id,
                success: false,
                metadata: {
                    type: 'LISTING_HOST_MISMATCH',
                    listingHostId: listing.hostId,
                    currentUserId: currentUser.id
                }
            });
            return { success: false, error: 'Cannot create listing for another user' };
        }

        rawListings.push(listing);
    }

    try {
        localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(rawListings));
        console.log('✅ Listing saved to localStorage successfully:', listing.id);
        
        // Verify the save worked by reading it back
        const verifyListings = getRawListings();
        const savedListing = verifyListings.find(l => l.id === listing.id);
        if (savedListing) {
            console.log('✅ Verified listing in localStorage:', {
                id: savedListing.id,
                title: savedListing.title,
                imageCount: savedListing.images?.length || 0,
                firstImage: savedListing.images?.[0]?.substring(0, 50) + '...'
            });
        } else {
            console.error('❌ Listing not found in localStorage after save!');
        }
        
        return { success: true };
    } catch (error) {
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
            console.error('🚨 Storage quota exceeded when saving listing');
            // Try to clean up and retry
            cleanupStorageSpace();
            try {
                localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(rawListings));
                return { success: true };
            } catch {
                return { success: false, error: 'Storage quota exceeded. Please clear some browser data or remove old listings.' };
            }
        }
        console.error('Failed to save listing:', error);
        return { success: false, error: 'Failed to save listing' };
    }
};

/**
 * Clean up storage space by removing old drafts and analytics data
 */
const cleanupStorageSpace = () => {
    // Remove old listing drafts
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('listing_draft_') || key.startsWith('fiilar_analytics'))) {
            keysToRemove.push(key);
        }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    console.log(`Cleaned up ${keysToRemove.length} items to free storage space`);
};

/**
 * Delete a listing by ID
 * SECURITY: Validates that the current user owns the listing or is an admin
 */
export const deleteListing = (id: string): { success: boolean; error?: string } => {
    // SECURITY CHECK: Verify user is authorized to delete this listing
    const authCheck = authorizeListingModification(id);
    if (!authCheck.authorized) {
        console.error('🚨 SECURITY: Unauthorized listing deletion attempt', {
            listingId: id,
            error: authCheck.error
        });
        return { success: false, error: authCheck.error };
    }

    const listings = getListings();
    const updatedListings = listings.filter(l => l.id !== id);

    try {
        localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(updatedListings));
        return { success: true };
    } catch (error) {
        console.error('Failed to delete listing:', error);
        return { success: false, error: 'Failed to delete listing' };
    }
};
