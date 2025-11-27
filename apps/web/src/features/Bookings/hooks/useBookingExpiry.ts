import { useEffect } from 'react';
import { getBookings, saveBooking, getUserById, saveUser, BOOKING_CONFIG } from '@fiilar/storage';
import { escrowService } from '@fiilar/escrow';
import { addNotification } from '@fiilar/notifications';

export const useBookingExpiry = () => {
    useEffect(() => {
        const checkExpiry = async () => {
            const bookings = getBookings();
            const now = new Date();
            let hasChanges = false;

            for (const booking of bookings) {
                if (booking.status === 'Pending') {
                    if (!booking.createdAt) continue;

                    const created = new Date(booking.createdAt);
                    const diff = now.getTime() - created.getTime();
                    const expiryMs = BOOKING_CONFIG.BOOKING_EXPIRY_HOURS * 60 * 60 * 1000;

                    if (diff > expiryMs) {
                        // Expire booking
                        booking.status = 'Cancelled';
                        booking.cancellationReason = `Request expired (Host did not respond in ${BOOKING_CONFIG.BOOKING_EXPIRY_HOURS} hour)`;
                        booking.cancelledBy = 'system';
                        booking.cancelledAt = now.toISOString();

                        // Process refund through escrow service for audit trail
                        await escrowService.processRefund(
                            booking, 
                            booking.userId, 
                            booking.totalPrice, 
                            'Automatic expiry refund - Host did not respond'
                        );

                        // Update user wallet balance
                        const user = getUserById(booking.userId);
                        if (user) {
                            user.walletBalance = (user.walletBalance || 0) + booking.totalPrice;
                            saveUser(user);
                        }

                        saveBooking(booking);
                        
                        // Notify the user
                        addNotification({
                            userId: booking.userId,
                            type: 'booking',
                            title: 'Booking Request Expired',
                            message: `Your booking request has expired as the host did not respond within 1 hour. A full refund of $${booking.totalPrice.toFixed(2)} has been processed to your wallet.`,
                            severity: 'info',
                            read: false,
                            actionRequired: false,
                            metadata: {
                                bookingId: booking.id,
                                link: '/dashboard?tab=bookings'
                            }
                        });
                        
                        hasChanges = true;
                    }
                }
            }

            if (hasChanges) {
                console.log("Expired bookings processed with refunds.");
                window.dispatchEvent(new Event('fiilar:listings-updated')); // Trigger refresh
            }
        };

        checkExpiry(); // Run immediately
        const interval = setInterval(checkExpiry, 60 * 1000); // Run every minute

        return () => clearInterval(interval);
    }, []);
};
