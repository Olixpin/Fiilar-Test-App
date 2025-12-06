import React, { useState } from 'react';
import {
    Search,
    X,
    Filter,
    Receipt,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';

interface FinancialsTransactionsProps {
    transactions: any[]; // Replace with proper type
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    txFilter: 'all' | 'payments' | 'payouts' | 'refunds';
    setTxFilter: (filter: 'all' | 'payments' | 'payouts' | 'refunds') => void;
    TxRow: React.ElementType;
}

const EmptyState = ({ icon: Icon, title, description, action }: {
    icon: React.ElementType;
    title: string;
    description: string;
    action?: { label: string; onClick: () => void };
}) => (
    <div className="text-center py-16 px-4">
        <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6">
            {/* Animated rings */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-brand-100 to-brand-200 animate-pulse" />
            <div className="absolute inset-2 rounded-full bg-white" />
            <Icon className="relative h-8 w-8 text-brand-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">{description}</p>
        {action && (
            <button
                onClick={action.onClick}
                className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors"
            >
                {action.label}
                <ArrowRight className="h-4 w-4" />
            </button>
        )}
    </div>
);

import { ArrowRight } from 'lucide-react';

export function FinancialsTransactions({
    transactions,
    searchTerm,
    setSearchTerm,
    txFilter,
    setTxFilter,
    TxRow,
}: FinancialsTransactionsProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Reset page when filters change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, txFilter]);

    const totalPages = Math.ceil(transactions.length / itemsPerPage);
    const paginatedTransactions = transactions.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="space-y-6">
            {/* Header with stats */}
            <div className="bg-gradient-to-r from-brand-500/90 to-brand-700/90 backdrop-blur-xl rounded-2xl p-6 text-white shadow-lg shadow-brand-500/20">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold">Transaction Ledger</h2>
                        <p className="text-brand-100 mt-1">Complete history of all financial movements</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="px-4 py-2 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                            <p className="text-2xl font-bold">{transactions.length}</p>
                            <p className="text-xs text-brand-100">Total</p>
                        </div>
                        <div className="px-4 py-2 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                            <p className="text-2xl font-bold">{transactions.filter(t => t.type === 'GUEST_PAYMENT').length}</p>
                            <p className="text-xs text-brand-100">Payments</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by ID, reference, listing, or name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-12 py-3.5 text-sm bg-white/60 backdrop-blur-md border border-white/50 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 shadow-sm transition-all"
                    />
                    {searchTerm && (
                        <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors" aria-label="Clear search" title="Clear">
                            <X className="h-4 w-4 text-gray-400" />
                        </button>
                    )}
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
                    {(['all', 'payments', 'payouts', 'refunds'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setTxFilter(f)}
                            className={`px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 whitespace-nowrap ${txFilter === f
                                ? 'bg-gray-900 text-white shadow-lg'
                                : 'bg-white/60 backdrop-blur-md text-gray-600 border border-white/50 hover:bg-white hover:border-white/80'
                                }`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Transaction List */}
            <div className="backdrop-blur-xl bg-white/60 rounded-2xl border border-white/50 shadow-sm overflow-hidden">
                {transactions.length === 0 ? (
                    <EmptyState
                        icon={Receipt}
                        title="No transactions found"
                        description={searchTerm ? "Try adjusting your search or filters" : "Transactions will appear here when bookings are made"}
                        action={searchTerm ? { label: 'Clear search', onClick: () => setSearchTerm('') } : undefined}
                    />
                ) : (
                    <div>
                        <div className="px-6 py-4 bg-white/30 border-b border-gray-100/50 flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-600">
                                {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
                            </span>
                            <button className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
                                <Filter className="h-4 w-4" />
                                More filters
                            </button>
                        </div>

                        {paginatedTransactions.map(tx => <TxRow key={tx.id} tx={tx} />)}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="px-6 py-4 border-t border-gray-100/50 flex items-center justify-between bg-white/30">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg hover:bg-white/50 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                                    aria-label="Previous page"
                                    title="Previous page"
                                >
                                    <ChevronLeft className="h-5 w-5 text-gray-600" />
                                </button>
                                <span className="text-sm font-medium text-gray-600">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-lg hover:bg-white/50 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                                    aria-label="Next page"
                                    title="Next page"
                                >
                                    <ChevronRight className="h-5 w-5 text-gray-600" />
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
