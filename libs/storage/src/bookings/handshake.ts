import { Booking } from '@fiilar/types';
import { STORAGE_KEYS } from '../constants';
import { getBookings } from './bookingStorage';
import { getListings } from '../listings';

/**
 * Handshake Verification Service
 * 
 * API ENDPOINTS (for backend implementation):
 * - POST /api/bookings/:id/handshake - Verify guest code
 * - GET  /api/bookings/code/:code - Find booking by guest code
 */

/**
 * Verify a handshake using the guest code
 * 
 * API: POST /api/bookings/:id/handshake
 * Body: { code }
 * Response: { success, verifiedAt }
 */
export const verifyHandshake = (bookingId: string, code: string): boolean => {
    console.log('📤 API CALL: POST /api/bookings/' + bookingId + '/handshake', { code: code.substring(0, 2) + '****' });
    
    const bookings = getBookings();
    const idx = bookings.findIndex(b => b.id === bookingId);

    if (idx === -1) {
        console.log('❌ API RESPONSE: Booking not found');
        return false;
    }

    const booking = bookings[idx];

    // Check if code matches guest code
    if (booking.guestCode === code) {
        booking.handshakeStatus = 'VERIFIED';
        booking.verifiedAt = new Date().toISOString();
        booking.status = 'Started';

        bookings[idx] = booking;
        localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
        
        console.log('✅ API RESPONSE: Handshake verified', {
            bookingId,
            verifiedAt: booking.verifiedAt,
            newStatus: 'Started'
        });
        return true;
    }

    console.log('❌ API RESPONSE: Invalid code');
    return false;
};

/**
 * Find a booking by guest code for a specific host
 * 
 * API: GET /api/bookings/code/:code?hostId=xxx
 * Response: Booking | null
 */
export const findBookingByGuestCode = (hostId: string, code: string): Booking | undefined => {
    console.log('📤 API CALL: GET /api/bookings/code/' + code.substring(0, 2) + '****', { hostId });
    
    const bookings = getBookings();
    const listings = getListings();

    // Get all listing IDs for this host
    const hostListingIds = listings.filter(l => l.hostId === hostId).map(l => l.id);

    const found = bookings.find(b =>
        hostListingIds.includes(b.listingId) &&
        b.guestCode === code &&
        b.status !== 'Cancelled' &&
        b.status !== 'Completed'
    );
    
    console.log('✅ API RESPONSE:', found ? 'Booking found for host' : 'No matching booking');
    return found;
};
