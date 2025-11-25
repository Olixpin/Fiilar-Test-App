import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Listing } from '@fiilar/types';
import { getBookings, deleteBooking } from '@fiilar/storage';
import { migrateBookingTimestamps } from '../../../services/bookingMigration';
import { removeDuplicateBookings } from '../../../services/bookingCleanup';
import { Sparkles, Clock, Calendar, Info } from 'lucide-react';

interface UserReserveListTabProps {
  user: User;
  listings: Listing[];
  onUpdate: () => void;
}

export const UserReserveListTab: React.FC<UserReserveListTabProps> = ({ user, listings, onUpdate }) => {
  const navigate = useNavigate();
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  const reservedBookings = getBookings().filter(b => b.userId === user.id && b.status === 'Reserved');

  // Run cleanup and migration once on component mount
  React.useEffect(() => {
    removeDuplicateBookings(); // Remove any duplicates first
    migrateBookingTimestamps(); // Then migrate timestamps
  }, []);

  const formatSavedTime = (createdAt?: string) => {
    if (!createdAt) return 'Just now';
    return new Date(createdAt).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
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
                  <div className="flex justify-between"><span className="text-gray-500">Duration:</span><span>{b.duration} {listing?.priceUnit === 'Hourly' ? (Number(b.duration) === 1 ? 'hr' : 'hrs') : (Number(b.duration) === 1 ? 'day' : 'days')}</span></div>
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

            return (
              <div key={b.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-6 relative overflow-hidden hover:shadow-md transition-shadow">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-400"></div>

                {compareMode && (
                  <div className="absolute top-4 right-4 z-10">
                    <input
                      type="checkbox"
                      checked={selectedForCompare.includes(b.id)}
                      onChange={() => toggleCompare(b.id)}
                      aria-label={`Select ${listing?.title || 'listing'} for comparison`}
                      title={`Select ${listing?.title || 'listing'} for comparison`}
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
                        Saved: {formatSavedTime(b.createdAt)}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm mb-4">{listing?.location}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar size={16} />
                      {b.date}
                    </div>
                    <div className="font-medium text-gray-900">
                      ${b.totalPrice.toFixed(2)}
                    </div>
                    <div className="text-gray-500">
                      • {b.duration} {listing?.priceUnit === 'Hourly' ? (Number(b.duration) === 1 ? 'Hour' : 'Hours') : (Number(b.duration) === 1 ? 'Day' : 'Days')}
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
                          onUpdate();
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
};
