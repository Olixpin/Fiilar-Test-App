import { ListingStatus } from '@fiilar/types';
import { deleteListing, getBookings } from '../../../services/storage';

export const useListingActions = (refreshData: () => void) => {
    const handleDeleteListing = (id: string, status: ListingStatus) => {
        const allBookings = getBookings();
        const hasActiveBookings = allBookings.some(b =>
            b.listingId === id &&
            (b.status === 'Confirmed' || b.status === 'Pending') &&
            new Date(b.date) >= new Date(new Date().setHours(0, 0, 0, 0))
        );

        if (hasActiveBookings) {
            alert("Unable to delete: This listing has active upcoming bookings. Please cancel all bookings associated with this listing first.");
            return;
        }

        let confirmMsg = "Are you sure you want to permanently delete this listing?";
        if (status === ListingStatus.LIVE) {
            confirmMsg = "Warning: This listing is LIVE. Deleting it will immediately remove it from the marketplace. This action cannot be undone. Are you sure?";
        } else if ((status as unknown as string) === ListingStatus.PENDING_APPROVAL) {
            confirmMsg = "This listing is pending approval. Deleting it will cancel the review process. Continue?";
        } else if (status === ListingStatus.DRAFT) {
            confirmMsg = "Discard this draft listing?";
        }

        if (window.confirm(confirmMsg)) {
            deleteListing(id);
            refreshData();
            alert("Listing deleted successfully.");
        }
    };

    return {
        handleDeleteListing
    };
};
