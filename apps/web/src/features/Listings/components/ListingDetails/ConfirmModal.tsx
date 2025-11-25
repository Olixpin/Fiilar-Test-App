
import React from 'react';
import { Listing, CancellationPolicy } from '@fiilar/types';
import { X, Star, CreditCard, Wallet, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../../../utils/currency';
import { getAverageRating, getReviews } from '@fiilar/reviews';
import { useNavigate } from 'react-router-dom';
import { Button } from '@fiilar/ui';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: Listing;
  pendingBooking: any;
  paymentMethod: 'WALLET' | 'CARD';
  setPaymentMethod: (method: 'WALLET' | 'CARD') => void;
  walletBalance: number;
  agreedToTerms: boolean;
  setAgreedToTerms: (agreed: boolean) => void;
  isBookingLoading: boolean;
  handleConfirmBooking: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  listing,
  pendingBooking,
  paymentMethod,
  setPaymentMethod,
  walletBalance,
  agreedToTerms,
  setAgreedToTerms,
  isBookingLoading,
  handleConfirmBooking
}) => {
  const navigate = useNavigate();
  if (!isOpen || !pendingBooking) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] animate-in zoom-in-95 duration-200">

        {/* Left: Trip Details */}
        <div className="md:w-1/3 bg-gray-50 p-6 border-r border-gray-200 overflow-y-auto">
          <h2 className="text-xl font-bold mb-6">Your Trip</h2>

          <div className="flex gap-4 mb-6">
            <img src={listing.images[0]} className="w-20 h-20 rounded-lg object-cover" alt="Space" />
            <div>
              <div className="text-xs text-gray-500 mb-1">{listing.type}</div>
              <div className="font-semibold text-sm line-clamp-2">{listing.title}</div>
              <div className="flex items-center text-xs text-gray-500 mt-1">
                <Star size={10} className="text-yellow-500 mr-1" />
                {getReviews(listing.id).length > 0
                  ? getAverageRating(listing.id).toFixed(1)
                  : 'New'
                }
              </div>
            </div>
          </div>

          <div className="space-y-4 border-t border-gray-200 pt-4">
            <div>
              <div className="font-semibold text-sm mb-1">Dates</div>
              <div className="text-sm text-gray-600">{new Date(pendingBooking.dates[0]).toLocaleDateString()} {pendingBooking.dates.length > 1 && `+ ${pendingBooking.dates.length - 1} more`}</div>
            </div>
            <div>
              <div className="font-semibold text-sm mb-1">Guests</div>
              <div className="text-sm text-gray-600">{pendingBooking.guestCount} Guests</div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 mt-4">
            <h3 className="font-bold text-sm mb-3">Price Details</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(pendingBooking.fees.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Service Fee</span>
                <span>{formatCurrency(pendingBooking.fees.serviceFee)}</span>
              </div>
              {pendingBooking.fees.cautionFee > 0 && (
                <div className="flex justify-between text-green-700">
                  <span>Caution Fee (Refundable)</span>
                  <span>{formatCurrency(pendingBooking.fees.cautionFee)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-2 mt-2">
                <span>Total (USD)</span>
                <span>{formatCurrency(pendingBooking.fees.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Review & Agreement */}
        <div className="md:w-2/3 p-8 overflow-y-auto relative">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close confirmation dialog"
            title="Close confirmation dialog"
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X size={20} className="text-gray-500" />
          </button>

          <h2 className="text-2xl font-bold mb-6">Review and pay</h2>

          <div className="space-y-8">
            {/* Payment Method Selection */}
            <section>
              <h3 className="font-semibold text-lg mb-3">Pay with</h3>
              <div className="space-y-3">
                {/* Wallet Option */}
                <div
                  onClick={() => setPaymentMethod('WALLET')}
                  className={`flex items - center justify - between p - 4 rounded - xl border cursor - pointer transition - all ${paymentMethod === 'WALLET' ? 'border-brand-600 bg-brand-50 ring-1 ring-brand-600' : 'border-gray-200 hover:border-gray-300'} `}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p - 2 rounded - full ${paymentMethod === 'WALLET' ? 'bg-brand-200 text-brand-700' : 'bg-gray-100 text-gray-500'} `}>
                      <Wallet size={20} />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">Fiilar Wallet</div>
                      <div className="text-sm text-gray-500">Balance: ₦{walletBalance.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className={`w - 5 h - 5 rounded - full border flex items - center justify - center ${paymentMethod === 'WALLET' ? 'border-brand-600 bg-brand-600' : 'border-gray-300'} `}>
                    {paymentMethod === 'WALLET' && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                </div>

                {/* Card Option */}
                <div
                  onClick={() => setPaymentMethod('CARD')}
                  className={`flex items - center justify - between p - 4 rounded - xl border cursor - pointer transition - all ${paymentMethod === 'CARD' ? 'border-brand-600 bg-brand-50 ring-1 ring-brand-600' : 'border-gray-200 hover:border-gray-300'} `}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p - 2 rounded - full ${paymentMethod === 'CARD' ? 'bg-brand-200 text-brand-700' : 'bg-gray-100 text-gray-500'} `}>
                      <CreditCard size={20} />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">Credit / Debit Card</div>
                      <div className="text-sm text-gray-500">Pay securely with card</div>
                    </div>
                  </div>
                  <div className={`w - 5 h - 5 rounded - full border flex items - center justify - center ${paymentMethod === 'CARD' ? 'border-brand-600 bg-brand-600' : 'border-gray-300'} `}>
                    {paymentMethod === 'CARD' && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                </div>
              </div>

              {/* Insufficient Funds Warning */}
              {paymentMethod === 'WALLET' && walletBalance < pendingBooking.fees.total && (
                <div className="mt-3 flex items-start gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <span>Insufficient wallet balance. Please top up or use a card.</span>
                </div>
              )}
            </section>

            <section>
              <h3 className="font-semibold text-lg mb-3">Cancellation Policy</h3>
              <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <span className="font-bold text-gray-900">{listing.cancellationPolicy || CancellationPolicy.MODERATE}: </span>
                {listing.cancellationPolicy === CancellationPolicy.FLEXIBLE && "Cancel up to 24 hours before check-in for a full refund."}
                {listing.cancellationPolicy === CancellationPolicy.MODERATE && "Cancel up to 5 days before check-in for a full refund."}
                {(listing.cancellationPolicy === CancellationPolicy.STRICT || !listing.cancellationPolicy) && "Bookings are non-refundable."}
              </div>
            </section>

            <div className="pt-6 border-t border-gray-200">
              <label className="flex items-start gap-3 mb-6 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-gray-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                  I agree to the <button type="button" onClick={() => navigate('/terms')} className="text-brand-600 hover:text-brand-700 font-medium underline">Host's House Rules</button>, Ground rules for guests, and Fiilar's <button type="button" onClick={() => navigate('/terms')} className="text-brand-600 hover:text-brand-700 font-medium underline">Rebooking and Refund Policy</button>.
                </span>
              </label>
              <Button
                onClick={handleConfirmBooking}
                disabled={!agreedToTerms || isBookingLoading || (paymentMethod === 'WALLET' && walletBalance < pendingBooking.fees.total)}
                variant="primary"
                size="lg"
                className="w-full shadow-lg"
                isLoading={isBookingLoading}
              >
                {!isBookingLoading && `Pay $${pendingBooking.fees.total.toFixed(2)} `}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
