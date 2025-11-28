import React from 'react';
import { X, Info, ShieldCheck } from 'lucide-react';
import { useScrollLock } from '../../../../hooks/useScrollLock';
import { Listing } from '@fiilar/types';
import { formatCurrency } from '../../../../utils/currency';

interface PriceBreakdownModalProps {
    isOpen: boolean;
    onClose: () => void;
    listing: Listing;
    fees: {
        subtotal: number;
        serviceFee: number;
        cautionFee: number;
        total: number;
    };
    isHourly: boolean;
    duration: number;
    guestCount: number;
}

export const PriceBreakdownModal: React.FC<PriceBreakdownModalProps> = ({
    isOpen,
    onClose,
    listing,
    fees,
    isHourly,
    duration,
    guestCount
}) => {
    useScrollLock(isOpen);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

            <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-900 font-display">Price Breakdown</h3>
                        <button
                            onClick={onClose}
                            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                            aria-label="Close"
                        >
                            <X size={20} className="text-gray-500" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {/* Base Rate */}
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-gray-700 font-medium">
                                    {formatCurrency(listing.price)} x {duration} {isHourly ? (duration === 1 ? 'hour' : 'hours') : (duration === 1 ? 'day' : 'days')}
                                </p>
                                {guestCount > (listing.includedGuests || 1) && (
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Includes extra guest fee
                                    </p>
                                )}
                            </div>
                            <p className="text-gray-900 font-medium">{formatCurrency(fees.subtotal)}</p>
                        </div>

                        {/* Service Fee */}
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-1.5">
                                <p className="text-gray-700 font-medium">Service Fee</p>
                                <div className="group relative">
                                    <Info size={14} className="text-gray-400 cursor-help" />
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-center">
                                        Helps us run the platform and offer 24/7 support.
                                    </div>
                                </div>
                            </div>
                            <p className="text-gray-900 font-medium">{formatCurrency(fees.serviceFee)}</p>
                        </div>

                        {/* Caution Fee */}
                        {fees.cautionFee > 0 && (
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-1.5">
                                    <p className="text-gray-700 font-medium">Caution Fee</p>
                                    <ShieldCheck size={14} className="text-brand-600" />
                                </div>
                                <div className="text-right">
                                    <p className="text-gray-900 font-medium">{formatCurrency(fees.cautionFee)}</p>
                                    <p className="text-xs text-gray-500">Refundable</p>
                                </div>
                            </div>
                        )}

                        <div className="border-t border-gray-100 my-4"></div>

                        {/* Total */}
                        <div className="flex justify-between items-end">
                            <p className="text-lg font-bold text-gray-900">Total</p>
                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(fees.total)}</p>
                        </div>
                    </div>

                    <div className="mt-6 bg-gray-50 p-4 rounded-xl text-xs text-gray-500 leading-relaxed">
                        The total shown is an estimate based on your current selection. Final price may vary if you change dates or guests.
                    </div>
                </div>
            </div>
        </div>
    );
};
