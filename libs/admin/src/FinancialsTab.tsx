import React, { useState } from 'react';
import { Listing, Booking, EscrowTransaction, PlatformFinancials } from '@fiilar/types';
import { DollarSign, TrendingUp, Clock, ArrowUpRight, Download, RefreshCw, ChevronDown, ChevronRight } from 'lucide-react';
import { triggerManualReleaseCheck } from '@fiilar/escrow';
import { useLocale, useToast } from '@fiilar/ui';

interface FinancialsTabProps {
    financials: PlatformFinancials | null;
    bookings: Booking[];
    transactions: EscrowTransaction[];
    listings: Listing[];
    loading: boolean;
}

const FinancialsTab: React.FC<FinancialsTabProps> = ({ financials, bookings, transactions, listings, loading }) => {
    const { locale } = useLocale();
    const { showToast } = useToast();
    const [isTriggering, setIsTriggering] = useState(false);
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

    const handleManualRelease = async () => {
        setIsTriggering(true);
        try {
            await triggerManualReleaseCheck((bookingId, amount) => {
                console.log(`✅ Manually released $${amount} for booking ${bookingId}`);
            });
            showToast({ message: 'Release check completed! Check console for details.', type: 'success' });
            window.location.reload();
        } catch (error) {
            showToast({ message: 'Failed to trigger release check', type: 'error' });
            console.error(error);
        } finally {
            setIsTriggering(false);
        }
    };

    if (loading) {
        return (
            <div className="glass-card p-12 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-500">Loading financial data...</p>
            </div>
        );
    }

    if (!financials) return null;

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-gray-500">Total Escrow</h3>
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                            <DollarSign className="text-blue-600" size={20} />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{locale.currencySymbol}{financials.totalEscrow.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 mt-2">Funds held securely</p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-gray-500">Released to Hosts</h3>
                        <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                            <TrendingUp className="text-green-600" size={20} />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{locale.currencySymbol}{financials.totalReleased.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 mt-2">Total payouts</p>
                </div>

                <div className="bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-white/90">Platform Revenue</h3>
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                            <ArrowUpRight className="text-white" size={20} />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-white">{locale.currencySymbol}{financials.totalRevenue.toLocaleString()}</p>
                    <p className="text-xs text-white/70 mt-2">Service fees collected</p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-gray-500">Pending Payouts</h3>
                        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                            <Clock className="text-orange-600" size={20} />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{financials.pendingPayouts}</p>
                    <p className="text-xs text-gray-400 mt-2">Awaiting release</p>
                </div>
            </div>

            {/* Escrow Management Table */}
            <div className="glass-card overflow-hidden">
                <div className="p-4 border-b border-white/20 bg-gradient-to-r from-gray-50 to-gray-100 flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-gray-900">Escrow Management</h3>
                        <span className="text-xs text-gray-500">{bookings.filter(b => b.paymentStatus === 'Paid - Escrow').length} in escrow</span>
                    </div>
                    <button
                        onClick={handleManualRelease}
                        disabled={isTriggering}
                        className="text-sm font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
                    >
                        <RefreshCw size={14} className={isTriggering ? 'animate-spin' : ''} />
                        {isTriggering ? 'Checking...' : 'Trigger Release Check'}
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Booking ID</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Listing</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Amount</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Release Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {(() => {
                                const escrowBookings = bookings.filter(b => b.paymentStatus === 'Paid - Escrow');
                                if (escrowBookings.length === 0) {
                                    return (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-8 text-center text-gray-500">No funds in escrow</td>
                                        </tr>
                                    );
                                }

                                const processedGroups = new Set<string>();
                                return escrowBookings.map(booking => {
                                    if (booking.groupId && processedGroups.has(booking.groupId)) return null;

                                    const isGroup = !!booking.groupId;
                                    const group = isGroup ? escrowBookings.filter(b => b.groupId === booking.groupId) : [booking];

                                    if (isGroup) processedGroups.add(booking.groupId!);

                                    const listing = listings.find(l => l.id === booking.listingId);
                                    const totalAmount = group.reduce((sum, b) => sum + b.totalPrice, 0);
                                    const isExpanded = isGroup && expandedGroups.has(booking.groupId!);

                                    const toggleGroup = () => {
                                        if (!booking.groupId) return;
                                        const newExpanded = new Set(expandedGroups);
                                        if (isExpanded) newExpanded.delete(booking.groupId);
                                        else newExpanded.add(booking.groupId);
                                        setExpandedGroups(newExpanded);
                                    };

                                    return (
                                        <React.Fragment key={booking.id}>
                                            <tr
                                                className={`hover:bg-gray-50/50 transition-colors ${isGroup ? 'cursor-pointer bg-gray-50/30' : ''}`}
                                                onClick={isGroup ? toggleGroup : undefined}
                                            >
                                                <td className="px-4 py-3 text-sm font-mono text-gray-600 flex items-center gap-2">
                                                    {isGroup && (
                                                        <button className="p-1 hover:bg-gray-200 rounded">
                                                            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                                        </button>
                                                    )}
                                                    {isGroup ? `Group: ${booking.groupId?.slice(0, 8)}...` : `${booking.id.slice(0, 8)}...`}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900">
                                                    {listing?.title || 'Unknown'}
                                                    {isGroup && <span className="ml-2 text-xs text-gray-500">({group.length} Sessions)</span>}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-600">
                                                    {isGroup ? 'Multiple Dates' : new Date(booking.date).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 py-3 text-sm font-bold text-gray-900">{locale.currencySymbol}{totalAmount.toFixed(2)}</td>
                                                <td className="px-4 py-3">
                                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">
                                                        Paid - Escrow
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-600">
                                                    {isGroup ? 'Various' : (booking.escrowReleaseDate ? new Date(booking.escrowReleaseDate).toLocaleString() : 'N/A')}
                                                </td>
                                            </tr>
                                            {isExpanded && group.map(subBooking => (
                                                <tr key={subBooking.id} className="bg-gray-50/50 border-l-4 border-brand-200">
                                                    <td className="px-4 py-2 text-xs font-mono text-gray-500 pl-12">
                                                        {subBooking.id.slice(0, 8)}...
                                                    </td>
                                                    <td className="px-4 py-2 text-xs text-gray-500">Session</td>
                                                    <td className="px-4 py-2 text-xs text-gray-500">{new Date(subBooking.date).toLocaleDateString()}</td>
                                                    <td className="px-4 py-2 text-xs font-medium text-gray-700">{locale.currencySymbol}{subBooking.totalPrice.toFixed(2)}</td>
                                                    <td className="px-4 py-2"></td>
                                                    <td className="px-4 py-2 text-xs text-gray-500">
                                                        {subBooking.escrowReleaseDate ? new Date(subBooking.escrowReleaseDate).toLocaleString() : 'N/A'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </React.Fragment>
                                    );
                                });
                            })()}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Transaction History */}
            <div className="glass-card overflow-hidden">
                <div className="p-4 border-b border-white/20 bg-gradient-to-r from-gray-50 to-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-gray-900">Transaction History</h3>
                    <button className="text-sm font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1 transition-all hover:scale-105">
                        <Download size={14} />
                        Export CSV
                    </button>
                </div>
                <div className="overflow-x-auto max-h-96">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 sticky top-0">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Transaction ID</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Type</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Amount</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Timestamp</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Reference</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">No transactions yet</td>
                                </tr>
                            ) : (
                                transactions.slice(0, 50).map(tx => (
                                    <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-4 py-3 text-sm font-mono text-gray-600">{tx.id.slice(0, 12)}...</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 text-xs font-bold rounded-full ${tx.type === 'GUEST_PAYMENT' ? 'bg-blue-100 text-blue-800' :
                                                tx.type === 'HOST_PAYOUT' ? 'bg-green-100 text-green-800' :
                                                    tx.type === 'SERVICE_FEE' ? 'bg-purple-100 text-purple-800' :
                                                        'bg-red-100 text-red-800'
                                                }`}>
                                                {tx.type.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm font-bold text-gray-900">{locale.currencySymbol}{tx.amount.toFixed(2)}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 text-xs font-bold rounded-full ${tx.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                                tx.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                {tx.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{new Date(tx.timestamp).toLocaleString()}</td>
                                        <td className="px-4 py-3 text-xs font-mono text-gray-500">{tx.paystackReference?.slice(0, 16)}...</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default FinancialsTab;
