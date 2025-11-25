import { Listing } from '@fiilar/types';

/**
 * Check if listing is available for date range
 */
export const isAvailableForDates = (
    listing: Listing,
    dateFrom: string,
    dateTo: string,
    bookedDates: string[] = []
): boolean => {
    if (!listing.availability) return false;

    const start = new Date(dateFrom);
    const end = new Date(dateTo);

    // Check each date in the range
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];

        // Check if date is booked
        if (bookedDates.includes(dateStr)) {
            return false;
        }

        // Check if listing has availability for this date
        if (!listing.availability[dateStr] || listing.availability[dateStr].length === 0) {
            return false;
        }
    }

    return true;
};
