import React, { useState, useEffect } from 'react';
import { useToast } from '@fiilar/ui';
import { Booking, Listing } from '@fiilar/types';
import { X, Calendar, Clock, AlertCircle, CheckCircle, DollarSign, Trash2, Plus } from 'lucide-react';
import { updateBooking, getBookings, deleteBooking, createBooking, setModificationAllowed, updateUserWalletBalance } from '@fiilar/storage';
import { paymentService, escrowService } from '@fiilar/escrow';
import { Button } from '@fiilar/ui';

interface ModifyBookingModalProps {
    booking: Booking;
    listing: Listing;
    onClose: () => void;
    onSuccess: () => void;
}

const ModifyBookingModal: React.FC<ModifyBookingModalProps> = ({ booking, listing, onClose, onSuccess }) => {
    const toast = useToast();
    // Mode: Single or Recurring
    const isRecurring = !!booking.groupId;

    // Single Booking State
    const [date, setDate] = useState(new Date(booking.date).toISOString().split('T')[0]);
    const [startTime, setStartTime] = useState(booking.hours ? booking.hours[0] : 9);
    const [endTime, setEndTime] = useState(booking.hours ? booking.hours[booking.hours.length - 1] + 1 : 17);

    // Recurring Booking State
    const [groupBookings, setGroupBookings] = useState<Booking[]>([]);
    const [pendingRemovals, setPendingRemovals] = useState<string[]>([]);
    const [pendingAdditions, setPendingAdditions] = useState<string[]>([]); // Array of date strings
    const [newDateInput, setNewDateInput] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Price Calculation State
    const [newTotalPrice, setNewTotalPrice] = useState(booking.totalPrice);
    const [priceDifference, setPriceDifference] = useState(0);

    // Initialize Recurring Data
    useEffect(() => {
        if (isRecurring && booking.groupId) {
            const allBookings = getBookings();
            const group = allBookings.filter(b => b.groupId === booking.groupId);
            setGroupBookings(group.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
        }
    }, [isRecurring, booking.groupId]);

    // Calculate Price (Single)
    useEffect(() => {
        if (isRecurring) return;

        const duration = endTime - startTime;
        if (duration <= 0) {
            setNewTotalPrice(0);
            setPriceDifference(0);
            return;
        }

        const pricePerHour = listing.price || (booking.totalPrice / booking.duration);
        const calculatedPrice = duration * pricePerHour;
        setNewTotalPrice(calculatedPrice);
        setPriceDifference(calculatedPrice - booking.totalPrice);
    }, [startTime, endTime, listing.price, booking.totalPrice, booking.duration, isRecurring]);

    // Calculate Price (Recurring)
    useEffect(() => {
        if (!isRecurring) return;

        // Calculate total of current active bookings (original - removed)
        const activeOriginalBookings = groupBookings.filter(b => !pendingRemovals.includes(b.id));
        const currentTotal = activeOriginalBookings.reduce((sum, b) => sum + b.totalPrice, 0);

        // Calculate cost of additions
        // Assuming same duration/hours as the original booking
        const pricePerBooking = booking.totalPrice; // Or calculate from hours
        const additionsTotal = pendingAdditions.length * pricePerBooking;

        const finalTotal = currentTotal + additionsTotal;
        const originalGroupTotal = groupBookings.reduce((sum, b) => sum + b.totalPrice, 0);

        setNewTotalPrice(finalTotal);
        setPriceDifference(finalTotal - originalGroupTotal);
    }, [groupBookings, pendingRemovals, pendingAdditions, isRecurring, booking.totalPrice]);

    const handleAddDate = () => {
        if (!newDateInput) return;
        // Check if date already exists in group or pending additions
        const exists = groupBookings.some(b => new Date(b.date).toISOString().split('T')[0] === newDateInput && !pendingRemovals.includes(b.id))
            || pendingAdditions.includes(newDateInput);

        if (exists) {
            toast.showToast({ message: 'This date is already in your booking list.', type: 'info' });
            return;
        }

        setPendingAdditions([...pendingAdditions, newDateInput]);
        setNewDateInput('');
    };

    const handleRemoveDate = (bookingId: string) => {
        setPendingRemovals([...pendingRemovals, bookingId]);
    };

    const handleUndoRemove = (bookingId: string) => {
        setPendingRemovals(pendingRemovals.filter(id => id !== bookingId));
    };

    const handleRemovePendingDate = (dateStr: string) => {
        setPendingAdditions(pendingAdditions.filter(d => d !== dateStr));
    };

    const handleUpdate = async () => {
        setIsSubmitting(true);

        try {
            // Handle Payment / Refund
            // Handle Payment / Refund
            if (priceDifference > 0) {
                // Charge the difference
                // For this demo, we'll try to charge the wallet first
                try {
                    await paymentService.processPayment(priceDifference, 'WALLET');
                    console.log(`Processed additional payment of $${priceDifference}`);

                    // RECORD IN ESCROW: Additional Payment
                    // We need to create a mock booking object representing just this addition or update the main one?
                    // Ideally, we record a GUEST_PAYMENT for the difference.
                    // We can use a helper or just manually call processGuestPayment with a "dummy" booking or the main one but we need to ensure the amount is correct.
                    // escrowService.processGuestPayment takes a booking and uses booking.totalPrice.
                    // We should probably create a specific transaction record or update processGuestPayment to accept amount.
                    // For now, let's manually create the transaction since processGuestPayment is a bit rigid in the mock.
                    // Actually, let's just use processGuestPayment but we need to be careful about the amount.
                    // The best way for this mock is to manually add the transaction to storage or add a helper to escrowService.
                    // Let's add a helper to escrowService for "Additional Payment" later? 
                    // Or just rely on the fact that we updated the booking totalPrice and maybe that's enough? 
                    // No, we need a transaction record.
                    // Let's use a temporary booking object for the transaction recording.
                    const tempBookingForTx = { ...booking, totalPrice: priceDifference };
                    await escrowService.processGuestPayment(tempBookingForTx, booking.userId);

                } catch (err) {
                    // If wallet fails (e.g. insufficient funds), we might fallback to card
                    // For now, we'll just log and proceed as if charged to card (mock)
                    console.log('Wallet charge failed, assuming card payment:', err);
                    await paymentService.processPayment(priceDifference, 'CARD', 'mock_card');

                    // Record in Escrow
                    const tempBookingForTx = { ...booking, totalPrice: priceDifference };
                    await escrowService.processGuestPayment(tempBookingForTx, booking.userId);
                }
            } else if (priceDifference < 0) {
                // Refund the difference
                const refundAmount = Math.abs(priceDifference);

                // USE ESCROW SERVICE FOR REFUND
                // This ensures an audit trail (Transaction ID, Type: REFUND) is created.
                await escrowService.processRefund(booking, booking.userId, refundAmount);

                // We also need to actually add the funds back to the user's wallet (which processRefund doesn't do in the mock service yet? Let's check.)
                // Checking escrowService.ts... processRefund just creates the transaction record.
                // So we still need to update the wallet balance.
                // ideally escrowService should handle the "money movement" too, but for now we do both.
                await paymentService.addFunds(refundAmount, 'REFUND');
                updateUserWalletBalance(booking.userId, refundAmount);

                console.log(`Processed refund of $${refundAmount} via Escrow Service`);
            }

            if (isRecurring) {
                // 1. Remove bookings
                pendingRemovals.forEach(id => deleteBooking(id));

                // 2. Add new bookings
                pendingAdditions.forEach(dateStr => {
                    createBooking({
                        ...booking,
                        id: `bk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        date: new Date(dateStr).toISOString(),
                        status: 'Pending'
                    });
                });

            } else {
                // Single Booking Update
                const updatedHours = Array.from({ length: endTime - startTime }, (_, i) => startTime + i);
                const updatedBooking: Booking = {
                    ...booking,
                    date: new Date(date).toISOString(),
                    hours: updatedHours,
                    totalPrice: newTotalPrice,
                    status: 'Pending',
                    modificationAllowed: false
                };
                updateBooking(updatedBooking);
            }

            // Disable modification for all bookings in group
            if (isRecurring && booking.groupId) {
                const allBookings = getBookings();
                allBookings.filter(b => b.groupId === booking.groupId).forEach(b => {
                    setModificationAllowed(b.id, false);
                });
            }

            let message = 'Request updated successfully!';
            if (priceDifference > 0) {
                message += ` An additional charge of $${priceDifference.toFixed(2)} has been processed.`;
            } else if (priceDifference < 0) {
                message += ` A refund of $${Math.abs(priceDifference).toFixed(2)} has been added to your wallet.`;
            }

            toast.showToast({ message: message, type: "info" });
            onSuccess();
            onClose();

        } catch (error) {
            console.error('Failed to update booking:', error);
            toast.showToast({ message: 'Failed to update booking. Please try again.', type: 'info' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Modify Request</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors" title="Close">
                        <X size={24} />
                    </button>
                </div>

                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-6 flex gap-3">
                    <AlertCircle size={20} className="text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-800">
                        {isRecurring
                            ? "For recurring bookings, you can add or remove dates. Time slots remain consistent."
                            : "Changing the date or time will update your pending request. The host will see the new details immediately."
                        }
                    </p>
                </div>

                {isRecurring ? (
                    <div className="space-y-4 mb-6">
                        <h4 className="font-bold text-gray-900">Manage Dates</h4>

                        {/* Existing Bookings List */}
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                            {groupBookings.map(b => {
                                const isRemoved = pendingRemovals.includes(b.id);
                                return (
                                    <div key={b.id} className={`flex justify-between items-center p-3 rounded-lg border ${isRemoved ? 'bg-red-50 border-red-100' : 'bg-white border-gray-200'}`}>
                                        <div className="flex items-center gap-2">
                                            <Calendar size={16} className={isRemoved ? 'text-red-400' : 'text-gray-500'} />
                                            <span className={`text-sm font-medium ${isRemoved ? 'text-red-700 line-through' : 'text-gray-700'}`}>
                                                {new Date(b.date).toLocaleDateString()}
                                            </span>
                                        </div>
                                        {isRemoved ? (
                                            <button onClick={() => handleUndoRemove(b.id)} className="text-xs font-bold text-red-600 hover:underline">
                                                Undo
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleRemoveDate(b.id)}
                                                className="text-gray-400 hover:text-red-600 transition-colors"
                                                title="Remove date"
                                                aria-label="Remove date"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                );
                            })}

                            {/* Pending Additions */}
                            {pendingAdditions.map(dateStr => (
                                <div key={dateStr} className="flex justify-between items-center p-3 rounded-lg border bg-green-50 border-green-100">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={16} className="text-green-600" />
                                        <span className="text-sm font-medium text-green-800">
                                            {new Date(dateStr).toLocaleDateString()} (New)
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => handleRemovePendingDate(dateStr)}
                                        className="text-green-600 hover:text-green-800 transition-colors"
                                        title="Remove pending date"
                                        aria-label="Remove pending date"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Add Date Input */}
                        <div className="flex gap-2 mt-4">
                            <input
                                type="date"
                                className="flex-1 border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                                value={newDateInput}
                                onChange={e => setNewDateInput(e.target.value)}
                                aria-label="Select date to add"
                                title="Select date to add"
                            />
                            <button
                                onClick={handleAddDate}
                                disabled={!newDateInput}
                                className="bg-gray-900 text-white px-4 py-2 rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                title="Add date"
                                aria-label="Add date"
                            >
                                <Plus size={20} />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4 mb-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5" htmlFor="date-input">Date</label>
                            <div className="relative">
                                <input
                                    id="date-input"
                                    type="date"
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow"
                                    value={date}
                                    onChange={e => setDate(e.target.value)}
                                />
                                <Calendar size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5" htmlFor="start-time-select">Start Time</label>
                                <div className="relative">
                                    <select
                                        id="start-time-select"
                                        className="w-full border border-gray-300 rounded-xl px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-brand-500 appearance-none bg-white transition-shadow"
                                        value={startTime}
                                        onChange={e => setStartTime(Number(e.target.value))}
                                    >
                                        {Array.from({ length: 24 }).map((_, i) => (
                                            <option key={i} value={i}>{i % 12 || 12}:00 {i >= 12 ? 'PM' : 'AM'}</option>
                                        ))}
                                    </select>
                                    <Clock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5" htmlFor="end-time-select">End Time</label>
                                <div className="relative">
                                    <select
                                        id="end-time-select"
                                        className="w-full border border-gray-300 rounded-xl px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-brand-500 appearance-none bg-white transition-shadow"
                                        value={endTime}
                                        onChange={e => setEndTime(Number(e.target.value))}
                                    >
                                        {Array.from({ length: 24 }).map((_, i) => (
                                            <option key={i} value={i}>{i % 12 || 12}:00 {i >= 12 ? 'PM' : 'AM'}</option>
                                        ))}
                                    </select>
                                    <Clock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Price Breakdown Section */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Price Update</h4>
                    <div className="flex justify-between items-center mb-2 text-sm">
                        <span className="text-gray-600">Original Price</span>
                        <span className="font-medium text-gray-900">
                            ${(isRecurring ? groupBookings.reduce((sum, b) => sum + b.totalPrice, 0) : booking.totalPrice).toFixed(2)}
                        </span>
                    </div>
                    <div className="flex justify-between items-center mb-3 text-sm">
                        <span className="text-gray-600">New Price</span>
                        <span className="font-medium text-gray-900">${newTotalPrice.toFixed(2)}</span>
                    </div>

                    <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                        <span className="font-bold text-gray-900">Difference</span>
                        <div className={`flex items-center gap-1 font-bold ${priceDifference > 0 ? 'text-red-600' : priceDifference < 0 ? 'text-green-600' : 'text-gray-900'}`}>
                            {priceDifference > 0 ? (
                                <>
                                    <DollarSign size={14} /> +{priceDifference.toFixed(2)}
                                </>
                            ) : priceDifference < 0 ? (
                                <>
                                    <DollarSign size={14} /> {priceDifference.toFixed(2)}
                                </>
                            ) : (
                                <span>$0.00</span>
                            )}
                        </div>
                    </div>

                    {priceDifference !== 0 && (
                        <p className={`text-xs mt-2 font-medium ${priceDifference > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {priceDifference > 0
                                ? 'You will be charged the difference upon confirmation.'
                                : 'The difference will be refunded to your wallet.'}
                        </p>
                    )}
                </div>

                <div className="flex gap-3">
                    <Button
                        onClick={onClose}
                        variant="outline"
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleUpdate}
                        disabled={isSubmitting || (!isRecurring && endTime <= startTime)}
                        variant="primary"
                        className="flex-1"
                        leftIcon={!isSubmitting ? <CheckCircle size={18} /> : undefined}
                    >
                        {isSubmitting ? 'Updating...' : (priceDifference > 0 ? 'Pay & Update' : 'Update Request')}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ModifyBookingModal;
