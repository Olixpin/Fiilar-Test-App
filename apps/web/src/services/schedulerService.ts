import { getBookings, getListings, updateBooking } from './storage';
import { escrowService } from './escrowService';

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
export const startAutoReleaseScheduler = (onRelease?: (bookingId: string, amount: number) => void) => {
    console.log('🤖 Auto-release scheduler started');

    // Run immediately on start
    checkAndReleaseEligibleBookings(onRelease);

    // Then run every minute (60000ms)
    // In production: every hour (3600000ms) or daily
    schedulerInterval = setInterval(() => {
        checkAndReleaseEligibleBookings(onRelease);
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
