import React from 'react';
import { User, Listing, Booking, CancellationPolicy, BookingType } from '@fiilar/types';
import { getBookings } from '@fiilar/storage';
import { getReviews } from '@fiilar/reviews';
import { Calendar, MessageSquare, XCircle, Star, Key, CheckCircle, Clock, Edit, ShieldCheck, Filter, List, Grid, Map, CalendarPlus } from 'lucide-react';
import { cn, useLocale } from '@fiilar/ui';

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

const getGoogleMapsUrl = (location: string) => {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
};

const getGoogleCalendarUrl = (booking: Booking, listing: Listing) => {
  const startDate = new Date(booking.date);
  const endDate = new Date(booking.date);

  // Set times based on booking type
  if (booking.bookingType === BookingType.HOURLY && booking.hours && booking.hours.length > 0) {
    const sortedHours = [...booking.hours].sort((a, b) => a - b);
    startDate.setHours(sortedHours[0], 0, 0);
    endDate.setHours(sortedHours[sortedHours.length - 1] + 1, 0, 0);
  } else {
    // Default to Check-in 3PM, Check-out 11AM next day (or same day + duration)
    startDate.setHours(15, 0, 0);
    endDate.setDate(endDate.getDate() + (booking.duration || 1));
    endDate.setHours(11, 0, 0);
  }

  const formatDate = (date: Date) => date.toISOString().replace(/-|:|\.\d\d\d/g, "");

  const text = encodeURIComponent(`Stay at ${listing.title}`);
  const details = encodeURIComponent(`Booking Ref: ${booking.id}\nLocation: ${listing.location}\n\nBooked via Fiilar`);
  const location = encodeURIComponent(listing.location);

  return `https://www.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${formatDate(startDate)}/${formatDate(endDate)}&details=${details}&location=${location}`;
};

type BookingFilter = 'all' | 'upcoming' | 'pending' | 'completed' | 'cancelled';

