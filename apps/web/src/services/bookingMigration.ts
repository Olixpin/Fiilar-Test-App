import { getBookings } from '@fiilar/storage';

/**
 * One-time migration to add createdAt timestamps to existing bookings
 * that don't have them. This fixes the "Saved 0h ago" issue for old bookings.
 * Uses sessionStorage to ensure it only runs once per browser session.
 */
export const migrateBookingTimestamps = () => {
    // Check if migration already ran in this session
    const migrationKey = 'fiilar_booking_migration_done';
    if (sessionStorage.getItem(migrationKey)) {
        return 0; // Already migrated in this session
    }

    const bookings = getBookings();
    let migratedCount = 0;
    let updated = false;

    const updatedBookings = bookings.map(booking => {
        // Only update bookings that don't have a createdAt timestamp
        if (!booking.createdAt) {
            // Set a reasonable timestamp - 1 day ago for Reserved bookings
            // This is better than showing "0h ago"
            const oneDayAgo = new Date();
            oneDayAgo.setDate(oneDayAgo.getDate() - 1);

            migratedCount++;
            updated = true;
            return {
                ...booking,
                createdAt: oneDayAgo.toISOString()
            };
        }
        return booking;
    });

    if (updated) {
        localStorage.setItem('fiilar_bookings', JSON.stringify(updatedBookings));
        sessionStorage.setItem(migrationKey, 'true'); // Mark as migrated
        console.log(`✅ Migrated ${migratedCount} bookings with timestamps`);
    }

    return migratedCount;
};
