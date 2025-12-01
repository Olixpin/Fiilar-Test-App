import React from 'react';
import { Booking, Listing } from '@fiilar/types';

interface AdminSeriesDebugProps {
  bookings: Booking[];
  listings: Listing[];
}

export const AdminSeriesDebug: React.FC<AdminSeriesDebugProps> = ({ bookings, listings }) => {
  const seriesGroups = React.useMemo(() => {
    const groups: Record<string, Booking[]> = {};
    bookings.forEach(b => {
      if (b.groupId) {
        if (!groups[b.groupId]) groups[b.groupId] = [];
        groups[b.groupId].push(b);
      }
    });
    return Object.entries(groups)
      .map(([groupId, groupBookings]) => ({
        groupId,
        bookings: groupBookings.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      }))
      // Only show groups that still have at least one non-cancelled booking
      .filter(group => group.bookings.some(b => b.status !== 'Cancelled'))
      .sort((a, b) => new Date(a.bookings[0].date).getTime() - new Date(b.bookings[0].date).getTime());
  }, [bookings]);

  if (seriesGroups.length === 0) {
    return (
      <div className="glass-card p-6 mt-4">
        <h2 className="text-lg font-semibold mb-2">Series Debug</h2>
        <p className="text-sm text-gray-600">No series bookings found. Create a recurring booking to inspect it here.</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 mt-4">
      <h2 className="text-lg font-semibold mb-4">Series Debug (Grouped by groupId)</h2>
      <div className="space-y-4 max-h-[600px] overflow-y-auto">
        {seriesGroups.map(group => {
          const first = group.bookings[0];
          const listing = listings.find(l => l.id === first.listingId);
          const uniqueStatuses = Array.from(new Set(group.bookings.map(b => b.status))).join(', ');

          return (
            <div key={group.groupId} className="border border-gray-200 rounded-xl p-4 bg-white/70">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <p className="text-xs font-mono text-gray-500">groupId: {group.groupId}</p>
                  <p className="text-sm text-gray-700">Listing: {listing?.title || first.listingId}</p>
                  <p className="text-xs text-gray-500">User: {first.userId}</p>
                </div>
                <div className="text-right text-xs text-gray-600">
                  <p>Count: {group.bookings.length}</p>
                  <p>Status set: {uniqueStatuses}</p>
                </div>
              </div>
              <div className="mt-2 border-t border-gray-100 pt-2 text-xs text-gray-700 space-y-1">
                {group.bookings.map(b => (
                  <div key={b.id} className="flex justify-between">
                    <span>{new Date(b.date).toLocaleString()} ({b.bookingType})</span>
                    <span className="font-medium">{b.status}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
