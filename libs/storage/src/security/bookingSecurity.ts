/**
 * Booking Security Utilities
 * Implements price validation, idempotency, and booking integrity checks
 * 
 * Note: This simulates server-side validation with localStorage for demo purposes.
 * In production, all pricing and validation must happen on the server.
 */

import { Booking, Listing, BookingType } from '@fiilar/types';
import { generateSecureToken, logAuditEvent } from './authSecurity';
import { BOOKING_CONFIG } from '../config/appConfig';

// ===== STORAGE KEYS =====
export const BOOKING_SECURITY_KEYS = {
    IDEMPOTENCY_KEYS: 'fiilar_idempotency_keys',
    PRICE_AUDIT: 'fiilar_price_audit',
};

// ===== CONFIGURATION =====
export const BOOKING_SECURITY_CONFIG = {
    SERVICE_FEE_PERCENTAGE: BOOKING_CONFIG.SERVICE_FEE_PERCENTAGE,
    IDEMPOTENCY_KEY_EXPIRY_HOURS: BOOKING_CONFIG.IDEMPOTENCY_KEY_EXPIRY_HOURS,
    MAX_BOOKING_DAYS_AHEAD: BOOKING_CONFIG.MAX_BOOKING_DAYS_AHEAD,
    MIN_PRICE: BOOKING_CONFIG.MIN_PRICE,
    MAX_GUESTS_MULTIPLIER: 2, // Can't exceed 2x capacity
};

// ===== TYPES =====
export interface IdempotencyRecord {
    key: string;
    bookingId: string;
    createdAt: string;
    expiresAt: string;
}

export interface PriceValidationResult {
    valid: boolean;
    calculatedTotal: number;
    expectedTotal: number;
    discrepancy: number;
    errors: string[];
    breakdown: {
        basePrice: number;
        extraGuestFee: number;
        addOnsCost: number;
        subtotal: number;
        serviceFee: number;
        cautionFee: number;
        total: number;
    };
}

export interface BookingValidationResult {
    valid: boolean;
    errors: string[];
}

// ===== IDEMPOTENCY =====
/**
 * Get idempotency records
 */
const getIdempotencyRecords = (): IdempotencyRecord[] => {
    try {
        const data = localStorage.getItem(BOOKING_SECURITY_KEYS.IDEMPOTENCY_KEYS);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
};

/**
 * Save idempotency records
 */
const saveIdempotencyRecords = (records: IdempotencyRecord[]): void => {
    localStorage.setItem(BOOKING_SECURITY_KEYS.IDEMPOTENCY_KEYS, JSON.stringify(records));
};

/**
 * Generate an idempotency key for a booking request
 * Based on: userId + listingId + date + hours/duration
 */
export const generateIdempotencyKey = (
    userId: string,
    listingId: string,
    date: string,
    duration: number,
    hours?: number[]
): string => {
    const hoursStr = hours ? hours.sort().join(',') : '';
    const raw = `${userId}:${listingId}:${date}:${duration}:${hoursStr}`;
    // Simple hash for idempotency
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
        const char = raw.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return `idem_${Math.abs(hash).toString(16)}_${Date.now().toString(36)}`;
};

/**
 * Check if a booking with this idempotency key already exists
 * Returns the existing booking ID if found
 */
export const checkIdempotency = (key: string): { exists: boolean; bookingId?: string } => {
    const records = getIdempotencyRecords();
    const now = new Date();

    // Clean up expired records
    const activeRecords = records.filter(r => new Date(r.expiresAt) > now);
    if (activeRecords.length !== records.length) {
        saveIdempotencyRecords(activeRecords);
    }

    const record = activeRecords.find(r => r.key === key);
    if (record) {
        return { exists: true, bookingId: record.bookingId };
    }

    return { exists: false };
};

/**
 * Record an idempotency key after successful booking creation
 */
export const recordIdempotencyKey = (key: string, bookingId: string): void => {
    const records = getIdempotencyRecords();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + BOOKING_SECURITY_CONFIG.IDEMPOTENCY_KEY_EXPIRY_HOURS * 60 * 60 * 1000);

    records.push({
        key,
        bookingId,
        createdAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
    });

    saveIdempotencyRecords(records);
};

