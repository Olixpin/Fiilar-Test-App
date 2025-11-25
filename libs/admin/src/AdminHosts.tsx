import React from 'react';
import { User, Listing } from '@fiilar/types';
import { Users, Sparkles, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@fiilar/ui';

interface AdminHostsProps {
    users: User[];
    listings: Listing[];
    handleUpdateBadgeStatus: (userId: string, badgeStatus: 'standard' | 'super_host' | 'premium') => void;
}

export const AdminHosts: React.FC<AdminHostsProps> = ({ users, listings, handleUpdateBadgeStatus }) => {
    return (
        <div className="space-y-6 animate-in fade-in">
            <Card>
                <CardHeader className="p-4 border-b-0">
                    <CardTitle className="text-xl">Host Badge Management</CardTitle>
                    <CardDescription>Assign Super Host and Premium badges to hosts</CardDescription>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Hosts</h3>
                            <div className="bg-blue-100 p-2 rounded-lg text-blue-700"><Users size={18} /></div>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.isHost).length}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Super Hosts</h3>
                            <div className="bg-amber-100 p-2 rounded-lg text-amber-700"><Sparkles size={18} /></div>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.badgeStatus === 'super_host').length}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Premium</h3>
                            <div className="bg-purple-100 p-2 rounded-lg text-purple-700"><ShieldCheck size={18} /></div>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.badgeStatus === 'premium').length}</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Host</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Listings</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Badge Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {users.filter(u => u.isHost).map(u => (
                                <tr key={u.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 font-bold">
                                                {u.name.charAt(0)}
                                            </div>
                                            <div className="font-medium text-gray-900">{u.name}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{u.email}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{listings.filter(l => l.hostId === u.id).length}</td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={u.badgeStatus || 'standard'}
                                            onChange={(e) => handleUpdateBadgeStatus(u.id, e.target.value as any)}
                                            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-brand-500 outline-none"
                                            aria-label={`Badge status for ${u.name}`}
                                        >
                                            <option value="standard">⚪ Standard</option>
                                            <option value="super_host">🟡 Super Host</option>
                                            <option value="premium">🟣 Premium</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};
