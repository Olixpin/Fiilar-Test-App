import React, { useState } from 'react';
import { PlatformFinancials, EscrowTransaction } from '@fiilar/types';
import { DollarSign, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, Search, Download, RefreshCw, FileText, X } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@fiilar/ui';
import { TransactionHistory } from '@fiilar/admin';

interface EscrowManagerProps {
    financials: PlatformFinancials | null;
    transactions: EscrowTransaction[];
    loading: boolean;
}

const EscrowManager: React.FC<EscrowManagerProps> = ({ financials, transactions, loading }) => {
    const [filter, setFilter] = useState<'ALL' | 'PAYMENT' | 'PAYOUT' | 'REFUND'>('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

    const filteredTransactions = transactions.filter(tx => {
        const matchesFilter = filter === 'ALL' ||
            (filter === 'PAYMENT' && tx.type === 'GUEST_PAYMENT') ||
            (filter === 'PAYOUT' && tx.type === 'HOST_PAYOUT') ||
            (filter === 'REFUND' && tx.type === 'REFUND');

        const matchesSearch = tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tx.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tx.paystackReference?.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesFilter && matchesSearch;
    });

    const getIcon = (type: string) => {
        switch (type) {
            case 'GUEST_PAYMENT': return <ArrowDownLeft size={18} className="text-green-600" />;
            case 'HOST_PAYOUT': return <ArrowUpRight size={18} className="text-blue-600" />;
            case 'REFUND': return <ArrowUpRight size={18} className="text-orange-600" />;
            case 'SERVICE_FEE': return <DollarSign size={18} className="text-gray-600" />;
            default: return <Clock size={18} className="text-gray-400" />;
        }
    };

    // Get all transactions for the selected booking
    const selectedBookingTransactions = selectedBookingId
        ? transactions.filter(t => t.bookingId === selectedBookingId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        : [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Escrow Manager</h2>
                    <p className="text-gray-500">Monitor funds held in escrow and release payouts</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" leftIcon={<Download size={16} />}>Export Report</Button>
                    <Button variant="primary" leftIcon={<RefreshCw size={16} />}>Sync Paystack</Button>
                </div>
            </div>

            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-linear-to-br from-indigo-500 to-purple-600 text-white border-none">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-indigo-100 text-sm font-medium mb-1">Total Held in Escrow</p>
                                <h3 className="text-3xl font-bold">${financials?.totalEscrow.toLocaleString() ?? '0.00'}</h3>
                            </div>
                            <div className="bg-white/20 p-2 rounded-lg">
                                <DollarSign size={24} className="text-white" />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-indigo-100 text-xs">
                            <Clock size={14} />
                            <span>{financials?.pendingPayouts ?? 0} payouts pending release</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-gray-500 text-sm font-medium mb-1">Total Released</p>
                                <h3 className="text-3xl font-bold text-gray-900">${financials?.totalReleased.toLocaleString() ?? '0.00'}</h3>
                            </div>
                            <div className="bg-green-100 p-2 rounded-lg">
                                <CheckCircle size={24} className="text-green-600" />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-green-600 text-xs font-medium">
                            <ArrowUpRight size={14} />
                            <span>+12% from last month</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-gray-500 text-sm font-medium mb-1">Platform Revenue</p>
                                <h3 className="text-3xl font-bold text-gray-900">${financials?.totalRevenue.toLocaleString() ?? '0.00'}</h3>
                            </div>
                            <div className="bg-blue-100 p-2 rounded-lg">
                                <DollarSign size={24} className="text-blue-600" />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 text-xs">
                            <span>Service fees collected</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Transaction Ledger */}
            <Card>
                <CardHeader className="border-b border-gray-100 pb-4">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <CardTitle>Transaction Ledger</CardTitle>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <div className="relative flex-1 sm:flex-none">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search ref, booking ID..."
                                    className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 w-full"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex bg-gray-100 p-1 rounded-lg">
                                <button
                                    onClick={() => setFilter('ALL')}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${filter === 'ALL' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    All
                                </button>
                                <button
                                    onClick={() => setFilter('PAYMENT')}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${filter === 'PAYMENT' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    In
                                </button>
                                <button
                                    onClick={() => setFilter('PAYOUT')}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${filter === 'PAYOUT' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Out
                                </button>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Type</th>
                                <th className="px-6 py-3">Amount</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Reference</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        Loading transactions...
                                    </td>
                                </tr>
                            ) : filteredTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        No transactions found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredTransactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                                            {new Date(tx.timestamp).toLocaleDateString()}
                                            <div className="text-xs text-gray-400">{new Date(tx.timestamp).toLocaleTimeString()}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg bg-gray-100 group-hover:bg-white transition-colors`}>
                                                    {getIcon(tx.type)}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{tx.type.replace('_', ' ')}</p>
                                                    <p className="text-xs text-gray-500 font-mono">{tx.bookingId.slice(0, 8)}...</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`font-bold ${tx.type === 'HOST_PAYOUT' || tx.type === 'REFUND' ? 'text-red-600' : 'text-green-600'}`}>
                                                {tx.type === 'HOST_PAYOUT' || tx.type === 'REFUND' ? '-' : '+'}${tx.amount.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tx.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                                tx.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                {tx.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-mono text-gray-500">
                                            {tx.paystackReference}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-gray-500 hover:text-brand-600"
                                                onClick={() => setSelectedBookingId(tx.bookingId)}
                                                title="View Audit Trail"
                                            >
                                                <FileText size={16} />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Transaction History Modal */}
            {selectedBookingId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <div>
                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                    <FileText size={20} className="text-brand-600" />
                                    Audit Trail
                                </h3>
                                <p className="text-xs text-gray-500 mt-0.5">Booking ID: <span className="font-mono">{selectedBookingId}</span></p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedBookingId(null)}
                                className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                                aria-label="Close"
                            >
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>
                        <div className="p-6 max-h-[70vh] overflow-y-auto">
                            <TransactionHistory transactions={selectedBookingTransactions} />
                        </div>
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                            <Button variant="outline" onClick={() => setSelectedBookingId(null)}>Close</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EscrowManager;