// ===== PRICE VALIDATION =====
/**
 * Server-side style price calculation
 * This should be the source of truth for all pricing
 */
export const calculateBookingPrice = (
    listing: Listing,
    duration: number,
    guestCount: number,
    selectedHours: number[] | undefined,
    selectedAddOns: string[],
    datesCount: number = 1
): PriceValidationResult['breakdown'] => {
    const isHourly = listing.priceUnit === BookingType.HOURLY;

    // Base price calculation
    let basePrice = listing.price;

    // NEW MODEL (v1.1): Extra guest fee calculation
    const maxGuests = listing.maxGuests ?? listing.capacity ?? 1;
    const allowExtraGuests = listing.allowExtraGuests ?? false;
    const extraGuestFeePerGuest = listing.extraGuestFee ?? listing.pricePerExtraGuest ?? 0;
    
    let extraGuestFee = 0;
    if (allowExtraGuests && extraGuestFeePerGuest > 0 && guestCount > maxGuests) {
        // New model: extras are guests beyond maxGuests
        const extraGuestsCount = guestCount - maxGuests;
        extraGuestFee = extraGuestsCount * extraGuestFeePerGuest;
    } else {
        // LEGACY: Fall back to old model for backward compatibility
        const includedGuests = listing.includedGuests || maxGuests;
        const pricePerExtraGuest = listing.pricePerExtraGuest || 0;
        if (guestCount > includedGuests && pricePerExtraGuest > 0) {
            extraGuestFee = (guestCount - includedGuests) * pricePerExtraGuest;
        }
    }

    // Rental cost based on type
    let rentalCost: number;
    if (isHourly && selectedHours) {
        rentalCost = selectedHours.length * basePrice;
    } else {
        rentalCost = duration * basePrice;
    }

    // Add-ons cost
    let addOnsCost = 0;
    if (listing.addOns && selectedAddOns.length > 0) {
        for (const addOnId of selectedAddOns) {
            const addOn = listing.addOns.find(a => a.id === addOnId);
            if (addOn) {
                addOnsCost += addOn.price;
            }
        }
    }

    // Extra guest fees are per booking occurrence (not per hour)
    const rentalSubtotal = rentalCost * datesCount;
    const extraGuestTotal = extraGuestFee * datesCount;
    
    // Subtotal before service fee
    const subtotal = rentalSubtotal + extraGuestTotal + (addOnsCost * datesCount);

    // Service fee (10% of rental + extra guest fees, NOT on add-ons per frontend logic)
    const feeableAmount = rentalSubtotal + extraGuestTotal;
    const serviceFee = Math.round(feeableAmount * BOOKING_SECURITY_CONFIG.SERVICE_FEE_PERCENTAGE * 100) / 100;

    // Caution fee (one-time, not multiplied by dates)
    const cautionFee = listing.cautionFee || 0;

    // Total
    const total = Math.round((subtotal + serviceFee + cautionFee) * 100) / 100;

    return {
        basePrice,
        extraGuestFee,
        addOnsCost,
        subtotal,
        serviceFee,
        cautionFee,
        total,
    };
};

/**
 * Validate client-submitted pricing against server calculation
 * This is the critical security check (detailed version)
 */
