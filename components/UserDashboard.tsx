
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../services/storage';
import { User, Listing, Booking, ListingStatus } from '../types';
import { getSpaceRecommendations } from '../services/geminiService';
import { WalletCard } from './WalletCard';
import { TransactionHistory } from './TransactionHistory';
import { PaymentMethods } from './PaymentMethods';
import { Wallet, CreditCard, LayoutGrid, Sparkles, Search, ArrowRight, Heart, Calendar, Star } from 'lucide-react';
import ListingCard from './ListingCard';
import { getBookings, deleteBooking, startConversation, getConversations, getReviews } from '../services/storage';
import { ChatList } from './ChatList';
import { ChatWindow } from './ChatWindow';
import { MessageSquare } from 'lucide-react';
import ReviewModal from './ReviewModal';
import Settings from './Settings';

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
  const [activeTab, setActiveTab] = useState<'explore' | 'wallet' | 'favorites' | 'bookings' | 'reserve-list' | 'messages' | 'settings'>('explore');
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>(undefined);
  const [reviewModalBooking, setReviewModalBooking] = useState<{ bookingId: string; listingId: string; listingTitle: string } | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [refreshKey, setRefreshKey] = useState(0); // Force re-render for storage updates

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
    if (tab === 'wallet' || tab === 'favorites' || tab === 'bookings' || tab === 'explore' || tab === 'reserve-list' || tab === 'messages') {
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
  const setTab = (tab: 'explore' | 'wallet' | 'favorites' | 'bookings' | 'reserve-list' | 'messages' | 'settings') => {
    setActiveTab(tab);
    // Update query param without losing other params
    const params = new URLSearchParams(searchParams);
    params.set('tab', tab);
    setSearchParams(params);
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Welcome back, <span className="text-brand-600">{user.name.split(' ')[0]}</span>
          </h1>
          <p className="mt-2 text-lg text-gray-500">Find your next space or manage your assets.</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-gray-100/80 backdrop-blur-sm p-1.5 rounded-xl border border-gray-200">
          <button
            onClick={() => setTab('explore')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${activeTab === 'explore'
              ? 'bg-white text-brand-600 shadow-sm ring-1 ring-black/5'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
              }`}
          >
            <LayoutGrid size={18} />
            Explore
          </button>
          <button
            onClick={() => setTab('favorites')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${activeTab === 'favorites'
              ? 'bg-white text-brand-600 shadow-sm ring-1 ring-black/5'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
              }`}
          >
            <Heart size={18} />
            Favorites
          </button>
          <button
            onClick={() => setTab('bookings')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${activeTab === 'bookings'
              ? 'bg-white text-brand-600 shadow-sm ring-1 ring-black/5'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
              }`}
          >
            <Calendar size={18} />
            Bookings
          </button>
          <button
            onClick={() => setTab('wallet')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${activeTab === 'wallet'
              ? 'bg-white text-brand-600 shadow-sm ring-1 ring-black/5'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
              }`}
          >
            <Wallet size={18} />
            Wallet
          </button>
          <button
            onClick={() => setTab('reserve-list')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${activeTab === 'reserve-list'
              ? 'bg-white text-brand-600 shadow-sm ring-1 ring-black/5'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
              }`}
          >
            <Sparkles size={18} />
            Reserve List
          </button>
          <button
            onClick={() => setTab('messages')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${activeTab === 'messages'
              ? 'bg-white text-brand-600 shadow-sm ring-1 ring-black/5'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
              }`}
          >
            <MessageSquare size={18} />
            Messages
          </button>
          <button
            onClick={() => setTab('settings')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${activeTab === 'settings'
              ? 'bg-white text-brand-600 shadow-sm ring-1 ring-black/5'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
              }`}
          >
            <LayoutGrid size={18} />
            Settings
          </button>
        </div>
      </div>

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
              <WalletCard onTransactionComplete={() => {
                // Trigger refresh logic if needed
              }} />
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
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Transaction History</h2>
                <button className="text-sm text-brand-600 font-medium hover:text-brand-700">View All</button>
              </div>
              <TransactionHistory />
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
                <div className="relative flex gap-2 bg-white p-2 rounded-2xl shadow-sm">
                  <input
                    type="text"
                    value={preference}
                    onChange={(e) => setPreference(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="e.g. A modern conference room for 20 people with a projector..."
                    className="w-full bg-transparent text-gray-900 placeholder-gray-400 px-4 text-lg outline-none"
                  />
                  <button
                    onClick={handleSearch}
                    disabled={isLoading}
                    className="bg-brand-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-brand-700 transition-colors shadow-sm disabled:opacity-80 disabled:cursor-not-allowed flex items-center gap-2 min-w-[120px] justify-center"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Search size={20} />
                        <span>Find</span>
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

      {activeTab === 'reserve-list' && (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Reserve List (Drafts)</h2>
          {getBookings().filter(b => b.userId === user.id && b.status === 'Reserved').length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
              <Sparkles size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No saved drafts found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {getBookings().filter(b => b.userId === user.id && b.status === 'Reserved').map(b => {
                const listing = listings.find(l => l.id === b.listingId);
                return (
                  <div key={b.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-6 relative overflow-hidden">
                    {/* Draft Indicator Strip */}
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-yellow-400"></div>

                    {listing && (
                      <img src={listing.images[0]} alt={listing.title} className="w-full md:w-48 h-32 object-cover rounded-lg grayscale-[20%]" />
                    )}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{listing?.title || 'Unknown Space'}</h3>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                          Draft / Reserved
                        </span>
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

                      <div className="flex gap-3 mt-2">
                        <button
                          onClick={() => {
                            // Navigate to listing details to complete booking
                            // In a real app, we might pass the draft ID to pre-fill the modal
                            // For now, just going to the listing is a good start, or we could open a modal here.
                            // Let's just navigate to the listing for simplicity in this iteration.
                            navigate(`/listing/${listing?.id}`);
                          }}
                          className="px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-lg hover:bg-brand-700 transition-colors"
                        >
                          Complete Booking
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Remove this draft?')) {
                              deleteBooking(b.id);
                              setRefreshKey(prev => prev + 1); // Force re-render
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
      )}

      {activeTab === 'messages' && (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 h-[600px] bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex">
          <div className="w-1/3 border-r border-gray-200">
            <ChatList
              currentUserId={user.id}
              selectedId={selectedConversationId}
              onSelect={setSelectedConversationId}
            />
          </div>
          <div className="w-2/3">
            {selectedConversationId ? (
              <ChatWindow
                conversationId={selectedConversationId}
                currentUserId={user.id}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-gray-50">
                <MessageSquare size={48} className="mb-4 opacity-20" />
                <p>Select a conversation to start chatting</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
          <Settings user={user} />
        </div>
      )}

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
    </div>
  );
};

export default UserDashboard;
