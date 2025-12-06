import React, { useState, useMemo } from 'react';
import { User, Booking } from '@fiilar/types';
import { Users, Search, Mail, Phone, MoreHorizontal, MapPin, Calendar, ShieldCheck, Star, CreditCard, Clock, CheckCircle, XCircle, UserIcon, Activity, DollarSign, Home } from 'lucide-react';
import { cn } from '@fiilar/utils';

// Helper component for user avatars
const UserAvatar = ({ user, size = 'md' }: { user: User; size?: 'sm' | 'md' | 'lg' }) => {
    const sizeClasses = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-14 h-14 text-lg'
    };
    
    if (user.avatar) {
        return <img src={user.avatar} alt={user.name} className={cn("rounded-full object-cover", sizeClasses[size])} />;
    }
    
    return (
        <div className={cn(
            "rounded-full flex items-center justify-center text-white font-semibold bg-gradient-to-br from-blue-400 to-blue-500",
            sizeClasses[size]
        )}>
            {user.name?.charAt(0).toUpperCase() || user.firstName?.charAt(0).toUpperCase() || 'U'}
        </div>
    );
};

interface AdminUsersProps {
    users: User[];
    bookings: Booking[];
}

type TabType = 'all' | 'verified' | 'unverified' | 'active';

export const AdminUsers: React.FC<AdminUsersProps> = ({ users, bookings }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<TabType>('all');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [detailTab, setDetailTab] = useState('overview');

    // Filter to get only regular users (non-hosts or users who have made bookings)
    const regularUsers = useMemo(() => {
        return users.filter(u => !u.isHost || bookings.some(b => b.userId === u.id));
    }, [users, bookings]);

    // Get user bookings
    const getUserBookings = (userId: string) => bookings.filter(b => b.userId === userId);

    // Calculate user stats
    const getUserStats = (userId: string) => {
        const userBookings = getUserBookings(userId);
        const completedBookings = userBookings.filter(b => b.status === 'Completed');
        const totalSpent = userBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
        return {
            totalBookings: userBookings.length,
            completedBookings: completedBookings.length,
            totalSpent,
            lastBooking: userBookings.length > 0 
                ? new Date(Math.max(...userBookings.map(b => new Date(b.createdAt || b.date).getTime())))
                : null
        };
    };

    // Filter users based on tab and search
    const filteredUsers = useMemo(() => {
        let filtered = regularUsers.filter(u => {
            const matchesSearch = u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
            
            if (!matchesSearch) return false;

            switch (activeTab) {
                case 'verified':
                    return u.emailVerified || u.kycVerified;
                case 'unverified':
                    return !u.emailVerified && !u.kycVerified;
                case 'active':
                    return getUserBookings(u.id).length > 0;
                default:
                    return true;
            }
        });
        return filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }, [regularUsers, searchTerm, activeTab, bookings]);

    const stats = {
        total: regularUsers.length,
        verified: regularUsers.filter(u => u.emailVerified || u.kycVerified).length,
        unverified: regularUsers.filter(u => !u.emailVerified && !u.kycVerified).length,
        active: regularUsers.filter(u => getUserBookings(u.id).length > 0).length,
    };

    const tabs = [
        { id: 'all' as TabType, label: 'All Users', count: stats.total },
        { id: 'verified' as TabType, label: 'Verified', count: stats.verified },
        { id: 'unverified' as TabType, label: 'Unverified', count: stats.unverified },
        { id: 'active' as TabType, label: 'Active', count: stats.active },
    ];

    const detailTabs = ['Overview', 'Bookings', 'Activity'];

    const getDisplayName = (user: User) => {
        if (user.firstName && user.lastName) {
            return `${user.firstName} ${user.lastName}`;
        }
        return user.name || 'Unknown User';
    };

    return (
        <div className="flex gap-6 h-[calc(100vh-180px)] animate-in fade-in">
            {/* Left Panel - User List */}
            <div className="w-[340px] flex-shrink-0 flex flex-col">
                {/* Tabs */}
                <div className="border-b border-gray-200 mb-4 flex-shrink-0">
                    <div className="flex gap-4 overflow-x-auto">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => { setActiveTab(tab.id); setSelectedUser(null); }}
                                className={cn(
                                    "pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                                    activeTab === tab.id
                                        ? "border-gray-900 text-gray-900"
                                        : "border-transparent text-gray-500 hover:text-gray-700"
                                )}
                            >
                                {tab.label}
                                {tab.count > 0 && (
                                    <span className={cn(
                                        "ml-2 px-1.5 py-0.5 text-xs rounded-full",
                                        activeTab === tab.id
                                            ? "bg-gray-900 text-white"
                                            : "bg-gray-100 text-gray-600"
                                    )}>
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Search */}
                <div className="relative mb-4 flex-shrink-0">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-200 focus:border-gray-300 outline-none transition-all"
                    />
                </div>

                {/* User List */}
                <div className="space-y-2 flex-1 overflow-y-auto pr-1">
                    {filteredUsers.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Users size={20} className="text-gray-400" />
                            </div>
                            <p className="text-sm text-gray-500">No users found</p>
                        </div>
                    ) : (
                        filteredUsers.map((user) => {
                            const userStats = getUserStats(user.id);
                            return (
                                <div
                                    key={user.id}
                                    onClick={() => setSelectedUser(user)}
                                    className={cn(
                                        "p-3 rounded-lg cursor-pointer transition-all border-l-2",
                                        selectedUser?.id === user.id
                                            ? "bg-gray-100 border-l-blue-400"
                                            : "border-l-transparent hover:bg-gray-50"
                                    )}
                                >
                                    <div className="flex items-start gap-3">
                                        <UserAvatar user={user} size="md" />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-gray-900 text-sm truncate">{getDisplayName(user)}</span>
                                                {user.emailVerified && <CheckCircle size={12} className="text-green-500" />}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-0.5 truncate">{user.email}</div>
                                            <div className="flex items-center gap-3 mt-2">
                                                <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                                                    <CreditCard size={10} /> {userStats.totalBookings} bookings
                                                </span>
                                                {user.kycVerified && (
                                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-green-100 text-green-700 text-[10px] font-medium">
                                                        <ShieldCheck size={8} /> KYC
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Right Panel - User Details */}
            <div className="flex-1 min-w-0 overflow-y-auto">
                {selectedUser ? (
                    <div className="bg-white rounded-xl border border-gray-200">
                        {/* User Header */}
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <UserAvatar user={selectedUser} size="lg" />
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-xl font-semibold text-gray-900">{getDisplayName(selectedUser)}</h2>
                                            {selectedUser.emailVerified && (
                                                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
                                                    <CheckCircle size={10} /> Verified
                                                </span>
                                            )}
                                            {selectedUser.kycVerified && (
                                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium flex items-center gap-1">
                                                    <ShieldCheck size={10} /> KYC
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500">{selectedUser.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
                                        <Mail size={14} />
                                        Mail
                                    </button>
                                    {selectedUser.phone && (
                                        <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
                                            <Phone size={14} />
                                            Call
                                        </button>
                                    )}
                                    <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors" title="More options" aria-label="More options">
                                        <MoreHorizontal size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Detail Tabs */}
                        <div className="border-b border-gray-200">
                            <div className="flex gap-1 px-6">
                                {detailTabs.map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setDetailTab(tab.toLowerCase())}
                                        className={cn(
                                            "px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors",
                                            detailTab === tab.toLowerCase()
                                                ? "border-gray-900 text-gray-900"
                                                : "border-transparent text-gray-500 hover:text-gray-700"
                                        )}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            {detailTab === 'overview' && (
                                <>
                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-4 gap-4 mb-6">
                                        <div className="p-4 bg-gray-50 rounded-xl">
                                            <div className="text-2xl font-bold text-gray-900">{getUserStats(selectedUser.id).totalBookings}</div>
                                            <div className="text-xs text-gray-500 mt-1">Total Bookings</div>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-xl">
                                            <div className="text-2xl font-bold text-gray-900">{getUserStats(selectedUser.id).completedBookings}</div>
                                            <div className="text-xs text-gray-500 mt-1">Completed</div>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-xl">
                                            <div className="text-2xl font-bold text-green-600">₦{getUserStats(selectedUser.id).totalSpent.toLocaleString()}</div>
                                            <div className="text-xs text-gray-500 mt-1">Total Spent</div>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-xl">
                                            <div className="text-2xl font-bold text-gray-900">₦{selectedUser.walletBalance?.toLocaleString() || '0'}</div>
                                            <div className="text-xs text-gray-500 mt-1">Wallet Balance</div>
                                        </div>
                                    </div>

                                    {/* User Info */}
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3">User Information</h3>
                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-gray-500 border border-gray-200">
                                                <Mail size={14} />
                                            </div>
                                            <div>
                                                <div className="text-xs text-gray-400">Email</div>
                                                <div className="text-sm font-medium text-gray-900">{selectedUser.email}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-gray-500 border border-gray-200">
                                                <Phone size={14} />
                                            </div>
                                            <div>
                                                <div className="text-xs text-gray-400">Phone</div>
                                                <div className="text-sm font-medium text-gray-900">{selectedUser.phone || 'Not provided'}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-gray-500 border border-gray-200">
                                                <Calendar size={14} />
                                            </div>
                                            <div>
                                                <div className="text-xs text-gray-400">Member Since</div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {selectedUser.createdAt 
                                                        ? new Date(selectedUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                                                        : 'N/A'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-gray-500 border border-gray-200">
                                                <UserIcon size={14} />
                                            </div>
                                            <div>
                                                <div className="text-xs text-gray-400">Auth Provider</div>
                                                <div className="text-sm font-medium text-gray-900 capitalize">{selectedUser.authProvider || 'Email'}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Verification Status */}
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Verification Status</h3>
                                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Mail size={14} className="text-gray-500" />
                                                <span className="text-sm text-gray-700">Email Verified</span>
                                            </div>
                                            <span className={cn(
                                                "px-2 py-0.5 rounded text-xs font-medium",
                                                selectedUser.emailVerified ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                                            )}>
                                                {selectedUser.emailVerified ? 'Verified' : 'Not Verified'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Phone size={14} className="text-gray-500" />
                                                <span className="text-sm text-gray-700">Phone Verified</span>
                                            </div>
                                            <span className={cn(
                                                "px-2 py-0.5 rounded text-xs font-medium",
                                                selectedUser.phoneVerified ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                                            )}>
                                                {selectedUser.phoneVerified ? 'Verified' : 'Not Verified'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <ShieldCheck size={14} className="text-gray-500" />
                                                <span className="text-sm text-gray-700">KYC Verification</span>
                                            </div>
                                            <span className={cn(
                                                "px-2 py-0.5 rounded text-xs font-medium",
                                                selectedUser.kycVerified ? "bg-green-100 text-green-700" : 
                                                selectedUser.kycStatus === 'pending' ? "bg-amber-100 text-amber-700" : 
                                                "bg-gray-100 text-gray-600"
                                            )}>
                                                {selectedUser.kycVerified ? 'Verified' : selectedUser.kycStatus === 'pending' ? 'Pending' : 'Not Verified'}
                                            </span>
                                        </div>
                                        {selectedUser.isHost && (
                                            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                                                <div className="flex items-center gap-2">
                                                    <Home size={14} className="text-gray-500" />
                                                    <span className="text-sm text-gray-700">Host Status</span>
                                                </div>
                                                <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700">
                                                    Active Host
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}

                            {detailTab === 'bookings' && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-semibold text-gray-900">
                                            Booking History ({getUserBookings(selectedUser.id).length})
                                        </h3>
                                    </div>

                                    {getUserBookings(selectedUser.id).length === 0 ? (
                                        <div className="border border-dashed border-gray-200 rounded-xl p-8 text-center">
                                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                                <CreditCard size={20} className="text-gray-400" />
                                            </div>
                                            <h4 className="text-sm font-medium text-gray-900 mb-1">No bookings yet</h4>
                                            <p className="text-xs text-gray-500">This user hasn't made any bookings</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {getUserBookings(selectedUser.id).map((booking) => (
                                                <div key={booking.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                                        <Home size={18} className="text-gray-500" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-medium text-gray-900 truncate">Booking #{booking.id.slice(0, 8)}</div>
                                                        <div className="text-sm text-gray-500 mt-0.5">
                                                            {new Date(booking.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <span className={cn(
                                                                "px-2 py-0.5 rounded text-xs font-medium",
                                                                booking.status === 'Completed' ? "bg-green-100 text-green-700" :
                                                                booking.status === 'Confirmed' ? "bg-blue-100 text-blue-700" :
                                                                booking.status === 'Pending' ? "bg-amber-100 text-amber-700" :
                                                                booking.status === 'Cancelled' ? "bg-red-100 text-red-700" :
                                                                "bg-gray-100 text-gray-600"
                                                            )}>
                                                                {booking.status}
                                                            </span>
                                                            <span className="text-xs text-gray-500">
                                                                ₦{booking.totalPrice?.toLocaleString() || '0'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className={cn(
                                                            "px-2 py-0.5 rounded text-xs font-medium",
                                                            booking.paymentStatus === 'Released' ? "bg-green-100 text-green-700" :
                                                            booking.paymentStatus === 'Refunded' ? "bg-red-100 text-red-700" :
                                                            "bg-blue-100 text-blue-700"
                                                        )}>
                                                            {booking.paymentStatus || 'Escrow'}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {detailTab === 'activity' && (
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-4">User Activity Timeline</h3>
                                    
                                    {/* Account Created */}
                                    <div className="flex gap-3">
                                        <div className="flex flex-col items-center">
                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                <UserIcon size={14} className="text-blue-600" />
                                            </div>
                                            <div className="w-0.5 flex-1 bg-gray-200 mt-2" />
                                        </div>
                                        <div className="pb-6">
                                            <p className="text-sm font-medium text-gray-900">Account Created</p>
                                            <p className="text-xs text-gray-500 mt-0.5">User registered on the platform</p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {selectedUser.createdAt 
                                                    ? new Date(selectedUser.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
                                                    : 'N/A'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Email Verification */}
                                    <div className="flex gap-3">
                                        <div className="flex flex-col items-center">
                                            <div className={cn(
                                                "w-8 h-8 rounded-full flex items-center justify-center",
                                                selectedUser.emailVerified ? "bg-green-100" : "bg-gray-100"
                                            )}>
                                                <Mail size={14} className={selectedUser.emailVerified ? "text-green-600" : "text-gray-400"} />
                                            </div>
                                            <div className="w-0.5 flex-1 bg-gray-200 mt-2" />
                                        </div>
                                        <div className="pb-6">
                                            <p className="text-sm font-medium text-gray-900">Email Verification</p>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {selectedUser.emailVerified ? 'Email address verified' : 'Awaiting email verification'}
                                            </p>
                                            <span className={cn(
                                                "inline-flex items-center gap-1 text-xs mt-1 px-2 py-0.5 rounded",
                                                selectedUser.emailVerified 
                                                    ? "bg-green-100 text-green-700" 
                                                    : "bg-amber-100 text-amber-700"
                                            )}>
                                                {selectedUser.emailVerified ? 'Verified' : 'Pending'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* KYC Verification */}
                                    <div className="flex gap-3">
                                        <div className="flex flex-col items-center">
                                            <div className={cn(
                                                "w-8 h-8 rounded-full flex items-center justify-center",
                                                selectedUser.kycVerified ? "bg-green-100" : "bg-gray-100"
                                            )}>
                                                <ShieldCheck size={14} className={selectedUser.kycVerified ? "text-green-600" : "text-gray-400"} />
                                            </div>
                                            <div className="w-0.5 flex-1 bg-gray-200 mt-2" />
                                        </div>
                                        <div className="pb-6">
                                            <p className="text-sm font-medium text-gray-900">Identity Verification</p>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {selectedUser.kycVerified ? 'Identity verified via KYC' : 'KYC verification pending'}
                                            </p>
                                            <span className={cn(
                                                "inline-flex items-center gap-1 text-xs mt-1 px-2 py-0.5 rounded",
                                                selectedUser.kycVerified 
                                                    ? "bg-green-100 text-green-700" 
                                                    : "bg-amber-100 text-amber-700"
                                            )}>
                                                {selectedUser.kycVerified ? 'Verified' : 'Pending'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* First Booking (if any) */}
                                    {getUserBookings(selectedUser.id).length > 0 && (
                                        <div className="flex gap-3">
                                            <div className="flex flex-col items-center">
                                                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                                    <CreditCard size={14} className="text-purple-600" />
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Booking Activity</p>
                                                <p className="text-xs text-gray-500 mt-0.5">User has made bookings on the platform</p>
                                                <span className="inline-flex items-center gap-1 text-xs mt-1 px-2 py-0.5 rounded bg-purple-100 text-purple-700">
                                                    {getUserStats(selectedUser.id).totalBookings} total bookings
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-200 h-full min-h-[500px] flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Users size={28} className="text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">Select a User</h3>
                            <p className="text-sm text-gray-500">Choose a user from the list to view their details</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
