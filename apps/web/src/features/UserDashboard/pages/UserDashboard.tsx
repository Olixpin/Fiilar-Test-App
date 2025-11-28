
import React, { useState, useEffect, useRef } from 'react';
import { useToast, UserAvatar } from '@fiilar/ui';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getCurrentUser, getBookings } from '@fiilar/storage';
import { startConversation, getConversations } from '@fiilar/messaging';
import { User, Listing, Booking, CancellationPolicy } from '@fiilar/types';
import { WalletCard } from '../components/WalletCard';
import { TransactionHistory } from '../components/TransactionHistory';
import { PaymentMethods } from '../components/PaymentMethods';
import { Heart, Calendar, Wallet, LayoutGrid, Sparkles, MessageSquare, Bell, CreditCard, Settings as SettingsIcon, CheckCircle, Clock, Search, Home, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
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
import { UserHomeTab } from '../components/UserHomeTab';
import { cn } from '@fiilar/utils';

interface UserDashboardProps {
  user: User | null;
  listings: Listing[];
  onRefreshUser: () => void;
  onLogout?: () => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ user, listings, onRefreshUser, onLogout }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  // Hooks must be declared unconditionally and in the same order on every render.
  // Move state and router hooks to the top so an early return (when user is null)
  // doesn't change the Hooks call order.
  const [activeTab, setActiveTab] = useState<'home' | 'explore' | 'wallet' | 'favorites' | 'bookings' | 'reserve-list' | 'messages' | 'settings' | 'notifications'>('home');
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>(undefined);
  const [reviewModalBooking, setReviewModalBooking] = useState<{ bookingId: string, listingId: string, listingTitle: string } | null>(null);
  const [cancellationModalBooking, setCancellationModalBooking] = useState<{ booking: Booking, policy: CancellationPolicy } | null>(null);
  const [modifyModalBooking, setModifyModalBooking] = useState<{ booking: Booking, listing: Listing } | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Poll for notifications
  useEffect(() => {
    if (!user) return;
    const updateNotificationCount = () => {
      // Assuming getUnreadCount is synchronous or we need to check its implementation. 
      // Navbar uses it synchronously: const count = getUnreadCount(user.id);
      // Let's verify if we need to import it first.
      import('@fiilar/notifications').then(({ getUnreadCount }) => {
        const count = getUnreadCount(user.id);
        setUnreadNotifications(count);
      });
    };

    updateNotificationCount();
    const interval = setInterval(updateNotificationCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setActiveTab('explore');
    }
  };

  // If user is not signed in, redirect to home page (not login).
  // Early-return prevents reading properties on null.
  useEffect(() => {
    if (!user) {
      // If there's no in-memory user but localStorage has a session, do not redirect — allow parent to hydrate state.
      const stored = getCurrentUser();
      if (!stored) {
        // navigate to home page after a tick to avoid render glitches
        navigate('/');
      }
    }
  }, [user, navigate]);

  // Initialize tab from url ?tab=bookings|wallet|favorites
  // IMPORTANT: This must be before the early return to maintain consistent hook order
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'home' || tab === 'wallet' || tab === 'favorites' || tab === 'bookings' || tab === 'explore' || tab === 'reserve-list' || tab === 'messages' || tab === 'settings' || tab === 'notifications') {
      setActiveTab(tab as any);
    }

    const convId = searchParams.get('conversationId');
    if (convId) {
      setSelectedConversationId(convId);
    }

    // Close profile menu on click outside or ESC
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
  }, [searchParams]);

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-gray-600">Please sign in to view your dashboard.</p>
      </div>
    );
  }

  // Helper to change tab and update URL so history reflects tab changes
  const setTab = (tab: 'home' | 'explore' | 'wallet' | 'favorites' | 'bookings' | 'reserve-list' | 'messages' | 'settings' | 'notifications') => {
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
  const unreadMessages = getConversations(user.id).filter(c => c.participants.includes(user.id) && c.unreadCount && c.unreadCount > 0).length;

  const tabConfig = [
    { id: 'home' as const, icon: Home, label: 'Home' },
    { id: 'explore' as const, icon: LayoutGrid, label: 'Explore' },
    { id: 'favorites' as const, icon: Heart, label: 'Favorites', badge: user.favorites?.length },
    { id: 'bookings' as const, icon: Calendar, label: 'Bookings', badge: userBookings.filter(b => b.status === 'Pending' || b.status === 'Confirmed').length },
    { id: 'wallet' as const, icon: Wallet, label: 'Wallet' },
    { id: 'reserve-list' as const, icon: Sparkles, label: 'Reserve List', badge: reservedBookings.length },
    { id: 'messages' as const, icon: MessageSquare, label: 'Messages', badge: unreadMessages },
  ];

  const secondaryTabs = [
    { id: 'settings' as const, icon: SettingsIcon, label: 'Settings' },
    { id: 'notifications' as const, icon: Bell, label: 'Notifications' },
  ];



  return (
    <div className="fixed inset-0 flex bg-white overflow-hidden">
      {/* Gradient Background Layer */}
      <div className="absolute inset-y-0 left-0 w-[400px] bg-gradient-to-br from-orange-100 via-rose-50 to-blue-100 opacity-60 pointer-events-none" />

      {/* Desktop Collapsible Sidebar */}
      <aside className={cn(
        "hidden lg:flex flex-col py-6 bg-white border-r border-gray-100 z-20 transition-all duration-300 ease-in-out",
        sidebarExpanded ? "w-[220px]" : "w-[72px]"
      )}>
        {/* Logo & Toggle */}
        <div className={cn(
          "flex items-center mb-8",
          sidebarExpanded ? "px-5 justify-between" : "px-4 justify-center"
        )}>
          <button
            onClick={() => navigate('/')}
            className={cn(
              "flex items-center justify-center hover:opacity-80 transition-opacity",
              sidebarExpanded ? "h-7" : "w-8 h-8"
            )}
            title="Go to homepage"
          >
            <img
              src={sidebarExpanded ? "/assets/logo.png" : "/assets/fiilar-icon.png"}
              alt="Fiilar"
              className={cn(
                "object-contain",
                sidebarExpanded ? "h-full w-auto" : "w-full h-full"
              )}
            />
          </button>
          <button
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            className={cn(
              "w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-all",
              !sidebarExpanded && "absolute left-[60px] top-6 shadow-sm border border-gray-200"
            )}
            title={sidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            {sidebarExpanded ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
          </button>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 flex flex-col w-full px-3">
          {tabConfig.map((tab, idx) => (
            <React.Fragment key={tab.id}>
              <button
                data-tab={tab.id}
                onClick={() => setTab(tab.id)}
                title={tab.label}
                className={cn(
                  "relative flex items-center gap-3 rounded-full transition-all duration-200",
                  sidebarExpanded ? "px-4 py-2.5" : "w-10 h-10 justify-center mx-auto rounded-xl",
                  activeTab === tab.id
                    ? "bg-brand-600 text-white shadow-md shadow-brand-600/20"
                    : "text-gray-700 hover:bg-gray-50"
                )}
              >
                <tab.icon size={18} strokeWidth={activeTab === tab.id ? 2 : 1.5} className="shrink-0" />
                {sidebarExpanded && (
                  <span className={cn(
                    "text-sm font-medium whitespace-nowrap",
                    activeTab === tab.id ? "text-white" : "text-gray-700"
                  )}>
                    {tab.label}
                  </span>
                )}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className={cn(
                    "min-w-[18px] h-[18px] text-[10px] font-bold rounded-full flex items-center justify-center px-1",
                    sidebarExpanded ? "ml-auto" : "absolute -top-1 -right-1 border-2 border-white",
                    activeTab === tab.id
                      ? sidebarExpanded ? "bg-white/20 text-white" : "bg-white text-brand-600"
                      : "bg-red-500 text-white"
                  )}>
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </span>
                )}
              </button>
              {idx < tabConfig.length - 1 && (
                <div className={cn(
                  "w-5 h-px bg-gray-200 my-2",
                  sidebarExpanded ? "mx-4" : "mx-auto"
                )} />
              )}
            </React.Fragment>
          ))}

          {/* Divider between main and secondary tabs */}
          <div className={cn(
            "h-px bg-gray-200 my-4",
            sidebarExpanded ? "mx-2" : "mx-2"
          )} />

          {secondaryTabs.map((tab, idx) => (
            <React.Fragment key={tab.id}>
              <button
                data-tab={tab.id}
                onClick={() => setTab(tab.id)}
                title={tab.label}
                className={cn(
                  "relative flex items-center gap-3 rounded-full transition-all duration-200",
                  sidebarExpanded ? "px-4 py-2.5" : "w-10 h-10 justify-center mx-auto rounded-xl",
                  activeTab === tab.id
                    ? "bg-brand-600 text-white shadow-md shadow-brand-600/20"
                    : "text-gray-700 hover:bg-gray-50"
                )}
              >
                <tab.icon size={18} strokeWidth={activeTab === tab.id ? 2 : 1.5} className="shrink-0" />
                {sidebarExpanded && (
                  <span className={cn(
                    "text-sm font-medium whitespace-nowrap",
                    activeTab === tab.id ? "text-white" : "text-gray-700"
                  )}>
                    {tab.label}
                  </span>
                )}
              </button>
              {idx < secondaryTabs.length - 1 && (
                <div className={cn(
                  "w-5 h-px bg-gray-200 my-2",
                  sidebarExpanded ? "mx-4" : "mx-auto"
                )} />
              )}
            </React.Fragment>
          ))}
        </nav>

        {/* Home Button at Bottom */}
        <div className="px-3 mt-auto pt-4">
          <button
            onClick={() => navigate('/')}
            title="Back to Home"
            className={cn(
              "flex items-center gap-3 rounded-full text-gray-700 hover:bg-gray-50 transition-all duration-200",
              sidebarExpanded ? "px-4 py-2.5 w-full" : "w-10 h-10 justify-center mx-auto rounded-xl"
            )}
          >
            <Home size={18} strokeWidth={1.5} className="shrink-0" />
            {sidebarExpanded && (
              <span className="text-sm font-medium text-gray-700">Back to Home</span>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10 bg-[#FFFBF9]">
        {/* Top Header */}
        <header className="hidden lg:flex items-center justify-between px-8 py-5 bg-transparent w-full max-w-[1600px] mx-auto">
          {/* Left: Current Tab Title - Empty as requested */}
          <div />

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Search Button */}
            {/* Search Input */}
            <div className="relative hidden xl:block group">
              <div className="flex items-center bg-white border border-gray-200 rounded-full shadow-sm hover:shadow-lg transition-all duration-300 w-[400px] focus-within:ring-4 focus-within:ring-brand-500/10 focus-within:border-brand-500/50">
                <input
                  type="text"
                  placeholder="Search for spaces..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearch}
                  className="flex-1 pl-6 pr-4 py-2.5 bg-transparent text-sm text-gray-900 placeholder-gray-500 focus:outline-none rounded-l-full"
                />
                <div className="pr-1.5">
                  <div className="bg-brand-600 text-white p-2 rounded-full group-hover:scale-105 transition-all duration-200 cursor-pointer shadow-md shadow-brand-600/20" onClick={() => searchQuery && setActiveTab('explore')}>
                    <Search size={16} strokeWidth={2.5} />
                  </div>
                </div>
              </div>
            </div>
            {/* Mobile/Tablet Search Button */}
            <button
              onClick={() => navigate('/')}
              className="xl:hidden flex items-center justify-center w-10 h-10 bg-white border border-gray-200 rounded-full text-gray-600 shadow-sm"
              aria-label="Search"
            >
              <Search size={18} />
            </button>

            {/* Notifications */}
            <button
              onClick={() => setTab('notifications')}
              className={cn(
                "relative w-9 h-9 rounded-full flex items-center justify-center transition-all border",
                activeTab === 'notifications'
                  ? "bg-brand-500 text-white border-brand-500 shadow-lg shadow-brand-500/20"
                  : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
              )}
              aria-label="Notifications"
            >
              <Bell size={16} />
              {unreadNotifications > 0 && activeTab !== 'notifications' && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
              )}
            </button>

            {/* User Avatar & Dropdown */}
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className={cn(
                  "flex items-center gap-2 rounded-full transition-all duration-200 p-1.5 pr-3",
                  isProfileMenuOpen || activeTab === 'settings'
                    ? "bg-gray-100"
                    : "hover:bg-gray-100"
                )}
                aria-label={`${user.firstName || user.name.split(' ')[0]} account menu`}
                {...{ 'aria-expanded': isProfileMenuOpen }}
                aria-haspopup="menu"
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
                      setTab('settings');
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <SettingsIcon size={16} />
                    Settings
                  </button>

                  <div className="h-px bg-gray-100 my-1" />

                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onLogout?.();
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
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
          {/* Left: Tab Title - Empty as requested */}
          <div />

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/')}
              className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center"
              title="Find Spaces"
            >
              <Search size={18} className="text-gray-600" />
            </button>
            <button
              onClick={() => setTab('notifications')}
              className="relative w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center"
              title="Notifications"
            >
              <Bell size={18} className="text-gray-600" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
            </button>
            <button
              onClick={() => setTab('settings')}
              className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center overflow-hidden"
              title="Settings"
            >
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover" />
              ) : (
                <span className="text-white font-bold text-sm">{user.name.charAt(0)}</span>
              )}
            </button>
          </div>
        </header>

        {/* Content Area with White Background Card */}
        <main className="flex-1 overflow-y-auto px-4 lg:px-8 pb-24 lg:pb-8">
          <div className="bg-white rounded-t-[32px] lg:rounded-3xl min-h-full shadow-xl shadow-gray-200/50 -mx-4 lg:mx-0 px-4 sm:px-6 lg:px-8 py-8 max-w-[1600px] mx-auto">

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

            {activeTab === 'home' && (
              <UserHomeTab
                user={user}
                listings={listings}
                onTabChange={setTab}
              />
            )}

            {activeTab === 'explore' && (
              <UserExploreTab listings={listings} initialSearchQuery={searchQuery} />
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
                    showToast({ message: 'Error: Could not find listing details for this booking.', type: 'error' });
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
                <Settings user={user} onUpdateUser={() => onRefreshUser()} onLogout={onLogout} />
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

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-gray-200 pb-safe">
        <div className="flex items-center justify-around h-[68px] px-2">
          {tabConfig.map((tab) => (
            <button
              key={tab.id}
              data-tab={tab.id}
              onClick={() => setTab(tab.id)}
              className={cn(
                "relative flex flex-col items-center justify-center flex-1 py-2",
                activeTab === tab.id ? "text-brand-600" : "text-gray-400"
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                activeTab === tab.id && "bg-brand-500 text-white shadow-lg shadow-brand-500/30"
              )}>
                <tab.icon
                  size={22}
                  strokeWidth={activeTab === tab.id ? 2 : 1.5}
                  className={activeTab === tab.id ? "text-white" : ""}
                />
                {tab.badge !== undefined && tab.badge > 0 && activeTab !== tab.id && (
                  <span className="absolute top-1 right-1/4 min-w-[16px] h-4 text-[10px] font-bold bg-red-500 text-white rounded-full flex items-center justify-center px-1">
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
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
