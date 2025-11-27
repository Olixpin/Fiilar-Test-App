import React from 'react';
import { User, Booking, Listing } from '@fiilar/types';
import { useLocale } from '@fiilar/ui';
import { DollarSign, Clock, ShieldCheck, Info, CheckCircle, Loader2, Save } from 'lucide-react';

interface HostFinancialsProps {
    user: User;
    bankDetails: {
        bankName: string;
        accountNumber: string;
        accountName: string;
        isVerified: boolean;
    };
    hostBookings: Booking[];
    hostTransactions: any[];
    listings: Listing[];
    isVerifyingBank: boolean;
    onVerifyBank: () => void;
    onSaveBankDetails: () => void;
    setBankDetails: (details: any) => void;
}

const HostFinancials: React.FC<HostFinancialsProps> = ({
    user,
    bankDetails,
    hostBookings,
    hostTransactions,
    listings,
    isVerifyingBank,
    onVerifyBank,
    onSaveBankDetails,
    setBankDetails
}) => {
    const { locale } = useLocale();
    return (
        <div className="space-y-6 animate-in fade-in">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Available Balance</h3>
                        <div className="bg-green-100 p-2 rounded-lg text-green-700">
                            <DollarSign size={18} />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{locale.currencySymbol}{user.walletBalance.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">Ready to withdraw</p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">In Escrow</h3>
                        <div className="bg-orange-100 p-2 rounded-lg text-orange-700">
                            <Clock size={18} />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{locale.currencySymbol}{hostBookings.filter(b => b.paymentStatus === 'Paid - Escrow').reduce((sum, b) => sum + (b.totalPrice - b.serviceFee - b.cautionFee), 0).toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">Pending release</p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Payout Method</h3>
                        <div className="bg-blue-100 p-2 rounded-lg text-blue-700">
                            <ShieldCheck size={18} />
                        </div>
                    </div>
                    <p className="text-lg font-bold text-gray-900">{bankDetails.isVerified ? bankDetails.bankName : 'Not Set'}</p>
                    <p className="text-xs text-gray-500 mt-1">{bankDetails.isVerified ? `••••${bankDetails.accountNumber.slice(-4)}` : 'Add bank account'}</p>
                </div>
            </div>

            {/* Bank Account Setup */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Payout Method</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage how you receive payments</p>
                </div>

                <div className="p-6 space-y-6">
                    <div className="bg-blue-50 p-4 rounded-xl flex items-start gap-3">
                        <Info className="text-blue-600 shrink-0 mt-0.5" size={20} />
                        <div>
                            <h4 className="text-sm font-bold text-blue-900">How payouts work</h4>
                            <p className="text-xs text-blue-700 mt-1">
                                Payments are processed securely via Paystack. Funds are released to your bank account 24 hours after the guest checks in.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="bank-name-select" className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                            <select
                                id="bank-name-select"
                                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                                value={bankDetails.bankName}
                                onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value, isVerified: false })}
                                disabled={bankDetails.isVerified}
                            >
                                <option value="">Select Bank</option>
                                <option value="GTBank">Guaranty Trust Bank</option>
                                <option value="Zenith">Zenith Bank</option>
                                <option value="FirstBank">First Bank of Nigeria</option>
                                <option value="UBA">United Bank for Africa</option>
                                <option value="Access">Access Bank</option>
                                <option value="Kuda">Kuda Microfinance Bank</option>
                                <option value="OPay">OPay Digital Services</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                            <input
                                type="text"
                                maxLength={10}
                                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                                placeholder="0123456789"
                                value={bankDetails.accountNumber}
                                onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value.replace(/\D/g, ''), isVerified: false })}
                                disabled={bankDetails.isVerified}
                            />
                        </div>
                    </div>

                    {bankDetails.isVerified && (
                        <div className="bg-green-50 border border-green-100 p-4 rounded-xl flex items-center justify-between animate-in fade-in">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                    <CheckCircle size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-green-900">{bankDetails.accountName}</p>
                                    <p className="text-xs text-green-700">Verified Account</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setBankDetails({ ...bankDetails, isVerified: false, accountName: '' })}
                                className="text-xs text-gray-500 hover:text-red-600 underline"
                            >
                                Change
                            </button>
                        </div>
                    )}

                    <div className="flex gap-3">
                        {!bankDetails.isVerified ? (
                            <button
                                onClick={onVerifyBank}
                                disabled={isVerifyingBank || !bankDetails.accountNumber || !bankDetails.bankName}
                                className="flex-1 py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isVerifyingBank ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                                Verify Account
                            </button>
                        ) : (
                            <button
                                onClick={onSaveBankDetails}
                                className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                            >
                                <Save size={18} />
                                Save Payout Method
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Payout Schedule */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900">Upcoming Payouts</h3>
                    <p className="text-sm text-gray-500 mt-1">Funds releasing in the next 7 days</p>
                </div>
                <div className="divide-y divide-gray-200">
                    {hostBookings.filter(b => {
                        if (!b.escrowReleaseDate || b.paymentStatus !== 'Paid - Escrow') return false;
                        const releaseDate = new Date(b.escrowReleaseDate);
                        const sevenDays = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                        return releaseDate <= sevenDays;
                    }).length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <Clock size={32} className="mx-auto mb-2 opacity-20" />
                            <p className="text-sm">No upcoming payouts</p>
                        </div>
                    ) : (
                        hostBookings.filter(b => {
                            if (!b.escrowReleaseDate || b.paymentStatus !== 'Paid - Escrow') return false;
                            const releaseDate = new Date(b.escrowReleaseDate);
                            const sevenDays = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                            return releaseDate <= sevenDays;
                        }).map(booking => {
                            const listing = listings.find(l => l.id === booking.listingId);
                            const releaseDate = new Date(booking.escrowReleaseDate!);
                            const daysUntil = Math.floor((releaseDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                            const payout = booking.totalPrice - booking.serviceFee - booking.cautionFee;
                            return (
                                <div key={booking.id} className="p-4 hover:bg-gray-50 transition flex items-center gap-4">
                                    <img src={listing?.images[0]} alt="" className="w-16 h-16 rounded-lg object-cover" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 truncate">{listing?.title}</p>
                                        <p className="text-sm text-gray-500">{new Date(booking.date).toLocaleDateString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-gray-900">{locale.currencySymbol}{payout.toFixed(2)}</p>
                                        <p className="text-xs font-medium text-brand-600">
                                            {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Payout History */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900">Payout History</h3>
                    <p className="text-sm text-gray-500 mt-1">All completed payouts</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Reference</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {hostTransactions.filter(tx => tx.type === 'HOST_PAYOUT' && tx.toUserId === user.id).length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No payouts yet</td>
                                </tr>
                            ) : (
                                hostTransactions
                                    .filter(tx => tx.type === 'HOST_PAYOUT' && tx.toUserId === user.id)
                                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                                    .map(tx => (
                                        <tr key={tx.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm text-gray-600">{new Date(tx.timestamp).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 text-sm font-bold text-gray-900">{locale.currencySymbol}{tx.amount.toFixed(2)}</td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">
                                                    {tx.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-mono text-gray-500">{tx.paystackReference?.slice(0, 20)}...</td>
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

export default HostFinancials;
