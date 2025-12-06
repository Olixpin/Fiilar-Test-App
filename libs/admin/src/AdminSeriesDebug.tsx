import React, { useState, useMemo } from 'react';
import { Booking, Listing } from '@fiilar/types';
import { 
  Calendar, 
  Clock, 
  User, 
  Home, 
  ChevronRight, 
  Search,
  Layers,
  AlertCircle,
  CheckCircle,
  XCircle,
  Activity,
  FileText
} from 'lucide-react';
import { cn } from '@fiilar/utils';

interface AdminSeriesDebugProps {
  bookings: Booking[];
  listings: Listing[];
}

interface SeriesGroup {
  groupId: string;
  bookings: Booking[];
  listing?: Listing;
}

export const AdminSeriesDebug: React.FC<AdminSeriesDebugProps> = ({ bookings, listings }) => {
  const [selectedGroup, setSelectedGroup] = useState<SeriesGroup | null>(null);
  const [detailTab, setDetailTab] = useState<'overview' | 'bookings' | 'timeline'>('overview');
  const [searchTerm, setSearchTerm] = useState('');

  const seriesGroups = useMemo(() => {
    const groups: Record<string, Booking[]> = {};
    bookings.forEach(b => {
      if (b.groupId) {
        if (!groups[b.groupId]) groups[b.groupId] = [];
        groups[b.groupId].push(b);
      }
    });
    return Object.entries(groups)
      .map(([groupId, groupBookings]) => {
        const sortedBookings = groupBookings.sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        const listing = listings.find(l => l.id === sortedBookings[0]?.listingId);
        return {
          groupId,
          bookings: sortedBookings,
          listing
        };
      })
      .filter(group => group.bookings.some(b => b.status !== 'Cancelled'))
      .sort((a, b) => new Date(b.bookings[0].date).getTime() - new Date(a.bookings[0].date).getTime());
  }, [bookings, listings]);

  const filteredGroups = useMemo(() => {
    if (!searchTerm) return seriesGroups;
    const term = searchTerm.toLowerCase();
    return seriesGroups.filter(group => 
      group.groupId.toLowerCase().includes(term) ||
      group.listing?.title?.toLowerCase().includes(term) ||
      group.bookings[0]?.userId?.toLowerCase().includes(term)
    );
  }, [seriesGroups, searchTerm]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Confirmed':
      case 'Completed':
        return <CheckCircle size={14} className="text-green-500" />;
      case 'Cancelled':
        return <XCircle size={14} className="text-red-500" />;
      case 'Pending':
        return <Clock size={14} className="text-yellow-500" />;
      default:
        return <AlertCircle size={14} className="text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed':
      case 'Completed':
        return 'bg-green-100 text-green-700';
      case 'Cancelled':
        return 'bg-red-100 text-red-700';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const renderDetailContent = () => {
    if (!selectedGroup) return null;

    const { bookings: groupBookings, listing, groupId } = selectedGroup;
    const confirmedCount = groupBookings.filter(b => b.status === 'Confirmed').length;
    const cancelledCount = groupBookings.filter(b => b.status === 'Cancelled').length;
    const pendingCount = groupBookings.filter(b => b.status === 'Pending').length;
    const completedCount = groupBookings.filter(b => b.status === 'Completed').length;

    switch (detailTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Series Stats */}
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">{groupBookings.length}</p>
                <p className="text-xs text-gray-500">Total Bookings</p>
              </div>
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{confirmedCount + completedCount}</p>
                <p className="text-xs text-gray-500">Active</p>
              </div>
              <div className="bg-yellow-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
                <p className="text-xs text-gray-500">Pending</p>
              </div>
              <div className="bg-red-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-red-600">{cancelledCount}</p>
                <p className="text-xs text-gray-500">Cancelled</p>
              </div>
            </div>

            {/* Series Info */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Series Details</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                    <Layers size={16} className="text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Group ID</p>
                    <p className="text-sm font-mono text-gray-900">{groupId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                    <Home size={16} className="text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Listing</p>
                    <p className="text-sm text-gray-900">{listing?.title || 'Unknown Listing'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                    <User size={16} className="text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">User ID</p>
                    <p className="text-sm font-mono text-gray-900">{groupBookings[0]?.userId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                    <Calendar size={16} className="text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Date Range</p>
                    <p className="text-sm text-gray-900">
                      {new Date(groupBookings[0]?.date).toLocaleDateString()} - {new Date(groupBookings[groupBookings.length - 1]?.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                    <Clock size={16} className="text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Booking Type</p>
                    <p className="text-sm text-gray-900">{groupBookings[0]?.bookingType || 'Daily'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'bookings':
        return (
          <div className="space-y-3">
            {groupBookings.map((booking, idx) => (
              <div 
                key={booking.id} 
                className="bg-gray-50 rounded-xl p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-sm font-medium text-gray-500">
                    #{idx + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(booking.date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                    <p className="text-xs text-gray-500 font-mono">{booking.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    getStatusColor(booking.status)
                  )}>
                    {booking.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        );

      case 'timeline':
        return (
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200" />
            <div className="space-y-4">
              {groupBookings.map((booking, idx) => (
                <div key={booking.id} className="flex items-start gap-4 relative">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center z-10",
                    booking.status === 'Confirmed' || booking.status === 'Completed' ? "bg-green-100" :
                    booking.status === 'Cancelled' ? "bg-red-100" :
                    booking.status === 'Pending' ? "bg-yellow-100" : "bg-gray-100"
                  )}>
                    {getStatusIcon(booking.status)}
                  </div>
                  <div className="flex-1 bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900">
                        Booking #{idx + 1}
                      </p>
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-medium",
                        getStatusColor(booking.status)
                      )}>
                        {booking.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(booking.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                    <p className="text-xs text-gray-400 font-mono mt-1">{booking.id}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-12rem)] animate-in fade-in">
      {/* Left Panel - Series List */}
      <div className="w-96 flex-shrink-0 bg-white rounded-2xl border border-gray-200 flex flex-col overflow-hidden">
        {/* Search */}
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search series..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>
        </div>

        {/* Series List */}
        <div className="flex-1 overflow-y-auto">
          {filteredGroups.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Layers size={20} className="text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">No series bookings found</p>
              <p className="text-xs text-gray-400 mt-1">Create a recurring booking to see it here</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredGroups.map((group) => {
                const isSelected = selectedGroup?.groupId === group.groupId;
                const activeCount = group.bookings.filter(b => 
                  b.status === 'Confirmed' || b.status === 'Completed'
                ).length;

                return (
                  <button
                    key={group.groupId}
                    onClick={() => {
                      setSelectedGroup(group);
                      setDetailTab('overview');
                    }}
                    className={cn(
                      "w-full p-4 text-left transition-colors",
                      isSelected ? "bg-brand-50" : "hover:bg-gray-50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center",
                        isSelected ? "bg-brand-100" : "bg-gray-100"
                      )}>
                        <Layers size={18} className={isSelected ? "text-brand-600" : "text-gray-500"} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {group.listing?.title || 'Unknown Listing'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {group.bookings.length} bookings · {activeCount} active
                        </p>
                      </div>
                      <ChevronRight size={16} className="text-gray-400" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Stats */}
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{seriesGroups.length} series total</span>
            <span>{bookings.filter(b => b.groupId).length} bookings in series</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Detail View */}
      <div className="flex-1 bg-white rounded-2xl border border-gray-200 flex flex-col overflow-hidden">
        {selectedGroup ? (
          <>
            {/* Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center">
                  <Layers size={24} className="text-brand-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedGroup.listing?.title || 'Unknown Listing'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {selectedGroup.bookings.length} bookings · Group ID: {selectedGroup.groupId.slice(0, 8)}...
                  </p>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 mt-4 bg-gray-100 rounded-lg p-1">
                {[
                  { id: 'overview', label: 'Overview', icon: FileText },
                  { id: 'bookings', label: 'Bookings', icon: Calendar },
                  { id: 'timeline', label: 'Timeline', icon: Activity },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setDetailTab(tab.id as typeof detailTab)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      detailTab === tab.id
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    )}
                  >
                    <tab.icon size={16} />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {renderDetailContent()}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Layers size={24} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Select a Series</h3>
              <p className="text-sm text-gray-500">
                Choose a booking series from the list to view details
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
