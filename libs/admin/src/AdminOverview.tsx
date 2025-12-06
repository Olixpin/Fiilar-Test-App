import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Home,
  Calendar,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  UserCheck,
  Clock,
  ArrowRight,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
} from 'recharts';
import { User, Listing, Booking, PlatformFinancials, EscrowTransaction, ListingStatus } from '@fiilar/types';
import { cn } from '@fiilar/utils';

interface AdminOverviewProps {
  users: User[];
  listings: Listing[];
  bookings: Booking[];
  financials: PlatformFinancials | null;
  transactions: EscrowTransaction[];
  unverifiedHosts: User[];
  pendingListings: Listing[];
  openDisputes: { id: string }[];
  loading?: boolean;
}

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  iconBg,
  iconColor,
  onClick,
}) => (
  <div
    className={cn(
      "bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300",
      onClick && "cursor-pointer hover:border-brand-200"
    )}
    onClick={onClick}
  >
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{title}</p>
        <h3 className="text-3xl font-bold text-gray-900 mt-2">{value}</h3>
        {change !== undefined && (
          <div className="flex items-center gap-1 mt-2">
            {change >= 0 ? (
              <TrendingUp size={14} className="text-green-500" />
            ) : (
              <TrendingDown size={14} className="text-red-500" />
            )}
            <span className={cn("text-sm font-medium", change >= 0 ? "text-green-600" : "text-red-600")}>
              {change >= 0 ? '+' : ''}{change}%
            </span>
            {changeLabel && <span className="text-xs text-gray-400 ml-1">{changeLabel}</span>}
          </div>
        )}
      </div>
      <div className={cn("p-3 rounded-2xl", iconBg)}>
        <Icon size={24} className={iconColor} />
      </div>
    </div>
  </div>
);

