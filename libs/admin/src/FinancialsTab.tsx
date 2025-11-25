import React, { useState } from 'react';
import { Listing, Booking, EscrowTransaction, PlatformFinancials } from '@fiilar/types';
import { DollarSign, TrendingUp, Clock, ArrowUpRight, Download, RefreshCw } from 'lucide-react';
import { triggerManualReleaseCheck } from '@fiilar/escrow';

interface FinancialsTabProps {
    financials: PlatformFinancials | null;
    bookings: Booking[];
    transactions: EscrowTransaction[];
    listings: Listing[];
    loading: boolean;
}

const FinancialsTab: React.FC<FinancialsTabProps> = ({ financials, bookings, transactions, listings, loading }) => {
    const [isTriggering, setIsTriggering] = useState(false);

    const handleManualRelease = async () => {
        setIsTriggering(true);
        try {
            await triggerManualReleaseCheck((bookingId, amount) => {
                console.log(`✅ Manually released $${amount} for booking ${bookingId}`);
            });
            alert('✅ Release check completed! Check console for details.');
            window.location.reload();
        } catch (error) {
            alert('❌ Failed to trigger release check');
            console.error(error);
        } finally {
            setIsTriggering(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-500">Loading financial data...</p>
            </div>
        );
    }

    if (!financials) return null;

    return (
        <div className="space-y-6">
            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-linear-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium opacity-90">Total Escrow</h3>
                        <DollarSign className="opacity-75" size={20} />
                    </div>
                    <p className="text-3xl font-bold">${financials.totalEscrow.toLocaleString()}</p>
                    <p className="text-xs opacity-75 mt-1">Funds held securely</p>
                </div>

                <div className="bg-linear-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium opacity-90">Released to Hosts</h3>
                        <TrendingUp className="opacity-75" size={20} />
                    </div>
                    <p className="text-3xl font-bold">${financials.totalReleased.toLocaleString()}</p>
                    <p className="text-xs opacity-75 mt-1">Total payouts</p>
                </div>

                <div className="bg-linear-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium opacity-90">Platform Revenue</h3>
                        <ArrowUpRight className="opacity-75" size={20} />
                    </div>
                    <p className="text-3xl font-bold">${financials.totalRevenue.toLocaleString()}</p>
                    <p className="text-xs opacity-75 mt-1">Service fees collected</p>
                </div>

                <div className="bg-linear-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium opacity-90">Pending Payouts</h3>
                        <Clock className="opacity-75" size={20} />
                    </div>
                    <p className="text-3xl font-bold">{financials.pendingPayouts}</p>
                    <p className="text-xs opacity-75 mt-1">Awaiting release</p>
                </div>
            </div>

            {/* Escrow Management Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-gray-900">Escrow Management</h3>
                        <span className="text-xs text-gray-500">{bookings.filter(b => b.paymentStatus === 'Paid - Escrow').length} in escrow</span>
                    </div>
                    <button
                        onClick={handleManualRelease}
                        disabled={isTriggering}
                        className="text-sm font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <RefreshCw size={14} className={isTriggering ? 'animate-spin' : ''} />
                        {isTriggering ? 'Checking...' : 'Trigger Release Check'}
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Booking ID</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Listing</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Amount</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Release Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {bookings.filter(b => b.paymentStatus === 'Paid - Escrow').length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">No funds in escrow</td>
                                </tr>
                            ) : (
                                bookings.filter(b => b.paymentStatus === 'Paid - Escrow').map(booking => {
                                    const listing = listings.find(l => l.id === booking.listingId);
                                    return (
                                        <tr key={booking.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm font-mono text-gray-600">{booking.id.slice(0, 8)}...</td>
                                            <td className="px-4 py-3 text-sm text-gray-900">{listing?.title || 'Unknown'}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{new Date(booking.date).toLocaleDateString()}</td>
                                            <td className="px-4 py-3 text-sm font-bold text-gray-900">${booking.totalPrice.toFixed(2)}</td>
                                            <td className="px-4 py-3">
                                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">
                                                    {booking.paymentStatus}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {booking.escrowReleaseDate ? new Date(booking.escrowReleaseDate).toLocaleString() : 'N/A'}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Transaction History */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <h3 className="font-bold text-gray-900">Transaction History</h3>
                    <button className="text-sm font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1">
                        <Download size={14} />
                        Export CSV
                    </button>
                </div>
                <div className="overflow-x-auto max-h-96">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Transaction ID</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Type</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Amount</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Timestamp</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Reference</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">No transactions yet</td>
                                </tr>
                            ) : (
                                transactions.slice(0, 50).map(tx => (
                                    <tr key={tx.id} className="hover:bg-gray-50">
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
                                        <td className="px-4 py-3 text-sm font-bold text-gray-900">${tx.amount.toFixed(2)}</td>
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
