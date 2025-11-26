
import React, { useState, useEffect } from 'react';
import { useToast } from '@fiilar/ui';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getCurrentUser, getBookings } from '@fiilar/storage';
import { startConversation, getConversations } from '@fiilar/messaging';
import { User, Listing, Booking, CancellationPolicy } from '@fiilar/types';
import { WalletCard } from '../components/WalletCard';
import { TransactionHistory } from '../components/TransactionHistory';
import { PaymentMethods } from '../components/PaymentMethods';
import { Heart, Search, Calendar, Wallet, LayoutGrid, Sparkles, MessageSquare, Bell, CreditCard, Settings as SettingsIcon, CheckCircle, Clock } from 'lucide-react';
import CancellationModal from '../../Bookings/components/CancellationModal';
import ModifyBookingModal from '../../Bookings/components/ModifyBookingModal';
import { ChatList } from '../../Messaging/components/ChatList';
import { ChatWindow } from '../../Messaging/components/ChatWindow';
import ReviewModal from '../../Listings/components/ReviewModal';
import Settings from '../components/Settings';
import NotificationsPage from '../../Notifications/pages/NotificationsPage';
import { UserExploreTab } from '../components/UserExploreTab';
import { UserFavoritesTab } from '../components/UserFavoritesTab';
import { UserBookingsTab } from '../components/UserBookingsTab';
import { UserReserveListTab } from '../components/UserReserveListTab';

interface UserDashboardProps {
  user: User | null;
  listings: Listing[];
}

