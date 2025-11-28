import React, { useState, useMemo } from 'react';
import { User, Listing } from '@fiilar/types';
import { Users, Sparkles, ShieldCheck, Search, Home, TrendingUp, Star, Filter, ChevronDown } from 'lucide-react';

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
        <div className="space-y-6 animate-in fade-in">
            {/* Header */}
            <div className="glass-card p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Host Management</h2>
                        <p className="text-sm text-gray-500 mt-1">Manage host badges and monitor performance</p>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:flex-none sm:w-64">
                            <input
                                type="text"
                                placeholder="Search hosts..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                            />
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="glass-card p-5 hover:shadow-lg transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Hosts</h3>
                        <div className="bg-blue-100 p-2 rounded-lg text-blue-700 group-hover:scale-110 transition-transform">
                            <Users size={18} />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                    <p className="text-xs text-gray-500 mt-1">{stats.verified} verified</p>
                </div>
                <div className="glass-card p-5 hover:shadow-lg transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Super Hosts</h3>
                        <div className="bg-amber-100 p-2 rounded-lg text-amber-700 group-hover:scale-110 transition-transform">
                            <Sparkles size={18} />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stats.superHost}</p>
                    <p className="text-xs text-gray-500 mt-1">{((stats.superHost / stats.total) * 100).toFixed(1)}% of total</p>
                </div>
                <div className="glass-card p-5 hover:shadow-lg transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Premium</h3>
                        <div className="bg-purple-100 p-2 rounded-lg text-purple-700 group-hover:scale-110 transition-transform">
                            <ShieldCheck size={18} />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stats.premium}</p>
                    <p className="text-xs text-gray-500 mt-1">{((stats.premium / stats.total) * 100).toFixed(1)}% of total</p>
                </div>
                <div className="glass-card p-5 hover:shadow-lg transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Avg Listings</h3>
                        <div className="bg-green-100 p-2 rounded-lg text-green-700 group-hover:scale-110 transition-transform">
                            <Home size={18} />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{(listings.length / Math.max(stats.total, 1)).toFixed(1)}</p>
                    <p className="text-xs text-gray-500 mt-1">per host</p>
                </div>
            </div>

            {/* Filters */}
            <div className="glass-card p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="flex items-center gap-2">
                        <Filter size={16} className="text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Filters:</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <button
                            onClick={() => setBadgeFilter('all')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${badgeFilter === 'all' ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30' : 'bg-white/80 text-gray-700 hover:bg-white'}`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setBadgeFilter('standard')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${badgeFilter === 'standard' ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30' : 'bg-white/80 text-gray-700 hover:bg-white'}`}
                        >
                            ⚪ Standard
                        </button>
                        <button
                            onClick={() => setBadgeFilter('super_host')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${badgeFilter === 'super_host' ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30' : 'bg-white/80 text-gray-700 hover:bg-white'}`}
                        >
                            🟡 Super Host
                        </button>
                        <button
                            onClick={() => setBadgeFilter('premium')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${badgeFilter === 'premium' ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30' : 'bg-white/80 text-gray-700 hover:bg-white'}`}
                        >
                            🟣 Premium
                        </button>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        <span className="text-sm text-gray-600">Sort by:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="text-sm border-2 border-gray-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none bg-white"
                        >
                            <option value="name">Name</option>
                            <option value="listings">Listings Count</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Hosts Table */}
            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Host</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Listings</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Verified</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Badge Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredHosts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
                                                <Users size={28} className="text-gray-400" />
                                            </div>
                                            <p className="text-gray-900 font-semibold text-lg">No hosts found</p>
                                            <p className="text-sm text-gray-500 mt-2">Try adjusting your filters</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredHosts.map(host => {
                                    const hostListings = listings.filter(l => l.hostId === host.id);
                                    return (
                                        <tr key={host.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-brand-600/30">
                                                        {host.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900">{host.name}</div>
                                                        <div className="text-xs text-gray-500">ID: {host.id.slice(0, 8)}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{host.email}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Home size={14} className="text-gray-400" />
                                                    <span className="text-sm font-medium text-gray-900">{hostListings.length}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {host.kycVerified ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                                                        <Star size={12} /> Verified
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                                                        Pending
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <select
                                                    value={host.badgeStatus || 'standard'}
                                                    onChange={(e) => handleUpdateBadgeStatus(host.id, e.target.value as any)}
                                                    className="text-sm border-2 border-gray-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none bg-white hover:border-gray-300 transition-colors"
                                                >
                                                    <option value="standard">⚪ Standard</option>
                                                    <option value="super_host">🟡 Super Host</option>
                                                    <option value="premium">🟣 Premium</option>
                                                </select>
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
