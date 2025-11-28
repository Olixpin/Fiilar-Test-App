import React, { useState } from 'react';
import { Booking, EscrowTransaction, Listing } from '@fiilar/types';
import { useLocale } from '@fiilar/ui';
import { DollarSign, TrendingUp, Clock, Calendar, Download, Filter, ChevronDown, BarChart3, PieChart } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell } from 'recharts';

interface HostEarningsProps {
    hostBookings: Booking[];
    transactions: EscrowTransaction[];
    hostId: string;
    listings?: Listing[];
}

const HostEarnings: React.FC<HostEarningsProps> = ({ hostBookings, transactions, hostId, listings = [] }) => {
    const { locale } = useLocale();
    const [timeFilter, setTimeFilter] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
    const [viewMode, setViewMode] = useState<'overview' | 'breakdown'>('overview');
    const now = new Date();
    const getFilterDate = () => {
        if (timeFilter === '7d') return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (timeFilter === '30d') return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        if (timeFilter === '90d') return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        return new Date(0);
    };

    const filterDate = getFilterDate();
    const filteredBookings = hostBookings.filter(b => new Date(b.date) >= filterDate);
    const filteredTransactions = transactions.filter(tx => new Date(tx.timestamp) >= filterDate);

    const fundsInEscrow = hostBookings
        .filter(b => b.paymentStatus === 'Paid - Escrow')
        .reduce((sum, b) => sum + (b.totalPrice - b.serviceFee - b.cautionFee), 0);

    const releasedEarnings = filteredTransactions
        .filter(tx => tx.type === 'HOST_PAYOUT' && tx.toUserId === hostId && tx.status === 'COMPLETED')
        .reduce((sum, tx) => sum + tx.amount, 0);

    const totalRevenue = filteredBookings
        .filter(b => b.status === 'Confirmed' || b.status === 'Completed')
        .reduce((sum, b) => sum + (b.totalPrice - b.serviceFee - b.cautionFee), 0);

    const pendingPayouts = hostBookings.filter(b => b.paymentStatus === 'Paid - Escrow');
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const upcomingPayouts = pendingPayouts.filter(b => {
        if (!b.escrowReleaseDate) return false;
        const releaseDate = new Date(b.escrowReleaseDate);
        return releaseDate >= now && releaseDate <= sevenDaysFromNow;
    });

    // Revenue by listing
    const revenueByListing = listings.map(listing => {
        const revenue = filteredBookings
            .filter(b => b.listingId === listing.id && (b.status === 'Confirmed' || b.status === 'Completed'))
            .reduce((sum, b) => sum + (b.totalPrice - b.serviceFee - b.cautionFee), 0);
        const bookings = filteredBookings.filter(b => b.listingId === listing.id).length;
        return { listing, revenue, bookings };
    }).filter(item => item.revenue > 0).sort((a, b) => b.revenue - a.revenue);

    // Chart data
    const chartData = Array.from({ length: timeFilter === '7d' ? 7 : timeFilter === '30d' ? 30 : 90 }, (_, i) => {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];
        const dayRevenue = filteredBookings
            .filter(b => b.date === dateStr && (b.status === 'Confirmed' || b.status === 'Completed'))
            .reduce((sum, b) => sum + (b.totalPrice - b.serviceFee - b.cautionFee), 0);
        return {
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            revenue: dayRevenue
        };
    }).reverse();

    const COLORS = ['#111827', '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b'];

    const exportCSV = () => {
        const headers = ['Date', 'Amount', 'Status', 'Reference'];
        const rows = filteredTransactions
            .filter(tx => tx.type === 'HOST_PAYOUT' && tx.toUserId === hostId)
            .map(tx => [
                new Date(tx.timestamp).toLocaleDateString(),
                tx.amount.toFixed(2),
                tx.status,
                tx.paystackReference || 'N/A'
            ]);
        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `earnings-${timeFilter}.csv`;
        a.click();
    };

    return (
        <div className="space-y-6">
            {/* Header with Filters */}
            <div className="glass-card p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Earnings Analytics</h2>
                        <p className="text-sm text-gray-500 mt-1">Track your revenue and payouts</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="flex items-center gap-2 px-3 py-2 glass-button text-xs font-semibold text-gray-600 hover:text-gray-900 transition">
                            <Filter size={14} />
                            <span>Filter</span>
                            <ChevronDown size={14} />
                        </button>
                        <div className="flex items-center gap-1 bg-white/50 rounded-lg p-1 border border-white/20">
                            {[{ key: '7d', label: '7D' }, { key: '30d', label: '30D' }, { key: '90d', label: '90D' }, { key: 'all', label: 'All' }].map(filter => (
                                <button
                                    key={filter.key}
                                    onClick={() => setTimeFilter(filter.key as any)}
                                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${timeFilter === filter.key ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    {filter.label}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={exportCSV}
                            className="flex items-center gap-2 px-3 py-2 bg-gray-900 text-white rounded-lg text-xs font-semibold hover:bg-black transition shadow-lg shadow-gray-900/20"
                        >
                            <Download size={14} /> Export
                        </button>
                    </div>
                </div>
            </div>

            {/* Earnings Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="glass-card p-5 hover:shadow-lg transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Revenue</h3>
                        <div className="bg-green-100 p-2 rounded-lg text-green-700 group-hover:scale-110 transition-transform">
                            <TrendingUp size={18} />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{locale.currencySymbol}{totalRevenue.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">{filteredBookings.filter(b => b.status === 'Confirmed' || b.status === 'Completed').length} bookings</p>
                </div>

                <div className="glass-card p-5 hover:shadow-lg transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Released</h3>
                        <div className="bg-blue-100 p-2 rounded-lg text-blue-700 group-hover:scale-110 transition-transform">
                            <DollarSign size={18} />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{locale.currencySymbol}{releasedEarnings.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">Paid out</p>
                </div>

                <div className="glass-card p-5 hover:shadow-lg transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">In Escrow</h3>
                        <div className="bg-orange-100 p-2 rounded-lg text-orange-700 group-hover:scale-110 transition-transform">
                            <Clock size={18} />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{locale.currencySymbol}{fundsInEscrow.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">{pendingPayouts.length} pending</p>
                </div>

                <div className="glass-card p-5 hover:shadow-lg transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Upcoming</h3>
                        <div className="bg-purple-100 p-2 rounded-lg text-purple-700 group-hover:scale-110 transition-transform">
                            <Calendar size={18} />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{upcomingPayouts.length}</p>
                    <p className="text-xs text-gray-500 mt-1">Next 7 days</p>
                </div>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2 glass-card p-1 w-fit">
                <button
                    onClick={() => setViewMode('overview')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'overview' ? 'bg-brand-600 text-white shadow-md' : 'text-gray-600 hover:bg-white/50'
                        }`}
                >
                    <BarChart3 size={16} /> Overview
                </button>
                <button
                    onClick={() => setViewMode('breakdown')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'breakdown' ? 'bg-brand-600 text-white shadow-md' : 'text-gray-600 hover:bg-white/50'
                        }`}
                >
                    <PieChart size={16} /> By Listing
                </button>
            </div>

            {viewMode === 'overview' ? (
                <>
                    {/* Revenue Chart */}
                    <div className="glass-card p-6">
                        <h3 className="font-bold text-gray-900 mb-4">Revenue Trend</h3>
                        <div className="h-64 w-full min-w-0 min-h-[256px]">
                            <ResponsiveContainer width="100%" height={256}>
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                                    <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `${locale.currencySymbol}${val}`} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                                    <Tooltip
                                        cursor={{ fill: '#f9fafb' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                                        formatter={(val: number) => [`${locale.currencySymbol}${val.toFixed(2)}`, 'Revenue']}
                                    />
                                    <Bar dataKey="revenue" fill="#111827" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Upcoming Payouts */}
                    {upcomingPayouts.length > 0 && (
                        <div className="glass-card overflow-hidden">
                            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                                <h3 className="font-bold text-gray-900">Upcoming Payouts</h3>
                                <p className="text-xs text-gray-500 mt-1">Funds releasing in the next 7 days</p>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {upcomingPayouts.map(booking => {
                                    const releaseDate = new Date(booking.escrowReleaseDate!);
                                    const hoursUntil = Math.max(0, (releaseDate.getTime() - now.getTime()) / (1000 * 60 * 60));
                                    const daysUntil = Math.floor(hoursUntil / 24);
                                    const payout = booking.totalPrice - booking.serviceFee - booking.cautionFee;

                                    return (
                                        <div key={booking.id} className="p-4 hover:bg-gray-50/50 transition">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-medium text-gray-900">{locale.currencySymbol}{payout.toFixed(2)}</p>
                                                    <p className="text-sm text-gray-500">Booking {booking.id.slice(0, 8)}...</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-medium text-brand-600">
                                                        {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`}
                                                    </p>
                                                    <p className="text-xs text-gray-500">{releaseDate.toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Payout History */}
                    <div className="glass-card overflow-hidden">
                        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="font-bold text-gray-900">Payout History</h3>
                            <p className="text-xs text-gray-500 mt-1">All completed payouts</p>
                        </div>
                        <div className="overflow-x-auto max-h-96">
                            <table className="w-full">
                                <thead className="bg-gray-50/50 border-b border-gray-100 sticky top-0">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Date</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Amount</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Reference</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {transactions.filter(tx => tx.type === 'HOST_PAYOUT' && tx.toUserId === hostId).length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-4 py-8 text-center text-gray-500">No payouts yet</td>
                                        </tr>
                                    ) : (
                                        transactions
                                            .filter(tx => tx.type === 'HOST_PAYOUT' && tx.toUserId === hostId)
                                            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                                            .map(tx => (
                                                <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-4 py-3 text-sm text-gray-600">{new Date(tx.timestamp).toLocaleDateString()}</td>
                                                    <td className="px-4 py-3 text-sm font-bold text-gray-900">{locale.currencySymbol}{tx.amount.toFixed(2)}</td>
                                                    <td className="px-4 py-3">
                                                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">
                                                            {tx.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-xs font-mono text-gray-500">{tx.paystackReference?.slice(0, 20)}...</td>
                                                </tr>
                                            ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : (
                <>
                    {/* Revenue by Listing */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Pie Chart */}
                        <div className="glass-card p-6">
                            <h3 className="font-bold text-gray-900 mb-4">Revenue Distribution</h3>
                            {revenueByListing.length > 0 ? (
                                <div className="h-64 w-full min-w-0 min-h-[256px] flex items-center justify-center">
                                    <ResponsiveContainer width="100%" height={256}>
                                        <RePieChart>
                                            <Pie
                                                data={revenueByListing.slice(0, 5)}
                                                dataKey="revenue"
                                                nameKey="listing.title"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={80}
                                                label={({ value }) => `${locale.currencySymbol}${(value as number).toFixed(0)}`}
                                            >
                                                {revenueByListing.slice(0, 5).map((_, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(val: number) => `${locale.currencySymbol}${val.toFixed(2)}`} />
                                        </RePieChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="h-64 flex items-center justify-center text-gray-400">
                                    <p className="text-sm">No revenue data</p>
                                </div>
                            )}
                        </div>

                        {/* Top Listings */}
                        <div className="glass-card p-6">
                            <h3 className="font-bold text-gray-900 mb-4">Top Performing Listings</h3>
                            <div className="space-y-3">
                                {revenueByListing.slice(0, 5).map((item, idx) => (
                                    <div key={item.listing.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition bg-white/50">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white ${['bg-[#111827]', 'bg-[#6366f1]', 'bg-[#8b5cf6]', 'bg-[#ec4899]', 'bg-[#f59e0b]'][idx % 5]}`}>
                                            {idx + 1}
                                        </div>
                                        <img src={item.listing.images[0]} alt="" className="w-12 h-12 rounded-lg object-cover" />
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-sm text-gray-900 truncate">{item.listing.title}</h4>
                                            <p className="text-xs text-gray-500">{item.bookings} bookings</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-gray-900">{locale.currencySymbol}{item.revenue.toFixed(0)}</p>
                                        </div>
                                    </div>
                                ))}
                                {revenueByListing.length === 0 && (
                                    <div className="text-center py-8 text-gray-400">
                                        <p className="text-sm">No listings with revenue yet</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Detailed Breakdown Table */}
                    <div className="glass-card overflow-hidden">
                        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="font-bold text-gray-900">All Listings Performance</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50/50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Listing</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Bookings</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Revenue</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Avg/Booking</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {revenueByListing.map(item => (
                                        <tr key={item.listing.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <img src={item.listing.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover" />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{item.listing.title}</p>
                                                        <p className="text-xs text-gray-500">{item.listing.location}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{item.bookings}</td>
                                            <td className="px-6 py-4 text-sm font-bold text-gray-900">{locale.currencySymbol}{item.revenue.toFixed(2)}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{locale.currencySymbol}{(item.revenue / item.bookings).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                    {revenueByListing.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No revenue data</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default HostEarnings;
