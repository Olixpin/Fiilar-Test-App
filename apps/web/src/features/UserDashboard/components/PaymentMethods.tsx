import React, { useState, useEffect } from 'react';
import { paymentService } from '@fiilar/escrow';
import { PaymentMethod } from '@fiilar/types';
import { CreditCard, Trash2, Plus } from 'lucide-react';

export const PaymentMethods: React.FC = () => {
    const [methods, setMethods] = useState<PaymentMethod[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);

    // Form State
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [adding, setAdding] = useState(false);

    const fetchMethods = async () => {
        try {
            const data = await paymentService.getPaymentMethods();
            setMethods(data);
        } catch (error) {
            console.error('Failed to fetch payment methods', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMethods();
    }, []);

    const handleAddCard = async (e: React.FormEvent) => {
        e.preventDefault();
        setAdding(true);

        try {
            // Simulate card processing
            const last4 = cardNumber.slice(-4) || '4242';
            const [month, year] = expiry.split('/').map(Number);

            // Simple brand detection simulation
            let brand = 'Visa';
            if (cardNumber.startsWith('5')) brand = 'MasterCard';
            if (cardNumber.startsWith('3')) brand = 'Amex';

            await paymentService.addPaymentMethod({
                last4,
                brand,
                expiryMonth: month || 12,
                expiryYear: year || 2025
            });

            await fetchMethods();
            setShowAddForm(false);
            setCardNumber('');
            setExpiry('');
            setCvv('');
        } catch (error) {
            console.error('Failed to add card', error);
        } finally {
            setAdding(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to remove this card?')) return;
        try {
            await paymentService.deletePaymentMethod(id);
            await fetchMethods();
        } catch (error) {
            console.error('Failed to delete card', error);
        }
    };

    const getBrandVisual = (brand: string) => {
        const b = brand.toLowerCase();
        if (b.includes('visa')) {
            return (
                <div className="w-10 h-7 bg-blue-900 rounded flex items-center justify-center text-[10px] font-bold text-white italic tracking-tighter">
                    VISA
                </div>
            );
        }
        if (b.includes('master')) {
            return (
                <div className="w-10 h-7 bg-gray-800 rounded flex items-center justify-center relative overflow-hidden">
                    <div className="w-4 h-4 rounded-full bg-red-500/90 absolute left-1.5"></div>
                    <div className="w-4 h-4 rounded-full bg-yellow-500/90 absolute right-1.5"></div>
                </div>
            );
        }
        if (b.includes('amex')) {
            return (
                <div className="w-10 h-7 bg-blue-400 rounded flex items-center justify-center text-[8px] font-bold text-white tracking-tighter border border-blue-300">
                    AMEX
                </div>
            );
        }
        return (
            <div className="w-10 h-7 bg-gray-200 rounded flex items-center justify-center text-gray-500">
                <CreditCard size={16} />
            </div>
        );
    };

    if (loading) return <div className="h-32 bg-gray-100 rounded-lg animate-pulse"></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Saved Cards</h3>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="text-sm text-indigo-600 font-medium hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                >
                    {showAddForm ? 'Cancel' : <><Plus size={14} /> Add New</>}
                </button>
            </div>

            {showAddForm && (
                <form onSubmit={handleAddCard} className="bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">Card Number</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={cardNumber}
                                onChange={(e) => setCardNumber(e.target.value)}
                                placeholder="0000 0000 0000 0000"
                                className="w-full pl-10 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                maxLength={19}
                                required
                            />
                            <CreditCard className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">Expiry (MM/YY)</label>
                            <input
                                type="text"
                                value={expiry}
                                onChange={(e) => setExpiry(e.target.value)}
                                placeholder="MM/YY"
                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                maxLength={5}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">CVV</label>
                            <input
                                type="text"
                                value={cvv}
                                onChange={(e) => setCvv(e.target.value)}
                                placeholder="123"
                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                maxLength={3}
                                required
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={adding}
                        className="w-full bg-gray-900 text-white py-2.5 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 transition-all shadow-lg shadow-gray-200"
                    >
                        {adding ? 'Adding Card...' : 'Save Card'}
                    </button>
                </form>
            )}

            <div className="space-y-3">
                {methods.length === 0 && !showAddForm && (
                    <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <p className="text-gray-500 text-sm">No payment methods saved yet.</p>
                    </div>
                )}

                {methods.map((method) => (
                    <div key={method.id} className="group flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all hover:border-indigo-100">
                        <div className="flex items-center gap-4">
                            <div className="p-1">
                                {getBrandVisual(method.brand)}
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 flex items-center gap-2">
                                    {method.brand}
                                    <span className="text-gray-400 font-normal">•••• {method.last4}</span>
                                </p>
                                <p className="text-xs text-gray-500 font-medium">Expires {method.expiryMonth}/{method.expiryYear}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => handleDelete(method.id)}
                            className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                            title="Remove card"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
