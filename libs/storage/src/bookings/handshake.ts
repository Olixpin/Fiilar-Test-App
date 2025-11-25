import { Booking } from '@fiilar/types';
import { STORAGE_KEYS } from '../constants';
import { getBookings } from './bookingStorage';
import { getListings } from '../listings';

/**
 * Verify a handshake using the guest code
 */
export const verifyHandshake = (bookingId: string, code: string): boolean => {
    const bookings = getBookings();
    const idx = bookings.findIndex(b => b.id === bookingId);

    if (idx === -1) return false;

    const booking = bookings[idx];

    // Check if code matches guest code
    if (booking.guestCode === code) {
        booking.handshakeStatus = 'VERIFIED';
        booking.verifiedAt = new Date().toISOString();
        booking.status = 'Started';

        bookings[idx] = booking;
        localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
        return true;
    }

    return false;
};

/**
 * Find a booking by guest code for a specific host
 */
export const findBookingByGuestCode = (hostId: string, code: string): Booking | undefined => {
    const bookings = getBookings();
    const listings = getListings();

    // Get all listing IDs for this host
    const hostListingIds = listings.filter(l => l.hostId === hostId).map(l => l.id);

    return bookings.find(b =>
        hostListingIds.includes(b.listingId) &&
        b.guestCode === code &&
        b.status !== 'Cancelled' &&
        b.status !== 'Completed'
    );
};
