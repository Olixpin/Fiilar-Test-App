import React, { useState } from 'react';
import { getCurrentUser, updateUserWalletBalance } from '@fiilar/storage';
import { DollarSign } from 'lucide-react';

const FixWallet: React.FC = () => {
    const [amount, setAmount] = useState('8199.78');
    const [message, setMessage] = useState('');

    const handleFix = () => {
        const user = getCurrentUser();
        if (!user) {
            setMessage('No user logged in');
            return;
        }

        const amountNum = parseFloat(amount);
        if (isNaN(amountNum)) {
            setMessage('Invalid amount');
            return;
        }

        updateUserWalletBalance(user.id, amountNum);
        setMessage(`Added ₦${amountNum} to wallet. Refresh the page to see changes.`);

        setTimeout(() => {
            window.location.reload();
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <DollarSign className="text-green-600" size={24} />
                    </div>
                    <h1 className="text-2xl font-bold">Fix Wallet Balance</h1>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Amount to Add</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-brand-500 outline-none"
                            placeholder="8199.78"
                        />
                    </div>

                    <button
                        onClick={handleFix}
                        className="w-full bg-brand-600 text-white py-3 rounded-lg font-semibold hover:bg-brand-700 transition"
                    >
                        Add to Wallet
                    </button>

                    {message && (
                        <div className="bg-green-50 border border-green-200 text-green-800 p-3 rounded-lg text-sm">
                            {message}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FixWallet;
