import { useState } from 'react';
import { ListingStatus } from '@fiilar/types';
import { useToast } from '@fiilar/ui';
import { deleteListing, getBookings } from '@fiilar/storage';

export const useListingActions = (refreshData: () => void) => {
    const toast = useToast();
    const [deleteConfirm, setDeleteConfirm] = useState<{
        isOpen: boolean;
        listingId: string | null;
        message: string;
    }>({ isOpen: false, listingId: null, message: '' });
    const handleDeleteListing = (id: string, status: ListingStatus) => {
        const allBookings = getBookings();
        const hasActiveBookings = allBookings.some(b =>
            b.listingId === id &&
            (b.status === 'Confirmed' || b.status === 'Pending') &&
            new Date(b.date) >= new Date(new Date().setHours(0, 0, 0, 0))
        );

        if (hasActiveBookings) {
            toast.showToast({ message: "Unable to delete: This listing has active upcoming bookings. Please cancel all bookings associated with this listing first.", type: "info" });
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

        setDeleteConfirm({
            isOpen: true,
            listingId: id,
            message: confirmMsg,
        });
    };

    const confirmDelete = () => {
        if (deleteConfirm.listingId) {
            deleteListing(deleteConfirm.listingId);
            refreshData();
            toast.showToast({ message: "Listing deleted successfully.", type: "info" });
        }
        setDeleteConfirm({ isOpen: false, listingId: null, message: '' });
    };

    const cancelDelete = () => {
        setDeleteConfirm({ isOpen: false, listingId: null, message: '' });
    };

    return {
        handleDeleteListing,
        deleteConfirm,
        confirmDelete,
        cancelDelete,
    };
};
