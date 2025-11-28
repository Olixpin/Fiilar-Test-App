import { getBookings, updateBooking, getListings } from '@fiilar/storage';
import { escrowService } from './escrowService';

/**
 * Auto-Cancel Policy Constants
 * - Standard bookings: 24 hours to respond
 * - Same-day/urgent bookings: 4 hours to respond
 */
const AUTO_CANCEL_HOURS = {
    STANDARD: 24,      // 24 hours for normal bookings
    SAME_DAY: 4,       // 4 hours for same-day bookings
};

/**
 * Mock Scheduler Service
 * In production, this would be a cron job or scheduled task (e.g., AWS Lambda, Vercel Cron)
 * For this demo, we'll run it on app initialization and provide manual trigger
 */

let schedulerInterval: NodeJS.Timeout | null = null;

/**
 * Check for bookings eligible for automatic fund release
 * Runs every minute in the demo (in production: every hour or daily)
 */
export const startAutoReleaseScheduler = (onRelease?: (bookingId: string, amount: number) => void, onAutoCancel?: (bookingId: string, reason: string) => void) => {
    console.log('🤖 Auto-release scheduler started');

    // Run immediately on start
    checkAndReleaseEligibleBookings(onRelease);
    checkAndAutoCancelPendingBookings(onAutoCancel);

    // Then run every minute (60000ms)
    // In production: every hour (3600000ms) or daily
    schedulerInterval = setInterval(() => {
        checkAndReleaseEligibleBookings(onRelease);
        checkAndAutoCancelPendingBookings(onAutoCancel);
    }, 60000); // 1 minute
};

/**
 * Stop the scheduler
 */
export const stopAutoReleaseScheduler = () => {
    if (schedulerInterval) {
        clearInterval(schedulerInterval);
        schedulerInterval = null;
        console.log('🛑 Auto-release scheduler stopped');
    }
};

/**
 * Manually trigger the release check (for testing/admin)
 */
export const triggerManualReleaseCheck = async (onRelease?: (bookingId: string, amount: number) => void) => {
    console.log('🔄 Manual release check triggered');
    await checkAndReleaseEligibleBookings(onRelease);
};

/**
 * Core logic: Check all bookings and release eligible ones
 */
const checkAndReleaseEligibleBookings = async (onRelease?: (bookingId: string, amount: number) => void) => {
    try {
        const bookings = getBookings();
        const listings = getListings();
        const now = new Date();

        let releasedCount = 0;

        for (const booking of bookings) {
            // Check if eligible for release
            if (
                booking.paymentStatus === 'Paid - Escrow' &&
                booking.escrowReleaseDate &&
                new Date(booking.escrowReleaseDate) <= now
            ) {
                console.log(`💰 Auto-releasing funds for booking ${booking.id}`);

                // Find the listing to get host ID
                const listing = listings.find(l => l.id === booking.listingId);
                if (!listing) {
                    console.error(`Listing not found for booking ${booking.id}`);
                    continue;
                }

                try {
                    // Release funds through escrow service
                    const result = await escrowService.releaseFundsToHost(booking, listing.hostId);

                    if (result.success) {
                        // Update booking status
                        const updatedBooking = {
                            ...booking,
                            paymentStatus: 'Released' as const,
                            transactionIds: [...(booking.transactionIds || []), result.transactionId]
                        };
                        updateBooking(updatedBooking);

                        releasedCount++;

                        // Notify callback (for UI updates)
                        if (onRelease) {
                            onRelease(booking.id, booking.totalPrice - booking.serviceFee - booking.cautionFee);
                        }

                        console.log(`✅ Successfully released $${booking.totalPrice} for booking ${booking.id}`);
                    }
                } catch (error) {
                    console.error(`Failed to release funds for booking ${booking.id}:`, error);
                }
            }
        }

        if (releasedCount > 0) {
            console.log(`🎉 Auto-released ${releasedCount} booking(s)`);
        } else {
            console.log('✓ No bookings eligible for release at this time');
        }

        return releasedCount;
    } catch (error) {
        console.error('Error in auto-release scheduler:', error);
        return 0;
    }
};

/**
 * Get upcoming releases (for admin dashboard)
 */
export const getUpcomingReleases = () => {
    const bookings = getBookings();
    const listings = getListings();

    return bookings
        .filter(b => b.paymentStatus === 'Paid - Escrow' && b.escrowReleaseDate)
        .map(booking => {
            const listing = listings.find(l => l.id === booking.listingId);
            const releaseDate = new Date(booking.escrowReleaseDate!);
            const now = new Date();
            const hoursUntilRelease = Math.max(0, (releaseDate.getTime() - now.getTime()) / (1000 * 60 * 60));

            return {
                booking,
                listing,
                releaseDate,
                hoursUntilRelease,
                isOverdue: releaseDate <= now
            };
        })
        .sort((a, b) => a.releaseDate.getTime() - b.releaseDate.getTime());
};

