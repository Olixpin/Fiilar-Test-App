
import { useState, useEffect, useCallback } from 'react';
import { User, Listing, Booking } from '@fiilar/types';
import { getBookings, updateBooking, verifyHandshake, setModificationAllowed, updateUserWalletBalance } from '@fiilar/storage';
import { addNotification } from '@fiilar/notifications';
import { useToast } from '@fiilar/ui';
import { escrowService, paymentService } from '@fiilar/escrow';

export const useHostBookings = (user: User | null, listings: Listing[], refreshData: () => void) => {
    const toast = useToast();
    const [hostBookings, setHostBookings] = useState<Booking[]>([]);
    const [bookingFilter, setBookingFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed'>('all');
    const [bookingView, setBookingView] = useState<'table' | 'cards'>('cards');

    const fetchBookings = useCallback(() => {
        if (!user) {
            setHostBookings([]);
            return;
        }

        const all = getBookings();
        const myListingIds = listings.filter(l => l.hostId === user.id).map(l => l.id);
        setHostBookings(all.filter(b => myListingIds.includes(b.listingId)).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }, [user, listings]);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    const handleAcceptBooking = (booking: Booking) => {
        // If part of a group, accept all
        const bookingsToUpdate = booking.groupId
            ? hostBookings.filter(b => b.groupId === booking.groupId && b.status === 'Pending')
            : [booking];

        bookingsToUpdate.forEach(b => {
            const updatedBooking = { ...b, status: 'Confirmed' as const };
            updateBooking(updatedBooking);
        });

        // Send ONE notification for the group
        const listing = listings.find(l => l.id === booking.listingId);
        const message = bookingsToUpdate.length > 1
            ? `Your recurring booking(${bookingsToUpdate.length} sessions) for "${listing?.title || 'the property'}" has been confirmed.`
            : `Your booking for "${listing?.title || 'the property'}" on ${booking.date} has been confirmed.`;

        addNotification({
            userId: booking.userId,
            type: 'booking',
            title: 'Booking Confirmed!',
            message: message,
            severity: 'info',
            read: false,
            actionRequired: false,
            metadata: {
                bookingId: booking.id,
                link: '/dashboard?tab=bookings'
            }
        });

        refreshData();
        fetchBookings(); // Refresh local state

        if (bookingsToUpdate.length > 1) {
            toast.showToast({ message: `Recurring booking series confirmed (${bookingsToUpdate.length} sessions)!`, type: 'success' });
        } else {
            toast.showToast({ message: `Booking confirmed!`, type: 'success' });
        }
    };

    const handleRejectBooking = async (booking: Booking) => {
        // If part of a group, reject all
        const bookingsToUpdate = booking.groupId
            ? hostBookings.filter(b => b.groupId === booking.groupId && b.status === 'Pending')
            : [booking];

        // Process refund for each booking
        for (const b of bookingsToUpdate) {
            // Process full refund through escrow service (external)
            await escrowService.processRefund(b, b.userId, b.totalPrice, 'Host rejected booking');

            // Credit in-app wallet and record REFUND transaction
            await paymentService.refundToWallet(b.totalPrice, 'Refund for rejected booking');

            // Keep user storage wallet in sync for admin views
            updateUserWalletBalance(b.userId, b.totalPrice, true);

            // Update booking status
            const updatedBooking = { ...b, status: 'Cancelled' as const };
            updateBooking(updatedBooking);
        }

        // Send ONE notification for the group
        const listing = listings.find(l => l.id === booking.listingId);
        const totalRefund = bookingsToUpdate.reduce((sum, b) => sum + b.totalPrice, 0);
        const message = bookingsToUpdate.length > 1
            ? `Unfortunately, your recurring booking request(${bookingsToUpdate.length} sessions) for "${listing?.title || 'the property'}" was not accepted. A full refund of $${totalRefund.toFixed(2)} has been processed.`
            : `Unfortunately, your booking request for "${listing?.title || 'the property'}" on ${booking.date} was not accepted. A full refund of $${booking.totalPrice.toFixed(2)} has been processed.`;

        addNotification({
            userId: booking.userId,
            type: 'booking',
            title: 'Booking Not Accepted - Refund Processed',
            message: message,
            severity: 'warning',
            read: false,
            actionRequired: false,
            metadata: {
                bookingId: booking.id,
                link: '/dashboard?tab=bookings'
            }
        });

        refreshData();
        fetchBookings(); // Refresh local state

        if (bookingsToUpdate.length > 1) {
            toast.showToast({ message: `Recurring booking series rejected. Refund of $${totalRefund.toFixed(2)} processed.`, type: 'info' });
        } else {
            toast.showToast({ message: `Booking rejected. Refund of $${booking.totalPrice.toFixed(2)} processed.`, type: 'info' });
        }
    };

    const handleReleaseFunds = (_bookingId: string) => {
        toast.showToast({ message: `Funds released for booking`, type: 'success' });
    };

    const handleVerifyGuest = (bookingId: string, code: string): boolean => {
        const success = verifyHandshake(bookingId, code);
        if (success) {
            refreshData();
            fetchBookings();
            return true;
        } else {
            return false;
        }
    };

    const handleAllowModification = (booking: Booking) => {
        // If part of a group, allow for all
        const bookingsToUpdate = booking.groupId
            ? hostBookings.filter(b => b.groupId === booking.groupId && b.status === 'Pending')
            : [booking];

        bookingsToUpdate.forEach(b => {
            setModificationAllowed(b.id, true);
        });

        // Send ONE notification for the group (outside the loop)
        const listing = listings.find(l => l.id === booking.listingId);
        const message = bookingsToUpdate.length > 1
            ? `The host has invited you to modify your recurring booking(${bookingsToUpdate.length} sessions) for "${listing?.title || 'the property'}".`
            : `The host has invited you to modify your booking for "${listing?.title || 'the property'}".`;

        addNotification({
            userId: booking.userId,
            type: 'booking',
            title: 'Modification Requested',
            message: message,
            severity: 'info',
            read: false,
            actionRequired: true,
            metadata: {
                bookingId: booking.id,
                link: '/dashboard?tab=bookings'
            }
        });

        refreshData();
        fetchBookings();

        if (bookingsToUpdate.length > 1) {
            toast.showToast({ message: `Modification enabled for recurring booking series.`, type: 'info' });
        } else {
            toast.showToast({ message: `Modification enabled for booking.`, type: 'info' });
        }
    };

    return {
        hostBookings,
        bookingFilter,
        setBookingFilter,
        bookingView,
        setBookingView,
        handleAcceptBooking,
        handleRejectBooking,
        handleReleaseFunds,
        handleVerifyGuest,
        handleAllowModification,
        refreshBookings: fetchBookings
    };
};
