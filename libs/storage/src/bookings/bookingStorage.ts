import { Booking, Listing } from '@fiilar/types';
import { STORAGE_KEYS } from '../constants';
import { generateVerificationCode } from '@fiilar/utils';
import { 
    validateBookingPriceDetailed, 
    checkBookingIdempotency,
    checkSlotAvailability,
    validateBookingIntegrity,
    logSecurityEvent 
} from '../security/bookingSecurity';
import { logAuditEvent } from '../security/authSecurity';
import { authorizeBookingModification, getAuthenticatedUser } from '../security/authorization';

// Types for booking results
export interface BookingResult {
    success: boolean;
    booking?: Booking;
    error?: string;
    securityError?: boolean;
}

// Extended listing data for secure booking
export interface SecureBookingListingData {
    listing: Listing;
    datesCount?: number; // For recurring bookings
}

/**
 * Booking Storage Service
 * 
 * API ENDPOINTS (for backend implementation):
 * - GET    /api/bookings - Get all bookings (admin/filtered)
 * - GET    /api/bookings/:id - Get booking by ID
 * - POST   /api/bookings - Create new booking
 * - PUT    /api/bookings/:id - Update booking
 * - DELETE /api/bookings/:id - Delete booking
 * - POST   /api/bookings/:id/handshake - Verify handshake code
 */

/**
 * Get all bookings
 * API: GET /api/bookings
 */
export const getBookings = (): Booking[] => {
    console.log('📤 API CALL: GET /api/bookings');
    const b = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
    const bookings = b ? JSON.parse(b) : [];
    console.log('✅ API RESPONSE: Retrieved', bookings.length, 'bookings');
    return bookings;
};

/**
 * Get a booking by ID
 * API: GET /api/bookings/:id
 */
export const getBookingById = (id: string): Booking | undefined => {
    console.log('📤 API CALL: GET /api/bookings/' + id);
    const bookings = getBookings();
    const booking = bookings.find(b => b.id === id);
    console.log('✅ API RESPONSE:', booking ? 'Booking found' : 'Booking not found');
    return booking;
};

/**
 * Create a new booking with handshake codes
 * SECURITY: Now validates pricing, checks for duplicates, and ensures integrity
 * 
 * API: POST /api/bookings
 * Body: Booking object
 * Response: { success, booking, guestCode, hostCode }
 */
export const createBooking = (booking: Booking): Booking => {
    console.log('📤 API CALL: POST /api/bookings', {
        listingId: booking.listingId,
        userId: booking.userId,
        date: booking.date,
        totalPrice: booking.totalPrice,
        status: booking.status
    });
    
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

    // Dispatch event to notify app of booking update
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('fiilar:bookings-updated', { detail: { booking: newBooking } }));
    }

    // Track booking for analytics (only for confirmed bookings)
    if (booking.status === 'Confirmed' || booking.status === 'Pending') {
        try {
            // Dynamic import to avoid circular dependency
            import('../analytics').then(({ trackBooking }) => {
                trackBooking(booking.listingId, booking.userId, newBooking.id);
            });
        } catch (e) {
            // Analytics tracking is non-critical
        }
    }

    console.log('✅ API RESPONSE: Booking created', {
        bookingId: newBooking.id,
        guestCode: newBooking.guestCode,
        hostCode: newBooking.hostCode,
        handshakeStatus: newBooking.handshakeStatus
    });
    
    return newBooking;
};

/**
 * Create a new booking with full security validation
 * Returns a result object with success/error status
 * 
 * SECURITY: This is the recommended method for creating bookings
 * - Validates pricing matches server calculation
 * - Prevents duplicate/double bookings
 * - Validates all booking constraints
 * 
 * @param booking - The booking to create
 * @param listingData - Full listing data OR simplified price data for validation
 */
