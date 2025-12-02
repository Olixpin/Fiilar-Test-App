
import { useState, useEffect } from 'react';
import { User, Listing, ListingStatus, Booking, EscrowTransaction, PlatformFinancials } from '@fiilar/types';
import { getBookings, saveListing, getAllUsers, saveUser, authorizeAdminOperation, deleteListing } from '@fiilar/storage';
import { updateKYC } from '@fiilar/kyc';
import { escrowService } from '@fiilar/escrow';
import { useToast } from '@fiilar/ui';
import { addNotification } from '@fiilar/notifications';

interface UseAdminDataProps {
    users: User[];
    listings: Listing[];
    refreshData: () => void;
}

/**
 * Hook for admin panel data and operations
 * SECURITY: All operations verify admin role before executing
 */
export const useAdminData = ({ users, listings, refreshData }: UseAdminDataProps) => {
    const [activeTab, setActiveTab] = useState<'kyc' | 'hosts' | 'listings' | 'financials' | 'escrow' | 'disputes' | 'series-debug'>('hosts');
    const [rejectionModal, setRejectionModal] = useState<{ isOpen: boolean, listingId: string | null, reason: string }>({
        isOpen: false,
        listingId: null,
        reason: ''
    });
    const { showToast } = useToast();
    const [financials, setFinancials] = useState<PlatformFinancials | null>(null);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [transactions, setTransactions] = useState<EscrowTransaction[]>([]);
    const [loading, setLoading] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);
    const [seriesCount, setSeriesCount] = useState(0);

    // SECURITY: Verify admin access on mount
    useEffect(() => {
        const authCheck = authorizeAdminOperation('admin_panel_access');
        if (!authCheck.authorized) {
            setAuthError(authCheck.error || 'Not authorized');
            console.error('🚨 SECURITY: Unauthorized admin panel access attempt');
        }
    }, []);

    // Derived Data - with null safety
    const unverifiedHosts = (users || []).filter(u => !u.kycVerified && u.role === 'HOST');
    const pendingListings = (listings || []).filter(l => l.status === ListingStatus.PENDING_APPROVAL).sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
    });
    const openDisputes = (bookings || []).filter(b => b.disputeStatus === 'OPEN');

    // Load financial data when financials or escrow tab is active
    useEffect(() => {
        if (activeTab === 'financials' || activeTab === 'escrow' || activeTab === 'disputes' || activeTab === 'series-debug') {
            loadFinancialData();
        }
    }, [activeTab]);

    const loadFinancialData = async () => {
        // SECURITY CHECK
        const authCheck = authorizeAdminOperation('load_financial_data');
        if (!authCheck.authorized) {
            console.error('🚨 SECURITY: Unauthorized financial data access');
            return;
        }

        setLoading(true);
        try {
            const allBookings = getBookings();
            const platformFinancials = await escrowService.getPlatformFinancials(allBookings);
            const allTransactions = await escrowService.getEscrowTransactions();

            setBookings(allBookings);
            // Count distinct groupIds for debug badge
            const groupIds = new Set(allBookings.filter(b => b.groupId).map(b => b.groupId as string));
            setSeriesCount(groupIds.size);
            setFinancials(platformFinancials);
            setTransactions(allTransactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
        } catch (error) {
            console.error('Failed to load financial data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyUser = (userId: string, approve: boolean) => {
        // SECURITY CHECK
        const authCheck = authorizeAdminOperation('verify_user');
        if (!authCheck.authorized) {
            showToast({ message: 'Not authorized to perform this action', type: 'error' });
            return;
        }

        if (approve) {
            updateKYC(userId, 'verified');
            showToast({ message: `User ${userId} approved. Email sent.`, type: 'success' });
        } else {
            showToast({ message: `User ${userId} rejected. Email sent.`, type: 'success' });
        }
        refreshData();
    };

    const handleUpdateBadgeStatus = (userId: string, badgeStatus: 'standard' | 'super_host' | 'premium') => {
        // SECURITY CHECK
        const authCheck = authorizeAdminOperation('update_badge_status');
        if (!authCheck.authorized) {
            showToast({ message: 'Not authorized to perform this action', type: 'error' });
            return;
        }

        const usersDb = getAllUsers();
        const user = usersDb.find((u: User) => u.id === userId);
        if (user) {
            user.badgeStatus = badgeStatus;
            saveUser(user);
            showToast({ message: `Badge status updated to ${badgeStatus.replace('_', ' ')}. Page will refresh.`, type: 'success' });
            setTimeout(() => window.location.reload(), 500);
        }
    };

    const handleApproveListing = (listing: Listing, approve: boolean, reason?: string) => {
        // SECURITY CHECK
        const authCheck = authorizeAdminOperation('approve_listing');
        if (!authCheck.authorized) {
            showToast({ message: 'Not authorized to perform this action', type: 'error' });
            return;
        }

        const updatedListing = {
            ...listing,
            status: approve ? ListingStatus.LIVE : ListingStatus.REJECTED,
            rejectionReason: reason
        };
        saveListing(updatedListing);
        
        // Send notification to host
        if (approve) {
            addNotification({
                userId: listing.hostId,
                type: 'platform_update',
                title: '🎉 Listing Approved!',
                message: `Great news! Your listing "${listing.title}" has been approved and is now live. Guests can start booking your space.`,
                severity: 'info',
                read: false,
                actionRequired: false,
                metadata: {
                    link: `/listing/${listing.id}`
                }
            });
            showToast({ message: `Listing "${listing.title}" Approved. Host has been notified.`, type: 'success' });
        } else {
            addNotification({
                userId: listing.hostId,
                type: 'platform_update',
                title: 'Listing Update Required',
                message: `Your listing "${listing.title}" requires some changes before it can be approved. Reason: ${reason || 'Please review and update your listing.'}`,
                severity: 'warning',
                read: false,
                actionRequired: true,
                metadata: {
                    link: `/host/dashboard?view=listings`
                }
            });
        }
        refreshData();
    };

    const openRejectionModal = (id: string) => {
        setRejectionModal({ isOpen: true, listingId: id, reason: '' });
    };

    const handleRejectionSubmit = () => {
        if (!rejectionModal.listingId) return;
        const listing = listings.find(l => l.id === rejectionModal.listingId);
        if (listing) {
            handleApproveListing(listing, false, rejectionModal.reason);
        }
        setRejectionModal({ isOpen: false, listingId: null, reason: '' });
    };

    const presetPhotographyOffer = () => {
        setRejectionModal(prev => ({
            ...prev,
            reason: "Your space has great potential, but the photos provided don't meet our quality standards. We'd like to offer you a COMPLIMENTARY professional photography session to help your listing shine. Please reply to accept this offer."
        }));
    };

    const handleDeleteListing = (listingId: string) => {
        // SECURITY CHECK
        const authCheck = authorizeAdminOperation('delete_listing');
        if (!authCheck.authorized) {
            showToast({ message: 'Not authorized to perform this action', type: 'error' });
            return;
        }

        deleteListing(listingId);
        showToast({ message: 'Listing deleted successfully.', type: 'success' });
        refreshData();
    };

    return {
        activeTab, setActiveTab,
        rejectionModal, setRejectionModal,
        financials,
        bookings,
        transactions,
        loading,
        authError,
        unverifiedHosts,
        pendingListings,
        openDisputes,
        loadFinancialData,
        handleVerifyUser,
        handleUpdateBadgeStatus,
        handleApproveListing,
        handleDeleteListing,
        openRejectionModal,
        handleRejectionSubmit,
        presetPhotographyOffer,
        seriesCount
    };
};
