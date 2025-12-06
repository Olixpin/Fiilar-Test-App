import React, { useMemo, useState } from 'react';
import { User, Booking } from '@fiilar/types';
import { useLocale } from '@fiilar/ui';
import { DollarSign, Clock, ShieldCheck, CheckCircle, Loader2, Save, TrendingUp, ArrowUpRight, ArrowDownRight, CreditCard, Building2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '@fiilar/utils';

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
    isVerifyingBank,
    onVerifyBank,
    onSaveBankDetails,
    setBankDetails
}) => {
    const { locale } = useLocale();
    const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');
    const [showAllTransactions, setShowAllTransactions] = useState(false);

    // Calculate stats
    const escrowBalance = useMemo(() => {
        return hostBookings
            .filter(b => b.paymentStatus === 'Paid - Escrow')
            .reduce((sum, b) => sum + (b.hostPayout || (b.totalPrice - b.userServiceFee - b.cautionFee)), 0);
    }, [hostBookings]);

    const totalEarnings = useMemo(() => {
        return hostTransactions
            .filter(tx => tx.type === 'HOST_PAYOUT' && tx.toUserId === user.id && tx.status === 'COMPLETED')
            .reduce((sum, tx) => sum + tx.amount, 0);
    }, [hostTransactions, user.id]);

    // Aggregate chart data based on time range
    const chartData = useMemo(() => {
        const now = new Date();
        let days = 7;
        if (timeRange === 'month') days = 30;
        if (timeRange === 'year') days = 365; // Or 12 months, but let's stick to daily for now for consistency or monthly if year

        if (timeRange === 'year') {
            // Monthly aggregation for year view
            const data = Array.from({ length: 12 }, (_, i) => {
                const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const monthKey = date.toLocaleString('default', { month: 'short' });
                const yearKey = date.getFullYear();

                const monthlyRevenue = hostBookings
                    .filter(b => {
                        const bDate = new Date(b.date);
                        return bDate.getMonth() === date.getMonth() &&
                            bDate.getFullYear() === date.getFullYear() &&
                            (b.status === 'Confirmed' || b.status === 'Completed');
                    })
                    .reduce((sum, b) => sum + (b.hostPayout || (b.totalPrice - b.userServiceFee - b.cautionFee)), 0);

                return {
                    name: monthKey,
                    fullDate: `${monthKey} ${yearKey}`,
                    amount: monthlyRevenue,
                    timestamp: date.getTime() // For sorting
                };
            }).reverse();
            return data;
        } else {
            // Daily aggregation for week/month view
            const data = Array.from({ length: days }, (_, i) => {
                const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
                const dateStr = date.toISOString().split('T')[0];

                const dailyRevenue = hostBookings
                    .filter(b => {
                        const bDate = new Date(b.date).toISOString().split('T')[0];
                        return bDate === dateStr && (b.status === 'Confirmed' || b.status === 'Completed');
                    })
                    .reduce((sum, b) => sum + (b.hostPayout || (b.totalPrice - b.userServiceFee - b.cautionFee)), 0);

                return {
                    name: date.toLocaleDateString('en-US', { weekday: 'short' }),
                    fullDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    amount: dailyRevenue
                };
            }).reverse();
            return data;
        }
    }, [hostBookings, timeRange]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Earnings & Payouts</h1>
                <p className="text-gray-500">Track your revenue and manage payout methods.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Available Balance */}
                <div className="glass-card p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <DollarSign size={80} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 rounded-lg bg-green-100/50 text-green-700 backdrop-blur-sm">
                                <DollarSign size={20} />
                            </div>
                            <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Available Balance</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <h2 className="text-3xl font-bold text-gray-900">{locale.currencySymbol}{user.walletBalance.toLocaleString()}</h2>
                        </div>
                        <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                            <CheckCircle size={14} className="text-green-600" />
                            Ready for withdrawal
                        </p>
                    </div>
                </div>

                {/* In Escrow */}
                <div className="glass-card p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Clock size={80} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 rounded-lg bg-orange-100/50 text-orange-700 backdrop-blur-sm">
                                <Clock size={20} />
                            </div>
                            <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">In Escrow</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <h2 className="text-3xl font-bold text-gray-900">{locale.currencySymbol}{escrowBalance.toLocaleString()}</h2>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">Releasing soon</p>
                    </div>
                </div>

                {/* Total Earnings */}
                <div className="glass-card p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TrendingUp size={80} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 rounded-lg bg-blue-100/50 text-blue-700 backdrop-blur-sm">
                                <TrendingUp size={20} />
                            </div>
                            <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Earnings</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <h2 className="text-3xl font-bold text-gray-900">{locale.currencySymbol}{totalEarnings.toLocaleString()}</h2>
                        </div>
                        <p className="text-sm text-green-600 mt-2 flex items-center gap-1 font-medium">
                            <ArrowUpRight size={16} />
                            +12% this month
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Earnings Chart */}
                <div className="lg:col-span-2 glass-card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-lg text-gray-900">Earnings Overview</h3>
                        <select
                            className="bg-gray-50 border-none text-sm font-medium text-gray-600 rounded-lg px-3 py-1.5 focus:ring-0 cursor-pointer hover:bg-gray-100 transition-colors"
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value as 'week' | 'month' | 'year')}
                            title="Select time range"
                            aria-label="Select time range"
                        >
                            <option value="week">This Week</option>
                            <option value="month">Last Month</option>
                            <option value="year">This Year</option>
                        </select>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#EA580C" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#EA580C" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} tickFormatter={(value) => `${locale.currencySymbol}${value}`} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                                    cursor={{ stroke: '#EA580C', strokeWidth: 1, strokeDasharray: '4 4' }}
                                    formatter={(value: number) => [`${locale.currencySymbol}${value.toLocaleString()}`, 'Revenue']}
                                    labelFormatter={(label, payload) => {
                                        if (payload && payload.length > 0) {
                                            return payload[0].payload.fullDate;
                                        }
                                        return label;
                                    }}
                                />
                                <Area type="monotone" dataKey="amount" stroke="#EA580C" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Bank Details Card */}
                <div className="glass-card p-6 flex flex-col">
                    <h3 className="font-bold text-lg text-gray-900 mb-6">Payout Method</h3>

                    {/* Credit Card Style Display */}
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-xl mb-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-4 -translate-y-4">
                            <Building2 size={120} />
                        </div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-8">
                                <ShieldCheck className="text-gray-400" size={24} />
                                {bankDetails.isVerified && (
                                    <span className="bg-green-500/20 text-green-400 text-xs font-bold px-2 py-1 rounded-full border border-green-500/30 flex items-center gap-1">
                                        <CheckCircle size={10} /> VERIFIED
                                    </span>
                                )}
                            </div>
                            <div className="mb-6">
                                <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Bank Name</p>
                                <p className="text-xl font-bold tracking-wide">{bankDetails.bankName || 'Not Set'}</p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Account Number</p>
                                <p className="text-2xl font-mono tracking-wider">
                                    {bankDetails.accountNumber ? `•••• ${bankDetails.accountNumber.slice(-4)}` : '•••• ••••'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 flex-1">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label htmlFor="bank-name-select" className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Bank Name</label>
                                <select
                                    id="bank-name-select"
                                    className="w-full p-2.5 bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-brand-500 transition-all"
                                    value={bankDetails.bankName}
                                    onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value, isVerified: false })}
                                    disabled={bankDetails.isVerified}
                                    aria-label="Select bank name"
                                >
                                    <option value="">Select Bank</option>
                                    <option value="GTBank">Guaranty Trust Bank</option>
                                    <option value="Zenith">Zenith Bank</option>
                                    <option value="FirstBank">First Bank</option>
                                    <option value="UBA">UBA</option>
                                    <option value="Access">Access Bank</option>
                                    <option value="Kuda">Kuda Bank</option>
                                    <option value="OPay">OPay</option>
                                </select>
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Account Number</label>
                                <input
                                    type="text"
                                    maxLength={10}
                                    className="w-full p-2.5 bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-brand-500 transition-all font-mono"
                                    placeholder="0123456789"
                                    value={bankDetails.accountNumber}
                                    onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value.replace(/\D/g, ''), isVerified: false })}
                                    disabled={bankDetails.isVerified}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-6">
                        {!bankDetails.isVerified ? (
                            <button
                                onClick={onVerifyBank}
                                disabled={isVerifyingBank || !bankDetails.accountNumber || !bankDetails.bankName}
                                className="w-full py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98]"
                            >
                                {isVerifyingBank ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                                Verify Account
                            </button>
                        ) : (
                            <button
                                onClick={onSaveBankDetails}
                                className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/20 flex items-center justify-center gap-2 active:scale-[0.98]"
                            >
                                <Save size={18} />
                                Save Changes
                            </button>
                        )}
                        {bankDetails.isVerified && (
                            <button
                                onClick={() => setBankDetails({ ...bankDetails, isVerified: false, accountName: '' })}
                                className="w-full mt-3 py-2 text-sm text-gray-500 hover:text-red-600 font-medium transition-colors"
                            >
                                Change Account
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="glass-card overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-bold text-lg text-gray-900">
                        {showAllTransactions ? 'All Transactions' : 'Recent Transactions'}
                    </h3>
                    {hostTransactions.length > 5 && (
                        <button 
                            onClick={() => setShowAllTransactions(!showAllTransactions)}
                            className="text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
                        >
                            {showAllTransactions ? 'Show Less' : `View All (${hostTransactions.length})`}
                        </button>
                    )}
                </div>
                <div className={cn(
                    "overflow-x-auto",
                    showAllTransactions && "max-h-[500px] overflow-y-auto"
                )}>
                    <table className="w-full">
                        <thead className={cn(
                            "bg-gray-50/50",
                            showAllTransactions && "sticky top-0 z-10"
                        )}>
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Reference</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {hostTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                                                <CreditCard size={24} />
                                            </div>
                                            <p>No transactions yet</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                hostTransactions
                                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                                    .slice(0, showAllTransactions ? undefined : 5)
                                    .map((tx) => (
                                        <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                                                {new Date(tx.timestamp).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className={cn(
                                                        "p-1.5 rounded-full",
                                                        tx.type === 'HOST_PAYOUT' ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"
                                                    )}>
                                                        {tx.type === 'HOST_PAYOUT' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-700">
                                                        {tx.type === 'HOST_PAYOUT' ? 'Payout' : 'Booking Payment'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-gray-900">
                                                {locale.currencySymbol}{tx.amount.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={cn(
                                                    "px-2.5 py-1 text-xs font-bold rounded-full border",
                                                    tx.status === 'COMPLETED' ? "bg-green-50 text-green-700 border-green-200" :
                                                        tx.status === 'PENDING' ? "bg-orange-50 text-orange-700 border-orange-200" :
                                                            "bg-red-50 text-red-700 border-red-200"
                                                )}>
                                                    {tx.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-mono text-gray-400">
                                                {tx.paystackReference?.slice(0, 12)}...
                                            </td>
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
