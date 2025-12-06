import React, { useState, useEffect } from 'react';
import { User } from '@fiilar/types';
import { Search, Clock, CheckCircle, UserCheck, FileText, X, Check, Mail, Phone, MoreHorizontal, Shield, AlertCircle } from 'lucide-react';
import { Button, useToast } from '@fiilar/ui';
import { cn } from '@fiilar/utils';

interface AdminKYCProps {
    unverifiedHosts: User[];
    users: User[];
    handleVerifyUser: (userId: string, approve: boolean) => void;
    handleUpdateBadgeStatus: (userId: string, badgeStatus: 'standard' | 'super_host' | 'premium') => void;
}

type TabType = 'pending' | 'verified' | 'all';

// Avatar component that uses user's avatar or shows initial
const UserAvatar: React.FC<{ user: User; size?: 'sm' | 'md' | 'lg' }> = ({ user, size = 'md' }) => {
    const sizeClasses = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-14 h-14 text-xl',
    };

    if (user.avatar) {
        return (
            <img 
                src={user.avatar} 
                alt={user.name} 
                className={cn(sizeClasses[size], "rounded-full object-cover flex-shrink-0")}
            />
        );
    }

    return (
        <div className={cn(
            sizeClasses[size],
            "rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0",
            "bg-gray-500"
        )}>
            {user.name.charAt(0).toUpperCase()}
        </div>
    );
};

