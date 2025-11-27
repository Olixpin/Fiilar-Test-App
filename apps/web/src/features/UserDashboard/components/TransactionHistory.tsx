import React, { useState, useEffect } from 'react';
import { paymentService } from '@fiilar/escrow';
import { Transaction } from '@fiilar/types';
import { Download, Filter, TrendingUp, TrendingDown, DollarSign, FileText, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useLocale } from '@fiilar/ui';

interface TransactionHistoryProps {
    refreshTrigger?: number;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({ refreshTrigger }) => {
    const { locale } = useLocale();
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
        const headers = ['Date', 'Description', 'Type', 'Amount', 'Status'];
        const rows = filteredTransactions.map(tx => [
            new Date(tx.date).toLocaleDateString(),
            tx.description,
            tx.type,
            tx.amount,
            tx.status
        ]);
        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    const downloadInvoice = (tx: Transaction) => {
        // Create a simple print-friendly invoice window
        const invoiceWindow = window.open('', '_blank');
        if (invoiceWindow) {
            invoiceWindow.document.write(`
                <html>
                <head>
                    <title>Invoice - ${tx.id}</title>
                    <style>
                        body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; max-width: 800px; mx-auto; }
                        .header { display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 1px solid #eee; padding-bottom: 20px; }
                        .logo { font-weight: bold; font-size: 24px; color: #333; }
                        .invoice-title { font-size: 32px; font-weight: bold; color: #111; }
                        .details { margin-bottom: 40px; }
                        .row { display: flex; justify-content: space-between; margin-bottom: 10px; }
                        .label { color: #666; }
                        .amount { font-size: 24px; font-weight: bold; color: #111; }
                        .status { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
                        .COMPLETED { background: #dcfce7; color: #166534; }
                        .PENDING { background: #fef9c3; color: #854d0e; }
                        .FAILED { background: #fee2e2; color: #991b1b; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="logo">Fiilar</div>
                        <div style="text-align: right;">
                            <div>Date: ${new Date(tx.date).toLocaleDateString()}</div>
                            <div>Ref: ${tx.id}</div>
                        </div>
                    </div>
                    <h1 class="invoice-title">Transaction Receipt</h1>
                    <div class="details">
                        <div class="row">
                            <span class="label">Description</span>
                            <span>${tx.description}</span>
                        </div>
                        <div class="row">
                            <span class="label">Type</span>
                            <span>${tx.type}</span>
                        </div>
                        <div class="row">
                            <span class="label">Status</span>
                            <span class="status ${tx.status}">${tx.status}</span>
                        </div>
                    </div>
                    <div class="row" style="border-top: 2px solid #eee; padding-top: 20px;">
                        <span class="label">Total Amount</span>
                        <span class="amount">${locale.currencySymbol}${tx.amount.toLocaleString()}</span>
                    </div>
                    <script>window.print();</script>
                </body>
                </html>
            `);
            invoiceWindow.document.close();
        }
    };

    const filteredTransactions = filter === 'ALL'
        ? transactions
        : transactions.filter(tx => tx.type === filter);

    const insights = {
        totalSpent: transactions.filter(tx => tx.type === 'PAYMENT' && tx.status === 'COMPLETED').reduce((sum, tx) => sum + tx.amount, 0),
        totalDeposited: transactions.filter(tx => tx.type === 'DEPOSIT' && tx.status === 'COMPLETED').reduce((sum, tx) => sum + tx.amount, 0),
        totalRefunded: transactions.filter(tx => tx.type === 'REFUND' && tx.status === 'COMPLETED').reduce((sum, tx) => sum + tx.amount, 0),
    };

    const chartData = [
        { name: 'Spent', value: insights.totalSpent, color: '#ef4444' },
        { name: 'Deposited', value: insights.totalDeposited, color: '#22c55e' },
        { name: 'Refunded', value: insights.totalRefunded, color: '#3b82f6' },
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
                    <DollarSign className="h-6 w-6 text-gray-400" />
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
                        <p className="text-lg font-bold text-red-900">{locale.currencySymbol}{insights.totalSpent.toLocaleString()}</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 text-green-600 mb-1">
                            <TrendingUp size={16} />
                            <span className="text-xs font-medium">Added</span>
                        </div>
                        <p className="text-lg font-bold text-green-900">{locale.currencySymbol}{insights.totalDeposited.toLocaleString()}</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 text-blue-600 mb-1">
                            <DollarSign size={16} />
                            <span className="text-xs font-medium">Refunded</span>
                        </div>
                        <p className="text-lg font-bold text-blue-900">{locale.currencySymbol}{insights.totalRefunded.toLocaleString()}</p>
                    </div>
                </div>
                {chartData.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4 w-full min-w-0">
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label>
                                    {chartData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                                </Pie>
                                <Tooltip formatter={(value: number) => `${locale.currencySymbol}${value.toLocaleString()}`} />
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
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                    <div className="text-gray-400 mr-1 shrink-0">
                        <Filter size={16} />
                    </div>
                    <button
                        onClick={() => setFilter('ALL')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${filter === 'ALL' ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter('DEPOSIT')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${filter === 'DEPOSIT' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        Deposits
                    </button>
                    <button
                        onClick={() => setFilter('PAYMENT')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${filter === 'PAYMENT' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        Payments
                    </button>
                    <button
                        onClick={() => setFilter('REFUND')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${filter === 'REFUND' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        Refunds
                    </button>
                </div>
                <div className="flex items-center gap-2 shrink-0">
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
                                    <TrendingUp className="h-5 w-5" />
                                )}
                                {tx.type === 'PAYMENT' && (
                                    <TrendingDown className="h-5 w-5" />
                                )}
                                {tx.type === 'REFUND' && (
                                    <DollarSign className="h-5 w-5" />
                                )}
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">{tx.description}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <p className="text-xs text-gray-500 font-medium">
                                        {new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </p>
                                    {tx.status === 'PENDING' && (
                                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-yellow-100 text-yellow-700">
                                            <Clock size={10} /> Pending
                                        </span>
                                    )}
                                    {tx.status === 'FAILED' && (
                                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">
                                            <AlertCircle size={10} /> Failed
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <div className={`font-bold ${tx.type === 'DEPOSIT' || tx.type === 'REFUND' ? 'text-green-600' : 'text-gray-900'
                                }`}>
                                {tx.type === 'DEPOSIT' || tx.type === 'REFUND' ? '+' : '-'}{locale.currencySymbol}{tx.amount.toLocaleString()}
                            </div>
                            <button
                                onClick={() => downloadInvoice(tx)}
                                className="text-[10px] text-gray-400 hover:text-brand-600 flex items-center gap-1 transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <FileText size={10} /> Receipt
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
