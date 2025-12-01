import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Listing, Booking, ListingStatus } from '@fiilar/types';
import { useLocale } from '@fiilar/ui';
import { DollarSign, TrendingUp, Home, Clock, Sparkles, Plus, FileText, MessageSquare, ChevronRight, Star, PieChart as PieChartIcon } from 'lucide-react';
import { AreaChart, Area, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { cn } from '@fiilar/utils';

import { getConversations } from '@fiilar/messaging';
import ProfileCompletionWidget from './ProfileCompletionWidget';

interface HostOverviewProps {
    user: User;
    listings: Listing[];
    hostBookings: Booking[];
    setView: (view: any) => void;
    handleStartNewListing: () => void;
    onNavigateToBooking?: (booking: Booking) => void;
}

const HostOverview: React.FC<HostOverviewProps> = ({ user, listings, hostBookings, setView, handleStartNewListing, onNavigateToBooking }) => {
    const { locale } = useLocale();
    const navigate = useNavigate();

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

    // Calculate quick stats
    const activeListings = listings.filter(l => l.status === ListingStatus.LIVE).length;
    const pendingBookings = hostBookings.filter(b => b.status === 'Pending').length;

    // Calculate Occupancy Rate (Current Month)
    const calculateOccupancy = () => {
        if (listings.length === 0) return 0;
        const now = new Date();
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const totalAvailableNights = listings.length * daysInMonth;

        const bookedNights = hostBookings.reduce((acc, booking) => {
            if (booking.status !== 'Confirmed' && booking.status !== 'Completed') return acc;

            // @ts-ignore - properties exist in data
            const start = new Date((booking as any).startDate);
            // @ts-ignore - properties exist in data
            const end = new Date((booking as any).endDate);

            // Check overlap with current month
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

            if (end < monthStart || start > monthEnd) return acc;

            const overlapStart = start < monthStart ? monthStart : start;
            const overlapEnd = end > monthEnd ? monthEnd : end;

            const diffTime = Math.abs(overlapEnd.getTime() - overlapStart.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            return acc + diffDays;
        }, 0);

        return Math.min(Math.round((bookedNights / totalAvailableNights) * 100), 100);
    };

    const occupancyRate = calculateOccupancy();
    const occupancyData = [
        { name: 'Occupied', value: occupancyRate },
        { name: 'Vacant', value: 100 - occupancyRate },
    ];
    const COLORS = ['#e74c3c', '#f3f4f6'];

    // Calculate unread messages
    const conversations = getConversations(user.id);
    const unreadCount = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Profile Completion Widget */}
            <ProfileCompletionWidget
                user={user}
                onCompleteProfile={() => navigate('/host/dashboard?view=settings&edit=true')}
            />

            {/* Hero Section: Earnings & Key Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Total Earnings Hero Card */}
                <div className="lg:col-span-2 glass-premium rounded-3xl p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                        <DollarSign size={120} />
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="bg-white/20 backdrop-blur-md p-2 rounded-xl text-white">
                                <DollarSign size={20} />
                            </div>
                            <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wider">Total Earnings</h3>
                        </div>

                        <div className="mt-4 flex items-baseline gap-4">
                            <h2 className="text-5xl font-bold text-gray-900 tracking-tight">
                                {locale.currencySymbol}{user.walletBalance.toLocaleString()}
                            </h2>
                            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-100/80 text-green-700 text-sm font-bold">
                                <TrendingUp size={14} />
                                <span>+12.5%</span>
                            </div>
                        </div>
                        <p className="text-gray-500 mt-2 font-medium">Total revenue generated from all listings</p>

                        <div className="mt-8 h-[200px] w-full min-w-0 relative">
                            <ResponsiveContainer width="100%" height={200} minWidth={0}>
                                <AreaChart data={revenueData}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#e74c3c" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#e74c3c" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                            borderRadius: '12px',
                                            border: 'none',
                                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                                        }}
                                        cursor={{ stroke: '#e74c3c', strokeWidth: 1, strokeDasharray: '5 5' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#e74c3c"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorRevenue)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Secondary Stats Column */}
                <div className="space-y-6">
                    {/* Active Listings */}
                    <div className="glass-card rounded-3xl p-6 hover:shadow-lg transition-all duration-300 group">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">Active Listings</p>
                                <h3 className="text-3xl font-bold text-gray-900 mt-2">{activeListings}</h3>
                                <p className="text-xs text-gray-400 mt-1">{listings.length} total properties</p>
                            </div>
                            <div className="bg-blue-50 p-3 rounded-2xl text-blue-600 group-hover:scale-110 transition-transform duration-300">
                                <Home size={24} />
                            </div>
                        </div>
                    </div>

                    {/* Pending Actions */}
                    <div className="glass-card rounded-3xl p-6 hover:shadow-lg transition-all duration-300 group cursor-pointer" onClick={() => setView('bookings')}>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">Pending Requests</p>
                                <h3 className="text-3xl font-bold text-gray-900 mt-2">{pendingBookings}</h3>
                                <p className="text-xs text-orange-500 font-medium mt-1">Requires attention</p>
                            </div>
                            <div className="bg-orange-50 p-3 rounded-2xl text-orange-600 group-hover:scale-110 transition-transform duration-300">
                                <Clock size={24} />
                            </div>
                        </div>
                    </div>

                    {/* Occupancy Rate */}
                    <div className="glass-card rounded-3xl p-6 hover:shadow-lg transition-all duration-300 group">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">Occupancy Rate</p>
                                <h3 className="text-3xl font-bold text-gray-900 mt-2">{occupancyRate}%</h3>
                                <p className="text-xs text-gray-400 mt-1">For this month</p>
                            </div>
                            <div className="bg-rose-50 p-3 rounded-2xl text-rose-600 group-hover:scale-110 transition-transform duration-300">
                                <PieChartIcon size={24} />
                            </div>
                        </div>
                        <div className="h-16 w-full flex items-center min-w-0">
                            <div className="h-16 w-20 shrink-0 min-w-0">
                                <ResponsiveContainer width={80} height={64}>
                                    <PieChart>
                                        <Pie
                                            data={occupancyData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={25}
                                            outerRadius={35}
                                            startAngle={90}
                                            endAngle={-270}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {occupancyData.map((_entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="ml-4 flex-1">
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-gray-500">Target</span>
                                    <span className="font-medium text-gray-900">85%</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-1.5">
                                    <div className="bg-brand-500 h-1.5 rounded-full" style={{ width: '85%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Unread Messages */}
                    <div className="glass-card rounded-3xl p-6 hover:shadow-lg transition-all duration-300 group cursor-pointer" onClick={() => setView('messages')}>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">Messages</p>
                                <h3 className="text-3xl font-bold text-gray-900 mt-2">{unreadCount}</h3>
                                <p className="text-xs text-indigo-500 font-medium mt-1">
                                    {unreadCount > 0 ? 'New messages' : 'All caught up'}
                                </p>
                            </div>
                            <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600 group-hover:scale-110 transition-transform duration-300">
                                <MessageSquare size={24} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activity */}
                <div className="lg:col-span-2 glass-card rounded-3xl p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-xl text-gray-900 flex items-center gap-2">
                            <Sparkles className="text-brand-500" size={20} />
                            Recent Activity
                        </h3>
                        <button
                            onClick={() => setView('bookings')}
                            className="text-sm font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1 hover:gap-2 transition-all"
                        >
                            View All <ChevronRight size={16} />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {hostBookings.slice(0, 5).map((booking) => {
                            const listing = listings.find(l => l.id === booking.listingId);
                            return (
                                <div
                                    key={booking.id}
                                    className="group flex gap-4 items-center p-4 rounded-2xl hover:bg-gray-50 transition-all cursor-pointer border border-transparent hover:border-gray-100"
                                    onClick={() => onNavigateToBooking?.(booking)}
                                >
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105",
                                        booking.status === 'Pending' ? 'bg-orange-100 text-orange-600' :
                                            booking.status === 'Confirmed' ? 'bg-green-100 text-green-600' :
                                                'bg-gray-100 text-gray-600'
                                    )}>
                                        {booking.status === 'Pending' ? <Clock size={20} /> :
                                            booking.status === 'Confirmed' ? <Sparkles size={20} /> :
                                                <FileText size={20} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <p className="font-semibold text-gray-900 truncate">
                                                {booking.status === 'Pending' ? 'New Booking Request' :
                                                    booking.status === 'Confirmed' ? 'Booking Confirmed' :
                                                        'Booking Updated'}
                                            </p>
                                            <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                                                {new Date(booking.date).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 truncate mt-0.5">
                                            {listing?.title}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs font-medium text-gray-900">
                                                {locale.currencySymbol}{booking.totalPrice}
                                            </span>
                                            <span className="text-gray-300">•</span>
                                            <span className="text-xs text-gray-500">
                                                {/* @ts-ignore - guests property might be missing in type definition but present in data */}
                                                {(booking as any).guests || 1} guests
                                            </span>
                                        </div>
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400">
                                        <ChevronRight size={20} />
                                    </div>
                                </div>
                            );
                        })}
                        {hostBookings.length === 0 && (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Sparkles className="text-gray-300" size={32} />
                                </div>
                                <p className="text-gray-500 font-medium">No recent activity</p>
                                <p className="text-sm text-gray-400 mt-1">New bookings will appear here</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions & Insights */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <div className="glass-card rounded-3xl p-6">
                        <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={handleStartNewListing}
                                className="glass-button flex flex-col items-center justify-center gap-2 p-4 rounded-2xl hover:bg-brand-50 hover:border-brand-200 transition-all group h-32"
                            >
                                <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Plus size={20} />
                                </div>
                                <span className="text-sm font-medium text-gray-700 group-hover:text-brand-700">New Listing</span>
                            </button>

                            <button
                                onClick={() => setView('earnings')}
                                className="glass-button flex flex-col items-center justify-center gap-2 p-4 rounded-2xl hover:bg-green-50 hover:border-green-200 transition-all group h-32"
                            >
                                <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <DollarSign size={20} />
                                </div>
                                <span className="text-sm font-medium text-gray-700 group-hover:text-green-700">Earnings</span>
                            </button>
                        </div>
                    </div>

                    {/* Insights / Tips */}
                    <div className="glass-premium rounded-3xl p-6 relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-3">
                                <Star className="text-yellow-500 fill-yellow-500" size={18} />
                                <h3 className="font-bold text-gray-900">Pro Tip</h3>
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Listings with 10+ photos get 20% more bookings. Consider adding more high-quality photos to your listings.
                            </p>
                            <button
                                onClick={() => setView('listings')}
                                className="mt-4 text-sm font-semibold text-brand-600 hover:text-brand-700"
                            >
                                Update Photos
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HostOverview;