export const validateBookingPriceDetailed = (
    listing: Listing,
    clientBreakdown: { total: number; service: number; caution: number },
    duration: number,
    guestCount: number,
    selectedHours: number[] | undefined,
    selectedAddOns: string[],
    datesCount: number = 1
): PriceValidationResult => {
    const errors: string[] = [];

    // Calculate what the price SHOULD be
    const serverBreakdown = calculateBookingPrice(
        listing,
        duration,
        guestCount,
        selectedHours,
        selectedAddOns,
        datesCount
    );

    // Allow small floating point discrepancies (1 cent)
    const tolerance = 0.01;
    const totalDiff = Math.abs(serverBreakdown.total - clientBreakdown.total);
    const serviceDiff = Math.abs(serverBreakdown.serviceFee - clientBreakdown.service);
    const cautionDiff = Math.abs(serverBreakdown.cautionFee - clientBreakdown.caution);

    if (totalDiff > tolerance) {
        errors.push(`Total price mismatch: expected ${serverBreakdown.total}, got ${clientBreakdown.total}`);
    }

    if (serviceDiff > tolerance) {
        errors.push(`Service fee mismatch: expected ${serverBreakdown.serviceFee}, got ${clientBreakdown.service}`);
    }

    if (cautionDiff > tolerance) {
        errors.push(`Caution fee mismatch: expected ${serverBreakdown.cautionFee}, got ${clientBreakdown.caution}`);
    }

    // Additional validation
    if (serverBreakdown.total < BOOKING_SECURITY_CONFIG.MIN_PRICE) {
        errors.push(`Booking total cannot be less than ${BOOKING_SECURITY_CONFIG.MIN_PRICE}`);
    }

    const valid = errors.length === 0;

    // Log price validation for audit
    if (!valid) {
        logAuditEvent({
            action: 'PAYMENT_PROCESSED',
            success: false,
            metadata: {
                reason: 'Price validation failed',
                errors,
                clientTotal: clientBreakdown.total,
                serverTotal: serverBreakdown.total,
                listingId: listing.id,
            }
        });
    }

    return {
        valid,
        calculatedTotal: serverBreakdown.total,
        expectedTotal: clientBreakdown.total,
        discrepancy: totalDiff,
        errors,
        breakdown: serverBreakdown,
    };
};

// ===== BOOKING VALIDATION =====
/**
 * Comprehensive booking validation
 */
export const validateBooking = (
    listing: Listing,
    userId: string,
    dates: string[],
    duration: number,
    guestCount: number,
    selectedHours?: number[]
): BookingValidationResult => {
    const errors: string[] = [];
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // 1. Check user is not the host
    if (listing.hostId === userId) {
        errors.push('Cannot book your own listing');
    }

    // 2. Validate dates
    for (const dateStr of dates) {
        // Not in the past
        if (dateStr < todayStr) {
            errors.push(`Cannot book past date: ${dateStr}`);
        }

        // Not too far in the future
        const maxFutureDate = new Date(now);
        maxFutureDate.setDate(maxFutureDate.getDate() + BOOKING_SECURITY_CONFIG.MAX_BOOKING_DAYS_AHEAD);
        if (dateStr > maxFutureDate.toISOString().split('T')[0]) {
            errors.push(`Cannot book more than ${BOOKING_SECURITY_CONFIG.MAX_BOOKING_DAYS_AHEAD} days ahead`);
        }

        // Validate date format
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            errors.push(`Invalid date format: ${dateStr}`);
        }
    }

    // 3. Validate guest count
    if (guestCount < 1) {
        errors.push('Guest count must be at least 1');
    }

    const maxCapacity = (listing.capacity || 1) * BOOKING_SECURITY_CONFIG.MAX_GUESTS_MULTIPLIER;
    if (guestCount > maxCapacity) {
        errors.push(`Guest count ${guestCount} exceeds maximum allowed (${maxCapacity})`);
    }

    // 4. Validate duration
    if (duration < 1) {
        errors.push('Duration must be at least 1');
    }

    // 5. Validate hours for hourly bookings
    if (listing.priceUnit === BookingType.HOURLY) {
        if (!selectedHours || selectedHours.length === 0) {
            errors.push('Must select at least one hour for hourly bookings');
        } else {
            // Check hours are within valid range
            for (const hour of selectedHours) {
                if (hour < 0 || hour > 23) {
                    errors.push(`Invalid hour: ${hour}`);
                }
            }

            // Check hours are available in listing
            for (const dateStr of dates) {
                const availableHours = listing.availability?.[dateStr] || [];
                for (const hour of selectedHours) {
                    if (!availableHours.includes(hour)) {
                        errors.push(`Hour ${hour} not available on ${dateStr}`);
                    }
                }
            }
        }
    }

    // 6. Validate listing is bookable
    if (listing.status !== 'Live') {
        errors.push(`Listing is not available for booking (status: ${listing.status})`);
    }

    return {
        valid: errors.length === 0,
        errors,
    };
};

