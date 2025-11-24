import React from 'react';
import { EscrowTransaction } from '@fiilar/types';
import { Clock, ArrowUpRight, ArrowDownLeft, DollarSign, FileText } from 'lucide-react';
import { useLocale } from '../../../contexts/LocaleContext';

interface TransactionHistoryProps {
    transactions: EscrowTransaction[];
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions }) => {
    const { locale } = useLocale();

    if (transactions.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <FileText size={32} className="mx-auto mb-2 opacity-50" />
                <p>No transactions found for this booking.</p>
            </div>
        );
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'GUEST_PAYMENT': return <ArrowDownLeft size={16} className="text-green-600" />;
            case 'HOST_PAYOUT': return <ArrowUpRight size={16} className="text-blue-600" />;
            case 'REFUND': return <ArrowUpRight size={16} className="text-orange-600" />;
            case 'SERVICE_FEE': return <DollarSign size={16} className="text-gray-600" />;
            default: return <Clock size={16} className="text-gray-400" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'bg-green-100 text-green-700';
            case 'PENDING': return 'bg-yellow-100 text-yellow-700';
            case 'FAILED': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                    <tr>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3">Amount</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Ref</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                    {transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                                {new Date(tx.timestamp).toLocaleDateString()} <span className="text-xs text-gray-400">{new Date(tx.timestamp).toLocaleTimeString()}</span>
                            </td>
                            <td className="px-4 py-3 font-medium text-gray-900 flex items-center gap-2">
                                <div className={`p-1.5 rounded-full bg-gray-100`}>
                                    {getIcon(tx.type)}
                                </div>
                                {tx.type.replace('_', ' ')}
                            </td>
                            <td className={`px-4 py-3 font-bold ${tx.type === 'REFUND' || tx.type === 'HOST_PAYOUT' ? 'text-red-600' : 'text-green-600'}`}>
                                {tx.type === 'REFUND' || tx.type === 'HOST_PAYOUT' ? '-' : '+'}{locale.currencySymbol}{tx.amount.toFixed(2)}
                            </td>
                            <td className="px-4 py-3">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${getStatusColor(tx.status)}`}>
                                    {tx.status}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-xs font-mono text-gray-400">
                                {tx.id.slice(0, 8)}...
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TransactionHistory;