export const UserBookingsTab: React.FC<UserBookingsTabProps> = ({
  user,
  listings,
  onMessageHost,
  onCancelBooking,
  onReviewBooking,
  onModifyBooking
}) => {
  const { locale } = useLocale();
  const [userBookings, setUserBookings] = React.useState<Booking[]>([]);
  const [activeFilter, setActiveFilter] = React.useState<BookingFilter>('all');
  const [viewMode, setViewMode] = React.useState<'list' | 'calendar'>('list');

  React.useEffect(() => {
    const fetchBookings = () => {
      setUserBookings(getBookings().filter(b => b.userId === user.id));
    };

    fetchBookings();

    const handler = () => fetchBookings();
    window.addEventListener('fiilar:bookings-updated', handler);
    return () => window.removeEventListener('fiilar:bookings-updated', handler);
  }, [user.id]);

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

    // Sort all items by date (descending for completed/cancelled, ascending for upcoming)
    return items.sort((a, b) => {
      const dateA = new Date(a.booking.date).getTime();
      const dateB = new Date(b.booking.date).getTime();
      // If viewing past bookings, show most recent first
      if (activeFilter === 'completed' || activeFilter === 'cancelled') {
        return dateB - dateA;
      }
      // Otherwise show nearest upcoming first
      return dateA - dateB;
    });
  }, [userBookings, activeFilter]);

  const filteredItems = displayItems.filter(({ booking: b }) => {
    const isPast = new Date(b.date) < new Date();

    switch (activeFilter) {
      case 'upcoming':
        return (b.status === 'Confirmed' || b.status === 'Started') && !isPast;
      case 'pending':
        return b.status === 'Pending';
      case 'completed':
        return b.status === 'Completed' || (b.status === 'Confirmed' && isPast);
      case 'cancelled':
        return b.status === 'Cancelled';
      default:
        return true;
    }
  });

  const getCount = (filterId: BookingFilter) => {
    if (filterId === 'all') return displayItems.length;

    return displayItems.filter(({ booking: b }) => {
      const isPast = new Date(b.date) < new Date();
      switch (filterId) {
        case 'upcoming':
          return (b.status === 'Confirmed' || b.status === 'Started') && !isPast;
        case 'pending':
          return b.status === 'Pending';
        case 'completed':
          return b.status === 'Completed' || (b.status === 'Confirmed' && isPast);
        case 'cancelled':
          return b.status === 'Cancelled';
        default:
          return false;
      }
    }).length;
  };

  const filters: { id: BookingFilter; label: string }[] = [
    { id: 'all', label: `All Bookings (${getCount('all')})` },
    { id: 'upcoming', label: `Upcoming (${getCount('upcoming')})` },
    { id: 'pending', label: `Pending (${getCount('pending')})` },
    { id: 'completed', label: `Completed (${getCount('completed')})` },
    { id: 'cancelled', label: `Cancelled (${getCount('cancelled')})` },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-brand-50 rounded-full border border-brand-100 flex items-center justify-center text-brand-600 shadow-sm">
            <Calendar size={24} className="fill-brand-600/10" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Your Bookings</h2>
            <p className="text-sm font-medium text-gray-500">Manage your reservations</p>
          </div>
        </div>

        <div className="flex p-1 bg-gray-100 rounded-xl overflow-x-auto no-scrollbar">
          {filters.map(filter => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
                activeFilter === filter.id
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex p-1 bg-gray-100 rounded-lg">
        <button
          onClick={() => setViewMode('list')}
          className={cn(
            "p-2 rounded-md transition-all",
            viewMode === 'list' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
          )}
          title="List View"
        >
          <List size={20} />
        </button>
        <button
          onClick={() => setViewMode('calendar')}
          className={cn(
            "p-2 rounded-md transition-all",
            viewMode === 'calendar' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
          )}
          title="Calendar View"
        >
          <Grid size={20} />
        </button>
      </div>


      {
        viewMode === 'calendar' ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
              {/* Simple Calendar Grid (Mock for current month) */}
              {Array.from({ length: 35 }).map((_, i) => {
                const day = i - 2; // Offset for start of month
                const date = new Date();
                date.setDate(day);
                const isToday = new Date().getDate() === day;

                // Find bookings for this day
                const dayBookings = userBookings.filter(b => {
                  const bDate = new Date(b.date);
                  return bDate.getDate() === day && bDate.getMonth() === new Date().getMonth();
                });

                return (
                  <div key={i} className={cn(
                    "min-h-[100px] border rounded-xl p-2 flex flex-col gap-1 transition-colors",
                    day > 0 && day <= 31 ? "bg-white border-gray-100" : "bg-gray-50 border-transparent",
                    isToday && "ring-2 ring-brand-500 ring-offset-2"
                  )}>
                    {day > 0 && day <= 31 && (
                      <>
                        <span className={cn(
                          "text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full",
                          isToday ? "bg-brand-600 text-white" : "text-gray-700"
                        )}>{day}</span>

                        {dayBookings.map(b => (
                          <div key={b.id} className={cn(
                            "text-[10px] px-1.5 py-1 rounded truncate font-medium",
                            b.status === 'Confirmed' ? "bg-green-100 text-green-700" :
                              b.status === 'Pending' ? "bg-yellow-100 text-yellow-700" :
                                "bg-gray-100 text-gray-600"
                          )}>
                            {listings.find(l => l.id === b.listingId)?.title || 'Booking'}
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="text-center text-sm text-gray-400 mt-4">Showing current month</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Filter size={24} className="text-gray-400" />
            </div>
            <p className="text-gray-900 font-medium text-lg">No {activeFilter === 'all' ? '' : activeFilter} bookings found</p>
            <p className="text-gray-500 text-sm mt-1">
              {activeFilter === 'all'
                ? "You haven't made any bookings yet."
                : `You don't have any ${activeFilter} bookings at the moment.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredItems.map(({ booking: b, group }) => {
              const listing = listings.find(l => l.id === b.listingId);
              const timeRange = formatTimeRange(b.hours);
              const isGroup = group && group.length > 1;
              const totalPrice = isGroup ? group.reduce((sum, item) => sum + item.totalPrice, 0) : b.totalPrice;

              return (
                <div key={b.id} className="group bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col md:flex-row gap-6">
                  {listing && listing.images && listing.images[0] && (
                    <div className="relative w-full md:w-56 h-40 shrink-0">
                      <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover rounded-xl" />
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-md border w-fit",
                          b.status === 'Confirmed' ? "bg-green-100/90 text-green-700 border-green-200" :
                            b.status === 'Pending' ? "bg-yellow-100/90 text-yellow-700 border-yellow-200" :
                              b.status === 'Started' ? "bg-blue-100/90 text-blue-700 border-blue-200" :
                                b.status === 'Cancelled' ? "bg-red-100/90 text-red-700 border-red-200" :
                                  "bg-gray-100/90 text-gray-700 border-gray-200"
                        )}>
                          {b.status}
                        </span>

                        {/* Payment Status Badge */}
                        {b.paymentStatus === 'Paid - Escrow' && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-brand-700 bg-brand-50/90 backdrop-blur-md px-2 py-0.5 rounded-full border border-brand-100 shadow-sm w-fit">
                            <ShieldCheck size={10} /> Escrow
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-brand-600 transition-colors">{listing?.title || 'Unknown Space'}</h3>
                        <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                          <span className="truncate">{listing?.location}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900 text-xl">
                          {locale.currencySymbol}{totalPrice.toFixed(2)}
                        </div>
                        {isGroup && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full mt-1">
                            <Clock size={10} /> Series
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Date & Time Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-y border-gray-100 my-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gray-50 rounded-lg text-gray-500">
                          <Calendar size={18} />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase">Date</p>
                          {isGroup ? (
                            <div className="flex flex-col gap-1 mt-0.5">
                              <p className="text-sm font-medium text-gray-900">{group.length} Sessions</p>
                              <p className="text-xs text-gray-600 leading-relaxed">
                                {group.map(s => new Date(s.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })).join(', ')}
                              </p>
                            </div>
                          ) : (
                            <p className="text-sm font-medium text-gray-900 mt-0.5">{new Date(b.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                          )}
                        </div>
                      </div>

                      {!isGroup && timeRange && (
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-gray-50 rounded-lg text-gray-500">
                            <Clock size={18} />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase">Time</p>
                            <p className="text-sm font-medium text-gray-900 mt-0.5">{timeRange}</p>
                          </div>
                        </div>
                      )}

                      {(b.status === 'Confirmed' || b.status === 'Started') && b.guestCode && (
                        <div className="flex items-start gap-3 sm:col-span-2 bg-brand-50/50 p-2 rounded-lg border border-brand-100/50">
                          <div className="p-2 bg-brand-100 rounded-lg text-brand-600">
                            <Key size={18} />
                          </div>
                          <div className="flex-1 flex justify-between items-center">
                            <div>
                              <p className="text-xs font-bold text-brand-800 uppercase">Check-in Code</p>
                              <p className="text-xs text-brand-600">Show to host</p>
                            </div>
                            <span className="text-xl font-mono font-bold text-brand-700 tracking-widest bg-white px-3 py-1 rounded border border-brand-200 shadow-sm">
                              {b.guestCode}
                            </span>
                            {b.handshakeStatus === 'VERIFIED' && (
                              <div className="flex flex-col items-center text-green-600 ml-2">
                                <CheckCircle size={20} />
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions Footer */}
                    <div className="mt-auto flex flex-wrap gap-3 justify-end">
                      {listing && (
                        <button
                          onClick={() => onMessageHost(listing.hostId, listing.id)}
                          className="px-4 py-2 bg-gray-50 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
                        >
                          <MessageSquare size={16} /> Message
                        </button>
                      )}

                      {/* Confirmed Booking Actions: Directions & Calendar */}
                      {(b.status === 'Confirmed' || b.status === 'Started') && listing && (
                        <>
                          <a
                            href={getGoogleMapsUrl(listing.location)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 hover:text-brand-600 hover:border-brand-200 transition-colors flex items-center gap-2"
                          >
                            <Map size={16} /> Directions
                          </a>
                          <a
                            href={getGoogleCalendarUrl(b, listing)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 hover:text-brand-600 hover:border-brand-200 transition-colors flex items-center gap-2"
                          >
                            <CalendarPlus size={16} /> Add to Calendar
                          </a>
                        </>
                      )}

                      {b.status === 'Pending' && (
                        <>
                          {b.modificationAllowed && (
                            <button
                              onClick={() => onModifyBooking && onModifyBooking(b)}
                              className="px-4 py-2 bg-blue-50 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2"
                            >
                              <Edit size={16} /> Modify
                            </button>
                          )}
                          <button
                            onClick={() => onCancelBooking(b, CancellationPolicy.FLEXIBLE)}
                            className="px-4 py-2 bg-white border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors flex items-center gap-2"
                          >
                            <XCircle size={16} /> Cancel
                          </button>
                        </>
                      )}

                      {b.status === 'Confirmed' && (
                        <button
                          onClick={() => {
                            const policy = listing?.cancellationPolicy || CancellationPolicy.FLEXIBLE;
                            onCancelBooking(b, policy);
                          }}
                          className="px-4 py-2 bg-white border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors flex items-center gap-2"
                        >
                          <XCircle size={16} /> Cancel
                        </button>
                      )}

                      {(b.status === 'Confirmed' || b.status === 'Started' || b.status === 'Completed') && listing && (() => {
                        const reviews = getReviews(listing.id);
                        const hasReviewed = reviews.some(r => r.bookingId === b.id);
                        return !hasReviewed ? (
                          <button
                            onClick={() => onReviewBooking(b.id, listing.id, listing.title)}
                            className="px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors flex items-center gap-2 shadow-sm shadow-brand-500/20"
                          >
                            <Star size={16} /> Leave Review
                          </button>
                        ) : (
                          <span className="px-4 py-2 bg-yellow-50 text-yellow-700 text-sm font-medium rounded-lg flex items-center gap-2 border border-yellow-100">
                            <Star size={16} className="fill-yellow-500 text-yellow-500" /> Reviewed
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      }
    </div >
  );
};