const UserDashboard: React.FC<UserDashboardProps> = ({ user, listings }) => {
  const navigate = useNavigate();
  const toast = useToast();
  // Hooks must be declared unconditionally and in the same order on every render.
  // Move state and router hooks to the top so an early return (when user is null)
  // doesn't change the Hooks call order.
  const [activeTab, setActiveTab] = useState<'explore' | 'wallet' | 'favorites' | 'bookings' | 'reserve-list' | 'messages' | 'settings' | 'notifications'>('explore');
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>(undefined);
  const [reviewModalBooking, setReviewModalBooking] = useState<{ bookingId: string, listingId: string, listingTitle: string } | null>(null);
  const [cancellationModalBooking, setCancellationModalBooking] = useState<{ booking: Booking, policy: CancellationPolicy } | null>(null);
  const [modifyModalBooking, setModifyModalBooking] = useState<{ booking: Booking, listing: Listing } | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [refreshKey, setRefreshKey] = useState(0);

  // If user is not signed in, redirect to login (or show a short message).
  // Early-return prevents reading properties on null.
  useEffect(() => {
    if (!user) {
      // If there's no in-memory user but localStorage has a session, do not redirect — allow parent to hydrate state.
      const stored = getCurrentUser();
      if (!stored) {
        // navigate to login page after a tick to avoid render glitches
        navigate('/login');
      }
    }
  }, [user, navigate]);

  // Initialize tab from url ?tab=bookings|wallet|favorites
  // IMPORTANT: This must be before the early return to maintain consistent hook order
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'wallet' || tab === 'favorites' || tab === 'bookings' || tab === 'explore' || tab === 'reserve-list' || tab === 'messages' || tab === 'settings' || tab === 'notifications') {
      setActiveTab(tab as any);
    }

    const convId = searchParams.get('conversationId');
    if (convId) {
      setSelectedConversationId(convId);
    }
  }, [searchParams]);

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-gray-600">Please sign in to view your dashboard.</p>
      </div>
    );
  }

  // Helper to change tab and update URL so history reflects tab changes
  const setTab = (tab: 'explore' | 'wallet' | 'favorites' | 'bookings' | 'reserve-list' | 'messages' | 'settings' | 'notifications') => {
    setActiveTab(tab);
    // Update query param without losing other params
    const params = new URLSearchParams(searchParams);
    params.set('tab', tab);
    setSearchParams(params);
    // Scroll active tab into view on mobile
    setTimeout(() => {
      const activeButton = document.querySelector(`button[data-tab="${tab}"]`);
      activeButton?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }, 0);
  };
  const handleMessageHost = (hostId: string, listingId: string) => {
    const conversationId = startConversation(user.id, hostId, listingId);
    setSelectedConversationId(conversationId);
    setActiveTab('messages');
  };

  const userBookings = getBookings().filter(b => b.userId === user.id);
  const reservedBookings = userBookings.filter(b => b.status === 'Reserved');

  return (
    <div className="bg-gray-50">
      {/* Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-gray-200 fixed top-16 left-0 bottom-0 z-40">
        <div className="p-6 border-b border-gray-200 shrink-0">
          <h2 className="text-lg font-bold text-gray-900">Dashboard</h2>
          <p className="text-xs text-gray-500 mt-1">Welcome, {user.name.split(' ')[0]}</p>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto min-h-0">
          <button data-tab="explore" onClick={() => setTab('explore')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'explore' ? 'bg-brand-50 text-brand-700' : 'text-gray-700 hover:bg-gray-50'}`}>
            <LayoutGrid size={18} />
            Explore
          </button>
          <button data-tab="favorites" onClick={() => setTab('favorites')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'favorites' ? 'bg-brand-50 text-brand-700' : 'text-gray-700 hover:bg-gray-50'}`}>
            <Heart size={18} />
            Favorites
            {user.favorites && user.favorites.length > 0 && (
              <span className="ml-auto bg-gray-100 text-gray-700 text-xs font-bold px-2 py-0.5 rounded-full">{user.favorites.length}</span>
            )}
          </button>
          <button data-tab="bookings" onClick={() => setTab('bookings')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'bookings' ? 'bg-brand-50 text-brand-700' : 'text-gray-700 hover:bg-gray-50'}`}>
            <Calendar size={18} />
            Bookings
            {userBookings.filter(b => b.status === 'Pending' || b.status === 'Confirmed').length > 0 && (
              <span className="ml-auto bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">{userBookings.filter(b => b.status === 'Pending' || b.status === 'Confirmed').length}</span>
            )}
          </button>
          <button data-tab="wallet" onClick={() => setTab('wallet')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'wallet' ? 'bg-brand-50 text-brand-700' : 'text-gray-700 hover:bg-gray-50'}`}>
            <Wallet size={18} />
            Wallet
          </button>
          <button data-tab="reserve-list" onClick={() => setTab('reserve-list')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'reserve-list' ? 'bg-brand-50 text-brand-700' : 'text-gray-700 hover:bg-gray-50'}`}>
            <Sparkles size={18} />
            Reserve List
            {reservedBookings.length > 0 && (
              <span className="ml-auto bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">{reservedBookings.length}</span>
            )}
          </button>
          <button data-tab="messages" onClick={() => setTab('messages')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'messages' ? 'bg-brand-50 text-brand-700' : 'text-gray-700 hover:bg-gray-50'}`}>
            <MessageSquare size={18} />
            Messages
          </button>
        </nav>
        <div className="p-4 space-y-1 border-t border-gray-100 shrink-0">
          <button onClick={() => navigate('/')} className="w-full bg-brand-600 text-white px-4 py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-brand-700 transition shadow-sm mb-2">
            <Search size={18} /> Browse Spaces
          </button>
          <button data-tab="settings" onClick={() => setTab('settings')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'settings' ? 'bg-brand-50 text-brand-700' : 'text-gray-700 hover:bg-gray-50'}`}>
            <SettingsIcon size={18} />
            Settings
          </button>
          <button data-tab="notifications" onClick={() => setTab('notifications')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'notifications' ? 'bg-brand-50 text-brand-700' : 'text-gray-700 hover:bg-gray-50'}`}>
            <Bell size={18} />
            Notifications
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="min-h-screen lg:ml-64">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 p-4">
          <h1 className="text-xl font-bold text-gray-900">Welcome, {user.name.split(' ')[0]}</h1>
          <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar">
            <button data-tab="explore" onClick={() => setTab('explore')} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 hover:scale-105 active:scale-95 ${activeTab === 'explore' ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-700'}`}>Explore</button>
            <button data-tab="favorites" onClick={() => setTab('favorites')} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 hover:scale-105 active:scale-95 ${activeTab === 'favorites' ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-700'}`}>Favorites</button>
            <button data-tab="bookings" onClick={() => setTab('bookings')} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 hover:scale-105 active:scale-95 ${activeTab === 'bookings' ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-700'}`}>Bookings</button>
            <button data-tab="wallet" onClick={() => setTab('wallet')} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 hover:scale-105 active:scale-95 ${activeTab === 'wallet' ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-700'}`}>Wallet</button>
            <button data-tab="reserve-list" onClick={() => setTab('reserve-list')} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 hover:scale-105 active:scale-95 ${activeTab === 'reserve-list' ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-700'}`}>Reserve</button>
            <button data-tab="messages" onClick={() => setTab('messages')} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 hover:scale-105 active:scale-95 ${activeTab === 'messages' ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-700'}`}>Messages</button>
          </div>
        </div>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">

            {activeTab === 'wallet' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                {/* Left Column: Balance & Cards */}
                <div className="lg:col-span-7 space-y-8">
                  <section>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-brand-100 rounded-lg text-brand-600">
                        <Wallet size={24} />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">My Wallet</h2>
                    </div>
                    <WalletCard
                      onTransactionComplete={() => setRefreshKey(prev => prev + 1)}
                      refreshTrigger={refreshKey}
                    />
                  </section>

                  <section>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-brand-100 rounded-lg text-brand-600">
                        <CreditCard size={24} />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">Payment Methods</h2>
                    </div>
                    <PaymentMethods />
                  </section>
                </div>

                {/* Right Column: History */}
                <div className="lg:col-span-5">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-full">
                    <TransactionHistory refreshTrigger={refreshKey} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'explore' && (
              <UserExploreTab listings={listings} />
            )}

            {activeTab === 'favorites' && (
              <UserFavoritesTab user={user} listings={listings} />
            )}

            {activeTab === 'bookings' && (
              <UserBookingsTab
                user={user}
                listings={listings}
                onMessageHost={handleMessageHost}
                onCancelBooking={(booking, policy) => setCancellationModalBooking({ booking, policy })}
                onReviewBooking={(bookingId, listingId, listingTitle) => setReviewModalBooking({ bookingId, listingId, listingTitle })}
                onModifyBooking={(booking) => {
                  console.log('onModifyBooking called in UserDashboard', booking);
                  const listing = listings.find(l => l.id === booking.listingId);
                  if (listing) {
                    console.log('Listing found, opening modal', listing);
                    setModifyModalBooking({ booking, listing });
                  } else {
                    console.error('Listing not found for booking', booking);
                    toast.showToast({ message: 'Error: Could not find listing details for this booking.', type: 'info' });
                  }
                }}
              />
            )}

            {activeTab === 'reserve-list' && (
              <UserReserveListTab
                user={user}
                listings={listings}
                onUpdate={() => setRefreshKey(prev => prev + 1)}
              />
            )}

            {activeTab === 'messages' && (
              <div className="space-y-4 animate-in fade-in">
                {/* Messages Header */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Messages</h2>
                      <p className="text-sm text-gray-500 mt-1">Chat with hosts</p>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <div className="relative flex-1 sm:flex-none sm:w-64">
                        <input
                          type="text"
                          placeholder="Search conversations..."
                          title="Search conversations"
                          aria-label="Search conversations"
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
                    <div className={`w-full md:w-2/5 lg:w-1/3 border-r border-gray-200 flex flex-col ${selectedConversationId ? 'hidden md:flex' : 'flex'}`}>
                      <div className="p-4 border-b border-gray-200 bg-gray-50">
                        <h3 className="font-bold text-gray-900 text-sm">Conversations</h3>
                        <p className="text-xs text-gray-500 mt-1">{getConversations(user.id).filter(c => c.participants.includes(user.id)).length} active</p>
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
                    <div className={`w-full md:w-3/5 lg:w-2/3 flex-col ${selectedConversationId ? 'flex' : 'hidden md:flex'}`}>
                      {selectedConversationId ? (
                        <ChatWindow
                          conversationId={selectedConversationId}
                          currentUserId={user.id}
                          onBack={() => setSelectedConversationId(undefined)}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full bg-gray-50">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <MessageSquare size={32} className="text-gray-400" />
                          </div>
                          <h3 className="font-bold text-gray-900 mb-2">No conversation selected</h3>
                          <p className="text-sm text-gray-500 max-w-xs text-center">Choose a conversation from the list to start chatting with hosts</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <MessageSquare size={20} className="text-blue-700" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Total Conversations</p>
                        <p className="text-lg font-bold text-gray-900">{getConversations(user.id).filter(c => c.participants.includes(user.id)).length}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <CheckCircle size={20} className="text-green-700" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Unread Messages</p>
                        <p className="text-lg font-bold text-gray-900">{getConversations(user.id).filter(c => c.participants.includes(user.id) && c.unreadCount && c.unreadCount > 0).length}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Clock size={20} className="text-purple-700" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Active Bookings</p>
                        <p className="text-lg font-bold text-gray-900">{userBookings.filter(b => b.status === 'Confirmed').length}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                <Settings user={user} />
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && user && (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                <NotificationsPage userId={user.id} />
              </div>
            )}

          </div>
        </main>
      </div>

      {/* Review Modal */}
      {reviewModalBooking && (
        <ReviewModal
          bookingId={reviewModalBooking.bookingId}
          listingId={reviewModalBooking.listingId}
          userId={user.id}
          listingTitle={reviewModalBooking.listingTitle}
          onClose={() => setReviewModalBooking(null)}
          onSuccess={() => setRefreshKey(prev => prev + 1)}
        />
      )}
      {cancellationModalBooking && (
        <CancellationModal
          booking={cancellationModalBooking.booking}
          policy={cancellationModalBooking.policy}
          onClose={() => setCancellationModalBooking(null)}
          onSuccess={() => {
            setRefreshKey(prev => prev + 1);
            setCancellationModalBooking(null);
          }}
        />
      )}
      {modifyModalBooking && (
        <ModifyBookingModal
          booking={modifyModalBooking.booking}
          listing={modifyModalBooking.listing}
          onClose={() => setModifyModalBooking(null)}
          onSuccess={() => {
            setRefreshKey(prev => prev + 1);
            setModifyModalBooking(null);
          }}
        />
      )}
    </div>
  );
};

export default UserDashboard;
