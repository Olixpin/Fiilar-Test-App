
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../services/storage';
import { User, Listing, Booking, ListingStatus } from '../types';
import { getSpaceRecommendations } from '../services/geminiService';
import { WalletCard } from './WalletCard';
import { TransactionHistory } from './TransactionHistory';
import { PaymentMethods } from './PaymentMethods';
import { Heart, Search, Calendar, Wallet, Star, Home, LayoutGrid, Sparkles, MessageSquare, Bell, CreditCard, ArrowRight, XCircle, Clock, Info, Settings as SettingsIcon, CheckCircle } from 'lucide-react';
import ListingCard from './ListingCard';
import CancellationModal from './CancellationModal';
import { CancellationPolicy } from '../types';
import { getBookings, deleteBooking, startConversation, getConversations, getReviews } from '../services/storage';
import { ChatList } from './ChatList';
import { ChatWindow } from './ChatWindow';
import ReviewModal from './ReviewModal';
import Settings from './Settings';
import NotificationsPage from './NotificationsPage';

interface UserDashboardProps {
  user: User | null;
  listings: Listing[];
}

const UserDashboard: React.FC<UserDashboardProps> = ({ user, listings }) => {
  const navigate = useNavigate();
  // Hooks must be declared unconditionally and in the same order on every render.
  // Move state and router hooks to the top so an early return (when user is null)
  // doesn't change the Hooks call order.
  const [preference, setPreference] = useState('');
  const [recommendations, setRecommendations] = useState<{ listing: Listing, reason: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'explore' | 'wallet' | 'favorites' | 'bookings' | 'reserve-list' | 'messages' | 'settings' | 'notifications'>('explore');
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>(undefined);
  const [reviewModalBooking, setReviewModalBooking] = useState<{ bookingId: string, listingId: string, listingTitle: string } | null>(null);
  const [cancellationModalBooking, setCancellationModalBooking] = useState<{ booking: Booking, policy: CancellationPolicy } | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [searchParams, setSearchParams] = useSearchParams();
  const [refreshKey, setRefreshKey] = useState(0);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

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

  const handleSearch = async () => {
    if (!preference.trim()) return;
    setIsLoading(true);
    try {
      const recs = await getSpaceRecommendations(preference, listings);

      // Map IDs back to full objects
      const fullRecs = recs.map(r => {
        const found = listings.find(l => l.id === r.listingId);
        return found ? { listing: found, reason: r.reason } : null;
      }).filter(Boolean) as { listing: Listing, reason: string }[];

      setRecommendations(fullRecs);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const userBookings = getBookings().filter(b => b.userId === user.id);
  const reservedBookings = userBookings.filter(b => b.status === 'Reserved');

  return (
    <div className="bg-gray-50">
      {/* Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-gray-200 fixed top-16 left-0 bottom-0 z-40">
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
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
        <div className="p-4 space-y-1 border-t border-gray-100 flex-shrink-0">
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
            <button data-tab="explore" onClick={() => setTab('explore')} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${activeTab === 'explore' ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-700'}`}>Explore</button>
            <button data-tab="favorites" onClick={() => setTab('favorites')} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${activeTab === 'favorites' ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-700'}`}>Favorites</button>
            <button data-tab="bookings" onClick={() => setTab('bookings')} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${activeTab === 'bookings' ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-700'}`}>Bookings</button>
            <button data-tab="wallet" onClick={() => setTab('wallet')} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${activeTab === 'wallet' ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-700'}`}>Wallet</button>
            <button data-tab="reserve-list" onClick={() => setTab('reserve-list')} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${activeTab === 'reserve-list' ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-700'}`}>Reserve</button>
            <button data-tab="messages" onClick={() => setTab('messages')} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${activeTab === 'messages' ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-700'}`}>Messages</button>
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
              <WalletCard onTransactionComplete={() => setRefreshKey(prev => prev + 1)} />
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
        <>
          {/* AI Search */}
          <div className="bg-brand-50 p-8 md:p-12 rounded-[2rem] text-gray-900 shadow-sm relative overflow-hidden animate-in zoom-in-95 duration-700">
            <div className="relative z-10 max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 backdrop-blur-sm border border-brand-100 text-sm font-medium text-brand-700 mb-6">
                <Sparkles size={14} className="text-brand-500" />
                Powered by Gemini AI
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-black">
                Find your perfect space instantly
              </h2>
              <p className="mb-8 text-lg text-black max-w-2xl mx-auto">
                Describe what you need—whether it's a quiet studio, a large event hall, or a cozy apartment.
              </p>

              <div className="relative max-w-2xl mx-auto group">
                <div className="absolute -inset-1 bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
                <div className="relative flex flex-col sm:flex-row gap-2 bg-white p-2 rounded-2xl shadow-sm">
                  <input
                    type="text"
                    value={preference}
                    onChange={(e) => setPreference(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Describe your ideal space..."
                    className="w-full bg-transparent text-gray-900 placeholder-gray-400 px-4 py-3 sm:py-0 text-base sm:text-lg outline-none"
                  />
                  <button
                    onClick={handleSearch}
                    disabled={isLoading}
                    className="bg-brand-600 text-white px-6 sm:px-8 py-3 rounded-xl font-semibold hover:bg-brand-700 transition-colors shadow-sm disabled:opacity-80 disabled:cursor-not-allowed flex items-center gap-2 justify-center whitespace-nowrap"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Search size={20} />
                        <span>Find Spaces</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Decorative Elements (very subtle) */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-brand-500/6 rounded-full -translate-y-1/3 translate-x-1/4 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-brand-400/5 rounded-full translate-y-1/3 -translate-x-1/4 blur-3xl"></div>
          </div>

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="flex items-center gap-2">
                <Sparkles className="text-brand-600" size={24} />
                <h3 className="text-2xl font-bold text-gray-900">Recommended for you</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {recommendations.map((item, idx) => (
                  <div key={item.listing.id} className="flex flex-col h-full group">
                    <div className="relative">
                      <ListingCard listing={item.listing} />
                      <div className="absolute -bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm p-4 rounded-xl border border-brand-100 shadow-lg transform transition-all group-hover:-translate-y-1">
                        <div className="flex items-start gap-2">
                          <Sparkles size={16} className="text-brand-600 mt-1 shrink-0" />
                          <p className="text-sm text-gray-600 leading-relaxed">
                            <span className="font-semibold text-brand-900">Why:</span> {item.reason}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="h-12"></div> {/* Spacer for the absolute box */}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Standard Listing Grid (Fallback or Browse) */}
          {!isLoading && recommendations.length === 0 && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Trending Spaces</h3>
                <button className="text-brand-600 font-semibold hover:text-brand-700 flex items-center gap-1">
                  View all <ArrowRight size={16} />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {listings.slice(0, 3).map(l => (
                  <ListingCard key={l.id} listing={l} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'favorites' && (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Favorites</h2>
          {(!user.favorites || user.favorites.length === 0) ? (
            <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
              <Heart size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">You haven't saved any spaces yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {listings.filter(l => user.favorites?.includes(l.id)).map(l => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'bookings' && (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Bookings</h2>
          {getBookings().filter(b => b.userId === user.id).length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
              <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No bookings found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {getBookings().filter(b => b.userId === user.id).map(b => {
                const listing = listings.find(l => l.id === b.listingId);
                return (
                  <div key={b.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-6">
                    {listing && (
                      <img src={listing.images[0]} alt={listing.title} className="w-full md:w-48 h-32 object-cover rounded-lg" />
                    )}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{listing?.title || 'Unknown Space'}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${b.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                          b.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                          {b.status}
                        </span>
                      </div>
                      <p className="text-gray-500 text-sm mb-4">{listing?.location.address}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar size={16} />
                          {b.date}
                        </div>
                        <div className="font-medium text-gray-900">
                          ${b.totalPrice.toFixed(2)}
                        </div>
                      </div>

                      {listing && (
                        <div className="flex gap-3 mt-4">
                          <button
                            onClick={() => handleMessageHost(listing.hostId, listing.id)}
                            className="text-sm font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1"
                          >
                            <MessageSquare size={16} /> Message Host
                          </button>

                          {b.status === 'Confirmed' && (
                            <button
                              onClick={() => {
                                // Default to Flexible if not set (mock data)
                                const policy = listing.settings?.cancellationPolicy || 'Flexible';
                                setCancellationModalBooking({ booking: b, policy });
                              }}
                              className="text-sm font-medium text-red-600 hover:text-red-700 flex items-center gap-1"
                            >
                              <XCircle size={16} /> Cancel
                            </button>
                          )}

                          {b.status === 'Confirmed' && (() => {
                            const reviews = getReviews(listing.id);
                            const hasReviewed = reviews.some(r => r.bookingId === b.id);
                            return !hasReviewed ? (
                              <button
                                onClick={() => setReviewModalBooking({ bookingId: b.id, listingId: listing.id, listingTitle: listing.title })}
                                className="text-sm font-medium text-green-600 hover:text-green-700 flex items-center gap-1"
                              >
                                <Star size={16} /> Leave Review
                              </button>
                            ) : (
                              <span className="text-sm text-gray-500 flex items-center gap-1">
                                <Star size={16} className="fill-yellow-400 text-yellow-400" /> Reviewed
                              </span>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'reserve-list' && (() => {
        const reservedBookings = getBookings().filter(b => b.userId === user.id && b.status === 'Reserved');

        const getTimeSaved = (createdAt: string) => {
          const created = new Date(createdAt).getTime();
          const now = Date.now();
          const elapsed = now - created;
          const hours = Math.floor(elapsed / (60 * 60 * 1000));
          const days = Math.floor(hours / 24);
          return { days, hours: hours % 24 };
        };

        const toggleCompare = (bookingId: string) => {
          setSelectedForCompare(prev => 
            prev.includes(bookingId) ? prev.filter(id => id !== bookingId) : [...prev, bookingId]
          );
        };

        return (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Reserve List</h2>
                <p className="text-sm text-gray-500 mt-1">Saved for later • Not reserved</p>
              </div>
              {reservedBookings.length > 1 && (
                <button
                  onClick={() => {
                    setCompareMode(!compareMode);
                    setSelectedForCompare([]);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${compareMode ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {compareMode ? 'Exit Compare' : 'Compare'}
                </button>
              )}
            </div>

            {reservedBookings.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                <Sparkles size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No saved bookings found.</p>
                <p className="text-xs text-gray-400 mt-2">Save listings to compare and book later</p>
              </div>
            ) : compareMode && selectedForCompare.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedForCompare.map(bookingId => {
                  const b = reservedBookings.find(booking => booking.id === bookingId);
                  if (!b) return null;
                  const listing = listings.find(l => l.id === b.listingId);
                  return (
                    <div key={b.id} className="bg-white rounded-xl border-2 border-brand-200 p-4 space-y-3">
                      {listing && <img src={listing.images[0]} alt={listing.title} className="w-full h-32 object-cover rounded-lg" />}
                      <h3 className="font-bold text-gray-900">{listing?.title}</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-gray-500">Price:</span><span className="font-bold">${b.totalPrice}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Date:</span><span>{b.date}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Duration:</span><span>{b.duration} {listing?.priceUnit === 'Hourly' ? 'hrs' : 'days'}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Capacity:</span><span>{listing?.capacity} people</span></div>
                      </div>
                      <button onClick={() => navigate(`/listing/${listing?.id}`)} className="w-full bg-brand-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-brand-700">
                        Book Now
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-4">
                {reservedBookings.map(b => {
                  const listing = listings.find(l => l.id === b.listingId);
                  const timeSaved = getTimeSaved(b.createdAt || new Date().toISOString());

                  return (
                    <div key={b.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-6 relative overflow-hidden hover:shadow-md transition-shadow">
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-400"></div>

                      {compareMode && (
                        <div className="absolute top-4 right-4 z-10">
                          <input
                            type="checkbox"
                            checked={selectedForCompare.includes(b.id)}
                            onChange={() => toggleCompare(b.id)}
                            className="w-5 h-5 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                          />
                        </div>
                      )}

                      {listing && (
                        <img src={listing.images[0]} alt={listing.title} className="w-full md:w-48 h-32 object-cover rounded-lg" />
                      )}
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-bold text-gray-900">{listing?.title || 'Unknown Space'}</h3>
                          <div className="flex flex-col items-end gap-1">
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                              Draft
                            </span>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock size={12} />
                              Saved {timeSaved.days > 0 ? `${timeSaved.days}d ago` : `${timeSaved.hours}h ago`}
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-500 text-sm mb-4">{listing?.location.address}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                          <div className="flex items-center gap-1">
                            <Calendar size={16} />
                            {b.date}
                          </div>
                          <div className="font-medium text-gray-900">
                            ${b.totalPrice.toFixed(2)}
                          </div>
                          <div className="text-gray-500">
                            • {b.duration} {listing?.priceUnit === 'Hourly' ? 'Hours' : 'Days'}
                          </div>
                        </div>

                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                          <p className="text-xs text-amber-800 flex items-start gap-2">
                            <Info size={14} className="mt-0.5 shrink-0" />
                            <span>This slot is not held. Complete booking to secure availability.</span>
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-3 mt-2">
                          <button
                            onClick={() => navigate(`/listing/${listing?.id}`)}
                            className="px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-lg hover:bg-brand-700 transition-colors"
                          >
                            Complete Booking
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Remove this draft?')) {
                                deleteBooking(b.id);
                                setRefreshKey(prev => prev + 1);
                              }
                            }}
                            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}

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
                  <p className="text-xs text-gray-500 mt-1">{getConversations().filter(c => c.participants.includes(user.id)).length} active</p>
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
                  <p className="text-lg font-bold text-gray-900">{getConversations().filter(c => c.participants.includes(user.id)).length}</p>
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
                  <p className="text-lg font-bold text-gray-900">{getConversations().filter(c => c.participants.includes(user.id) && c.unreadCount && c.unreadCount > 0).length}</p>
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
    </div>
  );
};

export default UserDashboard;
