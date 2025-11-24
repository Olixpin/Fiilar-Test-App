import { useState, useEffect, useCallback } from 'react';
import { User, Listing, Booking } from '@fiilar/types';
import { getBookings, updateBooking, addNotification, verifyHandshake, setModificationAllowed } from '../../../services/storage';

export const useHostBookings = (user: User | null, listings: Listing[], refreshData: () => void) => {
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
            ? `Your recurring booking (${bookingsToUpdate.length} sessions) for "${listing?.title || 'the property'}" has been confirmed.`
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
            alert(`Recurring booking series confirmed (${bookingsToUpdate.length} sessions)!`);
        } else {
            alert(`Booking ${booking.id} confirmed!`);
        }
    };

    const handleRejectBooking = (booking: Booking) => {
        // If part of a group, reject all
        const bookingsToUpdate = booking.groupId 
            ? hostBookings.filter(b => b.groupId === booking.groupId && b.status === 'Pending')
            : [booking];

        bookingsToUpdate.forEach(b => {
            const updatedBooking = { ...b, status: 'Cancelled' as const };
            updateBooking(updatedBooking);
        });

        // Send ONE notification for the group
        const listing = listings.find(l => l.id === booking.listingId);
        const message = bookingsToUpdate.length > 1
            ? `Unfortunately, your recurring booking request (${bookingsToUpdate.length} sessions) for "${listing?.title || 'the property'}" was not accepted.`
            : `Unfortunately, your booking request for "${listing?.title || 'the property'}" on ${booking.date} was not accepted.`;

        addNotification({
            userId: booking.userId,
            type: 'booking',
            title: 'Booking Not Accepted',
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
            alert(`Recurring booking series rejected.`);
        } else {
            alert(`Booking ${booking.id} rejected.`);
        }
    };

    const handleReleaseFunds = (bookingId: string) => {
        alert(`Funds released for booking ${bookingId}`);
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
            ? `The host has invited you to modify your recurring booking (${bookingsToUpdate.length} sessions) for "${listing?.title || 'the property'}".`
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
            alert(`Modification enabled for recurring booking series.`);
        } else {
            alert(`Modification enabled for booking ${booking.id}.`);
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
