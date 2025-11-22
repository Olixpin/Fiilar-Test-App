import React from 'react';
import { Booking, EscrowTransaction } from '../types';
import { DollarSign, TrendingUp, Clock, Calendar } from 'lucide-react';

interface HostEarningsProps {
    hostBookings: Booking[];
    transactions: EscrowTransaction[];
    hostId: string;
}

const HostEarnings: React.FC<HostEarningsProps> = ({ hostBookings, transactions, hostId }) => {
    // Calculate earnings
    const fundsInEscrow = hostBookings
        .filter(b => b.paymentStatus === 'Paid - Escrow')
        .reduce((sum, b) => sum + (b.totalPrice - b.serviceFee - b.cautionFee), 0);

    const releasedEarnings = transactions
        .filter(tx => tx.type === 'HOST_PAYOUT' && tx.toUserId === hostId && tx.status === 'COMPLETED')
        .reduce((sum, tx) => sum + tx.amount, 0);

    const pendingPayouts = hostBookings.filter(b => b.paymentStatus === 'Paid - Escrow');

    // Get upcoming payouts (next 7 days)
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const upcomingPayouts = pendingPayouts.filter(b => {
        if (!b.escrowReleaseDate) return false;
        const releaseDate = new Date(b.escrowReleaseDate);
        return releaseDate >= now && releaseDate <= sevenDaysFromNow;
    });

    return (
        <div className="space-y-6">
            {/* Earnings Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium opacity-90">In Escrow</h3>
                        <Clock className="opacity-75" size={20} />
                    </div>
                    <p className="text-3xl font-bold">${fundsInEscrow.toLocaleString()}</p>
                    <p className="text-xs opacity-75 mt-1">{pendingPayouts.length} pending payout(s)</p>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium opacity-90">Total Earnings</h3>
                        <TrendingUp className="opacity-75" size={20} />
                    </div>
                    <p className="text-3xl font-bold">${releasedEarnings.toLocaleString()}</p>
                    <p className="text-xs opacity-75 mt-1">All-time released</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium opacity-90">Upcoming (7 days)</h3>
                        <Calendar className="opacity-75" size={20} />
                    </div>
                    <p className="text-3xl font-bold">{upcomingPayouts.length}</p>
                    <p className="text-xs opacity-75 mt-1">Payouts releasing soon</p>
                </div>
            </div>

            {/* Upcoming Payouts */}
            {upcomingPayouts.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                        <h3 className="font-bold text-gray-900">Upcoming Payouts</h3>
                        <p className="text-xs text-gray-500 mt-1">Funds releasing in the next 7 days</p>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {upcomingPayouts.map(booking => {
                            const releaseDate = new Date(booking.escrowReleaseDate!);
                            const hoursUntil = Math.max(0, (releaseDate.getTime() - now.getTime()) / (1000 * 60 * 60));
                            const daysUntil = Math.floor(hoursUntil / 24);
                            const payout = booking.totalPrice - booking.serviceFee - booking.cautionFee;

                            return (
                                <div key={booking.id} className="p-4 hover:bg-gray-50 transition">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium text-gray-900">${payout.toFixed(2)}</p>
                                            <p className="text-sm text-gray-500">Booking {booking.id.slice(0, 8)}...</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-brand-600">
                                                {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`}
                                            </p>
                                            <p className="text-xs text-gray-500">{releaseDate.toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Payout History */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="font-bold text-gray-900">Payout History</h3>
                    <p className="text-xs text-gray-500 mt-1">All completed payouts</p>
                </div>
                <div className="overflow-x-auto max-h-96">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Amount</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Reference</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {transactions.filter(tx => tx.type === 'HOST_PAYOUT' && tx.toUserId === hostId).length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">No payouts yet</td>
                                </tr>
                            ) : (
                                transactions
                                    .filter(tx => tx.type === 'HOST_PAYOUT' && tx.toUserId === hostId)
                                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                                    .map(tx => (
                                        <tr key={tx.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm text-gray-600">{new Date(tx.timestamp).toLocaleDateString()}</td>
                                            <td className="px-4 py-3 text-sm font-bold text-gray-900">${tx.amount.toFixed(2)}</td>
                                            <td className="px-4 py-3">
                                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">
                                                    {tx.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-xs font-mono text-gray-500">{tx.paystackReference?.slice(0, 20)}...</td>
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

export default HostEarnings;
