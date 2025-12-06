import React, { useState, useEffect } from 'react';
import { PlatformFinancials, EscrowTransaction } from '@fiilar/types';
import { DollarSign, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, Search, RefreshCw, X, ExternalLink, Copy, AlertCircle } from 'lucide-react';
import { Button } from '@fiilar/ui';
import { useLocale } from '@fiilar/ui';
import { cn } from '@fiilar/utils';

interface EscrowManagerProps {
    financials: PlatformFinancials | null;
    transactions: EscrowTransaction[];
    loading: boolean;
}

type TabType = 'all' | 'payments' | 'payouts' | 'refunds';

const EscrowManager: React.FC<EscrowManagerProps> = ({ financials, transactions, loading }) => {
    const { locale } = useLocale();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<TabType>('all');
    const [selectedTransaction, setSelectedTransaction] = useState<EscrowTransaction | null>(null);

    const getFilteredTransactions = () => {
        let filtered = transactions;
        
        switch (activeTab) {
            case 'payments':
                filtered = transactions.filter(tx => tx.type === 'GUEST_PAYMENT');
                break;
            case 'payouts':
                filtered = transactions.filter(tx => tx.type === 'HOST_PAYOUT');
                break;
            case 'refunds':
                filtered = transactions.filter(tx => tx.type === 'REFUND');
                break;
        }

        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(tx =>
                tx.id.toLowerCase().includes(search) ||
                tx.bookingId.toLowerCase().includes(search) ||
                tx.paystackReference?.toLowerCase().includes(search)
            );
        }

        return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    };

    const filteredTransactions = getFilteredTransactions();

    useEffect(() => {
        if (filteredTransactions.length > 0 && !selectedTransaction) {
            setSelectedTransaction(filteredTransactions[0]);
        }
    }, [filteredTransactions, selectedTransaction]);

    const tabs = [
        { id: 'all' as TabType, label: 'All', count: transactions.length },
        { id: 'payments' as TabType, label: 'Payments', count: transactions.filter(tx => tx.type === 'GUEST_PAYMENT').length },
        { id: 'payouts' as TabType, label: 'Payouts', count: transactions.filter(tx => tx.type === 'HOST_PAYOUT').length },
        { id: 'refunds' as TabType, label: 'Refunds', count: transactions.filter(tx => tx.type === 'REFUND').length },
    ];

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'GUEST_PAYMENT': return <ArrowDownLeft size={16} className="text-green-600" />;
            case 'HOST_PAYOUT': return <ArrowUpRight size={16} className="text-blue-600" />;
            case 'REFUND': return <RefreshCw size={16} className="text-orange-600" />;
            case 'SERVICE_FEE': return <DollarSign size={16} className="text-purple-600" />;
            default: return <Clock size={16} className="text-gray-400" />;
        }
    };

    const getTypeBadge = (type: string) => {
        const config: Record<string, { bg: string; text: string; label: string }> = {
            'GUEST_PAYMENT': { bg: 'bg-green-50', text: 'text-green-700', label: 'Payment' },
            'HOST_PAYOUT': { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Payout' },
            'REFUND': { bg: 'bg-orange-50', text: 'text-orange-700', label: 'Refund' },
            'SERVICE_FEE': { bg: 'bg-purple-50', text: 'text-purple-700', label: 'Fee' },
        };
        const c = config[type] || { bg: 'bg-gray-50', text: 'text-gray-700', label: type };
        return (
            <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", c.bg, c.text)}>
                {c.label}
            </span>
        );
    };

    const getStatusBadge = (status: string) => {
        const config: Record<string, { bg: string; text: string }> = {
            'COMPLETED': { bg: 'bg-green-100', text: 'text-green-700' },
            'PENDING': { bg: 'bg-yellow-100', text: 'text-yellow-700' },
            'FAILED': { bg: 'bg-red-100', text: 'text-red-700' },
        };
        const c = config[status] || { bg: 'bg-gray-100', text: 'text-gray-700' };
        return (
            <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", c.bg, c.text)}>
                {status}
            </span>
        );
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const formatCurrency = (amount: number) => {
        return `${locale.currencySymbol}${amount.toLocaleString()}`;
    };

    return (
        <div className="flex h-[calc(100vh-180px)] gap-6">
            {/* Left Panel - Transaction List */}
            <div className="w-96 flex-shrink-0 bg-white rounded-xl border border-gray-200 flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900 mb-1">Escrow Manager</h2>
                    <p className="text-xs text-gray-500">Monitor funds and transactions</p>
                </div>

                {/* Summary Cards */}
                <div className="p-4 border-b border-gray-100 space-y-2">
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                                <DollarSign size={16} className="text-indigo-600" />
                            </div>
                            <span className="text-sm text-gray-600">In Escrow</span>
                        </div>
                        <span className="font-semibold text-gray-900">{formatCurrency(financials?.totalEscrow ?? 0)}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="p-2 bg-green-50 rounded-lg text-center">
                            <p className="text-xs text-green-600">Released</p>
                            <p className="font-semibold text-green-700 text-sm">{formatCurrency(financials?.totalReleased ?? 0)}</p>
                        </div>
                        <div className="p-2 bg-blue-50 rounded-lg text-center">
                            <p className="text-xs text-blue-600">Revenue</p>
                            <p className="font-semibold text-blue-700 text-sm">{formatCurrency(financials?.totalRevenue ?? 0)}</p>
                        </div>
                    </div>
                    {/* Caution/Security Deposits */}
                    <div className="grid grid-cols-2 gap-2">
                        <div className="p-2 bg-amber-50 rounded-lg text-center">
                            <p className="text-xs text-amber-600">Caution Held</p>
                            <p className="font-semibold text-amber-700 text-sm">{formatCurrency(financials?.escrow?.heldCautionFees ?? 0)}</p>
                        </div>
                        <div className="p-2 bg-purple-50 rounded-lg text-center">
                            <p className="text-xs text-purple-600">Pending Release</p>
                            <p className="font-semibold text-purple-700 text-sm">{formatCurrency(financials?.escrow?.pendingRelease ?? 0)}</p>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-gray-100">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search transactions..."
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
                                onClick={() => { setActiveTab(tab.id); setSelectedTransaction(null); }}
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

                {/* Transaction List */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center h-40">
                            <RefreshCw size={24} className="animate-spin text-gray-400" />
                        </div>
                    ) : filteredTransactions.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <DollarSign size={20} className="text-gray-400" />
                            </div>
                            <p className="text-sm text-gray-500">No transactions found</p>
                        </div>
                    ) : (
                        filteredTransactions.map((tx) => (
                            <div
                                key={tx.id}
                                onClick={() => setSelectedTransaction(tx)}
                                className={cn(
                                    "p-3 border-b border-gray-100 cursor-pointer transition-all border-l-2",
                                    selectedTransaction?.id === tx.id
                                        ? "bg-gray-100 border-l-gray-400"
                                        : "border-l-transparent hover:bg-gray-50"
                                )}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={cn(
                                        "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                                        tx.type === 'GUEST_PAYMENT' ? 'bg-green-100' :
                                        tx.type === 'HOST_PAYOUT' ? 'bg-blue-100' :
                                        tx.type === 'REFUND' ? 'bg-orange-100' : 'bg-gray-100'
                                    )}>
                                        {getTypeIcon(tx.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-sm font-medium text-gray-900">
                                                {tx.type === 'GUEST_PAYMENT' ? 'Payment Received' :
                                                 tx.type === 'HOST_PAYOUT' ? 'Host Payout' :
                                                 tx.type === 'REFUND' ? 'Refund Issued' : tx.type}
                                            </span>
                                            {getStatusBadge(tx.status)}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-0.5 truncate">
                                            {tx.paystackReference || tx.id.slice(0, 16)}
                                        </p>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-xs text-gray-400">
                                                {new Date(tx.timestamp).toLocaleDateString()}
                                            </span>
                                            <span className={cn(
                                                "font-semibold text-sm",
                                                tx.type === 'HOST_PAYOUT' || tx.type === 'REFUND' 
                                                    ? 'text-gray-900' 
                                                    : 'text-green-600'
                                            )}>
                                                {tx.type === 'HOST_PAYOUT' || tx.type === 'REFUND' ? '-' : '+'}
                                                {formatCurrency(tx.amount)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Right Panel - Transaction Detail */}
            <div className="flex-1 bg-white rounded-xl border border-gray-200 flex flex-col overflow-hidden">
                {selectedTransaction ? (
                    <div className="flex-1 overflow-y-auto">
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-12 h-12 rounded-xl flex items-center justify-center",
                                        selectedTransaction.type === 'GUEST_PAYMENT' ? 'bg-green-100' :
                                        selectedTransaction.type === 'HOST_PAYOUT' ? 'bg-blue-100' :
                                        selectedTransaction.type === 'REFUND' ? 'bg-orange-100' : 'bg-gray-100'
                                    )}>
                                        {getTypeIcon(selectedTransaction.type)}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">
                                            {selectedTransaction.type === 'GUEST_PAYMENT' ? 'Payment Received' :
                                             selectedTransaction.type === 'HOST_PAYOUT' ? 'Host Payout' :
                                             selectedTransaction.type === 'REFUND' ? 'Refund Issued' : selectedTransaction.type}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {new Date(selectedTransaction.timestamp).toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedTransaction(null)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    aria-label="Close"
                                >
                                    <X size={20} className="text-gray-400" />
                                </button>
                            </div>
                        </div>

                        {/* Amount Section */}
                        <div className="p-6 border-b border-gray-100 bg-gray-50">
                            <div className="text-center">
                                <p className="text-sm text-gray-500 mb-1">Amount</p>
                                <p className={cn(
                                    "text-4xl font-bold",
                                    selectedTransaction.type === 'HOST_PAYOUT' || selectedTransaction.type === 'REFUND'
                                        ? 'text-gray-900'
                                        : 'text-green-600'
                                )}>
                                    {selectedTransaction.type === 'HOST_PAYOUT' || selectedTransaction.type === 'REFUND' ? '-' : '+'}
                                    {formatCurrency(selectedTransaction.amount)}
                                </p>
                                <div className="flex items-center justify-center gap-2 mt-2">
                                    {getTypeBadge(selectedTransaction.type)}
                                    {getStatusBadge(selectedTransaction.status)}
                                </div>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <h4 className="text-sm font-semibold text-gray-900 mb-4">Transaction Details</h4>
                            
                            <div className="space-y-4">
                                {/* Transaction ID */}
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="text-xs text-gray-500">Transaction ID</p>
                                        <p className="font-mono text-sm text-gray-900">{selectedTransaction.id}</p>
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(selectedTransaction.id)}
                                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                        title="Copy ID"
                                    >
                                        <Copy size={16} className="text-gray-400" />
                                    </button>
                                </div>

                                {/* Booking ID */}
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="text-xs text-gray-500">Booking ID</p>
                                        <p className="font-mono text-sm text-gray-900">{selectedTransaction.bookingId}</p>
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(selectedTransaction.bookingId)}
                                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                        title="Copy Booking ID"
                                    >
                                        <Copy size={16} className="text-gray-400" />
                                    </button>
                                </div>

                                {/* Paystack Reference */}
                                {selectedTransaction.paystackReference && (
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="text-xs text-gray-500">Paystack Reference</p>
                                            <p className="font-mono text-sm text-gray-900">{selectedTransaction.paystackReference}</p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => copyToClipboard(selectedTransaction.paystackReference!)}
                                                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                                title="Copy Reference"
                                            >
                                                <Copy size={16} className="text-gray-400" />
                                            </button>
                                            <a
                                                href={`https://dashboard.paystack.com/#/transactions/${selectedTransaction.paystackReference}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                                title="View in Paystack"
                                            >
                                                <ExternalLink size={16} className="text-gray-400" />
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {/* From User */}
                                {selectedTransaction.fromUserId && (
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <p className="text-xs text-gray-500 mb-1">From User</p>
                                        <p className="font-mono text-sm text-gray-900">{selectedTransaction.fromUserId}</p>
                                    </div>
                                )}

                                {/* To User */}
                                {selectedTransaction.toUserId && (
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <p className="text-xs text-gray-500 mb-1">To User</p>
                                        <p className="font-mono text-sm text-gray-900">{selectedTransaction.toUserId}</p>
                                    </div>
                                )}

                                {/* Status */}
                                <div className="mt-6">
                                    <h4 className="text-sm font-semibold text-gray-900 mb-4">Status</h4>
                                    <div className="flex items-center gap-3 p-4 rounded-lg border border-gray-200">
                                        <div className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center",
                                            selectedTransaction.status === 'COMPLETED' ? 'bg-green-100' :
                                            selectedTransaction.status === 'PENDING' ? 'bg-yellow-100' : 'bg-red-100'
                                        )}>
                                            {selectedTransaction.status === 'COMPLETED' ? (
                                                <CheckCircle size={20} className="text-green-600" />
                                            ) : selectedTransaction.status === 'PENDING' ? (
                                                <Clock size={20} className="text-yellow-600" />
                                            ) : (
                                                <AlertCircle size={20} className="text-red-600" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {selectedTransaction.status === 'COMPLETED' ? 'Transaction Completed' :
                                                 selectedTransaction.status === 'PENDING' ? 'Transaction Pending' :
                                                 'Transaction Failed'}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {new Date(selectedTransaction.timestamp).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="p-4 border-t border-gray-100 flex gap-3">
                            {selectedTransaction.paystackReference && (
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => window.open(`https://dashboard.paystack.com/#/transactions/${selectedTransaction.paystackReference}`, '_blank')}
                                >
                                    <ExternalLink size={16} className="mr-2" />
                                    View in Paystack
                                </Button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <DollarSign size={28} className="text-gray-300" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Transaction</h3>
                        <p className="text-sm text-gray-500 text-center max-w-sm">
                            Choose a transaction from the list to view its details, status, and related information.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EscrowManager;
