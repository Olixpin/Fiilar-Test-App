import { useEffect } from 'react';
import { getBookings, saveBooking, getUserById, saveUser } from '@fiilar/storage';

export const useBookingExpiry = () => {
    useEffect(() => {
        const checkExpiry = () => {
            const bookings = getBookings();
            const now = new Date();
            let hasChanges = false;

            bookings.forEach(booking => {
                if (booking.status === 'Pending') {
                    if (!booking.createdAt) return;

                    const created = new Date(booking.createdAt);
                    const diff = now.getTime() - created.getTime();
                    const oneHour = 60 * 60 * 1000;

                    if (diff > oneHour) {
                        // Expire booking
                        booking.status = 'Cancelled';
                        booking.cancellationReason = "Request expired (Host did not respond in 1 hour)";
                        booking.cancelledBy = 'system';
                        booking.cancelledAt = now.toISOString();

                        // Refund user
                        const user = getUserById(booking.userId);
                        if (user) {
                            user.walletBalance = (user.walletBalance || 0) + booking.totalPrice;
                            saveUser(user);
                        }

                        saveBooking(booking);
                        hasChanges = true;
                    }
                }
            });

            if (hasChanges) {
                console.log("Expired bookings processed.");
                window.dispatchEvent(new Event('fiilar:listings-updated')); // Trigger refresh
            }
        };

        checkExpiry(); // Run immediately
        const interval = setInterval(checkExpiry, 60 * 1000); // Run every minute

        return () => clearInterval(interval);
    }, []);
};
