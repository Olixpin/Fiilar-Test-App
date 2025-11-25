import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, Listing, ListingStatus, Booking } from '@fiilar/types';
import { Menu, Plus } from 'lucide-react';
import { getConversations } from '@fiilar/messaging';

// Hooks
import { useHostBookings } from '../hooks/useHostBookings';
import { useHostFinancials } from '../hooks/useHostFinancials';
import { useListingActions } from '../hooks/useListingActions';

// Components
import HostOverview from '../components/HostOverview';
import HostListings from '../components/HostListings';
import HostBookings from '../components/HostBookings';
import HostFinancials from '../components/HostFinancials';
import HostVerify from '../components/HostVerify';
import CreateListingWizard from '../components/CreateListingWizard';
import HostSidebar from '../components/HostSidebar';
import HostMobileMenu from '../components/HostMobileMenu';
import HostMessages from '../components/HostMessages';

// Legacy Components (to be refactored later if needed)
import HostEarnings from '../components/HostEarnings';
import HostSettings from '../components/HostSettings';
import NotificationsPage from '../../Notifications/pages/NotificationsPage';

interface HostDashboardPageProps {
    user: User;
    listings: Listing[];
    refreshData: () => void;
    onCreateListing?: (l: Listing) => void;
    onUpdateListing?: (l: Listing) => void;
}

type View = 'overview' | 'listings' | 'create' | 'edit' | 'calendar' | 'settings' | 'bookings' | 'earnings' | 'payouts' | 'messages' | 'notifications' | 'verify';

