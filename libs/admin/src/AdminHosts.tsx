import React, { useState, useMemo } from 'react';
import { User, Listing } from '@fiilar/types';
import { Users, Sparkles, ShieldCheck, Search, Home, Star, ChevronDown, MoreHorizontal } from 'lucide-react';
import { cn } from '@fiilar/utils';

interface AdminHostsProps {
    users: User[];
    listings: Listing[];
    handleUpdateBadgeStatus: (userId: string, badgeStatus: 'standard' | 'super_host' | 'premium') => void;
}

export const AdminHosts: React.FC<AdminHostsProps> = ({ users, listings, handleUpdateBadgeStatus }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [badgeFilter, setBadgeFilter] = useState<'all' | 'standard' | 'super_host' | 'premium'>('all');
    const [sortBy, setSortBy] = useState<'name' | 'listings' | 'earnings'>('name');

    const hosts = users.filter(u => u.isHost);

    // Filter and sort hosts
    const filteredHosts = useMemo(() => {
        let filtered = hosts.filter(h => {
            const matchesSearch = h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                h.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesBadge = badgeFilter === 'all' || h.badgeStatus === badgeFilter;
            return matchesSearch && matchesBadge;
        });

        // Sort
        filtered.sort((a, b) => {
            if (sortBy === 'name') return a.name.localeCompare(b.name);
            if (sortBy === 'listings') {
                const aListings = listings.filter(l => l.hostId === a.id).length;
                const bListings = listings.filter(l => l.hostId === b.id).length;
                return bListings - aListings;
            }
            return 0;
        });

        return filtered;
    }, [hosts, searchTerm, badgeFilter, sortBy, listings]);

    const stats = {
        total: hosts.length,
        superHost: hosts.filter(h => h.badgeStatus === 'super_host').length,
        premium: hosts.filter(h => h.badgeStatus === 'premium').length,
        verified: hosts.filter(h => h.kycVerified).length,
    };

    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            {/* Compact Header & Stats Bar */}
            <div className="glass-card p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Host Management</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Manage host badges and performance</p>
                </div>

                {/* Compact Stats Row */}
                <div className="flex items-center divide-x divide-gray-200 bg-gray-50/50 rounded-xl border border-gray-100 p-1">
                    <div className="px-4 py-1 flex items-center gap-3">
                        <div className="bg-blue-100 p-1.5 rounded-lg text-blue-700">
                            <Users size={14} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total</p>
                            <p className="text-sm font-bold text-gray-900">{stats.total}</p>
                        </div>
                    </div>
                    <div className="px-4 py-1 flex items-center gap-3">
                        <div className="bg-amber-100 p-1.5 rounded-lg text-amber-700">
                            <Sparkles size={14} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Super</p>
                            <p className="text-sm font-bold text-gray-900">{stats.superHost}</p>
                        </div>
                    </div>
                    <div className="px-4 py-1 flex items-center gap-3">
                        <div className="bg-purple-100 p-1.5 rounded-lg text-purple-700">
                            <ShieldCheck size={14} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Premium</p>
                            <p className="text-sm font-bold text-gray-900">{stats.premium}</p>
                        </div>
                    </div>
                    <div className="px-4 py-1 flex items-center gap-3">
                        <div className="bg-green-100 p-1.5 rounded-lg text-green-700">
                            <Home size={14} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Avg List</p>
                            <p className="text-sm font-bold text-gray-900">{(listings.length / Math.max(stats.total, 1)).toFixed(1)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search hosts by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none shadow-sm transition-all"
                    />
                </div>

                <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
                    {(['all', 'standard', 'super_host', 'premium'] as const).map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setBadgeFilter(filter)}
                            className={cn(
                                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                                badgeFilter === filter
                                    ? "bg-gray-900 text-white shadow-md"
                                    : "text-gray-600 hover:bg-gray-50"
                            )}
                        >
                            {filter === 'all' ? 'All' :
                                filter === 'standard' ? 'Standard' :
                                    filter === 'super_host' ? 'Super Host' : 'Premium'}
                        </button>
                    ))}
                </div>

                <div className="relative min-w-[140px]">
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none shadow-sm cursor-pointer"
                        aria-label="Sort hosts"
                    >
                        <option value="name">Sort by Name</option>
                        <option value="listings">Sort by Listings</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
            </div>

            {/* Hosts Table */}
            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Host Details</th>
                                <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Listings</th>
                                <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Badge Tier</th>
                                <th className="px-6 py-3 text-right text-[10px] font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredHosts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center opacity-50">
                                            <Users size={32} className="text-gray-400 mb-2" />
                                            <p className="text-gray-900 font-medium">No hosts found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredHosts.map(host => {
                                    const hostListings = listings.filter(l => l.hostId === host.id);
                                    return (
                                        <tr key={host.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold text-xs border border-gray-200">
                                                        {host.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900 text-sm">{host.name}</div>
                                                        <div className="text-xs text-gray-500">{host.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3">
                                                {host.kycVerified ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-[10px] font-bold border border-green-100">
                                                        <Star size={10} /> Verified
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-medium border border-gray-200">
                                                        Pending
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-3">
                                                <div className="flex items-center gap-1.5">
                                                    <div className="bg-gray-100 p-1 rounded text-gray-500">
                                                        <Home size={12} />
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-900">{hostListings.length}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3">
                                                <div className="relative inline-flex items-center">
                                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                                                        {host.badgeStatus === 'super_host' ? <Sparkles size={14} className="text-amber-500" /> :
                                                            host.badgeStatus === 'premium' ? <ShieldCheck size={14} className="text-purple-500" /> :
                                                                <Users size={14} className="text-gray-400" />}
                                                    </div>
                                                    <select
                                                        value={host.badgeStatus || 'standard'}
                                                        onChange={(e) => handleUpdateBadgeStatus(host.id, e.target.value as any)}
                                                        className={cn(
                                                            "appearance-none pl-9 pr-8 py-2 rounded-xl text-xs font-semibold border outline-none cursor-pointer transition-all",
                                                            host.badgeStatus === 'super_host' ? "bg-amber-50 text-amber-700 border-amber-200 hover:border-amber-300" :
                                                                host.badgeStatus === 'premium' ? "bg-purple-50 text-purple-700 border-purple-200 hover:border-purple-300" :
                                                                    "bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300"
                                                        )}
                                                        aria-label="Change badge status"
                                                    >
                                                        <option value="standard">Standard Host</option>
                                                        <option value="super_host">Super Host</option>
                                                        <option value="premium">Premium Host</option>
                                                    </select>
                                                    <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                                </div>
                                            </td>
                                            <td className="px-6 py-3 text-right">
                                                <button className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded transition-colors" aria-label="More actions">
                                                    <MoreHorizontal size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
