import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Listing } from '@fiilar/types';
import { getBookings, deleteBooking, deleteBookingDraft } from '@fiilar/storage';
import { migrateBookingTimestamps } from '../../../services/bookingMigration';
import { removeDuplicateBookings } from '../../../services/bookingCleanup';
import { Sparkles, Clock, Calendar, Info, Share2, Flame, Search } from 'lucide-react';
import { ConfirmDialog, useToast } from '@fiilar/ui';
import { formatCurrency } from '../../../utils/currency';

interface UserReserveListTabProps {
  user: User;
  listings: Listing[];
  onUpdate: () => void;
}

export const UserReserveListTab: React.FC<UserReserveListTabProps> = ({ user, listings, onUpdate }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; bookingId: string | null }>({
    isOpen: false,
    bookingId: null,
  });

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

  const handleShare = (listing: Listing) => {
    // Mock share functionality
    const url = `${window.location.origin}/listing/${listing.id}`;
    navigator.clipboard.writeText(url);
    showToast({ message: 'Link copied to clipboard!', type: 'success' });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-brand-50 rounded-full border border-brand-100 flex items-center justify-center text-brand-600 shadow-sm">
            <Sparkles size={24} className="fill-brand-600/10" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Reserve List</h2>
            <p className="text-sm font-medium text-gray-500">Saved for later • Not reserved</p>
          </div>
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
          <p className="text-gray-500 font-medium mb-1">No saved bookings found</p>
          <p className="text-xs text-gray-400 mb-6">Save listings to compare and book later</p>
          <button
            onClick={() => navigate('/?tab=explore')}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/20"
          >
            <Search size={18} />
            Explore Spaces
          </button>
        </div>
      ) : compareMode && selectedForCompare.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {selectedForCompare.map(bookingId => {
            const b = reservedBookings.find(booking => booking.id === bookingId);
            if (!b) return null;
            const listing = listings.find(l => l.id === b.listingId);
            return (
              <div key={b.id} className="bg-white rounded-xl border-2 border-brand-200 p-4 space-y-3 shadow-lg shadow-brand-100">
                {listing && listing.images && listing.images[0] && (
                  <img src={listing.images[0]} alt={listing.title} className="w-full h-32 object-cover rounded-lg" />
                )}
                <h3 className="font-bold text-gray-900 line-clamp-1">{listing?.title}</h3>
                <div className="space-y-2 text-sm bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between"><span className="text-gray-500">Price:</span><span className="font-bold">{formatCurrency(b.totalPrice)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Date:</span><span>{b.date}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Duration:</span><span>{b.duration} {listing?.priceUnit === 'Hourly' ? (Number(b.duration) === 1 ? 'hr' : 'hrs') : (Number(b.duration) === 1 ? 'day' : 'days')}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Capacity:</span><span>{listing?.capacity} people</span></div>
                </div>
                <button onClick={() => navigate(`/listing/${listing?.id}`)} className="w-full bg-brand-600 text-white py-2.5 rounded-lg text-sm font-bold hover:bg-brand-700 shadow-md shadow-brand-600/10">
                  Book Now
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          {reservedBookings.map((b, idx) => {
            const listing = listings.find(l => l.id === b.listingId);
            // Mock high demand for every 3rd item or randomly
            const isHighDemand = idx % 3 === 0;

            return (
              <div key={b.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-6 relative overflow-hidden hover:shadow-md transition-shadow group">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-brand-400"></div>

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

                {listing && listing.images && listing.images[0] && (
                  <div className="relative w-full md:w-48 h-32 shrink-0">
                    <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover rounded-lg" />
                    {isHighDemand && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                        <Flame size={10} className="fill-white" />
                        HIGH DEMAND
                      </div>
                    )}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-gray-900 truncate pr-4">{listing?.title || 'Unknown Space'}</h3>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-brand-50 text-brand-700 border border-brand-200">
                        Draft
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock size={12} />
                        Saved: {formatSavedTime(b.createdAt)}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm mb-4 truncate">{listing?.location}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
                      <Calendar size={14} className="text-gray-400" />
                      {b.date}
                    </div>
                    <div className="font-bold text-gray-900 bg-gray-50 px-2 py-1 rounded-md">
                      {formatCurrency(b.totalPrice)}
                    </div>
                    <div className="text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                      {b.duration} {listing?.priceUnit === 'Hourly' ? (Number(b.duration) === 1 ? 'Hour' : 'Hours') : (Number(b.duration) === 1 ? 'Day' : 'Days')}
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
                      className="px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-lg hover:bg-brand-700 transition-colors shadow-sm shadow-brand-600/20"
                    >
                      Complete Booking
                    </button>
                    <button
                      onClick={() => listing && handleShare(listing)}
                      className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <Share2 size={14} />
                      Share
                    </button>
                    <button
                      onClick={() => setConfirmDelete({ isOpen: true, bookingId: b.id })}
                      className="px-4 py-2 bg-white border border-gray-200 text-red-600 text-sm font-semibold rounded-lg hover:bg-red-50 hover:border-red-100 transition-colors"
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

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={confirmDelete.isOpen}
        title="Remove Draft?"
        message="This will permanently remove this draft booking from your reserve list. This action cannot be undone."
        confirmText="Remove"
        cancelText="Keep"
        variant="warning"
        onConfirm={() => {
          if (confirmDelete.bookingId) {
            // Find the booking to get the listingId before deleting
            const bookingToDelete = reservedBookings.find(b => b.id === confirmDelete.bookingId);
            if (bookingToDelete) {
              // Delete both the booking and any associated localStorage draft
              deleteBooking(confirmDelete.bookingId);
              deleteBookingDraft(user.id, bookingToDelete.listingId);
            }
            onUpdate();
          }
          setConfirmDelete({ isOpen: false, bookingId: null });
        }}
        onCancel={() => setConfirmDelete({ isOpen: false, bookingId: null })}
      />
    </div>
  );
};
