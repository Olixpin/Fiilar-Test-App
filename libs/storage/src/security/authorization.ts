/**
 * Authorization Security Utilities
 * 
 * CRITICAL: These functions validate that operations are performed by authorized users.
 * They should be called BEFORE any data modification operation.
 * 
 * In production, these checks would be enforced server-side.
 * For this demo with localStorage, we enforce them client-side as a security layer.
 */

import { Role, Booking, Listing, User } from '@fiilar/types';
import { STORAGE_KEYS } from '../constants';
import { logAuditEvent } from './authSecurity';

export interface AuthorizationResult {
    authorized: boolean;
    error?: string;
    userId?: string;
    userRole?: Role;
}

// Internal helpers to avoid circular imports
const _getCurrentUser = (): User | null => {
    try {
        const u = localStorage.getItem(STORAGE_KEYS.USER);
        return u ? JSON.parse(u) : null;
    } catch (e) {
        console.error('Failed to parse current user from localStorage:', e);
        return null;
    }
};

const _getBookings = (): Booking[] => {
    try {
        const b = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
        return b ? JSON.parse(b) : [];
    } catch (e) {
        console.error('Failed to parse bookings from localStorage:', e);
        return [];
    }
};

const _getListings = (): Listing[] => {
    try {
        const l = localStorage.getItem(STORAGE_KEYS.LISTINGS);
        return l ? JSON.parse(l) : [];
    } catch (e) {
        console.error('Failed to parse listings from localStorage:', e);
        return [];
    };
};

/**
 * Get the current authenticated user and their role
 * Returns null if not authenticated
 */
export const getAuthenticatedUser = (): { id: string; role: Role } | null => {
    const user = _getCurrentUser();
    if (!user) return null;
    return { id: user.id, role: user.role };
};

/**
 * Check if current user is authenticated
 */
export const isAuthenticated = (): boolean => {
    return _getCurrentUser() !== null;
};

/**
 * Check if current user has admin role
 */
export const isAdmin = (): boolean => {
    const user = _getCurrentUser();
    return user?.role === Role.ADMIN;
};

/**
 * Check if current user has host role
 */
export const isHost = (): boolean => {
    const user = _getCurrentUser();
    return user?.role === Role.HOST;
};

/**
 * Authorize a booking modification (update/delete)
 * Only the guest who created the booking, the host of the listing, or an admin can modify it
 */
export const authorizeBookingModification = (bookingId: string): AuthorizationResult => {
    const currentUser = _getCurrentUser();
    
    if (!currentUser) {
        logAuditEvent({
            action: 'SECURITY_VIOLATION',
            success: false,
            metadata: { 
                type: 'UNAUTHORIZED_BOOKING_MODIFICATION',
                bookingId,
                reason: 'Not authenticated'
            }
        });
        return { authorized: false, error: 'Not authenticated' };
    }

    // Admins can modify any booking
    if (currentUser.role === Role.ADMIN) {
        return { authorized: true, userId: currentUser.id, userRole: currentUser.role };
    }

    const bookings = _getBookings();
    const booking = bookings.find(b => b.id === bookingId);
    
    if (!booking) {
        return { authorized: false, error: 'Booking not found' };
    }

    // Guest who created the booking can modify it
    if (booking.userId === currentUser.id) {
        return { authorized: true, userId: currentUser.id, userRole: currentUser.role };
    }

    // Host of the listing can modify bookings for their listing
    const listings = _getListings();
    const listing = listings.find(l => l.id === booking.listingId);
    
    if (listing && listing.hostId === currentUser.id) {
        return { authorized: true, userId: currentUser.id, userRole: currentUser.role };
    }

    logAuditEvent({
        action: 'SECURITY_VIOLATION',
        userId: currentUser.id,
        success: false,
        metadata: { 
            type: 'UNAUTHORIZED_BOOKING_MODIFICATION',
            bookingId,
            attemptedBy: currentUser.id,
            bookingOwner: booking.userId
        }
    });

    return { 
        authorized: false, 
        error: 'You do not have permission to modify this booking',
        userId: currentUser.id,
        userRole: currentUser.role
    };
};

/**
 * Authorize a listing modification (update/delete)
 * Only the host who created the listing or an admin can modify it
 */
