import React, { useState, useEffect } from 'react';
import { paymentService } from '../services/paymentService';
import { Transaction } from '../types';
import { ArrowDownToLine } from 'lucide-react';

interface WalletCardProps {
    onTransactionComplete?: (transaction: Transaction) => void;
}

export const WalletCard: React.FC<WalletCardProps> = ({ onTransactionComplete }) => {
    const [balance, setBalance] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [addingFunds, setAddingFunds] = useState(false);
    const [withdrawing, setWithdrawing] = useState(false);
    const [amount, setAmount] = useState<string>('');
    const [withdrawAmount, setWithdrawAmount] = useState<string>('');
    const [showWithdraw, setShowWithdraw] = useState(false);

    const fetchBalance = async () => {
        try {
            const bal = await paymentService.getWalletBalance();
            setBalance(bal);
        } catch (error) {
            console.error('Failed to fetch balance', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBalance();
    }, []);

    const handleAddFunds = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || isNaN(Number(amount))) return;

        setAddingFunds(true);
        try {
            const tx = await paymentService.addFunds(Number(amount), 'mock_pm_id');
            setBalance(prev => prev + Number(amount));
            setAmount('');
            if (onTransactionComplete) onTransactionComplete(tx);
            alert('Funds added successfully!');
        } catch (error) {
            console.error('Failed to add funds', error);
            alert('Failed to add funds');
        } finally {
            setAddingFunds(false);
        }
    };

    const handleWithdraw = async (e: React.FormEvent) => {
        e.preventDefault();
        const amt = Number(withdrawAmount);
        if (!withdrawAmount || isNaN(amt) || amt > balance) {
            alert('Invalid amount or insufficient balance');
            return;
        }

        setWithdrawing(true);
        try {
            await paymentService.withdrawFunds(amt);
            setBalance(prev => prev - amt);
            setWithdrawAmount('');
            setShowWithdraw(false);
            alert('Withdrawal initiated! Funds will arrive in 1-3 business days.');
        } catch (error) {
            console.error('Failed to withdraw', error);
            alert('Failed to process withdrawal');
        } finally {
            setWithdrawing(false);
        }
    };

    if (loading) {
        return <div className="p-6 bg-white rounded-xl shadow-sm animate-pulse h-48"></div>;
    }

    return (
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl shadow-2xl text-white p-8 relative overflow-hidden group transition-transform hover:scale-[1.01] duration-300">
            {/* Abstract Card Patterns */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full translate-y-1/2 -translate-x-1/3 blur-3xl"></div>

            <div className="relative z-10 flex flex-col justify-between h-full min-h-[220px]">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-gray-400 text-sm font-medium mb-1 tracking-wider uppercase">Total Balance</p>
                        <h2 className="text-4xl font-bold tracking-tight">₦{balance.toLocaleString()}</h2>
                    </div>
                    <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-md border border-white/10 shadow-inner">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                    </div>
                </div>

                <div className="mt-8 space-y-3">
                    {!showWithdraw ? (
                        <form onSubmit={handleAddFunds} className="relative">
                            <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider font-semibold">Quick Top Up</label>
                            <div className="flex gap-2">
                                <div className="relative flex-1 group-focus-within:ring-2 ring-indigo-500/50 rounded-xl transition-all">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₦</span>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="Enter amount"
                                        className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:bg-white/20 transition-all"
                                        min="100"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={addingFunds || !amount}
                                    className="bg-white text-gray-900 px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-lg shadow-white/10"
                                >
                                    {addingFunds ? (
                                        <div className="w-5 h-5 border-2 border-gray-900/30 border-t-gray-900 rounded-full animate-spin" />
                                    ) : (
                                        'Top Up'
                                    )}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleWithdraw} className="relative">
                            <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider font-semibold">Withdraw to Bank</label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₦</span>
                                    <input
                                        type="number"
                                        value={withdrawAmount}
                                        onChange={(e) => setWithdrawAmount(e.target.value)}
                                        placeholder="Enter amount"
                                        className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:bg-white/20 transition-all"
                                        min="100"
                                        max={balance}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={withdrawing || !withdrawAmount}
                                    className="bg-white text-gray-900 px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-lg shadow-white/10"
                                >
                                    {withdrawing ? (
                                        <div className="w-5 h-5 border-2 border-gray-900/30 border-t-gray-900 rounded-full animate-spin" />
                                    ) : (
                                        'Withdraw'
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                    <button
                        onClick={() => setShowWithdraw(!showWithdraw)}
                        className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                    >
                        <ArrowDownToLine size={12} />
                        {showWithdraw ? 'Back to Top Up' : 'Withdraw to Bank'}
                    </button>
                </div>
            </div>
        </div>
    );
};
