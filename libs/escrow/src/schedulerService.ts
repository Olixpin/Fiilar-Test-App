import { getBookings, updateBooking, getListings } from '@fiilar/storage';
import { PricingModel } from '@fiilar/types';
import { escrowService } from './escrowService';
import { addNotification } from '@fiilar/notifications';

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
export const startAutoReleaseScheduler = (onRelease?: (bookingId: string, amount: number) => void, onAutoCancel?: (bookingId: string, reason: string) => void, onAutoComplete?: (bookingId: string) => void) => {
    console.log('🤖 Auto-release scheduler started');

    // Run immediately on start
    checkAndReleaseEligibleBookings(onRelease);
    checkAndAutoCancelPendingBookings(onAutoCancel);
    checkAndAutoCompleteStartedBookings(onAutoComplete);
    checkAndNotifyUpcomingPayouts();

    // Then run every minute (60000ms)
    // In production: every hour (3600000ms) or daily
    schedulerInterval = setInterval(() => {
        checkAndReleaseEligibleBookings(onRelease);
        checkAndAutoCancelPendingBookings(onAutoCancel);
        checkAndAutoCompleteStartedBookings(onAutoComplete);
        checkAndNotifyUpcomingPayouts();
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
 * Manually trigger the auto-complete check (for testing/admin)
 */
export const triggerManualCompleteCheck = async (onAutoComplete?: (bookingId: string) => void) => {
    console.log('🔄 Manual complete check triggered');
    await checkAndAutoCompleteStartedBookings(onAutoComplete);
};

/**
 * Core logic: Check all bookings and release eligible ones
 * Release date is recalculated dynamically based on current config
 */
const checkAndReleaseEligibleBookings = async (onRelease?: (bookingId: string, amount: number) => void) => {
    try {
        const bookings = getBookings();
        const listings = getListings();
        const now = new Date();

        let releasedCount = 0;

        for (const booking of bookings) {
            // Only check bookings in escrow
            if (booking.paymentStatus !== 'Paid - Escrow') continue;

            // Find the listing to get pricing model and config
            const listing = listings.find(l => l.id === booking.listingId);
            if (!listing) {
                console.error(`Listing not found for booking ${booking.id}`);
                continue;
            }

            // Recalculate release date dynamically (applies latest config)
            const calculatedReleaseDate = escrowService.calculateReleaseDate(
                booking.date,
                booking.hours,
                booking.duration,
                {
                    pricingModel: listing.pricingModel,
                    bookingConfig: listing.bookingConfig
                }
            );
            const releaseDate = new Date(calculatedReleaseDate);

            // Update stored release date if different (for UI consistency)
            if (booking.escrowReleaseDate !== calculatedReleaseDate) {
                updateBooking({
                    ...booking,
                    escrowReleaseDate: calculatedReleaseDate
                });
                console.log(`📅 Updated release date for booking ${booking.id}: ${releaseDate.toLocaleString()}`);
            }

            // Check if eligible for release
            if (releaseDate <= now) {
                console.log(`💰 Auto-releasing funds for booking ${booking.id}`);

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

                        const hostPayout = booking.totalPrice - booking.serviceFee - booking.cautionFee;

                        // 🔔 Notify host: Funds released
                        addNotification({
                            userId: listing.hostId,
                            type: 'booking',
                            title: 'Payment Received',
                            message: `Your payout of ${hostPayout.toLocaleString('en-US', { style: 'currency', currency: 'NGN' })} for booking has been released to your account.`,
                            severity: 'info',
                            read: false,
                            actionRequired: false,
                            metadata: {
                                bookingId: booking.id,
                                listingId: booking.listingId,
                                amount: hostPayout,
                                transactionId: result.transactionId
                            }
                        });

                        // Notify callback (for UI updates)
                        if (onRelease) {
                            onRelease(booking.id, hostPayout);
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
 * Check and auto-complete Started bookings when their end time has passed
 * This handles the automatic transition from Started -> Completed
 * 
 * Industry Standard End Times:
 * - NIGHTLY: checkOutTime on the last day (date + duration days)
 *   Example: 2-night stay starting Jan 1 → checkout Jan 3 at 11:00
 * - DAILY: accessEndTime on the last booked day (date + duration - 1 days)
 *   Example: 2-day booking Jan 1 → access ends Jan 2 at 23:00
 * - HOURLY: End of the last booked hour on the booking date
 *   Example: Hours [9,10,11] → ends at 12:00
 */
const checkAndAutoCompleteStartedBookings = async (onAutoComplete?: (bookingId: string) => void) => {
    try {
        const bookings = getBookings();
        const listings = getListings();
        const now = new Date();

        let completedCount = 0;

        for (const booking of bookings) {
            // Only check Started bookings
            if (booking.status !== 'Started') continue;

            // Get the listing to access bookingConfig
            const listing = listings.find(l => l.id === booking.listingId);
            if (!listing) {
                console.warn(`Listing not found for booking ${booking.id}, skipping auto-complete check`);
                continue;
            }

            // Calculate end time based on listing's pricing model and config
            const bookingDate = new Date(booking.date);
            let endTime: Date;
            const pricingModel = listing.pricingModel || PricingModel.DAILY; // Default to DAILY for legacy bookings

            if (pricingModel === PricingModel.HOURLY && booking.hours && booking.hours.length > 0) {
                // HOURLY: End of the last booked hour
                // Example: Hours [9,10,11] → session ends at 12:00
                const lastHour = Math.max(...booking.hours);
                endTime = new Date(bookingDate);
                endTime.setHours(lastHour + 1, 0, 0, 0);
                
            } else if (pricingModel === PricingModel.NIGHTLY) {
                // NIGHTLY: Use checkOutTime from listing config on the checkout date
                // Checkout date = start date + duration (nights)
                // Example: 2-night stay starting Jan 1 → checkout Jan 3 at 11:00
                const config = listing.bookingConfig as { checkOutTime?: string };
                const checkOutTime = config?.checkOutTime || '11:00'; // Default 11:00 AM
                const [checkOutHour, checkOutMinute] = checkOutTime.split(':').map(Number);
                
                endTime = new Date(bookingDate);
                endTime.setDate(endTime.getDate() + (booking.duration || 1)); // Add nights to get checkout day
                endTime.setHours(checkOutHour, checkOutMinute, 0, 0);
                
            } else {
                // DAILY: Use accessEndTime from listing config on the last day
                // Last day = start date + duration - 1 (since we count from day 1)
                // Example: 2-day booking Jan 1 → last day is Jan 2, access ends at accessEndTime
                const config = listing.bookingConfig as { accessEndTime?: string };
                const accessEndTime = config?.accessEndTime || '23:00'; // Default 11:00 PM
                const [endHour, endMinute] = accessEndTime.split(':').map(Number);
                
                endTime = new Date(bookingDate);
                endTime.setDate(endTime.getDate() + (booking.duration || 1) - 1); // Last day of booking
                endTime.setHours(endHour, endMinute, 0, 0);
            }

            // Check if end time has passed
            if (now >= endTime) {
                console.log(`✅ Auto-completing booking ${booking.id} (${pricingModel}) - session ended at ${endTime.toLocaleString()}`);

                try {
                    // Update booking status to Completed
                    updateBooking({
                        ...booking,
                        status: 'Completed'
                    });

                    completedCount++;

                    // 🔔 Notify guest: Booking completed + review reminder
                    addNotification({
                        userId: booking.userId,
                        type: 'booking',
                        title: 'Booking Completed',
                        message: `Your booking at ${listing.title} has ended. We hope you had a great experience!`,
                        severity: 'info',
                        read: false,
                        actionRequired: false,
                        metadata: {
                            bookingId: booking.id,
                            listingId: booking.listingId
                        }
                    });

                    // 🔔 Notify guest: Review reminder (industry standard)
                    addNotification({
                        userId: booking.userId,
                        type: 'review',
                        title: 'Leave a Review',
                        message: `How was your experience at ${listing.title}? Share your feedback to help other guests.`,
                        severity: 'info',
                        read: false,
                        actionRequired: true,
                        metadata: {
                            bookingId: booking.id,
                            listingId: booking.listingId,
                            reviewType: 'guest_to_host'
                        }
                    });

                    // 🔔 Notify host: Booking completed
                    addNotification({
                        userId: listing.hostId,
                        type: 'booking',
                        title: 'Booking Completed',
                        message: `The booking for ${listing.title} has ended. Funds will be released to your account soon.`,
                        severity: 'info',
                        read: false,
                        actionRequired: false,
                        metadata: {
                            bookingId: booking.id,
                            listingId: booking.listingId,
                            guestId: booking.userId
                        }
                    });

                    // Notify callback (for UI updates/notifications)
                    if (onAutoComplete) {
                        onAutoComplete(booking.id);
                    }

                    console.log(`✅ Successfully auto-completed booking ${booking.id}`);
                } catch (error) {
                    console.error(`Failed to auto-complete booking ${booking.id}:`, error);
                }
            } else {
                console.log(`⏳ Booking ${booking.id} (${pricingModel}) will auto-complete after ${endTime.toLocaleString()}`);
            }
        }

        if (completedCount > 0) {
            console.log(`🎉 Auto-completed ${completedCount} Started booking(s)`);
        }

        return completedCount;
    } catch (error) {
        console.error('Error in auto-complete check:', error);
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

                    // Get listing for notification context
                    const listings = getListings();
                    const listing = listings.find(l => l.id === booking.listingId);
                    const listingTitle = listing?.title || 'your listing';

                    // 🔔 Notify guest: Booking auto-cancelled
                    addNotification({
                        userId: booking.userId,
                        type: 'booking',
                        title: 'Booking Request Expired',
                        message: `Your booking request for ${listingTitle} was automatically cancelled because the host did not respond in time. ${booking.paymentStatus === 'Paid - Escrow' ? 'Your payment has been refunded.' : ''}`,
                        severity: 'warning',
                        read: false,
                        actionRequired: false,
                        metadata: {
                            bookingId: booking.id,
                            listingId: booking.listingId,
                            reason: 'host_no_response',
                            refunded: booking.paymentStatus === 'Paid - Escrow'
                        }
                    });

                    // 🔔 Notify host: Missed booking opportunity
                    if (listing) {
                        addNotification({
                            userId: listing.hostId,
                            type: 'booking',
                            title: 'Booking Request Expired',
                            message: `A booking request for ${listingTitle} was automatically cancelled because you did not respond within ${isSameDayBooking ? AUTO_CANCEL_HOURS.SAME_DAY : AUTO_CANCEL_HOURS.STANDARD} hours.`,
                            severity: 'warning',
                            read: false,
                            actionRequired: false,
                            metadata: {
                                bookingId: booking.id,
                                listingId: booking.listingId,
                                reason: 'no_response_timeout'
                            }
                        });
                    }

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
 * Storage key to track which payouts we've already notified about
 */
const PAYOUT_NOTIFICATION_KEY = 'fiilar_payout_notifications_sent';

/**
 * Check for upcoming payouts within 24 hours and notify hosts
 * Prevents duplicate notifications by tracking which bookings have been notified
 */
const checkAndNotifyUpcomingPayouts = async () => {
    try {
        const bookings = getBookings();
        const listings = getListings();
        const now = new Date();
        const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        // Get already notified booking IDs
        const notifiedRaw = localStorage.getItem(PAYOUT_NOTIFICATION_KEY);
        const notifiedBookings: string[] = notifiedRaw ? JSON.parse(notifiedRaw) : [];

        let notifiedCount = 0;

        for (const booking of bookings) {
            // Only check bookings in escrow with a release date
            if (booking.paymentStatus !== 'Paid - Escrow' || !booking.escrowReleaseDate) continue;

            // Skip if already notified
            if (notifiedBookings.includes(booking.id)) continue;

            const releaseDate = new Date(booking.escrowReleaseDate);

            // Check if release is within 24 hours but not yet due
            if (releaseDate > now && releaseDate <= twentyFourHoursFromNow) {
                const listing = listings.find(l => l.id === booking.listingId);
                if (!listing) continue;

                const hostPayout = booking.totalPrice - booking.serviceFee - booking.cautionFee;
                const hoursUntilRelease = Math.round((releaseDate.getTime() - now.getTime()) / (1000 * 60 * 60));

                // 🔔 Notify host: Payout upcoming
                addNotification({
                    userId: listing.hostId,
                    type: 'booking',
                    title: 'Payout Scheduled',
                    message: `Your payout of ${hostPayout.toLocaleString('en-US', { style: 'currency', currency: 'NGN' })} for ${listing.title} will be released in approximately ${hoursUntilRelease} hours.`,
                    severity: 'info',
                    read: false,
                    actionRequired: false,
                    metadata: {
                        bookingId: booking.id,
                        listingId: booking.listingId,
                        amount: hostPayout
                    }
                });

                // Mark as notified
                notifiedBookings.push(booking.id);
                notifiedCount++;

                console.log(`📅 Notified host about upcoming payout for booking ${booking.id}`);
            }
        }

        // Save updated notified list
        if (notifiedCount > 0) {
            localStorage.setItem(PAYOUT_NOTIFICATION_KEY, JSON.stringify(notifiedBookings));
            console.log(`📅 Sent ${notifiedCount} upcoming payout notification(s)`);
        }

        // Clean up old entries (remove bookings that are no longer in escrow)
        const activeBookingIds = bookings
            .filter(b => b.paymentStatus === 'Paid - Escrow')
            .map(b => b.id);
        const cleanedNotifications = notifiedBookings.filter(id => activeBookingIds.includes(id));
        if (cleanedNotifications.length !== notifiedBookings.length) {
            localStorage.setItem(PAYOUT_NOTIFICATION_KEY, JSON.stringify(cleanedNotifications));
        }

        return notifiedCount;
    } catch (error) {
        console.error('Error in upcoming payout check:', error);
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
