import React, { useState } from 'react';
import { Booking, Listing } from '@fiilar/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Badge, ConfirmDialog } from '@fiilar/ui';
import { AlertTriangle, CheckCircle, XCircle, MessageSquare, Clock, Shield, Gavel, User, DollarSign, Calendar, ArrowRight, Filter, Search } from 'lucide-react';
import { escrowService } from '@fiilar/escrow';
import { updateBooking } from '@fiilar/storage';
import { cn } from '@fiilar/utils';

interface DisputeCenterProps {
    bookings: Booking[];
    listings: Listing[];
    refreshData: () => void;
}

type DisputeStatus = 'OPEN' | 'IN_REVIEW' | 'RESOLVED';

const DisputeCenter: React.FC<DisputeCenterProps> = ({ bookings, listings, refreshData }) => {
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [adminNote, setAdminNote] = useState('');
    const [activeTab, setActiveTab] = useState<DisputeStatus>('OPEN');

    const [resolveConfirmation, setResolveConfirmation] = useState<{ isOpen: boolean, decision: 'REFUND_GUEST' | 'RELEASE_TO_HOST' | null }>({
        isOpen: false,
        decision: null
    });

    // Filter bookings that have a dispute status
    const disputedBookings = bookings.filter(b => b.disputeStatus && b.disputeStatus !== 'NONE');

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OPEN': return 'bg-red-100 text-red-700 border-red-200';
            case 'IN_REVIEW': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'RESOLVED': return 'bg-green-100 text-green-700 border-green-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const handleResolveClick = (decision: 'REFUND_GUEST' | 'RELEASE_TO_HOST') => {
        setResolveConfirmation({ isOpen: true, decision });
    };

    const confirmResolve = async () => {
        const decision = resolveConfirmation.decision;
        if (!selectedBooking || !decision) return;

        await escrowService.resolveDispute(selectedBooking, decision, adminNote);

        // Update local booking state
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

    const renderKanbanColumn = (status: DisputeStatus, title: string, icon: React.ReactNode) => {
        const items = disputedBookings.filter(b => {
            if (status === 'RESOLVED') return b.disputeStatus === 'RESOLVED';
            // For simplicity in this demo, we'll treat 'OPEN' as the default for non-resolved
            return b.disputeStatus === 'OPEN' || (status === 'OPEN' && !b.disputeStatus);
        });

        return (
            <div className="flex-1 min-w-[300px] bg-gray-50/50 rounded-2xl p-4 border border-gray-200/50 flex flex-col h-full">
                <div className="flex items-center justify-between mb-4 px-2">
                    <div className="flex items-center gap-2">
                        {icon}
                        <h3 className="font-bold text-gray-700">{title}</h3>
                    </div>
                    <span className="bg-white px-2.5 py-0.5 rounded-full text-xs font-bold text-gray-500 shadow-sm border border-gray-100">
                        {items.length}
                    </span>
                </div>

                <div className="space-y-3 overflow-y-auto pr-1 custom-scrollbar flex-1">
                    {items.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                            <p className="text-sm">No disputes</p>
                        </div>
                    ) : (
                        items.map(booking => (
                            <div
                                key={booking.id}
                                onClick={() => setSelectedBooking(booking)}
                                className={cn(
                                    "bg-white p-4 rounded-xl border border-gray-100 shadow-sm cursor-pointer transition-all hover:shadow-md hover:border-brand-200 group relative overflow-hidden",
                                    selectedBooking?.id === booking.id ? "ring-2 ring-brand-500 border-transparent" : ""
                                )}
                            >
                                {selectedBooking?.id === booking.id && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-500" />
                                )}

                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-mono text-[10px] text-gray-400 uppercase tracking-wider">#{booking.id.slice(-6)}</span>
                                    <span className="text-[10px] font-bold text-gray-500 flex items-center gap-1">
                                        <Clock size={10} /> 2h ago
                                    </span>
                                </div>

                                <h4 className="font-bold text-gray-900 text-sm mb-1 line-clamp-1 group-hover:text-brand-600 transition-colors">
                                    {listings.find(l => l.id === booking.listingId)?.title || 'Unknown Listing'}
                                </h4>

                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                                            <User size={12} />
                                        </div>
                                        <span className="text-xs text-gray-600">Guest</span>
                                    </div>
                                    <span className="font-bold text-gray-900 text-sm">${booking.totalPrice}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between shrink-0">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Gavel className="text-brand-600" />
                        Dispute Resolution Center
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">Manage and resolve booking disputes efficiently</p>
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search disputes..."
                            className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 w-64"
                        />
                    </div>
                    <Button variant="outline" leftIcon={<Filter size={16} />}>Filter</Button>
                </div>
            </div>

            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Kanban Board */}
                <div className="lg:col-span-1 flex flex-col gap-4 h-full overflow-hidden">
                    {/* Simplified for this view - just showing Open disputes list style but enhanced */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col h-full overflow-hidden">
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <AlertTriangle size={16} className="text-red-500" />
                                Active Disputes
                            </h3>
                            <Badge variant="secondary" className="bg-red-100 text-red-700 border-red-200">{disputedBookings.length}</Badge>
                        </div>
                        <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                            {disputedBookings.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                                    <Shield size={48} className="mb-4 opacity-20" />
                                    <p className="text-sm">No active disputes found.</p>
                                    <p className="text-xs mt-1 opacity-60">Great job keeping the platform safe!</p>
                                </div>
                            ) : (
                                disputedBookings.map(booking => (
                                    <div
                                        key={booking.id}
                                        onClick={() => setSelectedBooking(booking)}
                                        className={cn(
                                            "p-4 rounded-xl border transition-all cursor-pointer group relative overflow-hidden",
                                            selectedBooking?.id === booking.id
                                                ? "bg-brand-50 border-brand-200 shadow-sm ring-1 ring-brand-200"
                                                : "bg-white border-gray-100 hover:border-brand-200 hover:shadow-md"
                                        )}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <Badge variant="outline" className="bg-white text-[10px] font-mono text-gray-500">
                                                #{booking.id.slice(-6)}
                                            </Badge>
                                            <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                                                ACTION REQ
                                            </span>
                                        </div>

                                        <h4 className="font-bold text-gray-900 text-sm mb-1 line-clamp-1">
                                            {listings.find(l => l.id === booking.listingId)?.title || 'Unknown Listing'}
                                        </h4>

                                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
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
                </div>

                {/* Dispute Detail / Resolution Area */}
                <div className="lg:col-span-2 h-full overflow-hidden">
                    {selectedBooking ? (
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm h-full flex flex-col overflow-hidden animate-in slide-in-from-right-4 duration-300">
                            {/* Detail Header */}
                            <div className="p-6 border-b border-gray-100 bg-gray-50/30 flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h2 className="text-xl font-bold text-gray-900">Dispute #{selectedBooking.id.slice(-6)}</h2>
                                        <Badge variant="outline" className={getStatusColor(selectedBooking.disputeStatus || 'OPEN')}>
                                            {selectedBooking.disputeStatus || 'OPEN'}
                                        </Badge>
                                    </div>
                                    <p className="text-gray-500 text-sm flex items-center gap-2">
                                        Listing: <span className="font-medium text-gray-900">{listings.find(l => l.id === selectedBooking.listingId)?.title}</span>
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">Disputed Amount</p>
                                    <p className="text-2xl font-bold text-gray-900">${selectedBooking.totalPrice}</p>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                                {/* Evidence Section */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                            <Shield size={14} /> System Evidence
                                        </h4>

                                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
                                            <div className="flex justify-between items-center p-2 bg-white rounded-lg border border-gray-100">
                                                <span className="text-sm text-gray-600">Handshake Status</span>
                                                {selectedBooking.handshakeStatus === 'VERIFIED' ? (
                                                    <Badge className="bg-green-100 text-green-700 border-green-200 flex items-center gap-1">
                                                        <CheckCircle size={12} /> Verified
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-red-100 text-red-700 border-red-200 flex items-center gap-1">
                                                        <XCircle size={12} /> Not Verified
                                                    </Badge>
                                                )}
                                            </div>

                                            <div className="flex justify-between items-center p-2 bg-white rounded-lg border border-gray-100">
                                                <span className="text-sm text-gray-600">Verification Time</span>
                                                <span className="text-sm font-mono text-gray-900">
                                                    {selectedBooking.verifiedAt ? new Date(selectedBooking.verifiedAt).toLocaleString() : 'N/A'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className={cn(
                                            "p-4 rounded-xl border text-sm leading-relaxed",
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
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                            <MessageSquare size={14} /> Communication
                                        </h4>
                                        <div className="bg-gray-50 rounded-xl border border-gray-100 h-48 flex items-center justify-center text-gray-400 text-sm">
                                            Chat logs would appear here
                                        </div>
                                    </div>
                                </div>

                                {/* Decision Section */}
                                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <Gavel size={16} /> Admin Decision
                                    </h4>

                                    <textarea
                                        className="w-full border border-gray-300 rounded-xl p-4 text-sm h-32 focus:ring-2 focus:ring-brand-500 outline-none mb-6 resize-none shadow-sm"
                                        placeholder="Enter your reasoning for this decision (visible to internal team)..."
                                        value={adminNote}
                                        onChange={(e) => setAdminNote(e.target.value)}
                                    />

                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => handleResolveClick('REFUND_GUEST')}
                                            className="group flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-red-200 bg-white hover:bg-red-50 hover:border-red-300 transition-all"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <User size={20} />
                                            </div>
                                            <div className="text-center">
                                                <span className="block font-bold text-red-700">Rule for Guest</span>
                                                <span className="text-xs text-red-600/70">Full Refund</span>
                                            </div>
                                        </button>

                                        <button
                                            onClick={() => handleResolveClick('RELEASE_TO_HOST')}
                                            className="group flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-green-200 bg-white hover:bg-green-50 hover:border-green-300 transition-all"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <CheckCircle size={20} />
                                            </div>
                                            <div className="text-center">
                                                <span className="block font-bold text-green-700">Rule for Host</span>
                                                <span className="text-xs text-green-600/70">Release Funds</span>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 p-12">
                            <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center mb-6">
                                <Gavel size={32} className="text-gray-300" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">No Dispute Selected</h3>
                            <p className="text-center max-w-sm text-gray-500">
                                Select a dispute from the list to review evidence, check handshake status, and make a final ruling.
                            </p>
                        </div>
                    )}
                </div>
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
        </div >
    );
};

export default DisputeCenter;
