import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, Listing, ListingStatus, Booking } from '@fiilar/types';
import { Button } from '@fiilar/ui';
import { Plus, Briefcase, FileText, TrendingUp, DollarSign, MessageSquare, Settings, AlertCircle, Home, Menu, ShieldCheck } from 'lucide-react';
import { getConversations, startConversation } from '../../../services/storage';

// Hooks
import { useHostListings } from '../hooks/useHostListings';
import { useHostBookings } from '../hooks/useHostBookings';
import { useHostFinancials } from '../hooks/useHostFinancials';

// Components
import HostOverview from '../components/HostOverview';
import HostListings from '../components/HostListings';
import HostBookings from '../components/HostBookings';
import HostFinancials from '../components/HostFinancials';
import HostVerify from '../components/HostVerify';
import CreateListingWizard from '../components/CreateListingWizard';

// Legacy Components (to be refactored later if needed)
import HostEarnings from '../components/HostEarnings';
import { ChatList } from '../../Messaging/components/ChatList';
import { ChatWindow } from '../../Messaging/components/ChatWindow';
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
    const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>(undefined);

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

    // Custom Hooks
    const {
        newListing, setNewListing, step, setStep, aiPrompt, setAiPrompt, isAiGenerating, showAiInput, setShowAiInput,
        tempAddOn, setTempAddOn, tempRule, setTempRule, customSafety, setCustomSafety, availTab, setAvailTab,
        weeklySchedule, currentMonth, setCurrentMonth, isSubmitting, lastSaved, isEditingUpload, setIsEditingUpload,
        selectedCalendarDate, setSelectedCalendarDate, draggedImageIndex,
        handleStartNewListing, handleAiAutoFill, handleAddAddOn, handleRemoveAddOn, handleAddRule, handleRemoveRule,
        handleAddCustomSafety, toggleSafetyItem, handleImageUpload, handleImageDragStart, handleImageDragOver, handleImageDragEnd,
        removeImage, handleProofUpload, toggleDaySchedule, updateDayTime, applyWeeklySchedule, getDaysInMonth, handleDateClick,
        toggleHourOverride, handleCreateListing, getPreviousProofs, formatDate, handleEditListing, handleDeleteListing
    } = useHostListings(user, hostListings, refreshData, setView, onCreateListing, onUpdateListing);

    const {
        hostBookings, bookingFilter, setBookingFilter, bookingView, setBookingView,
        handleAcceptBooking, handleRejectBooking, handleReleaseFunds, handleVerifyGuest,
        handleAllowModification
    } = useHostBookings(user, hostListings, refreshData);

    const {
        bankDetails, setBankDetails, isVerifyingBank, hostTransactions,
        handleVerifyBank, handleSaveBankDetails
    } = useHostFinancials(user, hostListings);

    // Handle deep linking to messages
    useEffect(() => {
        if (view === 'messages') {
            const targetUserId = searchParams.get('userId');
            const targetBookingId = searchParams.get('bookingId');

            if (targetUserId && targetBookingId) {
                const booking = hostBookings.find(b => b.id === targetBookingId);
                if (booking) {
                    const conversationId = startConversation(user.id, targetUserId, booking.listingId);
                    setSelectedConversationId(conversationId);
                }
            }
        }
    }, [view, searchParams, hostBookings, user.id]);

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

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Sidebar */}
            <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-gray-200 fixed top-16 left-0 bottom-0 z-40">
                <div className="p-6 border-b border-gray-200 shrink-0">
                    <h2 className="text-lg font-bold text-gray-900">Host Dashboard</h2>
                    <p className="text-xs text-gray-500 mt-1">Manage your spaces</p>
                </div>
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto min-h-0">
                    <button onClick={() => setView('overview')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${view === 'overview' ? 'bg-brand-50 text-brand-700' : 'text-gray-700 hover:bg-gray-50'}`}>
                        <Home size={18} />
                        Overview
                    </button>
                    <button onClick={() => setView('listings')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${view === 'listings' ? 'bg-brand-50 text-brand-700' : 'text-gray-700 hover:bg-gray-50'}`}>
                        <Briefcase size={18} />
                        Listings
                        {pendingListingsCount > 0 && (
                            <span className="ml-auto bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full">
                                {pendingListingsCount}
                            </span>
                        )}
                    </button>
                    <button onClick={() => setView('bookings')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${view === 'bookings' ? 'bg-brand-50 text-brand-700' : 'text-gray-700 hover:bg-gray-50'}`}>
                        <FileText size={18} />
                        Bookings
                        {pendingBookingsCount > 0 && (
                            <span className="ml-auto bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full">
                                {pendingBookingsCount}
                            </span>
                        )}
                    </button>
                    <button onClick={() => setView('verify')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${view === 'verify' ? 'bg-brand-50 text-brand-700' : 'text-gray-700 hover:bg-gray-50'}`}>
                        <ShieldCheck size={18} />
                        Verify Guest
                    </button>
                    <button onClick={() => setView('earnings')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${view === 'earnings' ? 'bg-brand-50 text-brand-700' : 'text-gray-700 hover:bg-gray-50'}`}>
                        <TrendingUp size={18} />
                        Earnings
                    </button>
                    <button onClick={() => setView('payouts')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${view === 'payouts' ? 'bg-brand-50 text-brand-700' : 'text-gray-700 hover:bg-gray-50'}`}>
                        <DollarSign size={18} />
                        Payouts
                    </button>
                    <button onClick={() => setView('messages')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${view === 'messages' ? 'bg-brand-50 text-brand-700' : 'text-gray-700 hover:bg-gray-50'}`}>
                        <MessageSquare size={18} />
                        Messages
                        {unreadMessages > 0 && (
                            <span className="ml-auto bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">
                                {unreadMessages}
                            </span>
                        )}
                    </button>
                </nav>
                <div className="p-4 space-y-1 border-t border-gray-100 shrink-0">
                    <Button onClick={handleStartNewListing} variant="primary" className="w-full mb-2 justify-center" leftIcon={<Plus size={18} />}>New Listing</Button>
                    <button onClick={() => setView('settings')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${view === 'settings' ? 'bg-brand-50 text-brand-700' : 'text-gray-700 hover:bg-gray-50'}`}>
                        <Settings size={18} />
                        Settings
                    </button>
                    <button onClick={() => setView('notifications')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${view === 'notifications' ? 'bg-brand-50 text-brand-700' : 'text-gray-700 hover:bg-gray-50'}`}>
                        <AlertCircle size={18} />
                        Notifications
                    </button>
                </div>
            </aside>

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
                        <div className="mb-4 grid grid-cols-2 gap-2 animate-in slide-in-from-top-2 duration-200">
                            <button onClick={() => { setView('overview'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${view === 'overview' ? 'bg-brand-50 text-brand-700' : 'bg-gray-50 text-gray-700'}`}>
                                <Home size={16} /> Overview
                            </button>
                            <button onClick={() => { setView('listings'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${view === 'listings' ? 'bg-brand-50 text-brand-700' : 'bg-gray-50 text-gray-700'}`}>
                                <Briefcase size={16} /> Listings
                            </button>
                            <button onClick={() => { setView('bookings'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${view === 'bookings' ? 'bg-brand-50 text-brand-700' : 'bg-gray-50 text-gray-700'}`}>
                                <FileText size={16} /> Bookings
                            </button>
                            <button onClick={() => { setView('verify'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${view === 'verify' ? 'bg-brand-50 text-brand-700' : 'bg-gray-50 text-gray-700'}`}>
                                <ShieldCheck size={16} /> Verify Guest
                            </button>
                            <button onClick={() => { setView('earnings'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${view === 'earnings' ? 'bg-brand-50 text-brand-700' : 'bg-gray-50 text-gray-700'}`}>
                                <TrendingUp size={16} /> Earnings
                            </button>
                            <button onClick={() => { setView('messages'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${view === 'messages' ? 'bg-brand-50 text-brand-700' : 'bg-gray-50 text-gray-700'}`}>
                                <MessageSquare size={16} /> Messages
                            </button>
                            <button onClick={() => { setView('settings'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${view === 'settings' ? 'bg-brand-50 text-brand-700' : 'bg-gray-50 text-gray-700'}`}>
                                <Settings size={16} /> Settings
                            </button>
                        </div>
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
                                newListing={newListing}
                                setNewListing={setNewListing}
                                step={step}
                                setStep={setStep}
                                aiPrompt={aiPrompt}
                                setAiPrompt={setAiPrompt}
                                isAiGenerating={isAiGenerating}
                                handleAiAutoFill={handleAiAutoFill}
                                showAiInput={showAiInput}
                                setShowAiInput={setShowAiInput}
                                tempAddOn={tempAddOn}
                                setTempAddOn={setTempAddOn}
                                handleAddAddOn={handleAddAddOn}
                                handleRemoveAddOn={handleRemoveAddOn}
                                tempRule={tempRule}
                                setTempRule={setTempRule}
                                handleAddRule={handleAddRule}
                                handleRemoveRule={handleRemoveRule}
                                customSafety={customSafety}
                                setCustomSafety={setCustomSafety}
                                handleAddCustomSafety={handleAddCustomSafety}
                                toggleSafetyItem={toggleSafetyItem}
                                handleImageUpload={handleImageUpload}
                                handleImageDragStart={handleImageDragStart}
                                handleImageDragOver={handleImageDragOver}
                                handleImageDragEnd={handleImageDragEnd}
                                removeImage={removeImage}
                                handleProofUpload={handleProofUpload}
                                availTab={availTab}
                                setAvailTab={setAvailTab}
                                weeklySchedule={weeklySchedule}
                                toggleDaySchedule={toggleDaySchedule}
                                updateDayTime={updateDayTime}
                                applyWeeklySchedule={applyWeeklySchedule}
                                currentMonth={currentMonth}
                                setCurrentMonth={setCurrentMonth}
                                getDaysInMonth={getDaysInMonth}
                                handleDateClick={handleDateClick}
                                toggleHourOverride={toggleHourOverride}
                                activeBookings={hostBookings}
                                isSubmitting={isSubmitting}
                                handleCreateListing={handleCreateListing}
                                setView={setView}
                                lastSaved={lastSaved}
                                isEditingUpload={isEditingUpload}
                                setIsEditingUpload={setIsEditingUpload}
                                getPreviousProofs={getPreviousProofs}
                                formatDate={formatDate}
                                selectedCalendarDate={selectedCalendarDate}
                                setSelectedCalendarDate={setSelectedCalendarDate}
                                draggedImageIndex={draggedImageIndex}
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
                            <div className="space-y-4 animate-in fade-in">
                                {/* Messages Header */}
                                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900">Messages</h2>
                                            <p className="text-sm text-gray-500 mt-1">Chat with your guests</p>
                                        </div>
                                        <div className="flex items-center gap-2 w-full sm:w-auto">
                                            <div className="relative flex-1 sm:flex-none sm:w-64">
                                                <input
                                                    type="text"
                                                    placeholder="Search conversations..."
                                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                                                />
                                                <MessageSquare size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Messages Container */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="flex h-[600px]">
                                        {/* Conversation List */}
                                        <div className="w-full md:w-2/5 lg:w-1/3 border-r border-gray-200 flex flex-col">
                                            <div className="p-4 border-b border-gray-200 bg-gray-50">
                                                <h3 className="font-bold text-gray-900 text-sm">Conversations</h3>
                                                <p className="text-xs text-gray-500 mt-1">{activeConversations.length} active</p>
                                            </div>
                                            <div className="flex-1 overflow-y-auto">
                                                <ChatList
                                                    currentUserId={user.id}
                                                    selectedId={selectedConversationId}
                                                    onSelect={setSelectedConversationId}
                                                />
                                            </div>
                                        </div>

                                        {/* Chat Window */}
                                        <div className="hidden md:flex md:w-3/5 lg:w-2/3 flex-col">
                                            {selectedConversationId ? (
                                                <ChatWindow
                                                    conversationId={selectedConversationId}
                                                    currentUserId={user.id}
                                                />
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-full bg-gray-50">
                                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                        <MessageSquare size={32} className="text-gray-400" />
                                                    </div>
                                                    <h3 className="font-bold text-gray-900 mb-2">No conversation selected</h3>
                                                    <p className="text-sm text-gray-500 max-w-xs text-center">Choose a conversation from the list to start chatting with your guests</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
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