const HostDashboardPage: React.FC<HostDashboardPageProps> = ({ user, listings, refreshData, onCreateListing, onUpdateListing }) => {
    // View State
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // Derived view state from URL
    const viewParam = searchParams.get('view');
    const view: View = (viewParam && ['overview', 'listings', 'create', 'edit', 'calendar', 'settings', 'bookings', 'earnings', 'payouts', 'messages', 'notifications', 'verify'].includes(viewParam))
        ? (viewParam as View)
        : 'overview';

    const setView = (newView: View) => {
        setSearchParams({ view: newView });
    };

    // Filter listings to only show those belonging to the current user
    const hostListings = useMemo(() => {
        if (!user) return [];
        return listings.filter(l => l.hostId === user.id);
    }, [listings, user]);

    // Mobile menu state
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Editing State
    const [editingListing, setEditingListing] = useState<Listing | null>(null);

    // Custom Hooks
    const {
        hostBookings, bookingFilter, setBookingFilter, bookingView, setBookingView,
        handleAcceptBooking, handleRejectBooking, handleReleaseFunds, handleVerifyGuest,
        handleAllowModification
    } = useHostBookings(user, hostListings, refreshData);

    const {
        bankDetails, setBankDetails, isVerifyingBank, hostTransactions,
        handleVerifyBank, handleSaveBankDetails
    } = useHostFinancials(user, hostListings);

    const { handleDeleteListing } = useListingActions(refreshData);

    // Helper to get conversations
    const conversations = getConversations(user.id);
    const activeConversations = conversations.filter(c => c.participants.includes(user.id));
    const unreadMessages = activeConversations.filter(c => c.unreadCount && c.unreadCount > 0).length;

    // Derived state for badges
    const pendingListingsCount = hostListings.filter(l => l.status === ListingStatus.PENDING_APPROVAL).length;
    const pendingBookingsCount = hostBookings.filter(b => b.status === 'Pending').length;

    const handleNavigateToBooking = (booking: Booking) => {
        setBookingFilter('all');
        setBookingView('table');
        setView('bookings');
        navigate(`?view=bookings&bookingId=${booking.id}`);
    };

    const handleStartNewListing = () => {
        setEditingListing(null);
        setView('create');
    };

    const handleEditListing = (listing: Listing) => {
        setEditingListing(listing);
        setView('create');
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Sidebar */}
            <HostSidebar
                view={view}
                setView={setView}
                pendingListingsCount={pendingListingsCount}
                pendingBookingsCount={pendingBookingsCount}
                unreadMessages={unreadMessages}
                handleStartNewListing={handleStartNewListing}
            />

            {/* Main Content */}
            <div className="min-h-screen lg:ml-64">
                {/* Mobile Header */}
                <div className="lg:hidden bg-white border-b border-gray-200 p-4 sticky top-16 z-30">
                    <div className="flex items-center justify-between mb-3">
                        <h1 className="text-xl font-bold text-gray-900">Host Dashboard</h1>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleStartNewListing}
                                className="p-2 bg-brand-600 text-white rounded-full shadow-sm"
                                title="Create New Listing"
                                aria-label="Create New Listing"
                            >
                                <Plus size={20} />
                            </button>
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                aria-label="Toggle menu"
                            >
                                <Menu size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Mobile Navigation Menu */}
                    {isMobileMenuOpen && (
                        <HostMobileMenu
                            view={view}
                            setView={setView}
                            setIsMobileMenuOpen={setIsMobileMenuOpen}
                        />
                    )}
                </div>

                {/* Content Area */}
                <main className="flex-1 overflow-y-auto">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">

                        {view === 'overview' && (
                            <HostOverview
                                user={user}
                                listings={hostListings}
                                hostBookings={hostBookings}
                                setView={setView}
                                handleStartNewListing={handleStartNewListing}
                                onNavigateToBooking={handleNavigateToBooking}
                            />
                        )}

                        {view === 'listings' && (
                            <HostListings
                                listings={hostListings}
                                onEdit={handleEditListing}
                                onDelete={handleDeleteListing}
                                onCreate={handleStartNewListing}
                            />
                        )}

                        {view === 'create' && (
                            <CreateListingWizard
                                user={user}
                                listings={hostListings}
                                activeBookings={hostBookings}
                                editingListing={editingListing}
                                setView={setView}
                                refreshData={refreshData}
                                onCreateListing={onCreateListing}
                                onUpdateListing={onUpdateListing}
                            />
                        )}

                        {view === 'bookings' && (
                            <HostBookings
                                bookings={hostBookings}
                                listings={hostListings}
                                filter={bookingFilter}
                                setFilter={setBookingFilter}
                                view={bookingView}
                                setView={setBookingView}
                                onAccept={handleAcceptBooking}
                                onReject={handleRejectBooking}
                                onRelease={handleReleaseFunds}
                                onVerify={handleVerifyGuest}
                                onAllowModification={handleAllowModification}
                            />
                        )}

                        {view === 'verify' && (
                            <HostVerify
                                user={user}
                                listings={hostListings}
                                onVerifySuccess={() => {
                                    refreshData();
                                }}
                            />
                        )}

                        {view === 'earnings' && (
                            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                                <HostEarnings
                                    hostBookings={hostBookings}
                                    transactions={hostTransactions}
                                    hostId={user.id}
                                    listings={hostListings}
                                />
                            </div>
                        )}

                        {view === 'payouts' && (
                            <HostFinancials
                                user={user}
                                bankDetails={bankDetails}
                                hostBookings={hostBookings}
                                hostTransactions={hostTransactions}
                                listings={hostListings}
                                isVerifyingBank={isVerifyingBank}
                                onVerifyBank={handleVerifyBank}
                                onSaveBankDetails={handleSaveBankDetails}
                                setBankDetails={setBankDetails}
                            />
                        )}

                        {view === 'messages' && (
                            <HostMessages
                                user={user}
                                hostBookings={hostBookings}
                            />
                        )}

                        {view === 'settings' && (
                            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                                <HostSettings user={user} />
                            </div>
                        )}

                        {view === 'notifications' && (
                            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                                <NotificationsPage userId={user.id} />
                            </div>
                        )}

                    </div>
                </main>
            </div>
        </div>
    );
};

export default HostDashboardPage;
