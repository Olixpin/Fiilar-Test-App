import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, Listing, ListingStatus, Booking, Role } from '@fiilar/types';
import { saveListing } from '@fiilar/storage';
import { Plus, Search, Bell, Settings as SettingsIcon, LogOut, AlertCircle, Clock, User as UserIcon, Wallet, Sparkles, ChevronRight } from 'lucide-react';
import { getConversations } from '@fiilar/messaging';
import { ConfirmDialog, UserAvatar } from '@fiilar/ui';
import { cn } from '@fiilar/utils';

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
import CreateListingWizard from '../components/CreateListingWizardV2';
import HostSidebar from '../components/HostSidebar';
import HostBottomNav from '../components/HostBottomNav';

import HostMessages from '../components/HostMessages';
import HostPhoneCollectionModal from '../components/HostPhoneCollectionModal';

// Legacy Components (to be refactored later if needed)
import HostEarnings from '../components/HostEarnings';
import HostSettings from '../components/HostSettings';
import NotificationsPage from '../../Notifications/pages/NotificationsPage';
import Home from '../../Listings/pages/Home';

interface HostDashboardPageProps {
    user: User;
    listings: Listing[];
    refreshData: () => void;
    hideUI?: boolean;
    onUpdateListing: (listing: Listing) => void;
    onCreateListing: (listing: Listing) => void;
    onLogout?: () => void;
}

type View = 'overview' | 'listings' | 'create' | 'edit' | 'calendar' | 'settings' | 'bookings' | 'earnings' | 'payouts' | 'messages' | 'notifications' | 'verify' | 'menu' | 'explore';