export const AdminKYC: React.FC<AdminKYCProps> = ({ unverifiedHosts, users, handleVerifyUser, handleUpdateBadgeStatus }) => {
    const { showToast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<TabType>('pending');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [detailTab, setDetailTab] = useState('details');

    // Wrapper to add toast notifications
    const handleVerifyWithToast = (userId: string, approve: boolean) => {
        const user = users.find(u => u.id === userId);
        handleVerifyUser(userId, approve);
        if (approve) {
            showToast({ message: `${user?.name || 'User'} has been verified successfully`, type: 'success' });
        } else {
            showToast({ message: `${user?.name || 'User'} verification has been rejected`, type: 'info' });
        }
        setSelectedUser(null);
    };

    const handleBadgeUpdateWithToast = (userId: string, badgeStatus: 'standard' | 'super_host' | 'premium') => {
        const user = users.find(u => u.id === userId);
        handleUpdateBadgeStatus(userId, badgeStatus);
        const badgeLabel = badgeStatus === 'super_host' ? 'Super Host' : badgeStatus === 'premium' ? 'Premium' : 'Standard';
        showToast({ message: `${user?.name || 'User'} badge updated to ${badgeLabel}`, type: 'success' });
    };

    const verifiedUsers = users.filter(u => u.kycVerified);
    
    // Get users based on active tab
    const getTabUsers = () => {
        switch (activeTab) {
            case 'pending':
                return unverifiedHosts;
            case 'verified':
                return verifiedUsers;
            case 'all':
                return users;
            default:
                return unverifiedHosts;
        }
    };

    // Filter users based on search
    const filteredUsers = getTabUsers().filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        if (filteredUsers.length > 0 && !selectedUser) {
            setSelectedUser(filteredUsers[0]);
        }
    }, [filteredUsers, selectedUser]);

    const tabs = [
        { id: 'pending' as TabType, label: 'Pending', count: unverifiedHosts.length },
        { id: 'verified' as TabType, label: 'Verified', count: verifiedUsers.length },
        { id: 'all' as TabType, label: 'All Users', count: users.length },
    ];

    const detailTabs = ['Details', 'Activity', 'Notes'];

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-US', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
        });
    };

    return (
        <div className="flex gap-6 h-[calc(100vh-180px)] animate-in fade-in">
            {/* Left Panel - User List */}
            <div className="w-[340px] flex-shrink-0 flex flex-col">
                {/* Tabs */}
                <div className="border-b border-gray-200 mb-4 flex-shrink-0">
                    <div className="flex gap-6">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => { setActiveTab(tab.id); setSelectedUser(null); }}
                                className={cn(
                                    "pb-3 text-sm font-medium border-b-2 transition-colors",
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

                {/* Recent Activity */}
                <div className="flex-1 overflow-y-auto pr-1">
                    <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3 sticky top-0 bg-white pb-2">Recent Activity</h3>
                    <div className="space-y-2">
                        {filteredUsers.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <UserCheck size={20} className="text-gray-400" />
                                </div>
                                <p className="text-sm text-gray-500">No users found</p>
                            </div>
                        ) : (
                            filteredUsers.map((user) => (
                                <div
                                    key={user.id}
                                    onClick={() => setSelectedUser(user)}
                                    className={cn(
                                        "p-3 rounded-lg cursor-pointer transition-all border-l-2",
                                        selectedUser?.id === user.id
                                            ? "bg-gray-100 border-l-gray-400"
                                            : "border-l-transparent hover:bg-gray-50"
                                    )}
                                >
                                    <div className="flex items-start gap-3">
                                        <UserAvatar user={user} size="md" />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-gray-900 text-sm truncate">{user.name}</span>
                                            </div>
                                            <div className="text-xs text-gray-500 mt-0.5 truncate">{user.email}</div>
                                            <div className="flex items-center gap-2 mt-2">
                                                {user.kycVerified ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs font-medium">
                                                        <CheckCircle size={10} /> Verified
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100 text-amber-700 text-xs font-medium">
                                                        <Clock size={10} /> Pending
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* User Info Section */}
                {selectedUser && (
                    <div className="border-t border-gray-100 pt-4">
                        <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">User Info</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm">
                                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                                    <FileText size={14} />
                                </div>
                                <div>
                                    <div className="text-xs text-gray-400">Account Type</div>
                                    <div className="font-medium text-gray-900">{selectedUser.isHost ? 'Host' : 'Guest'}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                                    <UserCheck size={14} />
                                </div>
                                <div>
                                    <div className="text-xs text-gray-400">Badge Status</div>
                                    <div className="font-medium text-gray-900 capitalize">{selectedUser.badgeStatus || 'Standard'}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Right Panel - Details */}
            <div className="flex-1 min-w-0 overflow-y-auto">
                {selectedUser ? (
                    <div className="bg-white rounded-xl border border-gray-200">
                        {/* User Header */}
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <UserAvatar user={selectedUser} size="lg" />
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-900">{selectedUser.name}</h2>
                                        <p className="text-sm text-gray-500">Joined: {formatDate(selectedUser.createdAt)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
                                        <Mail size={14} />
                                        Mail
                                    </button>
                                    <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
                                        <Phone size={14} />
                                        Call
                                    </button>
                                    <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
                                        <MoreHorizontal size={14} />
                                        More
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
                            {detailTab === 'details' && (
                                <>
                                    {/* KYC Status Card */}
                                    <div className={cn(
                                        "p-4 rounded-xl border mb-6",
                                        selectedUser.kycVerified 
                                            ? "bg-green-50 border-green-200" 
                                            : "bg-amber-50 border-amber-200"
                                    )}>
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-10 h-10 rounded-full flex items-center justify-center",
                                                selectedUser.kycVerified ? "bg-green-100" : "bg-amber-100"
                                            )}>
                                                {selectedUser.kycVerified ? (
                                                    <Shield size={20} className="text-green-600" />
                                                ) : (
                                                    <AlertCircle size={20} className="text-amber-600" />
                                                )}
                                            </div>
                                            <div>
                                                <h4 className={cn(
                                                    "font-semibold",
                                                    selectedUser.kycVerified ? "text-green-800" : "text-amber-800"
                                                )}>
                                                    {selectedUser.kycVerified ? 'Identity Verified' : 'Verification Pending'}
                                                </h4>
                                                <p className={cn(
                                                    "text-sm",
                                                    selectedUser.kycVerified ? "text-green-600" : "text-amber-600"
                                                )}>
                                                    {selectedUser.kycVerified 
                                                        ? 'User has completed Dojah identity verification' 
                                                        : 'User needs to complete Dojah identity verification'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* User Details */}
                                    <h3 className="text-sm font-semibold text-gray-900 mb-4">User Information</h3>
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="p-3 bg-gray-50 rounded-lg">
                                            <p className="text-xs text-gray-500 mb-1">Email</p>
                                            <p className="text-sm font-medium text-gray-900">{selectedUser.email}</p>
                                            <span className={cn(
                                                "inline-flex items-center gap-1 text-xs mt-1",
                                                selectedUser.emailVerified ? "text-green-600" : "text-gray-400"
                                            )}>
                                                {selectedUser.emailVerified ? <CheckCircle size={10} /> : <Clock size={10} />}
                                                {selectedUser.emailVerified ? 'Verified' : 'Not verified'}
                                            </span>
                                        </div>
                                        <div className="p-3 bg-gray-50 rounded-lg">
                                            <p className="text-xs text-gray-500 mb-1">Phone</p>
                                            <p className="text-sm font-medium text-gray-900">{selectedUser.phone || 'Not provided'}</p>
                                            {selectedUser.phone && (
                                                <span className={cn(
                                                    "inline-flex items-center gap-1 text-xs mt-1",
                                                    selectedUser.phoneVerified ? "text-green-600" : "text-gray-400"
                                                )}>
                                                    {selectedUser.phoneVerified ? <CheckCircle size={10} /> : <Clock size={10} />}
                                                    {selectedUser.phoneVerified ? 'Verified' : 'Not verified'}
                                                </span>
                                            )}
                                        </div>
                                        <div className="p-3 bg-gray-50 rounded-lg">
                                            <p className="text-xs text-gray-500 mb-1">Account Type</p>
                                            <p className="text-sm font-medium text-gray-900">{selectedUser.isHost ? 'Host' : 'Guest'}</p>
                                        </div>
                                        <div className="p-3 bg-gray-50 rounded-lg">
                                            <p className="text-xs text-gray-500 mb-1">Auth Provider</p>
                                            <p className="text-sm font-medium text-gray-900 capitalize">{selectedUser.authProvider || 'Email'}</p>
                                        </div>
                                    </div>

                                    {/* Badge Assignment */}
                                    <h3 className="text-sm font-semibold text-gray-900 mb-4">Badge Assignment</h3>
                                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 mb-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-medium text-gray-900">User Badge Tier</h4>
                                                <p className="text-sm text-gray-500 mt-0.5">Assign a badge tier to this user</p>
                                            </div>
                                            <select
                                                value={selectedUser.badgeStatus || 'standard'}
                                                onChange={(e) => handleBadgeUpdateWithToast(selectedUser.id, e.target.value as any)}
                                                className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
                                                title="Select badge status"
                                                aria-label="Select badge status"
                                            >
                                                <option value="standard">Standard</option>
                                                <option value="super_host">Super Host</option>
                                                <option value="premium">Premium</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Action Buttons - Only show for pending users */}
                                    {!selectedUser.kycVerified && (
                                        <div className="flex items-center gap-3 pt-6 border-t border-gray-100">
                                            <Button
                                                variant="danger"
                                                onClick={() => handleVerifyWithToast(selectedUser.id, false)}
                                                leftIcon={<X size={16} />}
                                                className="flex-1"
                                            >
                                                Reject
                                            </Button>
                                            <Button
                                                variant="primary"
                                                className="flex-1 bg-green-600 hover:bg-green-700"
                                                onClick={() => handleVerifyWithToast(selectedUser.id, true)}
                                                leftIcon={<Check size={16} />}
                                            >
                                                Approve
                                            </Button>
                                        </div>
                                    )}
                                </>
                            )}

                            {detailTab === 'activity' && (
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-4">User Activity Timeline</h3>
                                    
                                    {/* Account Created */}
                                    <div className="flex gap-3">
                                        <div className="flex flex-col items-center">
                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                <UserCheck size={14} className="text-blue-600" />
                                            </div>
                                            <div className="w-0.5 flex-1 bg-gray-200 mt-2" />
                                        </div>
                                        <div className="pb-6">
                                            <p className="text-sm font-medium text-gray-900">Account Created</p>
                                            <p className="text-xs text-gray-500 mt-0.5">User registered on the platform</p>
                                            <p className="text-xs text-gray-400 mt-1">{formatDate(selectedUser.createdAt)}</p>
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
                                                {selectedUser.emailVerified ? 'Email address verified' : 'Email verification pending'}
                                            </p>
                                            <span className={cn(
                                                "inline-flex items-center gap-1 text-xs mt-1 px-2 py-0.5 rounded",
                                                selectedUser.emailVerified 
                                                    ? "bg-green-100 text-green-700" 
                                                    : "bg-amber-100 text-amber-700"
                                            )}>
                                                {selectedUser.emailVerified ? 'Completed' : 'Pending'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Phone Verification */}
                                    {selectedUser.phone && (
                                        <div className="flex gap-3">
                                            <div className="flex flex-col items-center">
                                                <div className={cn(
                                                    "w-8 h-8 rounded-full flex items-center justify-center",
                                                    selectedUser.phoneVerified ? "bg-green-100" : "bg-gray-100"
                                                )}>
                                                    <Phone size={14} className={selectedUser.phoneVerified ? "text-green-600" : "text-gray-400"} />
                                                </div>
                                                <div className="w-0.5 flex-1 bg-gray-200 mt-2" />
                                            </div>
                                            <div className="pb-6">
                                                <p className="text-sm font-medium text-gray-900">Phone Verification</p>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    {selectedUser.phoneVerified ? 'Phone number verified' : 'Phone verification pending'}
                                                </p>
                                                <span className={cn(
                                                    "inline-flex items-center gap-1 text-xs mt-1 px-2 py-0.5 rounded",
                                                    selectedUser.phoneVerified 
                                                        ? "bg-green-100 text-green-700" 
                                                        : "bg-amber-100 text-amber-700"
                                                )}>
                                                    {selectedUser.phoneVerified ? 'Completed' : 'Pending'}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* KYC Verification */}
                                    <div className="flex gap-3">
                                        <div className="flex flex-col items-center">
                                            <div className={cn(
                                                "w-8 h-8 rounded-full flex items-center justify-center",
                                                selectedUser.kycVerified ? "bg-green-100" : "bg-gray-100"
                                            )}>
                                                <Shield size={14} className={selectedUser.kycVerified ? "text-green-600" : "text-gray-400"} />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Identity Verification (Dojah)</p>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {selectedUser.kycVerified ? 'Identity verified via Dojah' : 'Awaiting Dojah verification'}
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
                                </div>
                            )}

                            {detailTab === 'notes' && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-semibold text-gray-900">Admin Notes</h3>
                                        <Button variant="outline" size="sm" leftIcon={<FileText size={14} />}>
                                            Add Note
                                        </Button>
                                    </div>

                                    {/* Notes List - Empty State for now */}
                                    <div className="border border-dashed border-gray-200 rounded-xl p-8 text-center">
                                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <FileText size={20} className="text-gray-400" />
                                        </div>
                                        <h4 className="text-sm font-medium text-gray-900 mb-1">No notes yet</h4>
                                        <p className="text-xs text-gray-500 mb-4">Add notes about this user for your team</p>
                                        <Button variant="outline" size="sm" leftIcon={<FileText size={14} />}>
                                            Add First Note
                                        </Button>
                                    </div>

                                    {/* Note Input */}
                                    <div className="mt-6 pt-6 border-t border-gray-100">
                                        <label className="text-sm font-medium text-gray-900 mb-2 block">Quick Note</label>
                                        <textarea 
                                            placeholder="Add a note about this user..."
                                            className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none resize-none"
                                            rows={3}
                                        />
                                        <div className="flex justify-end mt-2">
                                            <Button variant="primary" size="sm">
                                                Save Note
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-200 h-full min-h-[500px] flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <UserCheck size={28} className="text-gray-400" />
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
