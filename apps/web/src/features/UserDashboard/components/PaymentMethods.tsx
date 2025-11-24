import React, { useState, useEffect } from 'react';
import { paymentService } from '../../../services/paymentService';
import { PaymentMethod } from '@fiilar/types';

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

            await paymentService.addPaymentMethod({
                last4,
                brand: 'Visa', // Mock brand
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

    if (loading) return <div className="h-32 bg-gray-100 rounded-lg animate-pulse"></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Saved Cards</h3>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="text-sm text-indigo-600 font-medium hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                    {showAddForm ? 'Cancel' : '+ Add New'}
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
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
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
                            <div className="bg-indigo-50 p-3 rounded-lg text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
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
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
