import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Clock, Info } from 'lucide-react';
import { Booking, CancellationPolicy } from '@fiilar/types';
import { calculateRefund, processCancellation, getCancellationPolicyDescription } from '../../../services/cancellationService';
import { useLocale, Button, useToast } from '@fiilar/ui';

interface CancellationModalProps {
    booking: Booking;
    policy: CancellationPolicy;
    onClose: () => void;
    onSuccess: () => void;
}

const CANCELLATION_REASONS = [
    'Change of plans',
    'Found alternative accommodation',
    'Emergency situation',
    'Booking error',
    'Property not as described',
    'Other'
];

const CancellationModal: React.FC<CancellationModalProps> = ({ booking, policy, onClose, onSuccess }) => {
    const { locale } = useLocale();
    const toast = useToast();
    const [reason, setReason] = useState('');
    const [customReason, setCustomReason] = useState('');
    const [confirmed, setConfirmed] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [refundCalc, setRefundCalc] = useState(calculateRefund(booking, policy));

    // Recalculate refund every minute
    useEffect(() => {
        const interval = setInterval(() => {
            setRefundCalc(calculateRefund(booking, policy));
        }, 60000);
        return () => clearInterval(interval);
    }, [booking, policy]);

    const handleCancel = async () => {
        if (!reason) {
            toast.showToast({ message: 'Please select a cancellation reason', type: 'info' });
            return;
        }

        if (!confirmed) {
            toast.showToast({ message: 'Please confirm that you understand the cancellation policy', type: 'info' });
            return;
        }

        setIsProcessing(true);

        const finalReason = reason === 'Other' ? customReason : reason;
        const currentUser = JSON.parse(localStorage.getItem('fiilar_user') || '{}');

        const result = await processCancellation(
            booking,
            currentUser.id,
            finalReason,
            refundCalc.refundAmount
        );

        setIsProcessing(false);

        if (result.success) {
            toast.showToast({ message: result.message, type: 'success' });
            onSuccess();
            onClose();
        } else {
            toast.showToast({ message: result.message, type: 'error' });
        }
    };

    const formatHours = (hours: number) => {
        if (hours < 24) {
            const h = Math.floor(hours);
            return `${h} hour${h === 1 ? '' : 's'}`;
        }
        const days = Math.floor(hours / 24);
        return `${days} day${days > 1 ? 's' : ''}`;
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Cancel Booking</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600" title="Close">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Warning */}
                    {!refundCalc.canCancel && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                                <AlertTriangle size={20} className="text-red-600 shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-red-900">Cannot Cancel</p>
                                    <p className="text-sm text-red-700 mt-1">{refundCalc.reason}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Refund Calculation */}
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                        <div className="flex items-center gap-2 text-gray-700">
                            <Clock size={18} />
                            <span className="font-semibold">Time until booking:</span>
                            <span>{formatHours(refundCalc.hoursUntilBooking)}</span>
                        </div>

                        <div className="border-t border-gray-200 pt-3 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Original amount:</span>
                                <span className="font-semibold">{locale.currencySymbol}{booking.totalPrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Refund percentage:</span>
                                <span className={`font-semibold ${refundCalc.refundPercentage > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {refundCalc.refundPercentage}%
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Cancellation fee:</span>
                                <span className="font-semibold text-red-600">{locale.currencySymbol}{refundCalc.cancellationFee.toFixed(2)}</span>
                            </div>
                            <div className="border-t border-gray-300 pt-2 flex justify-between">
                                <span className="font-semibold text-gray-900">Refund amount:</span>
                                <span className="text-lg font-bold text-green-600">{locale.currencySymbol}{refundCalc.refundAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Cancellation Policy */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                            <Info size={20} className="text-blue-600 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold text-blue-900 mb-1">Cancellation Policy: {policy}</p>
                                <p className="text-sm text-blue-700">{getCancellationPolicyDescription(policy)}</p>
                            </div>
                        </div>
                    </div>

                    {refundCalc.canCancel && (
                        <>
                            {/* Reason Selection */}
                            <div>
                                <label htmlFor="cancellation-reason" className="block text-sm font-semibold text-gray-900 mb-2">
                                    Reason for cancellation *
                                </label>
                                <select
                                    id="cancellation-reason"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
                                >
                                    <option value="">Select a reason...</option>
                                    {CANCELLATION_REASONS.map((r) => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Custom Reason */}
                            {reason === 'Other' && (
                                <div>
                                    <label htmlFor="custom-reason" className="block text-sm font-semibold text-gray-900 mb-2">
                                        Please specify
                                    </label>
                                    <textarea
                                        id="custom-reason"
                                        value={customReason}
                                        onChange={(e) => setCustomReason(e.target.value)}
                                        placeholder="Tell us more about your reason..."
                                        rows={3}
                                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                                    />
                                </div>
                            )}

                            {/* Confirmation Checkbox */}
                            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={confirmed}
                                        onChange={(e) => setConfirmed(e.target.checked)}
                                        className="mt-1 w-4 h-4 text-brand-600 rounded"
                                    />
                                    <span className="text-sm text-gray-700">
                                        I understand that by cancelling this booking, I will receive a refund of{' '}
                                        <span className="font-semibold">{locale.currencySymbol}{refundCalc.refundAmount.toFixed(2)}</span>
                                        {refundCalc.cancellationFee > 0 && (
                                            <> and will be charged a cancellation fee of{' '}
                                                <span className="font-semibold">{locale.currencySymbol}{refundCalc.cancellationFee.toFixed(2)}</span>
                                            </>
                                        )}. This action cannot be undone.
                                    </span>
                                </label>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <Button
                                    onClick={onClose}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    Keep Booking
                                </Button>
                                <Button
                                    onClick={handleCancel}
                                    disabled={isProcessing || !reason || !confirmed}
                                    variant="danger"
                                    className="flex-1"
                                    isLoading={isProcessing}
                                >
                                    {isProcessing ? 'Processing...' : 'Confirm Cancellation'}
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CancellationModal;