export const AdminOverview: React.FC<AdminOverviewProps> = ({
  users,
  listings,
  bookings,
  financials,
  transactions: _transactions,
  unverifiedHosts,
  pendingListings,
  openDisputes,
  loading,
}) => {
  const navigate = useNavigate();

  // Calculate stats
  const stats = useMemo(() => {
    const totalUsers = users.length;
    const totalHosts = users.filter(u => u.role === 'HOST').length;
    const verifiedHosts = users.filter(u => u.role === 'HOST' && u.kycVerified).length;
    const totalListings = listings.length;
    const activeListings = listings.filter(l => l.status === ListingStatus.LIVE).length;
    const totalBookings = bookings.length;
    const confirmedBookings = bookings.filter(b => b.status === 'Confirmed' || b.status === 'Completed').length;
    const pendingBookings = bookings.filter(b => b.status === 'Pending').length;
    const cancelledBookings = bookings.filter(b => b.status === 'Cancelled').length;

    // Platform revenue = userServiceFee + hostServiceFee (per PAYMENT_STRUCTURE.md)
    const completedBookingsList = bookings.filter(b => b.status === 'Confirmed' || b.status === 'Completed');
    const platformRevenue = financials?.totalRevenue || 
      completedBookingsList.reduce((sum, b) => sum + (b.userServiceFee || 0) + (b.hostServiceFee || 0), 0);
    
    // Gross volume = total amount paid by guests
    const grossVolume = completedBookingsList.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

    // Calculate month-over-month changes
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

    // Helper to check if date is in a specific month/year
    const isInMonth = (dateStr: string | undefined, month: number, year: number) => {
      if (!dateStr) return false;
      const d = new Date(dateStr);
      return d.getMonth() === month && d.getFullYear() === year;
    };

    // Users change
    const usersThisMonth = users.filter(u => isInMonth(u.createdAt, thisMonth, thisYear)).length;
    const usersLastMonth = users.filter(u => isInMonth(u.createdAt, lastMonth, lastMonthYear)).length;
    const usersChange = usersLastMonth > 0 ? Math.round(((usersThisMonth - usersLastMonth) / usersLastMonth) * 100) : (usersThisMonth > 0 ? 100 : 0);

    // Listings change
    const listingsThisMonth = listings.filter(l => isInMonth(l.createdAt, thisMonth, thisYear)).length;
    const listingsLastMonth = listings.filter(l => isInMonth(l.createdAt, lastMonth, lastMonthYear)).length;
    const listingsChange = listingsLastMonth > 0 ? Math.round(((listingsThisMonth - listingsLastMonth) / listingsLastMonth) * 100) : (listingsThisMonth > 0 ? 100 : 0);

    // Bookings change
    const bookingsThisMonth = bookings.filter(b => isInMonth(b.createdAt, thisMonth, thisYear)).length;
    const bookingsLastMonth = bookings.filter(b => isInMonth(b.createdAt, lastMonth, lastMonthYear)).length;
    const bookingsChange = bookingsLastMonth > 0 ? Math.round(((bookingsThisMonth - bookingsLastMonth) / bookingsLastMonth) * 100) : (bookingsThisMonth > 0 ? 100 : 0);

    // Revenue change (based on completed bookings)
    const revenueThisMonth = bookings
      .filter(b => isInMonth(b.createdAt, thisMonth, thisYear) && (b.status === 'Confirmed' || b.status === 'Completed'))
      .reduce((sum, b) => sum + (b.userServiceFee || 0) + (b.hostServiceFee || 0), 0);
    const revenueLastMonth = bookings
      .filter(b => isInMonth(b.createdAt, lastMonth, lastMonthYear) && (b.status === 'Confirmed' || b.status === 'Completed'))
      .reduce((sum, b) => sum + (b.userServiceFee || 0) + (b.hostServiceFee || 0), 0);
    const revenueChange = revenueLastMonth > 0 ? Math.round(((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100) : (revenueThisMonth > 0 ? 100 : 0);

    // Additional financial metrics per PAYMENT_STRUCTURE.md
    const totalUserServiceFees = completedBookingsList.reduce((sum, b) => sum + (b.userServiceFee || 0), 0);
    const totalHostServiceFees = completedBookingsList.reduce((sum, b) => sum + (b.hostServiceFee || 0), 0);
    const totalCautionHeld = bookings
      .filter(b => b.cautionStatus === 'HELD' || (!b.cautionStatus && b.status !== 'Cancelled'))
      .reduce((sum, b) => sum + (b.cautionFee || 0), 0);
    const totalHostPayouts = completedBookingsList.reduce((sum, b) => sum + (b.hostPayout || 0), 0);
    const totalExtras = completedBookingsList.reduce((sum, b) => sum + (b.extrasTotal || 0), 0);
    const totalExtraGuestFees = completedBookingsList.reduce((sum, b) => sum + (b.extraGuestFees || 0), 0);

    return {
      totalUsers,
      totalHosts,
      verifiedHosts,
      totalListings,
      activeListings,
      totalBookings,
      confirmedBookings,
      pendingBookings,
      cancelledBookings,
      platformRevenue,
      grossVolume,
      // Month-over-month changes
      usersChange,
      listingsChange,
      bookingsChange,
      revenueChange,
      // Detailed financials
      totalUserServiceFees,
      totalHostServiceFees,
      totalCautionHeld,
      totalHostPayouts,
      totalExtras,
      totalExtraGuestFees,
    };
  }, [users, listings, bookings, financials]);

  // Revenue trend data (last 6 months) - Shows PLATFORM REVENUE per PAYMENT_STRUCTURE.md
  const revenueTrendData = useMemo(() => {
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      return d;
    }).reverse();

    return last6Months.map(date => {
      const monthStr = date.toLocaleString('default', { month: 'short' });
      
      // Filter bookings for this month
      const monthBookings = bookings.filter(b => {
        const bDate = new Date(b.date || b.createdAt || Date.now());
        return (
          bDate.getMonth() === date.getMonth() &&
          bDate.getFullYear() === date.getFullYear() &&
          (b.status === 'Confirmed' || b.status === 'Completed')
        );
      });
      
      // Platform revenue = userServiceFee + hostServiceFee (per PAYMENT_STRUCTURE.md)
      const revenue = monthBookings.reduce((sum, b) => 
        sum + (b.userServiceFee || 0) + (b.hostServiceFee || 0), 0);

      const bookingCount = bookings.filter(b => {
        const bDate = new Date(b.date || b.createdAt || Date.now());
        return bDate.getMonth() === date.getMonth() && bDate.getFullYear() === date.getFullYear();
      }).length;

      return { name: monthStr, revenue, bookings: bookingCount };
    });
  }, [bookings]);

  // User registration trend
  const userTrendData = useMemo(() => {
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      return d;
    }).reverse();

    return last6Months.map(date => {
      const monthStr = date.toLocaleString('default', { month: 'short' });
      const count = users.filter(u => {
        const uDate = new Date(u.createdAt || Date.now());
        return uDate.getMonth() === date.getMonth() && uDate.getFullYear() === date.getFullYear();
      }).length;
      return { name: monthStr, users: count };
    });
  }, [users]);

  // Booking status distribution
  const bookingStatusData = useMemo(() => {
    return [
      { name: 'Confirmed', value: stats.confirmedBookings, color: '#10b981' },
      { name: 'Pending', value: stats.pendingBookings, color: '#f59e0b' },
      { name: 'Cancelled', value: stats.cancelledBookings, color: '#ef4444' },
    ].filter(item => item.value > 0);
  }, [stats]);

  // Listing status distribution
  const listingStatusData = useMemo(() => {
    const live = listings.filter(l => l.status === ListingStatus.LIVE).length;
    const pending = listings.filter(l => l.status === ListingStatus.PENDING_APPROVAL || l.status === ListingStatus.PENDING_KYC).length;
    const draft = listings.filter(l => l.status === ListingStatus.DRAFT).length;
    const rejected = listings.filter(l => l.status === ListingStatus.REJECTED).length;

    return [
      { name: 'Live', value: live, color: '#10b981' },
      { name: 'Pending', value: pending, color: '#f59e0b' },
      { name: 'Draft', value: draft, color: '#6b7280' },
      { name: 'Rejected', value: rejected, color: '#ef4444' },
    ].filter(item => item.value > 0);
  }, [listings]);

  // Recent activity
  const recentActivity = useMemo(() => {
    const activities: { id: string; type: string; message: string; time: Date; icon: React.ElementType; color: string }[] = [];

    // Add recent bookings
    bookings.slice(0, 3).forEach(booking => {
      activities.push({
        id: `booking-${booking.id}`,
        type: 'booking',
        message: `New booking for ${booking.date}`,
        time: new Date(booking.createdAt || Date.now()),
        icon: Calendar,
        color: 'text-blue-500',
      });
    });

    // Add recent users
    users.slice(0, 2).forEach(user => {
      activities.push({
        id: `user-${user.id}`,
        type: 'user',
        message: `${user.name || user.firstName || 'New user'} registered`,
        time: new Date(user.createdAt || Date.now()),
        icon: Users,
        color: 'text-green-500',
      });
    });

    return activities.sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 5);
  }, [bookings, users]);

  const formatCurrency = (amount: number) => {
    return `₦${new Intl.NumberFormat('en-NG', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)}`;
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          change={stats.usersChange}
          changeLabel="vs last month"
          icon={Users}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          onClick={() => navigate('/admin/hosts')}
        />
        <StatCard
          title="Active Listings"
          value={stats.activeListings}
          change={stats.listingsChange}
          changeLabel="vs last month"
          icon={Home}
          iconBg="bg-green-50"
          iconColor="text-green-600"
          onClick={() => navigate('/admin/listings')}
        />
        <StatCard
          title="Total Bookings"
          value={stats.totalBookings}
          change={stats.bookingsChange}
          changeLabel="vs last month"
          icon={Calendar}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
          onClick={() => navigate('/admin/financials')}
        />
        <StatCard
          title="Platform Revenue"
          value={formatCurrency(stats.platformRevenue)}
          change={stats.revenueChange}
          changeLabel="vs last month"
          icon={DollarSign}
          iconBg="bg-brand-50"
          iconColor="text-brand-600"
          onClick={() => navigate('/admin/financials')}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend - Large Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Revenue Overview</h3>
              <p className="text-sm text-gray-500">Monthly revenue and booking trends</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-brand-500" />
                <span className="text-gray-600">Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-400" />
                <span className="text-gray-600">Bookings</span>
              </div>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrendData}>
                <defs>
                  <linearGradient id="colorRevenueAdmin" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e74c3c" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#e74c3c" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorBookingsAdmin" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                <YAxis yAxisId="left" stroke="#9ca3af" fontSize={12} tickFormatter={(v) => `₦${v}`} />
                <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  }}
                  formatter={(value: number, name: string) => [
                    name === 'revenue' ? formatCurrency(value) : value,
                    name === 'revenue' ? 'Revenue' : 'Bookings',
                  ]}
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#e74c3c"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevenueAdmin)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="bookings"
                  stroke="#60a5fa"
                  strokeWidth={2}
                  dot={{ fill: '#60a5fa', r: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Booking Status Pie Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Booking Status</h3>
            <p className="text-sm text-gray-500">Distribution of all bookings</p>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={bookingStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {bookingStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            {bookingStatusData.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-gray-600">
                  {item.name} ({item.value})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Second Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Registration Trend */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">User Growth</h3>
            <p className="text-sm text-gray-500">New registrations per month</p>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  }}
                />
                <Bar dataKey="users" fill="#e74c3c" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Listing Status Distribution */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Listing Status</h3>
            <p className="text-sm text-gray-500">Current listing distribution</p>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={listingStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {listingStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            {listingStatusData.map((item, index) => (
              <div key={index} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-gray-600">
                  {item.name} ({item.value})
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Platform Health</h3>
            <p className="text-sm text-gray-500">Key metrics at a glance</p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <UserCheck size={18} className="text-green-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Verified Hosts</span>
              </div>
              <span className="text-lg font-bold text-gray-900">
                {stats.verifiedHosts}/{stats.totalHosts}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Home size={18} className="text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Live Listings</span>
              </div>
              <span className="text-lg font-bold text-gray-900">
                {stats.activeListings}/{stats.totalListings}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <CheckCircle2 size={18} className="text-purple-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Booking Success</span>
              </div>
              <span className="text-lg font-bold text-gray-900">
                {stats.totalBookings > 0
                  ? Math.round((stats.confirmedBookings / stats.totalBookings) * 100)
                  : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Breakdown - Per PAYMENT_STRUCTURE.md */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Financial Breakdown</h3>
            <p className="text-sm text-gray-500">Revenue breakdown per payment structure</p>
          </div>
          <button
            onClick={() => navigate('/admin/financials')}
            className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
          >
            View Details <ArrowRight size={14} />
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Gross Volume */}
          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={16} className="text-gray-500" />
              <span className="text-xs font-medium text-gray-500 uppercase">Gross Volume</span>
            </div>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.grossVolume)}</p>
            <p className="text-xs text-gray-400 mt-1">Total guest payments</p>
          </div>

          {/* Guest Service Fees (10%) */}
          <div className="p-4 bg-emerald-50 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} className="text-emerald-600" />
              <span className="text-xs font-medium text-emerald-600 uppercase">Guest Fees (10%)</span>
            </div>
            <p className="text-xl font-bold text-emerald-700">{formatCurrency(stats.totalUserServiceFees)}</p>
            <p className="text-xs text-emerald-600 mt-1">User service fees</p>
          </div>

          {/* Host Service Fees (3-5%) */}
          <div className="p-4 bg-violet-50 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} className="text-violet-600" />
              <span className="text-xs font-medium text-violet-600 uppercase">Host Fees (3-5%)</span>
            </div>
            <p className="text-xl font-bold text-violet-700">{formatCurrency(stats.totalHostServiceFees)}</p>
            <p className="text-xs text-violet-600 mt-1">Host service fees</p>
          </div>

          {/* Platform Revenue */}
          <div className="p-4 bg-brand-50 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={16} className="text-brand-600" />
              <span className="text-xs font-medium text-brand-600 uppercase">Platform Revenue</span>
            </div>
            <p className="text-xl font-bold text-brand-700">{formatCurrency(stats.platformRevenue)}</p>
            <p className="text-xs text-brand-600 mt-1">Guest + Host fees</p>
          </div>

          {/* Caution Held */}
          <div className="p-4 bg-amber-50 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={16} className="text-amber-600" />
              <span className="text-xs font-medium text-amber-600 uppercase">Caution Held</span>
            </div>
            <p className="text-xl font-bold text-amber-700">{formatCurrency(stats.totalCautionHeld)}</p>
            <p className="text-xs text-amber-600 mt-1">Security deposits</p>
          </div>

          {/* Host Payouts */}
          <div className="p-4 bg-blue-50 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Users size={16} className="text-blue-600" />
              <span className="text-xs font-medium text-blue-600 uppercase">Host Payouts</span>
            </div>
            <p className="text-xl font-bold text-blue-700">{formatCurrency(stats.totalHostPayouts)}</p>
            <p className="text-xs text-blue-600 mt-1">Released to hosts</p>
          </div>
        </div>

        {/* Additional breakdown row */}
        {(stats.totalExtras > 0 || stats.totalExtraGuestFees > 0) && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-100">
            {/* Extra Guest Fees */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <span className="text-xs text-gray-500">Extra Guest Fees</span>
              <p className="text-lg font-semibold text-gray-900">{formatCurrency(stats.totalExtraGuestFees)}</p>
            </div>

            {/* Optional Extras */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <span className="text-xs text-gray-500">Add-on Extras (No Fee)</span>
              <p className="text-lg font-semibold text-gray-900">{formatCurrency(stats.totalExtras)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Action Required & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Action Required */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Action Required</h3>
              <p className="text-sm text-gray-500">Items needing your attention</p>
            </div>
            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-orange-100 text-orange-700">
              <Zap size={14} />
              <span className="text-sm font-bold">
                {unverifiedHosts.length + pendingListings.length + openDisputes.length}
              </span>
            </div>
          </div>
          <div className="space-y-3">
            {unverifiedHosts.length > 0 && (
              <button
                onClick={() => navigate('/admin/kyc')}
                className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <UserCheck size={18} className="text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">KYC Pending</p>
                    <p className="text-sm text-gray-500">
                      {unverifiedHosts.length} host{unverifiedHosts.length !== 1 ? 's' : ''} awaiting verification
                    </p>
                  </div>
                </div>
                <ArrowRight size={18} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
              </button>
            )}
            {pendingListings.length > 0 && (
              <button
                onClick={() => navigate('/admin/listings')}
                className="w-full flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Home size={18} className="text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Listings Pending</p>
                    <p className="text-sm text-gray-500">
                      {pendingListings.length} listing{pendingListings.length !== 1 ? 's' : ''} need review
                    </p>
                  </div>
                </div>
                <ArrowRight size={18} className="text-gray-400 group-hover:text-green-600 transition-colors" />
              </button>
            )}
            {openDisputes.length > 0 && (
              <button
                onClick={() => navigate('/admin/disputes')}
                className="w-full flex items-center justify-between p-4 bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <AlertTriangle size={18} className="text-orange-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Open Disputes</p>
                    <p className="text-sm text-gray-500">
                      {openDisputes.length} dispute{openDisputes.length !== 1 ? 's' : ''} require attention
                    </p>
                  </div>
                </div>
                <ArrowRight size={18} className="text-gray-400 group-hover:text-orange-600 transition-colors" />
              </button>
            )}
            {unverifiedHosts.length === 0 && pendingListings.length === 0 && openDisputes.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="p-4 bg-green-100 rounded-full mb-4">
                  <CheckCircle2 size={32} className="text-green-600" />
                </div>
                <p className="font-medium text-gray-900">All caught up!</p>
                <p className="text-sm text-gray-500 mt-1">No pending actions at this time</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <p className="text-sm text-gray-500">Latest platform events</p>
          </div>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map(activity => (
                <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                  <div className={cn("p-2 rounded-lg bg-gray-100", activity.color)}>
                    <activity.icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{formatTimeAgo(activity.time)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Clock size={32} className="text-gray-300 mb-3" />
                <p className="text-sm text-gray-500">No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
