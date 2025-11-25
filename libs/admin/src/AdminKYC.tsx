import React from 'react';
import { User } from '@fiilar/types';
import { Search, Clock, CheckCircle, Users, UserCheck, FileText, X, Check } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription } from '@fiilar/ui';

interface AdminKYCProps {
    unverifiedHosts: User[];
    users: User[];
    handleVerifyUser: (userId: string, approve: boolean) => void;
    handleUpdateBadgeStatus: (userId: string, badgeStatus: 'standard' | 'super_host' | 'premium') => void;
}

export const AdminKYC: React.FC<AdminKYCProps> = ({ unverifiedHosts, users, handleVerifyUser, handleUpdateBadgeStatus }) => {
    return (
        <div className="space-y-6 animate-in fade-in">
            {/* Header */}
            <Card>
                <CardHeader className="p-4 border-b-0">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-xl">KYC Verification</CardTitle>
                            <CardDescription>Review and approve host identity documents</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                                    aria-label="Search users"
                                />
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            </div>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending</h3>
                            <div className="bg-orange-100 p-2 rounded-lg text-orange-700">
                                <Clock size={18} />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{unverifiedHosts.length}</p>
                        <p className="text-xs text-gray-500 mt-1">Awaiting review</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Verified</h3>
                            <div className="bg-green-100 p-2 rounded-lg text-green-700">
                                <CheckCircle size={18} />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.kycVerified).length}</p>
                        <p className="text-xs text-gray-500 mt-1">Total approved</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Users</h3>
                            <div className="bg-blue-100 p-2 rounded-lg text-blue-700">
                                <Users size={18} />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                        <p className="text-xs text-gray-500 mt-1">Platform users</p>
                    </CardContent>
                </Card>
            </div>

            {/* KYC List */}
            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">User</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Document</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Liveness</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Badge</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Submitted</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {unverifiedHosts.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                                <UserCheck size={24} className="text-gray-400" />
                                            </div>
                                            <p className="text-gray-500 font-medium">No pending KYC requests</p>
                                            <p className="text-sm text-gray-400 mt-1">All users are verified</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                unverifiedHosts.map(u => (
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
                                        <td className="px-6 py-4">
                                            {u.identityDocument ? (
                                                <a href={u.identityDocument} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700">
                                                    <FileText size={14} /> View Document
                                                </a>
                                            ) : (
                                                <span className="text-sm text-gray-400">Not uploaded</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {u.livenessVerified ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                                                    <CheckCircle size={12} /> Verified
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-bold">
                                                    Pending
                                                </span>
                                            )}
                                        </td>
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
                                        <td className="px-6 py-4 text-sm text-gray-600">Just now</td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="danger"
                                                    onClick={() => handleVerifyUser(u.id, false)}
                                                    leftIcon={<X size={14} />}
                                                >
                                                    Reject
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="primary"
                                                    className="bg-green-600 hover:bg-green-700 focus:ring-green-500"
                                                    onClick={() => handleVerifyUser(u.id, true)}
                                                    leftIcon={<Check size={14} />}
                                                >
                                                    Approve
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};
