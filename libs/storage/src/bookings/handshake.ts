import { Booking, BookingType } from '@fiilar/types';
import { STORAGE_KEYS } from '../constants';
import { getBookings } from './bookingStorage';
import { getListings } from '../listings';
import { addNotification } from '@fiilar/notifications';

/**
 * Handshake Verification Service
 * 
 * API ENDPOINTS (for backend implementation):
 * - POST /api/bookings/:id/handshake - Verify guest code
 * - GET  /api/bookings/code/:code - Find booking by guest code
 */

// Allow check-in window: 30 minutes before start time
const CHECK_IN_WINDOW_MINUTES = 30;

/**
 * Check if booking is within valid check-in window
 * Returns: { valid: boolean, error?: string }
 */
const isWithinCheckInWindow = (booking: Booking): { valid: boolean; error?: string } => {
    const now = new Date();
    const bookingDate = new Date(booking.date);
    
    // Parse start time from hours array or listing defaults
    let startHour = 0;
    let endHour = 23;
    
    if (booking.hours && booking.hours.length > 0) {
        // Sort hours to get start and end
        const sortedHours = [...booking.hours].sort((a, b) => a - b);
        startHour = sortedHours[0];
        endHour = sortedHours[sortedHours.length - 1] + 1; // End is after the last booked hour
    } else if (booking.bookingType === BookingType.DAILY) {
        // For daily bookings, assume standard hours (e.g., 9 AM - 6 PM)
        startHour = 9;
        endHour = 18;
    }
    
    // Create booking start datetime
    const bookingStart = new Date(bookingDate);
    bookingStart.setHours(startHour, 0, 0, 0);
    
    // Calculate check-in window start (30 min before booking)
    const checkInWindowStart = new Date(bookingStart);
    checkInWindowStart.setMinutes(checkInWindowStart.getMinutes() - CHECK_IN_WINDOW_MINUTES);
    
    // Create booking end datetime
    const bookingEnd = new Date(bookingDate);
    bookingEnd.setHours(endHour, 0, 0, 0);
    
    // Format time for display
    const formatHour = (h: number) => {
        const ampm = h >= 12 ? 'PM' : 'AM';
        const hour12 = h % 12 || 12;
        return `${hour12}:00 ${ampm}`;
    };
    
    // Check if current time is before check-in window
    if (now < checkInWindowStart) {
        const diffMs = checkInWindowStart.getTime() - now.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        let timeStr = '';
        if (diffHours > 24) {
            const diffDays = Math.floor(diffHours / 24);
            timeStr = `${diffDays} day${diffDays > 1 ? 's' : ''}`;
        } else if (diffHours > 0) {
            timeStr = `${diffHours} hour${diffHours > 1 ? 's' : ''} ${diffMins} minute${diffMins !== 1 ? 's' : ''}`;
        } else {
            timeStr = `${diffMins} minute${diffMins !== 1 ? 's' : ''}`;
        }
        
        return {
            valid: false,
            error: `Too early! Check-in opens ${timeStr} from now (${CHECK_IN_WINDOW_MINUTES} minutes before your booking starts at ${formatHour(startHour)})`
        };
    }
    
    // Check if booking has already ended
    if (now > bookingEnd) {
        return {
            valid: false,
            error: `This booking has already ended. The booking was scheduled for ${bookingDate.toLocaleDateString()} from ${formatHour(startHour)} to ${formatHour(endHour)}`
        };
    }
    
    return { valid: true };
};

/**
 * Verify a handshake using the guest code
 * 
 * API: POST /api/bookings/:id/handshake
 * Body: { code }
 * Response: { success, verifiedAt, error? }
 */
export const verifyHandshake = (bookingId: string, code: string): boolean | { success: false; error: string } => {
    console.log('📤 API CALL: POST /api/bookings/' + bookingId + '/handshake', { code: code.substring(0, 2) + '****' });
    
    const bookings = getBookings();
    const idx = bookings.findIndex(b => b.id === bookingId);

    if (idx === -1) {
        console.log('❌ API RESPONSE: Booking not found');
        return { success: false, error: 'Booking not found' };
    }

    const booking = bookings[idx];

    // Check if code matches guest code
    if (booking.guestCode !== code) {
        console.log('❌ API RESPONSE: Invalid code');
        return { success: false, error: 'Invalid verification code' };
    }
    
    // Check if already verified/started
    if (booking.status === 'Started') {
        console.log('❌ API RESPONSE: Booking already started');
        return { success: false, error: 'This booking has already been verified and started' };
    }
    
    // Check if booking is within valid check-in window
    const timeCheck = isWithinCheckInWindow(booking);
    if (!timeCheck.valid) {
        console.log('❌ API RESPONSE: Outside check-in window -', timeCheck.error);
        return { success: false, error: timeCheck.error! };
    }

    // All checks passed - verify the booking
    booking.handshakeStatus = 'VERIFIED';
    booking.verifiedAt = new Date().toISOString();
    booking.status = 'Started';

    bookings[idx] = booking;
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
    
    // Get listing details for notification
    const listings = getListings();
    const listing = listings.find(l => l.id === booking.listingId);
    const listingTitle = listing?.title || 'your booked space';
    
    // Send notification to the guest
    addNotification({
        userId: booking.userId,
        type: 'booking',
        title: 'Booking Started! 🎉',
        message: `Your booking for "${listingTitle}" has been verified. Your session has now started. Enjoy your time!`,
        severity: 'info',
        read: false,
        actionRequired: false,
        metadata: {
            bookingId: booking.id,
            listingId: booking.listingId
        }
    });
    
    console.log('✅ API RESPONSE: Handshake verified', {
        bookingId,
        verifiedAt: booking.verifiedAt,
        newStatus: 'Started'
    });
    return true;
};

/**
 * Find a booking by guest code for a specific host
 * For recurring bookings (series), this will find the booking for today's date if available.
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

    // Find all bookings matching the code
    const matchingBookings = bookings.filter(b =>
        hostListingIds.includes(b.listingId) &&
        b.guestCode === code &&
        b.status !== 'Cancelled' &&
        b.status !== 'Completed' &&
        b.status !== 'Started' // Exclude already verified bookings
    );
    
    if (matchingBookings.length === 0) {
        console.log('✅ API RESPONSE: No matching booking found');
        return undefined;
    }
    
    // For recurring bookings, find the one scheduled for today or nearest upcoming
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // First, try to find a booking for today
    const todayBooking = matchingBookings.find(b => {
        const bookingDate = new Date(b.date);
        bookingDate.setHours(0, 0, 0, 0);
        return bookingDate.getTime() === today.getTime();
    });
    
    if (todayBooking) {
        console.log('✅ API RESPONSE: Found booking for today', { bookingId: todayBooking.id, date: todayBooking.date });
        return todayBooking;
    }
    
    // Otherwise, find the nearest upcoming booking (sorted by date)
    const sortedByDate = matchingBookings.sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    const found = sortedByDate[0];
    console.log('✅ API RESPONSE:', found ? `Found nearest booking on ${found.date}` : 'No matching booking');
    return found;
};
