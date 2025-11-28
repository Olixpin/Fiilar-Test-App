import React, { useState } from 'react';
import { User } from '@fiilar/types';
import { Search, Clock, CheckCircle, Users, UserCheck, FileText, X, Check, Eye, CheckSquare, Square } from 'lucide-react';
import { Button } from '@fiilar/ui';

interface AdminKYCProps {
    unverifiedHosts: User[];
    users: User[];
    handleVerifyUser: (userId: string, approve: boolean) => void;
    handleUpdateBadgeStatus: (userId: string, badgeStatus: 'standard' | 'super_host' | 'premium') => void;
}

export const AdminKYC: React.FC<AdminKYCProps> = ({ unverifiedHosts, users, handleVerifyUser, handleUpdateBadgeStatus }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
    const [viewingDocument, setViewingDocument] = useState<{ url: string; userName: string } | null>(null);

    // Filter users based on search
    const filteredHosts = unverifiedHosts.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Bulk selection handlers
    const toggleSelectAll = () => {
        if (selectedUsers.size === filteredHosts.length) {
            setSelectedUsers(new Set());
        } else {
            setSelectedUsers(new Set(filteredHosts.map(u => u.id)));
        }
    };

    const toggleSelectUser = (userId: string) => {
        const newSelected = new Set(selectedUsers);
        if (newSelected.has(userId)) {
            newSelected.delete(userId);
        } else {
            newSelected.add(userId);
        }
        setSelectedUsers(newSelected);
    };

    // Bulk actions
    const handleBulkApprove = () => {
        selectedUsers.forEach(userId => handleVerifyUser(userId, true));
        setSelectedUsers(new Set());
    };

    const handleBulkReject = () => {
        selectedUsers.forEach(userId => handleVerifyUser(userId, false));
        setSelectedUsers(new Set());
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* Header */}
            <div className="glass-card p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">KYC Verification</h2>
                        <p className="text-sm text-gray-500 mt-1">Review and approve host identity documents</p>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:flex-none sm:w-64">
                            <input
                                type="text"
                                placeholder="Search users..."
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="glass-card p-5 hover:shadow-lg transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending</h3>
                        <div className="bg-orange-100 p-2 rounded-lg text-orange-700 group-hover:scale-110 transition-transform">
                            <Clock size={18} />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{unverifiedHosts.length}</p>
                    <p className="text-xs text-gray-500 mt-1">Awaiting review</p>
                </div>
                <div className="glass-card p-5 hover:shadow-lg transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Verified</h3>
                        <div className="bg-green-100 p-2 rounded-lg text-green-700 group-hover:scale-110 transition-transform">
                            <CheckCircle size={18} />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{users.filter(u => u.kycVerified).length}</p>
                    <p className="text-xs text-gray-500 mt-1">Total approved</p>
                </div>
                <div className="glass-card p-5 hover:shadow-lg transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Users</h3>
                        <div className="bg-blue-100 p-2 rounded-lg text-blue-700 group-hover:scale-110 transition-transform">
                            <Users size={18} />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{users.length}</p>
                    <p className="text-xs text-gray-500 mt-1">Platform users</p>
                </div>
            </div>

            {/* Bulk Actions Bar */}
            {selectedUsers.size > 0 && (
                <div className="glass-card p-4 border-2 border-brand-500 animate-in slide-in-from-top">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <CheckSquare size={20} className="text-brand-600" />
                            <span className="font-medium text-gray-900">{selectedUsers.size} user{selectedUsers.size > 1 ? 's' : ''} selected</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                size="sm"
                                variant="danger"
                                onClick={handleBulkReject}
                                leftIcon={<X size={14} />}
                            >
                                Reject All
                            </Button>
                            <Button
                                size="sm"
                                variant="primary"
                                className="bg-green-600 hover:bg-green-700 focus:ring-green-500"
                                onClick={handleBulkApprove}
                                leftIcon={<Check size={14} />}
                            >
                                Approve All
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* KYC List */}
            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left">
                                    <button
                                        onClick={toggleSelectAll}
                                        className="hover:scale-110 transition-transform"
                                    >
                                        {selectedUsers.size === filteredHosts.length && filteredHosts.length > 0 ? (
                                            <CheckSquare size={18} className="text-brand-600" />
                                        ) : (
                                            <Square size={18} className="text-gray-400" />
                                        )}
                                    </button>
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Document</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Liveness</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Badge</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredHosts.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
                                                <UserCheck size={28} className="text-gray-400" />
                                            </div>
                                            <p className="text-gray-900 font-semibold text-lg">No pending KYC requests</p>
                                            <p className="text-sm text-gray-500 mt-2">All users are verified ✓</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredHosts.map(u => (
                                    <tr key={u.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => toggleSelectUser(u.id)}
                                                className="hover:scale-110 transition-transform"
                                            >
                                                {selectedUsers.has(u.id) ? (
                                                    <CheckSquare size={18} className="text-brand-600" />
                                                ) : (
                                                    <Square size={18} className="text-gray-400" />
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-brand-600/30">
                                                    {u.name.charAt(0)}
                                                </div>
                                                <div className="font-medium text-gray-900">{u.name}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{u.email}</td>
                                        <td className="px-6 py-4">
                                            {u.identityDocument ? (
                                                <button
                                                    onClick={() => setViewingDocument({ url: u.identityDocument!, userName: u.name })}
                                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                                                >
                                                    <Eye size={14} />
                                                    View Document
                                                </button>
                                            ) : (
                                                <span className="text-sm text-gray-400 italic">Not uploaded</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {u.livenessVerified ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                                                    <CheckCircle size={12} /> Verified
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                                                    <Clock size={12} /> Pending
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={u.badgeStatus || 'standard'}
                                                onChange={(e) => handleUpdateBadgeStatus(u.id, e.target.value as any)}
                                                className="text-sm border-2 border-gray-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none bg-white hover:border-gray-300 transition-colors"
                                            >
                                                <option value="standard">⚪ Standard</option>
                                                <option value="super_host">🟡 Super Host</option>
                                                <option value="premium">🟣 Premium</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="danger"
                                                    onClick={() => handleVerifyUser(u.id, false)}
                                                    leftIcon={<X size={14} />}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    Reject
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="primary"
                                                    className="bg-green-600 hover:bg-green-700 focus:ring-green-500 opacity-0 group-hover:opacity-100 transition-opacity"
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
            </div>

            {/* Document Viewer Modal */}
            {viewingDocument && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-in zoom-in-95">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <div>
                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                    <FileText size={20} className="text-brand-600" />
                                    Identity Document
                                </h3>
                                <p className="text-sm text-gray-500 mt-0.5">{viewingDocument.userName}</p>
                            </div>
                            <button
                                onClick={() => setViewingDocument(null)}
                                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                            >
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                            <img
                                src={viewingDocument.url}
                                alt="Identity Document"
                                className="w-full h-auto rounded-lg shadow-lg"
                            />
                        </div>
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setViewingDocument(null)}>Close</Button>
                            <a
                                href={viewingDocument.url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition-colors"
                            >
                                <Eye size={16} />
                                Open in New Tab
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