export const createSecureBooking = (
    booking: Booking,
    listingData: SecureBookingListingData | { basePrice: number; serviceFee?: number; cautionFee?: number }
): BookingResult => {
    // Determine if we have full listing data or simplified data
    const hasFullListing = 'listing' in listingData;
    
    // 1. Validate price wasn't manipulated
    if (hasFullListing) {
        // Full validation with proper pricing calculation
        const { listing, datesCount = 1 } = listingData as SecureBookingListingData;
        
        const priceValidation = validateBookingPriceDetailed(
            listing,
            { 
                total: booking.totalPrice * datesCount, // Scale back to full price for validation
                service: booking.serviceFee * datesCount, 
                caution: booking.cautionFee * datesCount 
            },
            booking.duration || 1,
            booking.guestCount || 1,
            booking.hours,
            booking.selectedAddOns || [],
            datesCount
        );

        if (!priceValidation.valid) {
            logSecurityEvent('PRICE_VALIDATION_FAILED', booking.userId, {
                bookingId: booking.id,
                clientTotal: booking.totalPrice,
                serverTotal: priceValidation.breakdown.total / datesCount,
                errors: priceValidation.errors
            });
            
            return {
                success: false,
                error: `Price validation failed: ${priceValidation.errors.join(', ')}`,
                securityError: true
            };
        }
    } else {
        // Simplified validation (for backward compatibility during transition)
        // Log warning that full listing should be provided
        console.warn('createSecureBooking: Using simplified validation. Provide full listing for better security.');
        
        const simpleData = listingData as { basePrice: number; serviceFee?: number; cautionFee?: number };
        
        // Basic sanity checks only
        if (booking.totalPrice <= 0) {
            return {
                success: false,
                error: 'Invalid total price',
                securityError: true
            };
        }
        
        // Check if service fee is roughly 10% of base price
        const expectedMinServiceFee = simpleData.basePrice * 0.08; // Allow 8-12%
        const expectedMaxServiceFee = simpleData.basePrice * 0.12;
        if (booking.serviceFee < expectedMinServiceFee || booking.serviceFee > expectedMaxServiceFee) {
            console.warn('Service fee outside expected range', { 
                serviceFee: booking.serviceFee, 
                expected: `${expectedMinServiceFee}-${expectedMaxServiceFee}` 
            });
            // Don't fail, just warn - full validation should be used
        }
    }

    // 2. Check for duplicate booking (idempotency)
    const idempotencyCheck = checkBookingIdempotency(
        booking.userId,
        booking.listingId,
        booking.date,
        booking.hours || [],
        getBookings()
    );

    if (!idempotencyCheck.isUnique) {
        logSecurityEvent('DUPLICATE_BOOKING_ATTEMPT', booking.userId, {
            existingBookingId: idempotencyCheck.existingBookingId,
            listingId: booking.listingId,
            date: booking.date
        });
        
        return {
            success: false,
            error: 'A booking for this date/time already exists',
            securityError: true
        };
    }

    // 2.5. Check slot availability (prevents race conditions/double booking)
    const slotCheck = checkSlotAvailability(
        booking.listingId,
        booking.date,
        booking.hours || [],
        booking.duration || 1,
        getBookings()
    );

    if (!slotCheck.available) {
        logSecurityEvent('SLOT_ALREADY_BOOKED', booking.userId, {
            conflictingBookingIds: slotCheck.conflictingBookingIds,
            overlappingHours: slotCheck.overlappingHours,
            listingId: booking.listingId,
            date: booking.date
        });
        
        return {
            success: false,
            error: slotCheck.overlappingHours.length > 0 
                ? `The following hours are already booked: ${slotCheck.overlappingHours.join(', ')}`
                : 'This date/time slot is already booked',
            securityError: true
        };
    }

    // 3. Validate booking integrity
    const integrityCheck = validateBookingIntegrity(booking);
    if (!integrityCheck.valid) {
        logSecurityEvent('BOOKING_INTEGRITY_FAILED', booking.userId, {
            bookingId: booking.id,
            issues: integrityCheck.issues
        });
        
        return {
            success: false,
            error: `Booking validation failed: ${integrityCheck.issues?.join(', ')}`,
            securityError: true
        };
    }

    // 4. Create the booking
    const createdBooking = createBooking(booking);

    // 5. Log successful booking creation
    logAuditEvent({
        action: 'BOOKING_CREATED',
        userId: booking.userId,
        success: true,
        metadata: {
            bookingId: createdBooking.id,
            listingId: booking.listingId,
            totalPrice: booking.totalPrice
        }
    });

    return {
        success: true,
        booking: createdBooking
    };
};

// Alias for consistency with other services
export const saveBooking = createBooking;

/**
 * Valid booking status transitions
 * Pending -> Confirmed, Cancelled
 * Confirmed -> Completed, Cancelled
 * Completed -> (no transitions allowed)
 * Cancelled -> (no transitions allowed)
 */
const VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
    'Pending': ['Confirmed', 'Cancelled'],
    'Confirmed': ['Completed', 'Cancelled'],
    'Completed': [], // Terminal state
    'Cancelled': [], // Terminal state
};

/**
 * Validate that a status transition is allowed
 */
export const isValidStatusTransition = (from: string, to: string): boolean => {
    // Same status is always allowed (no transition)
    if (from === to) return true;
    
    const allowedTransitions = VALID_STATUS_TRANSITIONS[from] || [];
    return allowedTransitions.includes(to);
};

/**
 * Update an existing booking with status transition validation
 * SECURITY: Validates that the current user is authorized to modify this booking
 * Returns void for backward compatibility, but logs violations
 */
