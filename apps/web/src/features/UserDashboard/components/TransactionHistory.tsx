import React, { useState, useEffect } from 'react';
import { paymentService } from '../../../services/paymentService';
import { Transaction } from '@fiilar/types';
import { Download, Filter, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface TransactionHistoryProps {
    refreshTrigger?: number;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({ refreshTrigger }) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'ALL' | 'DEPOSIT' | 'PAYMENT' | 'REFUND'>('ALL');
    const [showInsights, setShowInsights] = useState(false);
    const [showAll, setShowAll] = useState(false);

    const fetchTransactions = async () => {
        try {
            const txs = await paymentService.getTransactions();
            setTransactions(txs);
        } catch (error) {
            console.error('Failed to fetch transactions', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [refreshTrigger]);

    const exportToCSV = () => {
        const headers = ['Date', 'Description', 'Type', 'Amount'];
        const rows = filteredTransactions.map(tx => [
            new Date(tx.date).toLocaleDateString(),
            tx.description,
            tx.type,
            tx.amount
        ]);
        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    const filteredTransactions = filter === 'ALL' 
        ? transactions 
        : transactions.filter(tx => tx.type === filter);

    const insights = {
        totalSpent: transactions.filter(tx => tx.type === 'PAYMENT').reduce((sum, tx) => sum + tx.amount, 0),
        totalDeposited: transactions.filter(tx => tx.type === 'DEPOSIT').reduce((sum, tx) => sum + tx.amount, 0),
        totalRefunded: transactions.filter(tx => tx.type === 'REFUND').reduce((sum, tx) => sum + tx.amount, 0),
    };

    const chartData = [
        { name: 'Spent', value: insights.totalSpent, color: 'var(--color-danger)' },
        { name: 'Deposited', value: insights.totalDeposited, color: 'var(--color-success)' },
        { name: 'Refunded', value: insights.totalRefunded, color: 'var(--color-info)' },
    ].filter(d => d.value > 0);

    if (loading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse"></div>
                ))}
            </div>
        );
    }

    if (transactions.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                </div>
                <p className="text-gray-500 font-medium">No transactions yet</p>
                <p className="text-xs text-gray-400 mt-1">Your recent activity will show up here</p>
            </div>
        );
    }

    if (showInsights) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Spending Insights</h3>
                    <button onClick={() => setShowInsights(false)} className="text-sm text-brand-600 hover:text-brand-700">Back</button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-red-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 text-red-600 mb-1">
                            <TrendingDown size={16} />
                            <span className="text-xs font-medium">Spent</span>
                        </div>
                        <p className="text-lg font-bold text-red-900">₦{insights.totalSpent.toLocaleString()}</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 text-green-600 mb-1">
                            <TrendingUp size={16} />
                            <span className="text-xs font-medium">Added</span>
                        </div>
                        <p className="text-lg font-bold text-green-900">₦{insights.totalDeposited.toLocaleString()}</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 text-blue-600 mb-1">
                            <DollarSign size={16} />
                            <span className="text-xs font-medium">Refunded</span>
                        </div>
                        <p className="text-lg font-bold text-blue-900">₦{insights.totalRefunded.toLocaleString()}</p>
                    </div>
                </div>
                {chartData.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4 w-full min-w-0">
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label>
                                    {chartData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                                </Pie>
                                <Tooltip formatter={(value: number) => `₦${value.toLocaleString()}`} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        );
    }

    const displayTransactions = showAll ? filteredTransactions : filteredTransactions.slice(0, 5);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Transaction History</h2>
                {filteredTransactions.length > 5 && (
                    <button 
                        onClick={() => setShowAll(!showAll)} 
                        className="text-sm text-brand-600 font-medium hover:text-brand-700"
                    >
                        {showAll ? 'Show Less' : `View All (${filteredTransactions.length})`}
                    </button>
                )}
            </div>
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <div className="text-gray-400 mr-1">
                        <Filter size={16} />
                    </div>
                    <button
                        onClick={() => setFilter('ALL')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === 'ALL' ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter('DEPOSIT')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === 'DEPOSIT' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        Deposits
                    </button>
                    <button
                        onClick={() => setFilter('PAYMENT')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === 'PAYMENT' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        Payments
                    </button>
                    <button
                        onClick={() => setFilter('REFUND')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === 'REFUND' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        Refunds
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setShowInsights(true)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="View Insights">
                        <TrendingUp size={16} className="text-gray-600" />
                    </button>
                    <button onClick={exportToCSV} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Export CSV">
                        <Download size={16} className="text-gray-600" />
                    </button>
                </div>
            </div>
            <div className="space-y-0 divide-y divide-gray-100">
                {displayTransactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between py-4 group hover:bg-gray-50/50 transition-colors rounded-lg px-2 -mx-2">
                        <div className="flex items-center gap-4">
                            <div className={`p-2.5 rounded-full ${tx.type === 'DEPOSIT' ? 'bg-green-100 text-green-600' :
                                tx.type === 'REFUND' ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'
                                }`}>
                                {tx.type === 'DEPOSIT' && (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                                    </svg>
                                )}
                                {tx.type === 'PAYMENT' && (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                                {tx.type === 'REFUND' && (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">{tx.description}</p>
                                <p className="text-xs text-gray-500 font-medium mt-0.5">
                                    {new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    <span className="mx-1">•</span>
                                    {new Date(tx.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                        <div className={`text-right font-bold ${tx.type === 'DEPOSIT' || tx.type === 'REFUND' ? 'text-green-600' : 'text-gray-900'
                            }`}>
                            {tx.type === 'DEPOSIT' || tx.type === 'REFUND' ? '+' : '-'}₦{tx.amount.toLocaleString()}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
