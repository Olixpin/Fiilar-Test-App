import React from 'react';
import { User, Listing, Booking, ListingStatus } from '@fiilar/types';
import { DollarSign, TrendingUp, Home, Calendar as CalendarIcon, Clock, Sparkles, Plus, FileText, MessageSquare } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import { getConversations } from '../../../services/storage';

interface HostOverviewProps {
    user: User;
    listings: Listing[];
    hostBookings: Booking[];
    setView: (view: any) => void;
    handleStartNewListing: () => void;
    onNavigateToBooking?: (booking: Booking) => void;
}

const HostOverview: React.FC<HostOverviewProps> = ({ user, listings, hostBookings, setView, handleStartNewListing, onNavigateToBooking }) => {
    // Calculate revenue data for chart
    const getRevenueData = () => {
        const last6Months = Array.from({ length: 6 }, (_, i) => {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            return d;
        }).reverse();

        return last6Months.map(date => {
            const monthStr = date.toLocaleString('default', { month: 'short' });
            const revenue = hostBookings
                .filter(b => {
                    const bDate = new Date(b.date);
                    return bDate.getMonth() === date.getMonth() &&
                        bDate.getFullYear() === date.getFullYear() &&
                        (b.status === 'Confirmed' || b.status === 'Completed');
                })
                .reduce((sum, b) => sum + b.totalPrice, 0);
            return { name: monthStr, revenue };
        });
    };

    const revenueData = getRevenueData();

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Earnings</h3>
                        <div className="bg-green-100 p-2 rounded-lg text-green-700">
                            <DollarSign size={18} />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">${user.walletBalance.toLocaleString()}</p>
                    <p className="text-xs text-green-600 font-medium mt-1 flex items-center gap-1">
                        <TrendingUp size={12} /> +12% from last month
                    </p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Listings</h3>
                        <div className="bg-blue-100 p-2 rounded-lg text-blue-700">
                            <Home size={18} />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{listings.filter(l => l.status === ListingStatus.LIVE).length}</p>
                    <p className="text-xs text-gray-500 mt-1">{listings.length} total listings</p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">This Month</h3>
                        <div className="bg-purple-100 p-2 rounded-lg text-purple-700">
                            <CalendarIcon size={18} />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{hostBookings.filter(b => b.status === 'Confirmed' || b.status === 'Completed').length}</p>
                    <p className="text-xs text-gray-500 mt-1">Bookings completed</p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending</h3>
                        <div className="bg-orange-100 p-2 rounded-lg text-orange-700">
                            <Clock size={18} />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{hostBookings.filter(b => b.status === 'Pending').length}</p>
                    <p className="text-xs text-orange-600 font-medium mt-1">Requires action</p>
                </div>

                {/* Unread Messages Card */}
                <div
                    className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setView('messages')}
                >
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Unread Messages</h3>
                        <div className="bg-indigo-100 p-2 rounded-lg text-indigo-700">
                            <MessageSquare size={18} />
                        </div>
                    </div>
                    {(() => {
                        // Calculate unread messages
                        const conversations = getConversations(user.id);
                        const unreadCount = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

                        return (
                            <>
                                <p className="text-2xl font-bold text-gray-900">{unreadCount}</p>
                                <p className={`text-xs font-medium mt-1 ${unreadCount > 0 ? 'text-indigo-600' : 'text-gray-500'}`}>
                                    {unreadCount > 0 ? `${unreadCount} new messages` : 'All caught up'}
                                </p>
                            </>
                        );
                    })()}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Sparkles size={18} className="text-brand-600" /> Quick Actions
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <button onClick={handleStartNewListing} className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-brand-500 hover:bg-brand-50 transition-all group">
                        <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-brand-100 flex items-center justify-center transition-colors">
                            <Plus size={20} className="text-gray-600 group-hover:text-brand-600" />
                        </div>
                        <span className="text-xs font-medium text-gray-700 group-hover:text-brand-700">New Listing</span>
                    </button>
                    <button onClick={() => setView('bookings')} className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-brand-500 hover:bg-brand-50 transition-all group">
                        <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-brand-100 flex items-center justify-center transition-colors">
                            <FileText size={20} className="text-gray-600 group-hover:text-brand-600" />
                        </div>
                        <span className="text-xs font-medium text-gray-700 group-hover:text-brand-700">View Bookings</span>
                    </button>
                    <button onClick={() => setView('earnings')} className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-brand-500 hover:bg-brand-50 transition-all group">
                        <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-brand-100 flex items-center justify-center transition-colors">
                            <TrendingUp size={20} className="text-gray-600 group-hover:text-brand-600" />
                        </div>
                        <span className="text-xs font-medium text-gray-700 group-hover:text-brand-700">Earnings</span>
                    </button>
                    <button onClick={() => setView('messages')} className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-brand-500 hover:bg-brand-50 transition-all group">
                        <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-brand-100 flex items-center justify-center transition-colors">
                            <MessageSquare size={20} className="text-gray-600 group-hover:text-brand-600" />
                        </div>
                        <span className="text-xs font-medium text-gray-700 group-hover:text-brand-700">Messages</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-gray-900">Revenue Overview</h3>
                        <select aria-label="Revenue period" className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-600 font-medium">
                            <option>Last 6 Months</option>
                        </select>
                    </div>
                    <div className="h-64 w-full min-w-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#6B7280' }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#6B7280' }}
                                    tickFormatter={(value) => `$${value}`}
                                />
                                <Tooltip
                                    cursor={{ fill: '#F3F4F6' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Bar dataKey="revenue" fill="#000000" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                        {hostBookings.slice(0, 5).map((booking) => {
                            const listing = listings.find(l => l.id === booking.listingId);
                            return (
                                <div
                                    key={booking.id}
                                    className="flex gap-3 items-start pb-3 border-b border-gray-100 last:border-0 last:pb-0 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                                    onClick={() => onNavigateToBooking?.(booking)}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${booking.status === 'Pending' ? 'bg-orange-100 text-orange-600' :
                                        booking.status === 'Confirmed' ? 'bg-green-100 text-green-600' :
                                            'bg-gray-100 text-gray-600'
                                        }`}>
                                        {booking.status === 'Pending' ? <Clock size={14} /> :
                                            booking.status === 'Confirmed' ? <Sparkles size={14} /> :
                                                <FileText size={14} />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {booking.status === 'Pending' ? 'New booking request' :
                                                booking.status === 'Confirmed' ? 'Booking confirmed' :
                                                    'Booking updated'}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {listing?.title} • {new Date(booking.date).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                        {hostBookings.length === 0 && (
                            <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HostOverview;