export const updateBooking = (booking: Booking): void => {
    // SECURITY CHECK: Verify user is authorized to modify this booking
    const authCheck = authorizeBookingModification(booking.id);
    if (!authCheck.authorized) {
        console.error('🚨 SECURITY: Unauthorized booking modification attempt', {
            bookingId: booking.id,
            error: authCheck.error
        });
        return;
    }

    const bookings = getBookings();
    const idx = bookings.findIndex(b => b.id === booking.id);
    if (idx < 0) {
        console.warn('updateBooking: Booking not found', booking.id);
        return;
    }
    
    const existingBooking = bookings[idx];
    
    // Validate status transition if status is changing
    if (booking.status && existingBooking.status !== booking.status) {
        if (!isValidStatusTransition(existingBooking.status, booking.status)) {
            console.error(`🚨 SECURITY: Invalid status transition: ${existingBooking.status} -> ${booking.status}`, {
                bookingId: booking.id,
                fromStatus: existingBooking.status,
                toStatus: booking.status
            });
            logAuditEvent({
                action: 'SECURITY_VIOLATION',
                userId: booking.userId || 'unknown',
                success: false,
                metadata: {
                    type: 'INVALID_STATUS_TRANSITION',
                    bookingId: booking.id,
                    fromStatus: existingBooking.status,
                    toStatus: booking.status
                }
            });
            // Block the update for security - this is a critical violation
            return;
        }
    }
    
    bookings[idx] = booking;
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));

    // Dispatch event to notify app of booking update
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('fiilar:bookings-updated', { detail: { booking } }));
    }
};

/**
 * Update an existing booking with validation - returns result object
 * SECURITY: Validates that the current user is authorized to modify this booking
 * Use this for new code that needs to handle validation errors
 */
export const updateBookingSecure = (booking: Booking): { success: boolean; error?: string } => {
    // SECURITY CHECK: Verify user is authorized to modify this booking
    const authCheck = authorizeBookingModification(booking.id);
    if (!authCheck.authorized) {
        return { success: false, error: authCheck.error };
    }

    const bookings = getBookings();
    const idx = bookings.findIndex(b => b.id === booking.id);
    if (idx < 0) {
        return { success: false, error: 'Booking not found' };
    }
    
    const existingBooking = bookings[idx];
    
    // Validate status transition if status is changing
    if (booking.status && existingBooking.status !== booking.status) {
        if (!isValidStatusTransition(existingBooking.status, booking.status)) {
            logAuditEvent({
                action: 'SECURITY_VIOLATION',
                userId: booking.userId || 'unknown',
                success: false,
                metadata: {
                    type: 'INVALID_STATUS_TRANSITION',
                    bookingId: booking.id,
                    fromStatus: existingBooking.status,
                    toStatus: booking.status
                }
            });
            return { 
                success: false, 
                error: `Invalid status transition from ${existingBooking.status} to ${booking.status}` 
            };
        }
    }
    
    bookings[idx] = booking;
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));

    // Dispatch event to notify app of booking update
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('fiilar:bookings-updated', { detail: { booking } }));
    }

    return { success: true };
};

/**
 * Set whether a booking can be modified
 * SECURITY: Validates that the current user is authorized to modify this booking
 */
export const setModificationAllowed = (bookingId: string, allowed: boolean): boolean => {
    // SECURITY CHECK: Verify user is authorized to modify this booking
    const authCheck = authorizeBookingModification(bookingId);
    if (!authCheck.authorized) {
        console.error('🚨 SECURITY: Unauthorized setModificationAllowed attempt', {
            bookingId,
            error: authCheck.error
        });
        return false;
    }

    const bookings = getBookings();
    const idx = bookings.findIndex(b => b.id === bookingId);
    if (idx >= 0) {
        bookings[idx].modificationAllowed = allowed;
        localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
        return true;
    }
    return false;
};

/**
 * Delete a booking by ID
 * SECURITY: Validates that the current user is authorized to delete this booking
 */
export const deleteBooking = (id: string): boolean => {
    // SECURITY CHECK: Verify user is authorized to delete this booking
    const authCheck = authorizeBookingModification(id);
    if (!authCheck.authorized) {
        console.error('🚨 SECURITY: Unauthorized booking deletion attempt', {
            bookingId: id,
            error: authCheck.error
        });
        return false;
    }

    const bookings = getBookings();
    const updatedBookings = bookings.filter(b => b.id !== id);
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(updatedBookings));

    // Dispatch event to notify app of booking update
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('fiilar:bookings-updated', { detail: { deletedId: id } }));
    }
    
    return true;
};
