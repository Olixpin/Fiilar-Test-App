import React, { useState } from 'react';
import { Booking, Listing } from '@fiilar/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button } from '@fiilar/ui';
import { AlertTriangle, CheckCircle, XCircle, MessageSquare, Clock, Shield } from 'lucide-react';
import { escrowService } from '../../../services/escrowService';
import { updateBooking } from '../../../services/storage';

interface DisputeCenterProps {
    bookings: Booking[];
    listings: Listing[];
    refreshData: () => void;
}

const DisputeCenter: React.FC<DisputeCenterProps> = ({ bookings, listings, refreshData }) => {
    const disputedBookings = bookings.filter(b => b.disputeStatus === 'OPEN');
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [adminNote, setAdminNote] = useState('');

    const handleResolve = async (decision: 'REFUND_GUEST' | 'RELEASE_TO_HOST') => {
        if (!selectedBooking) return;

        if (window.confirm(`Are you sure you want to ${decision === 'REFUND_GUEST' ? 'refund the guest' : 'release funds to host'}? This action is irreversible.`)) {
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
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Dispute List */}
                <div className="lg:col-span-1 space-y-4">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <AlertTriangle size={20} className="text-red-500" />
                        Active Disputes ({disputedBookings.length})
                    </h3>
                    {disputedBookings.length === 0 ? (
                        <Card className="p-6 text-center bg-gray-50 border-dashed">
                            <Shield size={32} className="mx-auto text-gray-300 mb-2" />
                            <p className="text-sm text-gray-500">No active disputes</p>
                        </Card>
                    ) : (
                        disputedBookings.map(booking => (
                            <Card
                                key={booking.id}
                                className={`cursor-pointer transition-all hover:shadow-md ${selectedBooking?.id === booking.id ? 'ring-2 ring-brand-500' : ''}`}
                                onClick={() => setSelectedBooking(booking)}
                            >
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-mono text-xs text-gray-500">{booking.id}</span>
                                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full">OPEN</span>
                                    </div>
                                    <h4 className="font-bold text-gray-900 mb-1">
                                        {listings.find(l => l.id === booking.listingId)?.title || 'Unknown Listing'}
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                        Amount: <span className="font-bold">${booking.totalPrice}</span>
                                    </p>
                                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                                        <Clock size={12} />
                                        Opened {new Date().toLocaleDateString()} {/* Mock date */}
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>

                {/* Dispute Detail / Resolution Area */}
                <div className="lg:col-span-2">
                    {selectedBooking ? (
                        <Card className="h-full">
                            <CardHeader className="border-b border-gray-100">
                                <CardTitle>Dispute Resolution</CardTitle>
                                <CardDescription>Review evidence and make a final decision</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                {/* Evidence Section */}
                                <div className="mb-8">
                                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Handshake Evidence</h4>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                            <p className="text-xs text-gray-500 mb-1">Handshake Status</p>
                                            <div className="flex items-center gap-2">
                                                {selectedBooking.handshakeStatus === 'VERIFIED' ? (
                                                    <>
                                                        <CheckCircle size={20} className="text-green-500" />
                                                        <span className="font-bold text-green-700">VERIFIED</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <XCircle size={20} className="text-red-500" />
                                                        <span className="font-bold text-red-700">NOT VERIFIED</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                            <p className="text-xs text-gray-500 mb-1">Verification Time</p>
                                            <p className="font-mono text-sm text-gray-900">
                                                {selectedBooking.verifiedAt ? new Date(selectedBooking.verifiedAt).toLocaleString() : 'N/A'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 p-4 bg-blue-50 text-blue-800 text-sm rounded-lg border border-blue-100">
                                        <strong>System Analysis:</strong>
                                        {selectedBooking.handshakeStatus === 'VERIFIED'
                                            ? " The host successfully scanned the guest's code. This is strong evidence that the guest was granted entry."
                                            : " No handshake was recorded. The host has no system-proof of granting entry."
                                        }
                                    </div>
                                </div>

                                {/* Decision Section */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Admin Decision</h4>

                                    <textarea
                                        className="w-full border border-gray-300 rounded-lg p-3 text-sm h-24 focus:ring-2 focus:ring-brand-500 outline-none"
                                        placeholder="Enter notes for this decision (visible to internal team)..."
                                        value={adminNote}
                                        onChange={(e) => setAdminNote(e.target.value)}
                                    />

                                    <div className="flex gap-4 pt-2">
                                        <Button
                                            variant="danger"
                                            className="flex-1"
                                            onClick={() => handleResolve('REFUND_GUEST')}
                                        >
                                            Rule for Guest (Refund)
                                        </Button>
                                        <Button
                                            variant="primary"
                                            className="flex-1 bg-green-600 hover:bg-green-700"
                                            onClick={() => handleResolve('RELEASE_TO_HOST')}
                                        >
                                            Rule for Host (Release Funds)
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl p-12">
                            <MessageSquare size={48} className="mb-4 opacity-20" />
                            <p>Select a dispute to review evidence</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DisputeCenter;
