import React, { useState, useMemo, useEffect } from 'react';
import { User, Listing } from '@fiilar/types';
import { Users, Sparkles, ShieldCheck, Search, Home, Star, Mail, Phone, MoreHorizontal, MapPin, Calendar, FileText, CheckCircle, Clock, MessageSquare } from 'lucide-react';
import { cn } from '@fiilar/utils';
import { Button, useToast } from '@fiilar/ui';

// Helper component for user avatars
const HostAvatar = ({ host, size = 'md' }: { host: User; size?: 'sm' | 'md' | 'lg' }) => {
    const sizeClasses = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-14 h-14 text-lg'
    };
    
    if (host.avatar) {
        return <img src={host.avatar} alt={host.name} className={cn("rounded-full object-cover", sizeClasses[size])} />;
    }
    
    // Badge-based gradient colors
    const gradientClass = host.badgeStatus === 'super_host' 
        ? "bg-gradient-to-br from-amber-400 to-amber-500" 
        : host.badgeStatus === 'premium' 
            ? "bg-gradient-to-br from-purple-400 to-purple-500" 
            : "bg-gradient-to-br from-gray-400 to-gray-500";
    
    return (
        <div className={cn(
            "rounded-full flex items-center justify-center text-white font-semibold",
            gradientClass,
            sizeClasses[size]
        )}>
            {host.name.charAt(0).toUpperCase()}
        </div>
    );
};

interface AdminHostsProps {
    users: User[];
    listings: Listing[];
    handleUpdateBadgeStatus: (userId: string, badgeStatus: 'standard' | 'super_host' | 'premium') => void;
}

type TabType = 'all' | 'super_host' | 'premium' | 'standard';

