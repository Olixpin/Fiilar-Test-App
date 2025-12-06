// Booking Cancellation Service
// Handles cancellation logic, refund calculations, and policy enforcement

import { Booking, CancellationPolicy } from '@fiilar/types';
import { escrowService, paymentService } from '@fiilar/escrow';
import { updateBooking, updateUserWalletBalance } from '@fiilar/storage';
import { addNotification } from '@fiilar/notifications';

export interface CancellationResult {
    refundPercentage: number;
    refundAmount: number;
    cancellationFee: number;
    canCancel: boolean;
    reason?: string;
    hoursUntilBooking: number;
}

/**
 * Calculate refund amount based on cancellation policy and time remaining
 * NOTE: Service fee (userServiceFee) is ALWAYS 100% refunded regardless of cancellation policy
 */
export const calculateRefund = (
    booking: Booking,
    policy: CancellationPolicy
): CancellationResult => {
    const now = new Date();
    const bookingDate = new Date(booking.date);
    const hoursUntil = (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    let refundPercentage = 0;
    let canCancel = true;
    let reason = '';

    // Check if booking is in the past
    if (hoursUntil < 0) {
        return {
            refundPercentage: 0,
            refundAmount: 0,
            cancellationFee: booking.totalPrice,
            canCancel: false,
            reason: 'Cannot cancel past bookings',
            hoursUntilBooking: hoursUntil
        };
    }

    // Check if booking is already cancelled or completed
    if (booking.status === 'Cancelled' || booking.status === 'Completed') {
        return {
            refundPercentage: 0,
            refundAmount: 0,
            cancellationFee: booking.totalPrice,
            canCancel: false,
            reason: `Booking is already ${booking.status.toLowerCase()}`,
            hoursUntilBooking: hoursUntil
        };
    }

    // Apply cancellation policy
    switch (policy) {
        case 'Flexible':
            if (hoursUntil >= 24) {
                refundPercentage = 100;
            } else if (hoursUntil >= 12) {
                refundPercentage = 50;
                reason = '50% refund applied (cancelled 12-24h before)';
            } else {
                refundPercentage = 0;
                reason = 'No refund (cancelled less than 12h before)';
            }
            break;

        case 'Moderate':
            if (hoursUntil >= 168) { // 7 days
                refundPercentage = 100;
            } else if (hoursUntil >= 48) {
                refundPercentage = 50;
                reason = '50% refund applied (cancelled 2-7 days before)';
            } else {
                refundPercentage = 0;
                reason = 'No refund (cancelled less than 48h before)';
            }
            break;

        case 'Strict':
            if (hoursUntil >= 336) { // 14 days
                refundPercentage = 50;
                reason = '50% refund applied (Strict policy)';
            } else {
                refundPercentage = 0;
                reason = 'No refund (cancelled less than 14 days before)';
            }
            break;

        case 'Non-refundable':
            refundPercentage = 0;
            reason = 'Non-refundable booking';
            break;

        default:
            refundPercentage = 0;
            reason = 'Cancellation policy not specified';
    }

    // Calculate base refund from booking price (excluding service fee)
    // Service fee is ALWAYS 100% refunded regardless of cancellation policy
    const serviceFeePaid = booking.userServiceFee || 0;
    const bookingPriceWithoutServiceFee = booking.totalPrice - serviceFeePaid;
    
    // Base refund = price without service fee * refund percentage
    const baseRefund = bookingPriceWithoutServiceFee * (refundPercentage / 100);
    
    // Per PAYMENT_STRUCTURE.md: "Service fee 100% refunded on any cancellation"
    // This means even if the booking portion is not refundable, the service fee should be refunded
    const refundAmount = baseRefund + serviceFeePaid;
    const cancellationFee = booking.totalPrice - refundAmount;

    return {
        refundPercentage,
        refundAmount,
        cancellationFee,
        canCancel,
        hoursUntilBooking: hoursUntil,
        reason: reason || (refundPercentage === 0 ? 'No refund available for this cancellation' : undefined)
    };
};

/**
 * Calculate aggregate refund for a group of bookings (e.g. recurring series)
 * using the earliest booking in the group as the policy reference.
 */
export const calculateGroupRefund = (
    bookings: Booking[],
    policy: CancellationPolicy
): CancellationResult & { totalOriginalAmount: number } => {
    if (!bookings.length) {
        return {
            refundPercentage: 0,
            refundAmount: 0,
            cancellationFee: 0,
            canCancel: false,
            hoursUntilBooking: 0,
            reason: 'No bookings to cancel',
            totalOriginalAmount: 0
        };
    }

    // Use the earliest booking as the reference for policy timing
    const sorted = [...bookings].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const reference = sorted[0];
    const singleResult = calculateRefund(reference, policy);

    const totalOriginalAmount = bookings.reduce((sum, b) => sum + b.totalPrice, 0);
    const refundAmount = totalOriginalAmount * (singleResult.refundPercentage / 100);
    const cancellationFee = totalOriginalAmount - refundAmount;

    return {
        ...singleResult,
        refundAmount,
        cancellationFee,
        totalOriginalAmount
    };
};

/**
 * Process booking cancellation
 */
export const processCancellation = async (
    booking: Booking,
    userId: string,
    reason: string,
    refundAmount: number
): Promise<{ success: boolean; message: string }> => {
    try {
        // Update booking with cancellation details
        const updatedBooking: Booking = {
            ...booking,
            status: 'Cancelled',
            cancellationReason: reason,
            cancelledAt: new Date().toISOString(),
            cancelledBy: userId,
            refundAmount,
            refundProcessed: refundAmount > 0,
            paymentStatus: refundAmount > 0 ? 'Refunded' : booking.paymentStatus
        };

        updateBooking(updatedBooking);

        // Process refund if applicable
        if (refundAmount > 0) {
            // External refund via escrow/payment provider
            await escrowService.processRefund(booking, userId, refundAmount);

            // Credit in-app wallet and record REFUND transaction
            await paymentService.refundToWallet(refundAmount, 'Refund for guest cancellation');

            // Keep user storage wallet in sync for admin views
            updateUserWalletBalance(booking.userId, refundAmount, true);
        }

        // Get listing details for notifications
        const listings = JSON.parse(localStorage.getItem('fiilar_listings') || '[]');
        const listing = listings.find((l: any) => l.id === booking.listingId);

        // Notify guest
        addNotification({
            userId: booking.userId,
            type: 'booking',
            title: 'Booking Cancelled',
            message: refundAmount > 0
                ? `Your booking has been cancelled. Refund of $${refundAmount.toFixed(2)} processed.`
                : 'Your booking has been cancelled. No refund available.',
            severity: 'info',
            read: false,
            actionRequired: false,
            metadata: {
                bookingId: booking.id,
                amount: refundAmount,
                link: '/dashboard?tab=bookings'
            }
        });

        // Notify host
        if (listing) {
            const users = JSON.parse(localStorage.getItem('fiilar_users') || '[]');
            const guest = users.find((u: any) => u.id === booking.userId);

            addNotification({
                userId: listing.hostId,
                type: 'booking',
                title: 'Booking Cancelled',
                message: `${guest?.name || 'A guest'} cancelled their booking for "${listing.title}"`,
                severity: 'warning',
                read: false,
                actionRequired: false,
                metadata: {
                    bookingId: booking.id,
                    link: '/dashboard?view=bookings'
                }
            });
        }

        return {
            success: true,
            message: refundAmount > 0
                ? `Booking cancelled successfully. Refund of $${refundAmount.toFixed(2)} has been processed.`
                : 'Booking cancelled successfully.'
        };
    } catch (error: any) {
        console.error('Cancellation error:', error);
        return {
            success: false,
            message: error.message || 'Failed to process cancellation. Please try again.'
        };
    }
};

/**
 * Process group (series) cancellation.
 * - Cancels all active bookings in the same group for this user.
 * - Applies a single refund/escrow operation for the provided groupRefundAmount.
 */
export const processGroupCancellation = async (
    primaryBooking: Booking,
    group: Booking[],
    userId: string,
    reason: string,
    groupRefundAmount: number
): Promise<{ success: boolean; message: string }> => {
    try {
        const nowIso = new Date().toISOString();

        // Only cancel bookings that are not already cancelled/completed and are in the future
        const now = new Date();
        const cancellable = group.filter(b => {
            const bookingDate = new Date(b.date);
            return (
                b.userId === primaryBooking.userId &&
                b.listingId === primaryBooking.listingId &&
                b.status !== 'Cancelled' &&
                b.status !== 'Completed' &&
                bookingDate.getTime() >= now.getTime()
            );
        });

        cancellable.forEach(b => {
            const updated: Booking = {
                ...b,
                status: 'Cancelled',
                cancellationReason: reason,
                cancelledAt: nowIso,
                cancelledBy: userId,
                // We keep per-booking refundAmount optional; the total is represented by groupRefundAmount
                refundAmount: 0,
                refundProcessed: groupRefundAmount > 0,
                paymentStatus: groupRefundAmount > 0 ? 'Refunded' : b.paymentStatus
            };
            updateBooking(updated);
        });

        // Process refund once for the whole group if applicable
        if (groupRefundAmount > 0) {
            await escrowService.processRefund(primaryBooking, userId, groupRefundAmount);
            await paymentService.refundToWallet(groupRefundAmount, 'Refund for guest series cancellation');
            updateUserWalletBalance(primaryBooking.userId, groupRefundAmount, true);
        }

        // Notifications: use primary booking id as reference
        const listings = JSON.parse(localStorage.getItem('fiilar_listings') || '[]');
        const listing = listings.find((l: any) => l.id === primaryBooking.listingId);

        addNotification({
            userId: primaryBooking.userId,
            type: 'booking',
            title: 'Series Booking Cancelled',
            message: groupRefundAmount > 0
                ? `Your series booking has been cancelled. Refund of $${groupRefundAmount.toFixed(2)} processed.`
                : 'Your series booking has been cancelled. No refund available.',
            severity: 'info',
            read: false,
            actionRequired: false,
            metadata: {
                bookingId: primaryBooking.id,
                amount: groupRefundAmount,
                link: '/dashboard?tab=bookings'
            }
        });

        if (listing) {
            const users = JSON.parse(localStorage.getItem('fiilar_users') || '[]');
            const guest = users.find((u: any) => u.id === primaryBooking.userId);

            addNotification({
                userId: listing.hostId,
                type: 'booking',
                title: 'Series Booking Cancelled',
                message: `${guest?.name || 'A guest'} cancelled their series booking for "${listing.title}"`,
                severity: 'warning',
                read: false,
                actionRequired: false,
                metadata: {
                    bookingId: primaryBooking.id,
                    link: '/dashboard?view=bookings'
                }
            });
        }

        return {
            success: true,
            message: groupRefundAmount > 0
                ? `Series cancelled successfully. Refund of $${groupRefundAmount.toFixed(2)} has been processed.`
                : 'Series cancelled successfully.'
        };
    } catch (error: any) {
        console.error('Group cancellation error:', error);
        return {
            success: false,
            message: error.message || 'Failed to process series cancellation. Please try again.'
        };
    }
};

/**
 * Get cancellation policy description
 */
export const getCancellationPolicyDescription = (policy: CancellationPolicy): string => {
    switch (policy) {
        case 'Flexible':
            return 'Full refund if cancelled 24+ hours before booking. 50% refund if cancelled 12-24 hours before. No refund if cancelled less than 12 hours before.';
        case 'Moderate':
            return 'Full refund if cancelled 7+ days before booking. 50% refund if cancelled 2-7 days before. No refund if cancelled less than 2 days before.';
        case 'Strict':
            return '50% refund if cancelled 14+ days before booking. No refund if cancelled less than 14 days before.';
        case 'Non-refundable':
            return 'No refunds allowed for any cancellations.';
        default:
            return 'Cancellation policy not specified.';
    }
};