export const authorizeListingModification = (listingId: string): AuthorizationResult => {
    const currentUser = _getCurrentUser();
    
    if (!currentUser) {
        logAuditEvent({
            action: 'SECURITY_VIOLATION',
            success: false,
            metadata: { 
                type: 'UNAUTHORIZED_LISTING_MODIFICATION',
                listingId,
                reason: 'Not authenticated'
            }
        });
        return { authorized: false, error: 'Not authenticated' };
    }

    // Admins can modify any listing
    if (currentUser.role === Role.ADMIN) {
        return { authorized: true, userId: currentUser.id, userRole: currentUser.role };
    }

    // Hosts can only modify their own listings
    if (currentUser.role !== Role.HOST) {
        logAuditEvent({
            action: 'SECURITY_VIOLATION',
            userId: currentUser.id,
            success: false,
            metadata: { 
                type: 'UNAUTHORIZED_LISTING_MODIFICATION',
                listingId,
                reason: 'User is not a host'
            }
        });
        return { authorized: false, error: 'Only hosts can modify listings' };
    }

    const listings = _getListings();
    const listing = listings.find(l => l.id === listingId);
    
    if (!listing) {
        return { authorized: false, error: 'Listing not found' };
    }

    if (listing.hostId !== currentUser.id) {
        logAuditEvent({
            action: 'SECURITY_VIOLATION',
            userId: currentUser.id,
            success: false,
            metadata: { 
                type: 'UNAUTHORIZED_LISTING_MODIFICATION',
                listingId,
                attemptedBy: currentUser.id,
                listingOwner: listing.hostId
            }
        });
        return { 
            authorized: false, 
            error: 'You do not have permission to modify this listing' 
        };
    }

    return { authorized: true, userId: currentUser.id, userRole: currentUser.role };
};

/**
 * Authorize a user profile modification
 * Users can only modify their own profile, admins can modify any profile
 */
export const authorizeUserModification = (targetUserId: string): AuthorizationResult => {
    const currentUser = _getCurrentUser();
    
    if (!currentUser) {
        logAuditEvent({
            action: 'SECURITY_VIOLATION',
            success: false,
            metadata: { 
                type: 'UNAUTHORIZED_USER_MODIFICATION',
                targetUserId,
                reason: 'Not authenticated'
            }
        });
        return { authorized: false, error: 'Not authenticated' };
    }

    // Users can modify their own profile
    if (currentUser.id === targetUserId) {
        return { authorized: true, userId: currentUser.id, userRole: currentUser.role };
    }

    // Admins can modify any user profile
    if (currentUser.role === Role.ADMIN) {
        return { authorized: true, userId: currentUser.id, userRole: currentUser.role };
    }

    logAuditEvent({
        action: 'SECURITY_VIOLATION',
        userId: currentUser.id,
        success: false,
        metadata: { 
            type: 'UNAUTHORIZED_USER_MODIFICATION',
            targetUserId,
            attemptedBy: currentUser.id
        }
    });

    return { 
        authorized: false, 
        error: 'You do not have permission to modify this user' 
    };
};

/**
 * Authorize admin operations
 * Only users with ADMIN role can perform admin operations
 */
export const authorizeAdminOperation = (operation: string): AuthorizationResult => {
    const currentUser = _getCurrentUser();
    
    if (!currentUser) {
        logAuditEvent({
            action: 'ADMIN_BYPASS_ATTEMPT',
            success: false,
            metadata: { 
                operation,
                reason: 'Not authenticated'
            }
        });
        return { authorized: false, error: 'Not authenticated' };
    }

    if (currentUser.role !== Role.ADMIN) {
        logAuditEvent({
            action: 'ADMIN_BYPASS_ATTEMPT',
            userId: currentUser.id,
            success: false,
            metadata: { 
                operation,
                attemptedByRole: currentUser.role
            }
        });
        return { 
            authorized: false, 
            error: 'Admin access required',
            userId: currentUser.id,
            userRole: currentUser.role
        };
    }

    return { authorized: true, userId: currentUser.id, userRole: currentUser.role };
};

/**
 * Authorize wallet/financial operations
 * Users can only modify their own wallet, admins can modify any wallet
 */
export const authorizeWalletOperation = (targetUserId: string): AuthorizationResult => {
    const currentUser = _getCurrentUser();
    
    if (!currentUser) {
        logAuditEvent({
            action: 'SECURITY_VIOLATION',
            success: false,
            metadata: { 
                type: 'UNAUTHORIZED_WALLET_OPERATION',
                targetUserId,
                reason: 'Not authenticated'
            }
        });
        return { authorized: false, error: 'Not authenticated' };
    }

    // Users can only access their own wallet
    if (currentUser.id === targetUserId) {
        return { authorized: true, userId: currentUser.id, userRole: currentUser.role };
    }

    // Admins can access any wallet (for dispute resolution, etc.)
    if (currentUser.role === Role.ADMIN) {
        return { authorized: true, userId: currentUser.id, userRole: currentUser.role };
    }

    logAuditEvent({
        action: 'SECURITY_VIOLATION',
        userId: currentUser.id,
        success: false,
        metadata: { 
            type: 'UNAUTHORIZED_WALLET_OPERATION',
            targetUserId,
            attemptedBy: currentUser.id
        }
    });

    return { 
        authorized: false, 
        error: 'You do not have permission to access this wallet' 
    };
};

/**
 * Authorize host dashboard access
 * Only hosts and admins can access host functionality
 */
export const authorizeHostAccess = (): AuthorizationResult => {
    const currentUser = _getCurrentUser();
    
    if (!currentUser) {
        return { authorized: false, error: 'Not authenticated' };
    }

    if (currentUser.role === Role.HOST || currentUser.role === Role.ADMIN) {
        return { authorized: true, userId: currentUser.id, userRole: currentUser.role };
    }

    return { 
        authorized: false, 
        error: 'Host access required',
        userId: currentUser.id,
        userRole: currentUser.role
    };
};
