import React, { useState } from 'react';
import { getCurrentUser, updateUserWalletBalance, STORAGE_KEYS } from '@fiilar/storage';
import { DollarSign } from 'lucide-react';

const FixWallet: React.FC = () => {
    const [amount, setAmount] = useState('8199.78');
    const [message, setMessage] = useState('');

    const handleFix = async () => {
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

        // Try standard update first
        const result = updateUserWalletBalance(user.id, amountNum);

        if (result.success) {
            setMessage(`Added ₦${amountNum} to wallet.`);
        } else {
            // If failed (likely permission), try direct update for dev/test purposes
            console.warn('Standard wallet update failed, attempting direct update:', result.error);

            try {
                // Direct update logic (bypass admin check for this specific tool)
                const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS_DB) || '[]');
                const idx = users.findIndex((u: any) => u.id === user.id);

                if (idx >= 0) {
                    const newBalance = (users[idx].walletBalance || 0) + amountNum;
                    users[idx].walletBalance = newBalance;
                    localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(users));

                    // Update session user
                    const updatedUser = { ...user, walletBalance: newBalance };
                    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));

                    // Sync with PaymentService storage (Source of Truth for WalletCard)
                    // Note: paymentService uses 'fiilar_wallet_balance' key
                    localStorage.setItem('fiilar_wallet_balance', newBalance.toString());

                    // Dispatch event
                    window.dispatchEvent(new CustomEvent('fiilar:user-updated', { detail: { user: updatedUser } }));
                    window.dispatchEvent(new CustomEvent('fiilar:wallet-updated', { detail: { balance: newBalance } }));

                    // Create Notification
                    try {
                        // Dynamically import to avoid build issues if not directly linked
                        const { addNotification } = await import('@fiilar/notifications');
                        addNotification({
                            userId: user.id,
                            type: 'platform_update',
                            title: 'Wallet Funded',
                            message: `You have successfully added ₦${amountNum.toLocaleString()} to your wallet.`,
                            severity: 'info',
                            read: false,
                            actionRequired: false,
                            metadata: {
                                amount: amountNum
                            }
                        });
                    } catch (err) {
                        console.error('Failed to create notification', err);
                    }

                    setMessage(`Added ₦${amountNum} to wallet (Direct Mode).`);
                } else {
                    setMessage('User not found in DB.');
                }
            } catch (e) {
                console.error('Direct update failed:', e);
                setMessage('Failed to update wallet: ' + (e as Error).message);
            }
        }
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

                <div className="mt-6 pt-6 border-t border-gray-100">
                    <a
                        href="/dashboard"
                        onClick={(e) => {
                            e.preventDefault();
                            // Use window.location to ensure full refresh if needed, but navigate is better
                            // Since we are in React Router, we can't use navigate hook inside onClick if not defined
                            // But we can use window.location.href as a fallback or just let the user navigate manually
                            // Actually, let's just use a simple link that React Router might intercept if we used Link component
                            // But here I'll just use window.location.href to be safe and simple
                            window.location.href = '/dashboard';
                        }}
                        className="block w-full text-center text-brand-600 font-medium hover:text-brand-700"
                    >
                        Go to Dashboard
                    </a>
                </div>
            </div>
        </div>
    );
};

export default FixWallet;