/**
 * Check and auto-cancel pending bookings that exceed the response time limit
 * - Standard bookings: Auto-cancel after 24 hours
 * - Same-day bookings: Auto-cancel after 4 hours
 */
const checkAndAutoCancelPendingBookings = async (onAutoCancel?: (bookingId: string, reason: string) => void) => {
    try {
        const bookings = getBookings();
        const now = new Date();

        let cancelledCount = 0;

        for (const booking of bookings) {
            // Only check pending bookings (not yet confirmed by host)
            if (booking.status !== 'Pending') continue;

            const bookingCreatedAt = new Date(booking.createdAt || booking.date);
            const bookingDate = new Date(booking.date);
            const hoursSinceCreated = (now.getTime() - bookingCreatedAt.getTime()) / (1000 * 60 * 60);

            // Determine if this is a same-day/urgent booking
            const isSameDayBooking = bookingDate.toDateString() === now.toDateString() ||
                (bookingDate.getTime() - now.getTime()) < (24 * 60 * 60 * 1000); // Within 24 hours

            const autoCancelThreshold = isSameDayBooking
                ? AUTO_CANCEL_HOURS.SAME_DAY
                : AUTO_CANCEL_HOURS.STANDARD;

            if (hoursSinceCreated >= autoCancelThreshold) {
                console.log(`⏰ Auto-cancelling booking ${booking.id} - exceeded ${autoCancelThreshold} hour response time`);

                try {
                    const cancelReason = isSameDayBooking
                        ? `Auto-cancelled: Host did not respond within ${AUTO_CANCEL_HOURS.SAME_DAY} hours (same-day booking policy)`
                        : `Auto-cancelled: Host did not respond within ${AUTO_CANCEL_HOURS.STANDARD} hours`;

                    // Refund the user if payment was made
                    if (booking.paymentStatus === 'Paid - Escrow') {
                        const refundAmount = booking.totalPrice;
                        await escrowService.processRefund(
                            booking,
                            booking.userId,
                            refundAmount,
                            cancelReason
                        );
                        console.log(`💸 Refunded ${refundAmount} to user ${booking.userId} for auto-cancelled booking`);
                    }

                    // Update booking status
                    updateBooking({
                        ...booking,
                        status: 'Cancelled',
                        paymentStatus: booking.paymentStatus === 'Paid - Escrow' ? 'Refunded' : booking.paymentStatus,
                        cancellationReason: cancelReason,
                        cancelledAt: now.toISOString(),
                        cancelledBy: 'system'
                    });

                    cancelledCount++;

                    // Notify callback (for UI updates/notifications)
                    if (onAutoCancel) {
                        onAutoCancel(booking.id, cancelReason);
                    }

                    console.log(`✅ Successfully auto-cancelled booking ${booking.id}`);
                } catch (error) {
                    console.error(`Failed to auto-cancel booking ${booking.id}:`, error);
                }
            }
        }

        if (cancelledCount > 0) {
            console.log(`🚫 Auto-cancelled ${cancelledCount} pending booking(s) due to no host response`);
        }

        return cancelledCount;
    } catch (error) {
        console.error('Error in auto-cancel check:', error);
        return 0;
    }
};

/**
 * Get pending bookings approaching auto-cancel deadline (for host warnings)
 */
export const getPendingBookingsNearDeadline = () => {
    const bookings = getBookings();
    const listings = getListings();
    const now = new Date();

    return bookings
        .filter(b => b.status === 'Pending')
        .map(booking => {
            const listing = listings.find(l => l.id === booking.listingId);
            const bookingCreatedAt = new Date(booking.createdAt || booking.date);
            const bookingDate = new Date(booking.date);
            const hoursSinceCreated = (now.getTime() - bookingCreatedAt.getTime()) / (1000 * 60 * 60);

            // Determine deadline
            const isSameDayBooking = bookingDate.toDateString() === now.toDateString() ||
                (bookingDate.getTime() - now.getTime()) < (24 * 60 * 60 * 1000);
            const deadline = isSameDayBooking ? AUTO_CANCEL_HOURS.SAME_DAY : AUTO_CANCEL_HOURS.STANDARD;
            const hoursRemaining = Math.max(0, deadline - hoursSinceCreated);

            return {
                booking,
                listing,
                isSameDayBooking,
                deadline,
                hoursSinceCreated,
                hoursRemaining,
                isUrgent: hoursRemaining <= 2, // Less than 2 hours remaining
                deadlineAt: new Date(bookingCreatedAt.getTime() + deadline * 60 * 60 * 1000)
            };
        })
        .filter(b => b.hoursRemaining > 0) // Only show ones not yet cancelled
        .sort((a, b) => a.hoursRemaining - b.hoursRemaining); // Most urgent first
};
