import React from 'react';
import { User, Listing, Booking, CancellationPolicy } from '@fiilar/types';
import { getBookings } from '@fiilar/storage';

import { getReviews } from '@fiilar/reviews';
import { Calendar, MessageSquare, XCircle, Star, Key, CheckCircle, Clock, Edit, ShieldCheck } from 'lucide-react';

interface UserBookingsTabProps {
  user: User;
  listings: Listing[];
  onMessageHost: (hostId: string, listingId: string) => void;
  onCancelBooking: (booking: Booking, policy: CancellationPolicy) => void;
  onReviewBooking: (bookingId: string, listingId: string, listingTitle: string) => void;
  onModifyBooking?: (booking: Booking) => void;
}

const formatTimeRange = (hours?: number[]) => {
  if (!hours || hours.length === 0) return null;
  const sorted = [...hours].sort((a, b) => a - b);
  const start = sorted[0];
  const end = sorted[sorted.length - 1] + 1; // End of the last hour

  const formatHour = (h: number) => {
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:00 ${ampm}`;
  };

  return `${formatHour(start)} - ${formatHour(end)}`;
};

export const UserBookingsTab: React.FC<UserBookingsTabProps> = ({
  user,
  listings,
  onMessageHost,
  onCancelBooking,
  onReviewBooking,
  onModifyBooking
}) => {
  const userBookings = getBookings().filter(b => b.userId === user.id);

  // Group bookings by groupId
  const displayItems = React.useMemo(() => {
    const groups: Record<string, Booking[]> = {};
    const items: { booking: Booking, group?: Booking[] }[] = [];

    // First pass: collect groups
    userBookings.forEach(b => {
      if (b.groupId) {
        if (!groups[b.groupId]) groups[b.groupId] = [];
        groups[b.groupId].push(b);
      }
    });

    // Second pass: build display items
    const processedGroups = new Set<string>();

    userBookings.forEach(b => {
      if (b.groupId) {
        if (!processedGroups.has(b.groupId)) {
          // Sort group by date
          const group = groups[b.groupId].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          items.push({ booking: group[0], group });
          processedGroups.add(b.groupId);
        }
      } else {
        items.push({ booking: b });
      }
    });

    // Sort all items by date
    return items.sort((a, b) => new Date(a.booking.date).getTime() - new Date(b.booking.date).getTime());
  }, [userBookings]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Bookings</h2>
      {displayItems.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
          <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No bookings found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayItems.map(({ booking: b, group }) => {
            const listing = listings.find(l => l.id === b.listingId);
            const timeRange = formatTimeRange(b.hours);
            const isGroup = group && group.length > 1;
            const totalPrice = isGroup ? group.reduce((sum, item) => sum + item.totalPrice, 0) : b.totalPrice;

            return (
              <div key={b.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-6">
                {listing && (
                  <img src={listing.images[0]} alt={listing.title} className="w-full md:w-48 h-32 object-cover rounded-lg" />
                )}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{listing?.title || 'Unknown Space'}</h3>
                      {isGroup && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700 mt-1">
                          <Clock size={12} /> Recurring Booking ({group.length} sessions)
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${b.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                        b.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                          b.status === 'Started' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                        }`}>
                        {b.status}
                      </span>
                      {/* Payment Status Badge */}
                      {b.paymentStatus === 'Paid - Escrow' && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-100">
                          <ShieldCheck size={10} /> Funds in Escrow
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm mb-4">{listing?.location}</p>

                  {/* Date & Price Section */}
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                    {isGroup ? (
                      <div className="w-full bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <p className="text-xs font-bold text-gray-500 uppercase mb-2">Session Dates</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {group.map(session => (
                            <div key={session.id} className="flex items-center gap-2 text-xs bg-white px-2 py-1 rounded border border-gray-200">
                              <Calendar size={12} className="text-gray-400" />
                              <span>{new Date(session.date).toLocaleDateString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <Calendar size={16} />
                        {new Date(b.date).toLocaleDateString()}
                      </div>
                    )}

                    {!isGroup && timeRange && (
                      <div className="flex items-center gap-1 font-medium text-brand-600">
                        <Clock size={16} />
                        {timeRange}
                      </div>
                    )}
                    <div className="font-medium text-gray-900 text-lg">
                      ${totalPrice.toFixed(2)}
                    </div>
                  </div>

                  {/* Handshake Code Display */}
                  {(b.status === 'Confirmed' || b.status === 'Started') && b.guestCode && (
                    <div className="mt-4 p-4 bg-brand-50 rounded-lg border border-brand-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Key size={16} className="text-brand-600" />
                            <span className="text-sm font-bold text-brand-800">Check-in Code</span>
                          </div>
                          <p className="text-xs text-brand-600">Show to host upon arrival</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-mono font-bold text-brand-700 tracking-widest bg-white px-3 py-1 rounded border border-brand-200">{b.guestCode}</span>
                          {b.handshakeStatus === 'VERIFIED' && (
                            <div className="flex flex-col items-center text-green-600">
                              <CheckCircle size={20} />
                              <span className="text-[10px] font-bold uppercase">Verified</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {listing && (
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => onMessageHost(listing.hostId, listing.id)}
                        className="text-sm font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1"
                      >
                        <MessageSquare size={16} /> Message Host
                      </button>

                      {b.status === 'Pending' && (
                        <>
                          {b.modificationAllowed && (
                            <button
                              type="button"
                              onClick={() => {
                                console.log('Modify Request clicked for booking:', b.id);
                                if (onModifyBooking) {
                                  onModifyBooking(b);
                                } else {
                                  console.error('onModifyBooking prop is undefined');
                                }
                              }}
                              className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer z-10 relative"
                            >
                              <Edit size={16} /> Modify Request
                            </button>
                          )}
                          <button
                            onClick={() => onCancelBooking(b, CancellationPolicy.FLEXIBLE)}
                            className="text-sm font-medium text-gray-500 hover:text-red-600 flex items-center gap-1"
                          >
                            <XCircle size={16} /> Cancel Request
                          </button>
                        </>
                      )}

                      {b.status === 'Confirmed' && (
                        <button
                          onClick={() => {
                            // Default to Flexible if not set (mock data)
                            const policy = listing.cancellationPolicy || CancellationPolicy.FLEXIBLE;
                            onCancelBooking(b, policy);
                          }}
                          className="text-sm font-medium text-red-600 hover:text-red-700 flex items-center gap-1"
                        >
                          <XCircle size={16} /> Cancel {isGroup ? 'Series' : 'Booking'}
                        </button>
                      )}

                      {(b.status === 'Confirmed' || b.status === 'Started' || b.status === 'Completed') && (() => {
                        const reviews = getReviews(listing.id);
                        const hasReviewed = reviews.some(r => r.bookingId === b.id);
                        return !hasReviewed ? (
                          <button
                            onClick={() => onReviewBooking(b.id, listing.id, listing.title)}
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
  );
};