/**
 * Validate refund amount doesn't exceed paid amount
 */
export const validateRefundAmount = (booking: Booking, refundAmount: number): boolean => {
    return refundAmount >= 0 && refundAmount <= booking.totalPrice;
};

/**
 * Generate a unique booking ID
 */
export const generateBookingId = (): string => {
    return `bk_${Date.now()}_${generateSecureToken(8)}`;
};

// ===== SIMPLIFIED VALIDATION FOR BOOKING STORAGE =====
/**
 * Simplified price validation for createSecureBooking
 * Checks if client-submitted total is close to server-calculated total
 */
export const validateBookingPriceSimple = (params: {
    basePrice: number;
    serviceFeePercent: number;
    cautionFeePercent: number;
    clientTotal: number;
    clientServiceFee: number;
    clientCautionFee: number;
    duration: number;
    guestCount: number;
    bookingType: BookingType;
}): { valid: boolean; serverTotal: number; discrepancy: number; reason?: string } => {
    const { basePrice, serviceFeePercent, cautionFeePercent, clientTotal, clientServiceFee, clientCautionFee, duration, guestCount, bookingType } = params;
    
    // Calculate server-side pricing based on booking type
    let rentalCost: number;
    if (bookingType === BookingType.HOURLY) {
        // For hourly, duration represents number of hours
        rentalCost = basePrice * duration;
    } else {
        // For daily, duration represents number of days
        rentalCost = basePrice * duration;
    }
    
    // Guest count could affect pricing in the future
    // For now, it's tracked for validation purposes
    if (guestCount < 1) {
        return {
            valid: false,
            serverTotal: 0,
            discrepancy: clientTotal,
            reason: 'Invalid guest count'
        };
    }
    
    const serverServiceFee = Math.round(rentalCost * (serviceFeePercent / 100) * 100) / 100;
    const serverCautionFee = Math.round(rentalCost * (cautionFeePercent / 100) * 100) / 100;
    const serverTotal = Math.round((rentalCost + serverServiceFee + serverCautionFee) * 100) / 100;
    
    // Allow 1 cent tolerance for floating point
    const tolerance = 0.01;
    const totalDiff = Math.abs(serverTotal - clientTotal);
    
    // Also validate individual fees
    const serviceFeeDiff = Math.abs(serverServiceFee - clientServiceFee);
    const cautionFeeDiff = Math.abs(serverCautionFee - clientCautionFee);
    
    if (totalDiff > tolerance) {
        return {
            valid: false,
            serverTotal,
            discrepancy: totalDiff,
            reason: `Total mismatch: server calculated ${serverTotal}, client sent ${clientTotal}`
        };
    }
    
    if (serviceFeeDiff > tolerance || cautionFeeDiff > tolerance) {
        return {
            valid: false,
            serverTotal,
            discrepancy: Math.max(serviceFeeDiff, cautionFeeDiff),
            reason: `Fee mismatch detected`
        };
    }
    
    return { valid: true, serverTotal, discrepancy: 0 };
};

// Alias for backward compatibility
export { validateBookingPriceSimple as validateBookingPrice };

/**
 * Check if a booking with same details already exists (idempotency)
 * This prevents the same user from creating duplicate bookings
 */
export const checkBookingIdempotency = (
    userId: string,
    listingId: string,
    date: string,
    hours: number[],
    existingBookings: Booking[]
): { isUnique: boolean; existingBookingId?: string } => {
    // Check for existing booking with same user, listing, date
    const existing = existingBookings.find(b => 
        b.userId === userId && 
        b.listingId === listingId && 
        b.date === date &&
        b.status !== 'Cancelled' &&
        // For hourly, check if same hours
        (hours.length === 0 || (b.hours && arraysEqual(b.hours, hours)))
    );
    
    if (existing) {
        return { isUnique: false, existingBookingId: existing.id };
    }
    
    return { isUnique: true };
};

/**
 * Check if time slots are already booked by ANY user (prevents double booking)
 * This is critical for preventing race conditions where two users book the same slot
 */
