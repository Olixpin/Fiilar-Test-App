import { getBookings } from '@fiilar/storage';

/**
 * Remove duplicate bookings from localStorage.
 * Keeps only the first occurrence of each booking ID.
 */
export const removeDuplicateBookings = () => {
    const bookings = getBookings();
    const seenIds = new Set<string>();
    const uniqueBookings = [];
    let duplicatesRemoved = 0;

    for (const booking of bookings) {
        if (!seenIds.has(booking.id)) {
            seenIds.add(booking.id);
            uniqueBookings.push(booking);
        } else {
            duplicatesRemoved++;
        }
    }

    if (duplicatesRemoved > 0) {
        localStorage.setItem('fiilar_bookings', JSON.stringify(uniqueBookings));
        console.log(`🧹 Removed ${duplicatesRemoved} duplicate bookings`);
    }

    return duplicatesRemoved;
};