const HostDashboardPage: React.FC<HostDashboardPageProps> = ({ user, listings, refreshData, hideUI = false, onUpdateListing, onCreateListing, onLogout }) => {
    // View State
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // Derived view state from URL
    const viewParam = searchParams.get('view');
    const listingIdParam = searchParams.get('listingId');
    const view: View = (viewParam && ['overview', 'listings', 'create', 'edit', 'calendar', 'settings', 'bookings', 'earnings', 'payouts', 'messages', 'notifications', 'verify', 'menu', 'explore'].includes(viewParam))
        ? (viewParam as View)
        : 'overview';

    const setView = (newView: View, listingId?: string) => {
        if (listingId) {
            setSearchParams({ view: newView, listingId });
        } else {
            setSearchParams({ view: newView });
        }
    };

    // Filter listings to only show those belonging to the current user
    const hostListings = useMemo(() => {
        if (!user) return [];
        return listings.filter(l => l.hostId === user.id);
    }, [listings, user]);

    // Mobile menu state
    const [showPhoneModal, setShowPhoneModal] = useState(false);
    const [sidebarExpanded, setSidebarExpanded] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const profileMenuRef = useRef<HTMLDivElement>(null);

    // Close profile menu on click outside or ESC
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
                setIsProfileMenuOpen(false);
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsProfileMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    // Editing State - restore from URL if listingId is present
    const [editingListing, setEditingListing] = useState<Listing | null>(() => {
        if (listingIdParam && listings.length > 0) {
            return listings.find(l => l.id === listingIdParam) || null;
        }
        return null;
    });

    // Restore editing listing when listings load (for page refresh)
    useEffect(() => {
        if (listingIdParam && !editingListing && listings.length > 0) {
            const listing = listings.find(l => l.id === listingIdParam);
            if (listing) {
                setEditingListing(listing);
            }
        }
    }, [listingIdParam, listings, editingListing]);

    const [unreadNotifications, setUnreadNotifications] = useState(0);

    // Poll for notifications
    React.useEffect(() => {
        if (!user) return;
        const updateNotificationCount = () => {
            import('@fiilar/notifications').then(({ getUnreadCount }) => {
                const count = getUnreadCount(user.id);
                setUnreadNotifications(count);
            });
        };

        updateNotificationCount();
        const interval = setInterval(updateNotificationCount, 30000);
        return () => clearInterval(interval);
    }, [user]);

    // Data Migration: Backfill missing bookingConfig for existing listings
    // This ensures "data driven" time display works for listings created before the fix.
    // Use a ref to prevent infinite loops if save fails or data is stubborn
    const migrationAttemptedRef = useRef(false);

    useEffect(() => {
        if (migrationAttemptedRef.current) return;

        const migrateListings = () => {
            // Only migrate listings that belong to the current user to avoid security errors
            const listingsToUpdate = listings.filter(l => !l.bookingConfig && l.hostId === user.id);
            if (listingsToUpdate.length > 0) {
                console.log('Migrating listings with missing bookingConfig:', listingsToUpdate.length);
                listingsToUpdate.forEach(l => {
                    let bookingConfig: any = {};
                    if (l.pricingModel === 'HOURLY') {
                        bookingConfig = { operatingHours: { start: '09:00', end: '18:00' }, bufferMinutes: 30, minHoursBooking: 1 };
                    } else if (l.pricingModel === 'NIGHTLY') {
                        bookingConfig = { checkInTime: '15:00', checkOutTime: '11:00', allowLateCheckout: false };
                    } else {
                        bookingConfig = { accessStartTime: '08:00', accessEndTime: '23:00', overnightAllowed: false };
                    }

                    // Update the listing in storage
                    const updatedListing = { ...l, bookingConfig };
                    saveListing(updatedListing);
                    console.log(`Migrated listing ${l.id} with default bookingConfig`);
                });

                // Mark as attempted so we don't loop if refreshData() returns same data
                migrationAttemptedRef.current = true;

                // Refresh data to reflect changes
                refreshData();
            }
        };
        migrateListings();
    }, [listings, refreshData]);


    // Custom Hooks
    const {
        hostBookings, bookingFilter, setBookingFilter, bookingView, setBookingView,
        handleAcceptBooking, handleRejectBooking, handleReleaseFunds, handleVerifyGuest,
        handleAllowModification
    } = useHostBookings(user, hostListings, refreshData);

    // Merge local drafts into listings for display
    // This ensures the dashboard shows the latest "work in progress" images/titles
    // Merge local drafts into listings for display
    // This ensures the dashboard shows the latest "work in progress" images/titles
    const mergedListings = React.useMemo(() => {
        return hostListings.map(listing => {
            try {
                const draftKey = `listing_draft_${user.id}_${listing.id}`;
                const savedDraft = localStorage.getItem(draftKey);
                if (savedDraft) {
                    const draft = JSON.parse(savedDraft);
                    // Merge draft data if it exists
                    // We prioritize draft data for editable fields
                    return {
                        ...listing,
                        title: draft.title || listing.title,
                        description: draft.description || listing.description,
                        // Use draft images if they exist, otherwise keep original
                        images: (draft.images && draft.images.length > 0) ? draft.images : listing.images,
                        price: draft.price || listing.price,
                        location: draft.location || listing.location,
                        amenities: draft.amenities || listing.amenities,
                        houseRules: draft.houseRules || listing.houseRules,
                        safetyItems: draft.safetyItems || listing.safetyItems,
                        // Keep original status and id
                    };
                }
            } catch (e) {
                console.error('Failed to load draft for listing', listing.id, e);
            }
            return listing;
        });
    }, [hostListings, user.id, view]);

    const {
        bankDetails, setBankDetails, isVerifyingBank, hostTransactions,
        handleVerifyBank, handleSaveBankDetails
    } = useHostFinancials(user, hostListings);

    const { handleDeleteListing, deleteConfirm, confirmDelete, cancelDelete } = useListingActions(refreshData);

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
        if (!user.phone) {
            setShowPhoneModal(true);
            return;
        }
        setEditingListing(null);
        setView('create');
    };

    const handleEditListing = (listing: Listing) => {
        setEditingListing(listing);
        setView('create', listing.id); // Include listing ID in URL for refresh persistence
    };

    const handlePreviewListing = (id: string) => {
        window.open(`/listing/${id}`, '_blank');
    };

    return (
        <div className="fixed inset-0 flex bg-white overflow-hidden">
            {/* Gradient Background Layer */}
            <div className="absolute inset-y-0 left-0 w-[400px] bg-gradient-to-br from-orange-100 via-rose-50 to-blue-100 opacity-60 pointer-events-none" />

            {/* Phone Collection Modal */}
            <HostPhoneCollectionModal
                user={user}
                isOpen={showPhoneModal}
                onClose={() => setShowPhoneModal(false)}
                onUpdateUser={() => {
                    refreshData();
                    setShowPhoneModal(false);
                    // Automatically proceed to create listing after saving phone
                    setEditingListing(null);
                    setView('create');
                }}
            />

            {/* Sidebar */}
            {!hideUI && (
                <HostSidebar
                    view={view}
                    setView={setView}
                    pendingListingsCount={pendingListingsCount}
                    pendingBookingsCount={pendingBookingsCount}
                    unreadMessages={unreadMessages}
                    handleStartNewListing={handleStartNewListing}
                    expanded={sidebarExpanded}
                    onToggle={() => setSidebarExpanded(!sidebarExpanded)}
                />
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 relative z-10 bg-[#FFFBF9]">
                {/* Top Header */}
                <header className="hidden lg:flex items-center justify-between px-8 py-5 bg-transparent w-full max-w-[1600px] mx-auto">
                    {/* Left: Empty for now */}
                    <div />

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-3">
                        {/* Search Input */}
                        <div className="relative hidden xl:block group">
                            <div className="flex items-center bg-white border border-gray-200 rounded-full shadow-sm hover:shadow-lg transition-all duration-300 w-[400px] focus-within:ring-4 focus-within:ring-brand-500/10 focus-within:border-brand-500/50">
                                <input
                                    type="text"
                                    placeholder="Search listings, bookings..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="flex-1 pl-6 pr-4 py-2.5 bg-transparent text-sm text-gray-900 placeholder-gray-500 focus:outline-none rounded-l-full"
                                />
                                <div className="pr-1.5">
                                    <div className="bg-brand-600 text-white p-2 rounded-full group-hover:scale-105 transition-all duration-200 cursor-pointer shadow-md shadow-brand-600/20">
                                        <Search size={16} strokeWidth={2.5} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Notifications */}
                        <button
                            onClick={() => setView('notifications')}
                            className={cn(
                                "relative w-9 h-9 rounded-full flex items-center justify-center transition-all border",
                                view === 'notifications'
                                    ? "bg-brand-500 text-white border-brand-500 shadow-lg shadow-brand-500/20"
                                    : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                            )}
                            aria-label="Notifications"
                        >
                            <Bell size={16} />
                            {unreadNotifications > 0 && view !== 'notifications' && (
                                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
                            )}
                        </button>

                        {/* User Avatar & Dropdown */}
                        <div className="relative" ref={profileMenuRef}>
                            <button
                                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                className={cn(
                                    "flex items-center gap-2 rounded-full transition-all duration-200 p-1.5 pr-3",
                                    isProfileMenuOpen || view === 'settings'
                                        ? "bg-gray-100"
                                        : "hover:bg-gray-100"
                                )}
                            >
                                <UserAvatar
                                    src={user.avatar}
                                    firstName={user.firstName || user.name.split(' ')[0]}
                                    lastName={user.lastName || user.name.split(' ')[1]}
                                    size="sm"
                                />
                                <span className="text-sm font-medium text-gray-700">
                                    {user.firstName || user.name.split(' ')[0]}
                                </span>
                            </button>

                            {/* Dropdown Menu */}
                            {isProfileMenuOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                                    <div className="px-4 py-2 border-b border-gray-100 mb-1">
                                        <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                    </div>

                                    <button
                                        onClick={() => {
                                            setView('settings');
                                            setIsProfileMenuOpen(false);
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                    >
                                        <SettingsIcon size={16} />
                                        Settings
                                    </button>

                                    <button
                                        onClick={() => {
                                            setView('explore');
                                            setIsProfileMenuOpen(false);
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                    >
                                        <UserIcon size={16} />
                                        Switch to Guest (Explore)
                                    </button>

                                    <div className="h-px bg-gray-100 my-1" />

                                    <button
                                        onClick={() => {
                                            setIsProfileMenuOpen(false);
                                            if (onLogout) {
                                                onLogout();
                                            } else {
                                                navigate('/login-host');
                                            }
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                    >
                                        <LogOut size={16} />
                                        Log out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Mobile Header */}
                {!hideUI && view !== 'explore' && (
                    <div className="lg:hidden bg-white border-b border-gray-200 p-4 sticky top-0 z-30">
                        <div className="flex items-center justify-between">
                            <h1 className="text-xl font-bold text-gray-900">Host Dashboard</h1>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setView('explore')}
                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                                    title="Explore / Switch to Guest"
                                    aria-label="Explore"
                                >
                                    <Search size={20} />
                                </button>
                                <button
                                    onClick={handleStartNewListing}
                                    className="p-2 bg-brand-600 text-white rounded-full shadow-sm hover:bg-brand-700 transition-colors"
                                    title="Create New Listing"
                                    aria-label="Create New Listing"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Verification Banner */}
                {user.role === Role.HOST && !user.kycVerified && (
                    <div className={cn(
                        "mx-4 lg:mx-8 mb-6 rounded-xl border p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm",
                        user.identityDocument ? "bg-blue-50 border-blue-100" : "bg-orange-50 border-orange-100"
                    )}>
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "p-2 rounded-full shrink-0",
                                user.identityDocument ? "bg-blue-100 text-blue-600" : "bg-orange-100 text-orange-600"
                            )}>
                                {user.identityDocument ? <Clock size={18} /> : <AlertCircle size={18} />}
                            </div>
                            <div className={cn("text-sm", user.identityDocument ? "text-blue-900" : "text-orange-900")}>
                                {user.identityDocument ? (
                                    <>
                                        <span className="font-bold block sm:inline">Identity Verification Pending:</span> Your ID is under review.
                                    </>
                                ) : (
                                    <>
                                        <span className="font-bold block sm:inline">Account Verification Needed:</span> Verify your identity to submit listings for approval.
                                    </>
                                )}
                            </div>
                        </div>
                        {!user.identityDocument && (
                            <button
                                onClick={() => navigate('/kyc')}
                                className="text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-lg transition-colors whitespace-nowrap shadow-sm shadow-orange-600/20"
                            >
                                Verify Identity
                            </button>
                        )}
                    </div>
                )}

                {/* Content Area */}
                <main className={cn(
                    "flex-1 overflow-y-auto",
                    view === 'create' || view === 'edit'
                        ? "" // No extra padding for wizard
                        : "px-4 lg:px-8 pb-24 lg:pb-8"
                )}>
                    <div className="lg:max-w-[1600px] lg:mx-auto">
                        <div className={cn(
                            "-mx-4 lg:mx-0",
                            view === 'create' || view === 'edit'
                                ? "" // No box styling for wizard
                                : "min-h-full bg-white rounded-t-[32px] lg:rounded-3xl shadow-xl shadow-gray-200/50 px-4 sm:px-6 lg:px-8 py-8"
                        )}>

                            {view === 'overview' && (
                                <HostOverview
                                    user={user}
                                    listings={mergedListings}
                                    hostBookings={hostBookings}
                                    setView={setView}
                                    handleStartNewListing={handleStartNewListing}
                                    onNavigateToBooking={handleNavigateToBooking}
                                />
                            )}

                            {view === 'listings' && (
                                <HostListings
                                    listings={mergedListings}
                                    onEdit={handleEditListing}
                                    onDelete={handleDeleteListing}
                                    onCreate={handleStartNewListing}
                                    onPreview={handlePreviewListing}
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
                                    <HostSettings
                                        user={user}
                                        onUpdateUser={() => refreshData()}
                                    />
                                </div>
                            )}

                            {view === 'explore' && (
                                <div className="animate-in fade-in duration-500">
                                    <Home
                                        listings={listings}
                                        user={user}
                                        activeCategory={activeCategory}
                                        setActiveCategory={setActiveCategory}
                                        searchTerm={searchQuery}
                                        onBecomeHostClick={() => { }}
                                    />
                                </div>
                            )}

                            {view === 'notifications' && (
                                <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                                    <NotificationsPage userId={user.id} />
                                </div>
                            )}

                            {view === 'menu' && (
                                <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-6">
                                    <div className="flex items-center gap-4 mb-6">
                                        <UserAvatar
                                            src={user.avatar}
                                            firstName={user.firstName}
                                            lastName={user.lastName}
                                            size="lg"
                                        />
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                                            <p className="text-sm text-gray-500">{user.email}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Host Tools</h3>
                                        <button onClick={() => setView('earnings')} className="w-full flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                                <Wallet size={20} />
                                            </div>
                                            <span className="font-medium text-gray-900">Wallet & Payouts</span>
                                            <ChevronRight size={16} className="ml-auto text-gray-400" />
                                        </button>
                                        <button onClick={() => setView('verify')} className="w-full flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                                            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                                <Sparkles size={20} />
                                            </div>
                                            <span className="font-medium text-gray-900">Verify Guest</span>
                                            <ChevronRight size={16} className="ml-auto text-gray-400" />
                                        </button>
                                    </div>

                                    <div className="space-y-2">
                                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Settings & Support</h3>
                                        <button onClick={() => setView('settings')} className="w-full flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                                            <div className="p-2 bg-gray-50 text-gray-600 rounded-lg">
                                                <SettingsIcon size={20} />
                                            </div>
                                            <span className="font-medium text-gray-900">Settings</span>
                                            <ChevronRight size={16} className="ml-auto text-gray-400" />
                                        </button>
                                        <button onClick={() => setView('notifications')} className="w-full flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                                            <div className="p-2 bg-gray-50 text-gray-600 rounded-lg">
                                                <Bell size={20} />
                                            </div>
                                            <span className="font-medium text-gray-900">Notifications</span>
                                            <ChevronRight size={16} className="ml-auto text-gray-400" />
                                        </button>
                                    </div>

                                    <div className="space-y-2">
                                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Switch Mode</h3>
                                        <button onClick={() => navigate('/dashboard')} className="w-full flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                                            <div className="p-2 bg-brand-50 text-brand-600 rounded-lg">
                                                <UserIcon size={20} />
                                            </div>
                                            <span className="font-medium text-gray-900">Switch to Guest Dashboard</span>
                                            <ChevronRight size={16} className="ml-auto text-gray-400" />
                                        </button>
                                    </div>

                                    <button
                                        onClick={() => {
                                            if (onLogout) onLogout();
                                            else navigate('/login-host');
                                        }}
                                        className="w-full flex items-center gap-3 p-4 bg-white border border-red-100 rounded-xl hover:bg-red-50 transition-colors text-red-600 mt-4"
                                    >
                                        <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                                            <LogOut size={20} />
                                        </div>
                                        <span className="font-medium">Log Out</span>
                                    </button>
                                </div>
                            )}

                        </div>
                    </div>
                </main>
            </div>

            {/* Delete Listing Confirmation Dialog */}
            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                title="Delete Listing?"
                message={deleteConfirm.message}
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
                onConfirm={confirmDelete}
                onCancel={cancelDelete}
            />

            {/* Mobile Bottom Navigation */}
            {!hideUI && (
                <HostBottomNav
                    view={view}
                    setView={setView}
                    unreadMessages={unreadMessages}
                />
            )}
        </div>
    );
};

export default HostDashboardPage;