export const checkSlotAvailability = (
    listingId: string,
    date: string,
    hours: number[],
    duration: number,
    existingBookings: Booking[]
): { available: boolean; conflictingBookingIds: string[]; overlappingHours: number[] } => {
    const conflicts: string[] = [];
    const overlappingHours: number[] = [];
    
    // Get all active bookings for this listing and date
    const listingBookings = existingBookings.filter(b => 
        b.listingId === listingId && 
        b.status !== 'Cancelled'
    );
    
    // Check for hourly booking overlaps
    if (hours && hours.length > 0) {
        for (const booking of listingBookings) {
            if (booking.date === date && booking.hours && booking.hours.length > 0) {
                const overlap = hours.filter(h => booking.hours!.includes(h));
                if (overlap.length > 0) {
                    conflicts.push(booking.id);
                    overlappingHours.push(...overlap);
                }
            }
        }
    }
    
    // Check for daily/nightly booking overlaps
    if (!hours || hours.length === 0) {
        const bookingStart = new Date(date);
        const bookingEnd = new Date(bookingStart);
        bookingEnd.setDate(bookingStart.getDate() + (duration || 1));
        
        for (const booking of listingBookings) {
            // Check if this is a daily/nightly booking that overlaps
            if (!booking.hours || booking.hours.length === 0) {
                const existingStart = new Date(booking.date);
                const existingEnd = new Date(existingStart);
                existingEnd.setDate(existingStart.getDate() + (booking.duration || 1));
                
                // Check for date range overlap
                if (bookingStart < existingEnd && bookingEnd > existingStart) {
                    conflicts.push(booking.id);
                }
            }
        }
    }
    
    return {
        available: conflicts.length === 0,
        conflictingBookingIds: [...new Set(conflicts)],
        overlappingHours: [...new Set(overlappingHours)]
    };
};

// Helper to check array equality
function arraysEqual(a: number[], b: number[]): boolean {
    if (a.length !== b.length) return false;
    const sortedA = [...a].sort();
    const sortedB = [...b].sort();
    return sortedA.every((val, idx) => val === sortedB[idx]);
}

/**
 * Validate booking integrity
 */
export const validateBookingIntegrity = (booking: Booking): { valid: boolean; issues?: string[] } => {
    const issues: string[] = [];
    
    // Required fields
    if (!booking.id) issues.push('Missing booking ID');
    if (!booking.userId) issues.push('Missing user ID');
    if (!booking.listingId) issues.push('Missing listing ID');
    if (!booking.date) issues.push('Missing booking date');
    if (!booking.totalPrice || booking.totalPrice <= 0) issues.push('Invalid total price');
    if (!booking.guestCount || booking.guestCount < 1) issues.push('Invalid guest count');
    
    // Duration/hours validation - must have at least 1 hour or 1 day duration
    if (booking.hours && booking.hours.length === 0) {
        issues.push('Hourly booking must have at least one hour selected');
    }
    if (booking.duration !== undefined && booking.duration < 1) {
        issues.push('Duration must be at least 1');
    }
    // For hourly bookings without explicit hours, check duration
    if (!booking.hours && (!booking.duration || booking.duration < 1)) {
        issues.push('Booking must have valid hours or duration');
    }
    
    // Date validation
    const today = new Date().toISOString().split('T')[0];
    if (booking.date < today) {
        issues.push('Booking date is in the past');
    }
    
    // Price sanity check
    if (booking.totalPrice > 100000000) { // 100M limit
        issues.push('Total price exceeds maximum allowed');
    }
    
    return {
        valid: issues.length === 0,
        issues: issues.length > 0 ? issues : undefined
    };
};

/**
 * Log a security event for booking operations
 */
export const logSecurityEvent = (
    eventType: string,
    userId: string,
    details: Record<string, any>
): void => {
    logAuditEvent({
        action: 'BOOKING_CREATED',
        userId,
        success: false,
        metadata: {
            securityEvent: eventType,
            ...details
        }
    });
    
    // Also log to console in development
    console.warn(`🔐 SECURITY: ${eventType}`, { userId, ...details });
};