export const AdminHosts: React.FC<AdminHostsProps> = ({ users, listings, handleUpdateBadgeStatus }) => {
    const { showToast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<TabType>('all');
    const [selectedHost, setSelectedHost] = useState<User | null>(null);
    const [detailTab, setDetailTab] = useState('overview');

    const hosts = users.filter(u => u.isHost);

    // Wrapper to add toast notifications
    const handleBadgeUpdateWithToast = (userId: string, badgeStatus: 'standard' | 'super_host' | 'premium') => {
        const host = users.find(u => u.id === userId);
        handleUpdateBadgeStatus(userId, badgeStatus);
        const badgeLabel = badgeStatus === 'super_host' ? 'Super Host' : badgeStatus === 'premium' ? 'Premium' : 'Standard';
        showToast({ message: `${host?.name || 'Host'} badge updated to ${badgeLabel}`, type: 'success' });
    };

    // Filter hosts based on tab and search
    const filteredHosts = useMemo(() => {
        let filtered = hosts.filter(h => {
            const matchesSearch = h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                h.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesTab = activeTab === 'all' || h.badgeStatus === activeTab;
            return matchesSearch && matchesTab;
        });
        return filtered.sort((a, b) => a.name.localeCompare(b.name));
    }, [hosts, searchTerm, activeTab]);

    const stats = {
        total: hosts.length,
        superHost: hosts.filter(h => h.badgeStatus === 'super_host').length,
        premium: hosts.filter(h => h.badgeStatus === 'premium').length,
        standard: hosts.filter(h => !h.badgeStatus || h.badgeStatus === 'standard').length,
    };

    const tabs = [
        { id: 'all' as TabType, label: 'All Hosts', count: stats.total },
        { id: 'super_host' as TabType, label: 'Super Hosts', count: stats.superHost },
        { id: 'premium' as TabType, label: 'Premium', count: stats.premium },
        { id: 'standard' as TabType, label: 'Standard', count: stats.standard },
    ];

    const detailTabs = ['Overview', 'Listings', 'Reviews', 'Activity'];

    const getHostListings = (hostId: string) => listings.filter(l => l.hostId === hostId);

    return (
        <div className="flex gap-6 h-[calc(100vh-180px)] animate-in fade-in">
            {/* Left Panel - Host List */}
            <div className="w-[340px] flex-shrink-0 flex flex-col">
                {/* Tabs */}
                <div className="border-b border-gray-200 mb-4 flex-shrink-0">
                    <div className="flex gap-4 overflow-x-auto">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => { setActiveTab(tab.id); setSelectedHost(null); }}
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
                        placeholder="Search hosts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-200 focus:border-gray-300 outline-none transition-all"
                    />
                </div>

                {/* Host List */}
                <div className="space-y-2 flex-1 overflow-y-auto pr-1">
                    {filteredHosts.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Users size={20} className="text-gray-400" />
                            </div>
                            <p className="text-sm text-gray-500">No hosts found</p>
                        </div>
                    ) : (
                        filteredHosts.map((host) => {
                            const hostListings = getHostListings(host.id);
                            return (
                                <div
                                    key={host.id}
                                    onClick={() => setSelectedHost(host)}
                                    className={cn(
                                        "p-3 rounded-lg cursor-pointer transition-all border-l-2",
                                        selectedHost?.id === host.id
                                            ? "bg-gray-100 border-l-gray-400"
                                            : "border-l-transparent hover:bg-gray-50"
                                    )}
                                >
                                    <div className="flex items-start gap-3">
                                        <HostAvatar host={host} size="md" />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-gray-900 text-sm truncate">{host.name}</span>
                                                {host.badgeStatus === 'super_host' && <Sparkles size={12} className="text-amber-500" />}
                                                {host.badgeStatus === 'premium' && <ShieldCheck size={12} className="text-purple-500" />}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-0.5 truncate">{host.email}</div>
                                            <div className="flex items-center gap-3 mt-2">
                                                <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                                                    <Home size={10} /> {hostListings.length} listings
                                                </span>
                                                {host.kycVerified && (
                                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-green-100 text-green-700 text-[10px] font-medium">
                                                        <Star size={8} /> Verified
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

            {/* Right Panel - Host Details */}
            <div className="flex-1 min-w-0 overflow-y-auto">
                {selectedHost ? (
                    <div className="bg-white rounded-xl border border-gray-200">
                        {/* Host Header */}
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <HostAvatar host={selectedHost} size="lg" />
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-xl font-semibold text-gray-900">{selectedHost.name}</h2>
                                            {selectedHost.badgeStatus === 'super_host' && (
                                                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium flex items-center gap-1">
                                                    <Sparkles size={10} /> Super Host
                                                </span>
                                            )}
                                            {selectedHost.badgeStatus === 'premium' && (
                                                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium flex items-center gap-1">
                                                    <ShieldCheck size={10} /> Premium
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500">{selectedHost.email}</p>
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
                                    <div className="grid grid-cols-3 gap-4 mb-6">
                                        <div className="p-4 bg-gray-50 rounded-xl">
                                            <div className="text-2xl font-bold text-gray-900">{getHostListings(selectedHost.id).length}</div>
                                            <div className="text-xs text-gray-500 mt-1">Active Listings</div>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-xl">
                                            <div className="text-2xl font-bold text-gray-900">--</div>
                                            <div className="text-xs text-gray-500 mt-1">Avg. Rating</div>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-xl">
                                            <div className="text-2xl font-bold text-gray-900">--</div>
                                            <div className="text-xs text-gray-500 mt-1">Response Rate</div>
                                        </div>
                                    </div>

                                    {/* Host Info */}
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Host Information</h3>
                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-gray-500 border border-gray-200">
                                                <Mail size={14} />
                                            </div>
                                            <div>
                                                <div className="text-xs text-gray-400">Email</div>
                                                <div className="text-sm font-medium text-gray-900">{selectedHost.email}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-gray-500 border border-gray-200">
                                                <Phone size={14} />
                                            </div>
                                            <div>
                                                <div className="text-xs text-gray-400">Phone</div>
                                                <div className="text-sm font-medium text-gray-900">{selectedHost.phone || 'Not provided'}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-gray-500 border border-gray-200">
                                                <MapPin size={14} />
                                            </div>
                                            <div>
                                                <div className="text-xs text-gray-400">Location</div>
                                                <div className="text-sm font-medium text-gray-900">Not specified</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-gray-500 border border-gray-200">
                                                <Calendar size={14} />
                                            </div>
                                            <div>
                                                <div className="text-xs text-gray-400">Member Since</div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {selectedHost.createdAt 
                                                        ? new Date(selectedHost.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                                                        : 'N/A'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Badge Management */}
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Badge Management</h3>
                                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-medium text-gray-900">Current Badge</h4>
                                                <p className="text-sm text-gray-500 mt-0.5">Update host badge tier</p>
                                            </div>
                                            <select
                                                value={selectedHost.badgeStatus || 'standard'}
                                                onChange={(e) => handleBadgeUpdateWithToast(selectedHost.id, e.target.value as any)}
                                                className="text-sm border border-gray-200 rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
                                                title="Select badge status"
                                                aria-label="Select badge status"
                                            >
                                                <option value="standard">Standard Host</option>
                                                <option value="super_host">Super Host</option>
                                                <option value="premium">Premium Host</option>
                                            </select>
                                        </div>
                                    </div>
                                </>
                            )}

                            {detailTab === 'listings' && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-semibold text-gray-900">
                                            All Listings ({getHostListings(selectedHost.id).length})
                                        </h3>
                                    </div>

                                    {getHostListings(selectedHost.id).length === 0 ? (
                                        <div className="border border-dashed border-gray-200 rounded-xl p-8 text-center">
                                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                                <Home size={20} className="text-gray-400" />
                                            </div>
                                            <h4 className="text-sm font-medium text-gray-900 mb-1">No listings yet</h4>
                                            <p className="text-xs text-gray-500">This host hasn't created any listings</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {getHostListings(selectedHost.id).map((listing) => (
                                                <div key={listing.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                                    <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                                                        {listing.images?.[0] ? (
                                                            <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <Home size={20} className="text-gray-400" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-medium text-gray-900 truncate">{listing.title}</div>
                                                        <div className="text-sm text-gray-500 mt-0.5">${listing.price}/night</div>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <span className={cn(
                                                                "px-2 py-0.5 rounded text-xs font-medium",
                                                                listing.status === 'approved' ? "bg-green-100 text-green-700" :
                                                                listing.status === 'pending' ? "bg-amber-100 text-amber-700" :
                                                                "bg-gray-100 text-gray-600"
                                                            )}>
                                                                {listing.status}
                                                            </span>
                                                            {listing.location && (
                                                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                                                    <MapPin size={10} /> {listing.location}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {detailTab === 'reviews' && (
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-4">Host Reviews</h3>
                                    
                                    {/* Reviews Empty State */}
                                    <div className="border border-dashed border-gray-200 rounded-xl p-8 text-center">
                                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <Star size={20} className="text-gray-400" />
                                        </div>
                                        <h4 className="text-sm font-medium text-gray-900 mb-1">No reviews yet</h4>
                                        <p className="text-xs text-gray-500">Reviews from guests will appear here</p>
                                    </div>

                                    {/* Review Stats Placeholder */}
                                    <div className="mt-6 pt-6 border-t border-gray-100">
                                        <h4 className="text-sm font-medium text-gray-900 mb-4">Review Summary</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-3 bg-gray-50 rounded-lg">
                                                <p className="text-xs text-gray-500 mb-1">Total Reviews</p>
                                                <p className="text-lg font-semibold text-gray-900">0</p>
                                            </div>
                                            <div className="p-3 bg-gray-50 rounded-lg">
                                                <p className="text-xs text-gray-500 mb-1">Average Rating</p>
                                                <p className="text-lg font-semibold text-gray-900">--</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {detailTab === 'activity' && (
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-4">Host Activity Timeline</h3>
                                    
                                    {/* Account Created */}
                                    <div className="flex gap-3">
                                        <div className="flex flex-col items-center">
                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                <Users size={14} className="text-blue-600" />
                                            </div>
                                            <div className="w-0.5 flex-1 bg-gray-200 mt-2" />
                                        </div>
                                        <div className="pb-6">
                                            <p className="text-sm font-medium text-gray-900">Account Created</p>
                                            <p className="text-xs text-gray-500 mt-0.5">Host registered on the platform</p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {selectedHost.createdAt 
                                                    ? new Date(selectedHost.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
                                                    : 'N/A'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* KYC Verification */}
                                    <div className="flex gap-3">
                                        <div className="flex flex-col items-center">
                                            <div className={cn(
                                                "w-8 h-8 rounded-full flex items-center justify-center",
                                                selectedHost.kycVerified ? "bg-green-100" : "bg-gray-100"
                                            )}>
                                                <ShieldCheck size={14} className={selectedHost.kycVerified ? "text-green-600" : "text-gray-400"} />
                                            </div>
                                            <div className="w-0.5 flex-1 bg-gray-200 mt-2" />
                                        </div>
                                        <div className="pb-6">
                                            <p className="text-sm font-medium text-gray-900">Identity Verification</p>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {selectedHost.kycVerified ? 'Identity verified via Dojah' : 'Awaiting verification'}
                                            </p>
                                            <span className={cn(
                                                "inline-flex items-center gap-1 text-xs mt-1 px-2 py-0.5 rounded",
                                                selectedHost.kycVerified 
                                                    ? "bg-green-100 text-green-700" 
                                                    : "bg-amber-100 text-amber-700"
                                            )}>
                                                {selectedHost.kycVerified ? 'Verified' : 'Pending'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Became Host */}
                                    <div className="flex gap-3">
                                        <div className="flex flex-col items-center">
                                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                                <Home size={14} className="text-purple-600" />
                                            </div>
                                            <div className="w-0.5 flex-1 bg-gray-200 mt-2" />
                                        </div>
                                        <div className="pb-6">
                                            <p className="text-sm font-medium text-gray-900">Became Host</p>
                                            <p className="text-xs text-gray-500 mt-0.5">User started hosting on the platform</p>
                                            <span className="inline-flex items-center gap-1 text-xs mt-1 px-2 py-0.5 rounded bg-purple-100 text-purple-700">
                                                {getHostListings(selectedHost.id).length} listings
                                            </span>
                                        </div>
                                    </div>

                                    {/* Badge Status */}
                                    <div className="flex gap-3">
                                        <div className="flex flex-col items-center">
                                            <div className={cn(
                                                "w-8 h-8 rounded-full flex items-center justify-center",
                                                selectedHost.badgeStatus === 'super_host' ? "bg-amber-100" :
                                                selectedHost.badgeStatus === 'premium' ? "bg-purple-100" : "bg-gray-100"
                                            )}>
                                                {selectedHost.badgeStatus === 'super_host' ? (
                                                    <Sparkles size={14} className="text-amber-600" />
                                                ) : selectedHost.badgeStatus === 'premium' ? (
                                                    <ShieldCheck size={14} className="text-purple-600" />
                                                ) : (
                                                    <Star size={14} className="text-gray-400" />
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Current Badge Status</p>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {selectedHost.badgeStatus === 'super_host' ? 'Super Host badge awarded' :
                                                 selectedHost.badgeStatus === 'premium' ? 'Premium host status' : 'Standard host'}
                                            </p>
                                            <span className={cn(
                                                "inline-flex items-center gap-1 text-xs mt-1 px-2 py-0.5 rounded",
                                                selectedHost.badgeStatus === 'super_host' ? "bg-amber-100 text-amber-700" :
                                                selectedHost.badgeStatus === 'premium' ? "bg-purple-100 text-purple-700" :
                                                "bg-gray-100 text-gray-600"
                                            )}>
                                                {selectedHost.badgeStatus === 'super_host' ? 'Super Host' :
                                                 selectedHost.badgeStatus === 'premium' ? 'Premium' : 'Standard'}
                                            </span>
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
                                <Users size={28} className="text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">Select a Host</h3>
                            <p className="text-sm text-gray-500">Choose a host from the list to view their details</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
