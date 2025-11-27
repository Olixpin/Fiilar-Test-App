
import { useState, useEffect } from 'react';
import { User, Listing, ListingStatus, Booking, EscrowTransaction, PlatformFinancials, Role } from '@fiilar/types';
import { getBookings, saveListing, getAllUsers, saveUser, getCurrentUser, authorizeAdminOperation } from '@fiilar/storage';
import { updateKYC } from '@fiilar/kyc';
import { escrowService } from '@fiilar/escrow';

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
    const [activeTab, setActiveTab] = useState<'kyc' | 'hosts' | 'listings' | 'financials' | 'escrow' | 'disputes'>('hosts');
    const [rejectionModal, setRejectionModal] = useState<{ isOpen: boolean, listingId: string | null, reason: string }>({
        isOpen: false, listingId: null, reason: ''
    });
    const [financials, setFinancials] = useState<PlatformFinancials | null>(null);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [transactions, setTransactions] = useState<EscrowTransaction[]>([]);
    const [loading, setLoading] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);

    // SECURITY: Verify admin access on mount
    useEffect(() => {
        const authCheck = authorizeAdminOperation('admin_panel_access');
        if (!authCheck.authorized) {
            setAuthError(authCheck.error || 'Not authorized');
            console.error('🚨 SECURITY: Unauthorized admin panel access attempt');
        }
    }, []);

    // Derived Data
    const unverifiedHosts = users.filter(u => !u.kycVerified && u.role === 'HOST');
    const pendingListings = listings.filter(l => l.status === ListingStatus.PENDING_APPROVAL);
    const openDisputes = bookings.filter(b => b.disputeStatus === 'OPEN');

    // Load financial data when financials or escrow tab is active
    useEffect(() => {
        if (activeTab === 'financials' || activeTab === 'escrow' || activeTab === 'disputes') {
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
            alert('Not authorized to perform this action');
            return;
        }

        if (approve) {
            updateKYC(userId, 'verified');
            alert(`User ${userId} approved.Email sent.`);
        } else {
            alert(`User ${userId} rejected.Email sent.`);
        }
        refreshData();
    };

    const handleUpdateBadgeStatus = (userId: string, badgeStatus: 'standard' | 'super_host' | 'premium') => {
        // SECURITY CHECK
        const authCheck = authorizeAdminOperation('update_badge_status');
        if (!authCheck.authorized) {
            alert('Not authorized to perform this action');
            return;
        }

        const usersDb = getAllUsers();
        const user = usersDb.find((u: User) => u.id === userId);
        if (user) {
            user.badgeStatus = badgeStatus;
            saveUser(user);
            alert(`Badge status updated to ${badgeStatus.replace('_', ' ')}. Page will refresh.`);
            setTimeout(() => window.location.reload(), 500);
        }
    };

    const handleApproveListing = (listing: Listing, approve: boolean, reason?: string) => {
        // SECURITY CHECK
        const authCheck = authorizeAdminOperation('approve_listing');
        if (!authCheck.authorized) {
            alert('Not authorized to perform this action');
            return;
        }

        const updatedListing = {
            ...listing,
            status: approve ? ListingStatus.LIVE : ListingStatus.REJECTED,
            rejectionReason: reason
        };
        saveListing(updatedListing);
        if (approve) {
            alert(`Listing "${listing.title}" Approved.Email notification sent.`);
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
        openRejectionModal,
        handleRejectionSubmit,
        presetPhotographyOffer
    };
};
