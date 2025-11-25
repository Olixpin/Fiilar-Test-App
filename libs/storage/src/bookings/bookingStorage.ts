import { Booking } from '@fiilar/types';
import { STORAGE_KEYS } from '../constants';
import { generateVerificationCode } from '@fiilar/utils';

/**
 * Get all bookings
 */
export const getBookings = (): Booking[] => {
    const b = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
    return b ? JSON.parse(b) : [];
};

/**
 * Get a booking by ID
 */
export const getBookingById = (id: string): Booking | undefined => {
    const bookings = getBookings();
    return bookings.find(b => b.id === id);
};

/**
 * Create a new booking with handshake codes
 */
export const createBooking = (booking: Booking): Booking => {
    const bookings = getBookings();

    // Generate Handshake Codes using the robust utility
    const guestCode = generateVerificationCode();
    const hostCode = generateVerificationCode();

    const newBooking: Booking = {
        ...booking,
        guestCode,
        hostCode,
        handshakeStatus: 'PENDING',
        disputeStatus: 'NONE',
        modificationAllowed: false
    };

    bookings.push(newBooking);
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));

    return newBooking;
};

// Alias for consistency with other services
export const saveBooking = createBooking;

/**
 * Update an existing booking
 */
export const updateBooking = (booking: Booking) => {
    const bookings = getBookings();
    const idx = bookings.findIndex(b => b.id === booking.id);
    if (idx >= 0) {
        bookings[idx] = booking;
        localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
    }
};

/**
 * Set whether a booking can be modified
 */
export const setModificationAllowed = (bookingId: string, allowed: boolean) => {
    const bookings = getBookings();
    const idx = bookings.findIndex(b => b.id === bookingId);
    if (idx >= 0) {
        bookings[idx].modificationAllowed = allowed;
        localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
    }
};

/**
 * Delete a booking by ID
 */
export const deleteBooking = (id: string) => {
    const bookings = getBookings();
    const updatedBookings = bookings.filter(b => b.id !== id);
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(updatedBookings));
};
