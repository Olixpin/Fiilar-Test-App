import React, { useState, useEffect } from 'react';
import { Booking, Listing } from '@fiilar/types';
import { Button, Badge, ConfirmDialog } from '@fiilar/ui';
import { AlertTriangle, CheckCircle, XCircle, MessageSquare, Clock, Shield, Gavel, User, DollarSign, Calendar, Search, X } from 'lucide-react';
import { escrowService } from '@fiilar/escrow';
import { updateBooking } from '@fiilar/storage';
import { cn } from '@fiilar/utils';

interface DisputeCenterProps {
    bookings: Booking[];
    listings: Listing[];
    refreshData: () => void;
}

type TabType = 'open' | 'in_review' | 'resolved' | 'all';

const DisputeCenter: React.FC<DisputeCenterProps> = ({ bookings, listings, refreshData }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<TabType>('open');
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [adminNote, setAdminNote] = useState('');

    const [resolveConfirmation, setResolveConfirmation] = useState<{ isOpen: boolean, decision: 'REFUND_GUEST' | 'RELEASE_TO_HOST' | null }>({
        isOpen: false,
        decision: null
    });

    // Filter bookings that have a dispute status
    const disputedBookings = bookings.filter(b => b.disputeStatus && b.disputeStatus !== 'NONE');

    const getFilteredDisputes = () => {
        let filtered = disputedBookings;

        switch (activeTab) {
            case 'open':
                filtered = disputedBookings.filter(b => b.disputeStatus === 'OPEN');
                break;
            case 'in_review':
                filtered = disputedBookings.filter(b => b.disputeStatus === 'IN_REVIEW');
                break;
            case 'resolved':
                filtered = disputedBookings.filter(b => b.disputeStatus === 'RESOLVED');
                break;
        }

        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(b =>
                b.id.toLowerCase().includes(search) ||
                listings.find(l => l.id === b.listingId)?.title.toLowerCase().includes(search)
            );
        }

        return filtered;
    };

    const filteredDisputes = getFilteredDisputes();

    useEffect(() => {
        if (filteredDisputes.length > 0 && !selectedBooking) {
            setSelectedBooking(filteredDisputes[0]);
        }
    }, [filteredDisputes, selectedBooking]);

    const tabs = [
        { id: 'open' as TabType, label: 'Open', count: disputedBookings.filter(b => b.disputeStatus === 'OPEN').length },
        { id: 'in_review' as TabType, label: 'In Review', count: disputedBookings.filter(b => b.disputeStatus === 'IN_REVIEW').length },
        { id: 'resolved' as TabType, label: 'Resolved', count: disputedBookings.filter(b => b.disputeStatus === 'RESOLVED').length },
        { id: 'all' as TabType, label: 'All', count: disputedBookings.length },
    ];

    const getStatusBadge = (status: string | undefined) => {
        const config: Record<string, { bg: string; text: string }> = {
            'OPEN': { bg: 'bg-red-100', text: 'text-red-700' },
            'IN_REVIEW': { bg: 'bg-yellow-100', text: 'text-yellow-700' },
            'RESOLVED': { bg: 'bg-green-100', text: 'text-green-700' },
        };
        const c = config[status || 'OPEN'] || { bg: 'bg-gray-100', text: 'text-gray-700' };
        return (
            <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", c.bg, c.text)}>
                {status || 'OPEN'}
            </span>
        );
    };

    const handleResolveClick = (decision: 'REFUND_GUEST' | 'RELEASE_TO_HOST') => {
        setResolveConfirmation({ isOpen: true, decision });
    };

    const confirmResolve = async () => {
        const decision = resolveConfirmation.decision;
        if (!selectedBooking || !decision) return;

        await escrowService.resolveDispute(selectedBooking, decision, adminNote);

        const updatedBooking = {
            ...selectedBooking,
            disputeStatus: 'RESOLVED' as const,
            status: decision === 'REFUND_GUEST' ? 'Cancelled' as const : 'Completed' as const
        };
        updateBooking(updatedBooking);

        refreshData();
        setSelectedBooking(null);
        setAdminNote('');
        setResolveConfirmation({ isOpen: false, decision: null });
    };

    return (
        <div className="flex h-[calc(100vh-180px)] gap-6">
            {/* Left Panel - Dispute List */}
            <div className="w-96 flex-shrink-0 bg-white rounded-xl border border-gray-200 flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center gap-2 mb-1">
                        <Gavel size={20} className="text-brand-600" />
                        <h2 className="text-lg font-semibold text-gray-900">Dispute Center</h2>
                    </div>
                    <p className="text-xs text-gray-500">Manage and resolve booking disputes</p>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-gray-100">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search disputes..."
                            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Tabs */}
                <div className="px-4 border-b border-gray-100">
                    <div className="flex gap-1 overflow-x-auto">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => { setActiveTab(tab.id); setSelectedBooking(null); }}
                                className={cn(
                                    "px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-all",
                                    activeTab === tab.id
                                        ? "border-brand-500 text-brand-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700"
                                )}
                            >
                                {tab.label}
                                <span className={cn(
                                    "ml-1 px-1.5 py-0.5 rounded-full text-xs",
                                    activeTab === tab.id ? "bg-brand-100 text-brand-700" : "bg-gray-100 text-gray-600"
                                )}>
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Dispute List */}
                <div className="flex-1 overflow-y-auto">
                    {filteredDisputes.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Shield size={20} className="text-gray-400" />
                            </div>
                            <p className="text-sm text-gray-500">No disputes found</p>
                            <p className="text-xs text-gray-400 mt-1">Great job keeping the platform safe!</p>
                        </div>
                    ) : (
                        filteredDisputes.map((booking) => (
                            <div
                                key={booking.id}
                                onClick={() => setSelectedBooking(booking)}
                                className={cn(
                                    "p-4 border-b border-gray-100 cursor-pointer transition-all border-l-2",
                                    selectedBooking?.id === booking.id
                                        ? "bg-gray-100 border-l-gray-400"
                                        : "border-l-transparent hover:bg-gray-50"
                                )}
                            >
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <span className="font-mono text-xs text-gray-400">#{booking.id.slice(-6)}</span>
                                    {getStatusBadge(booking.disputeStatus)}
                                </div>
                                <h4 className="font-medium text-gray-900 text-sm mb-1 truncate">
                                    {listings.find(l => l.id === booking.listingId)?.title || 'Unknown Listing'}
                                </h4>
                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                    <div className="flex items-center gap-1">
                                        <DollarSign size={12} />
                                        <span className="font-medium text-gray-900">${booking.totalPrice}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Calendar size={12} />
                                        <span>{new Date(booking.date).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Right Panel - Dispute Detail */}
            <div className="flex-1 bg-white rounded-xl border border-gray-200 flex flex-col overflow-hidden">
                {selectedBooking ? (
                    <div className="flex-1 overflow-y-auto">
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h2 className="text-xl font-semibold text-gray-900">Dispute #{selectedBooking.id.slice(-6)}</h2>
                                        {getStatusBadge(selectedBooking.disputeStatus)}
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        {listings.find(l => l.id === selectedBooking.listingId)?.title || 'Unknown Listing'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedBooking(null)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    aria-label="Close"
                                >
                                    <X size={20} className="text-gray-400" />
                                </button>
                            </div>
                        </div>

                        {/* Amount */}
                        <div className="p-6 border-b border-gray-100 bg-gray-50">
                            <div className="text-center">
                                <p className="text-sm text-gray-500 mb-1">Disputed Amount</p>
                                <p className="text-4xl font-bold text-gray-900">${selectedBooking.totalPrice}</p>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Evidence Section */}
                            <div>
                                <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Shield size={16} /> System Evidence
                                </h4>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <span className="text-sm text-gray-600">Handshake Status</span>
                                        {selectedBooking.handshakeStatus === 'VERIFIED' ? (
                                            <Badge className="bg-green-100 text-green-700 flex items-center gap-1">
                                                <CheckCircle size={12} /> Verified
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-red-100 text-red-700 flex items-center gap-1">
                                                <XCircle size={12} /> Not Verified
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <span className="text-sm text-gray-600">Verification Time</span>
                                        <span className="text-sm font-mono text-gray-900">
                                            {selectedBooking.verifiedAt ? new Date(selectedBooking.verifiedAt).toLocaleString() : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* AI Analysis */}
                            <div className={cn(
                                "p-4 rounded-lg border text-sm",
                                selectedBooking.handshakeStatus === 'VERIFIED'
                                    ? "bg-blue-50 text-blue-800 border-blue-100"
                                    : "bg-amber-50 text-amber-800 border-amber-100"
                            )}>
                                <strong>AI Analysis:</strong>
                                {selectedBooking.handshakeStatus === 'VERIFIED'
                                    ? " The host successfully scanned the guest's code. This is strong evidence that the guest was granted entry. Refund requests based on 'No Access' should likely be denied."
                                    : " No handshake was recorded. The host has no system-proof of granting entry. If the guest claims they couldn't access the property, the claim is likely valid."
                                }
                            </div>

                            {/* Communication */}
                            <div>
                                <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <MessageSquare size={16} /> Communication Log
                                </h4>
                                <div className="bg-gray-50 rounded-lg border border-gray-200 h-32 flex items-center justify-center text-gray-400 text-sm">
                                    Chat logs would appear here
                                </div>
                            </div>

                            {/* Admin Decision */}
                            {selectedBooking.disputeStatus !== 'RESOLVED' && (
                                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                                    <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <Gavel size={16} /> Admin Decision
                                    </h4>

                                    <textarea
                                        className="w-full border border-gray-300 rounded-lg p-3 text-sm h-24 focus:ring-2 focus:ring-brand-500 outline-none mb-4 resize-none"
                                        placeholder="Enter your reasoning for this decision..."
                                        value={adminNote}
                                        onChange={(e) => setAdminNote(e.target.value)}
                                    />

                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => handleResolveClick('REFUND_GUEST')}
                                            className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-red-200 bg-white hover:bg-red-50 hover:border-red-300 transition-all"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                                                <User size={20} />
                                            </div>
                                            <div className="text-center">
                                                <span className="block font-semibold text-red-700 text-sm">Rule for Guest</span>
                                                <span className="text-xs text-red-600/70">Full Refund</span>
                                            </div>
                                        </button>

                                        <button
                                            onClick={() => handleResolveClick('RELEASE_TO_HOST')}
                                            className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-green-200 bg-white hover:bg-green-50 hover:border-green-300 transition-all"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                                <CheckCircle size={20} />
                                            </div>
                                            <div className="text-center">
                                                <span className="block font-semibold text-green-700 text-sm">Rule for Host</span>
                                                <span className="text-xs text-green-600/70">Release Funds</span>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Resolved State */}
                            {selectedBooking.disputeStatus === 'RESOLVED' && (
                                <div className="bg-green-50 rounded-xl p-6 border border-green-200 text-center">
                                    <CheckCircle size={32} className="text-green-600 mx-auto mb-3" />
                                    <h4 className="font-semibold text-green-800">Dispute Resolved</h4>
                                    <p className="text-sm text-green-600 mt-1">This dispute has been successfully resolved.</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <Gavel size={28} className="text-gray-300" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Dispute Selected</h3>
                        <p className="text-sm text-gray-500 text-center max-w-sm">
                            Select a dispute from the list to review evidence, check handshake status, and make a final ruling.
                        </p>
                    </div>
                )}
            </div>

            <ConfirmDialog
                isOpen={resolveConfirmation.isOpen}
                title={resolveConfirmation.decision === 'REFUND_GUEST' ? 'Refund Guest' : 'Release to Host'}
                message={`Are you sure you want to ${resolveConfirmation.decision === 'REFUND_GUEST' ? 'refund the guest' : 'release funds to host'}? This action is irreversible.`}
                confirmText={resolveConfirmation.decision === 'REFUND_GUEST' ? 'Refund Guest' : 'Release Funds'}
                variant={resolveConfirmation.decision === 'REFUND_GUEST' ? 'warning' : 'info'}
                onConfirm={confirmResolve}
                onCancel={() => setResolveConfirmation({ isOpen: false, decision: null })}
            />
        </div>
    );
};

export default DisputeCenter;
