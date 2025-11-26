import React from 'react';
import { Listing, CancellationPolicy } from '@fiilar/types';
import { X, ShieldCheck, CreditCard, Wallet, AlertCircle, Loader2, Star, Info, Check } from 'lucide-react';
import { useScrollLock } from '../../../../hooks/useScrollLock';
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
  useScrollLock(isOpen);

  if (!isOpen || !pendingBooking) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl max-w-5xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-300 border border-white/20">

        {/* Scrollable Content Wrapper */}
        <div className="flex-1 overflow-y-auto md:overflow-hidden flex flex-col-reverse md:flex-row" id="confirm-scroll-container">

          {/* Left Column: Trip Details (Bottom on Mobile) */}
          <div className="w-full md:w-2/5 bg-gradient-to-br from-gray-50 to-gray-100/50 p-6 md:p-8 border-r border-gray-200/50 md:overflow-y-auto backdrop-blur-sm pb-32 md:pb-8">
            <h2 className="hidden md:block text-xl font-bold text-gray-900 mb-6 font-display">Your Trip</h2>

            {/* Listing Preview (Desktop Only) */}
            <div className="hidden md:block bg-white rounded-2xl p-4 mb-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex gap-4">
                <img
                  src={listing.images[0]}
                  className="w-24 h-24 rounded-xl object-cover border border-gray-200"
                  alt="Space"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-brand-600 mb-1 uppercase tracking-wide">{listing.type}</div>
                  <div className="font-bold text-sm line-clamp-2 text-gray-900 mb-2">{listing.title}</div>
                  <div className="flex items-center text-xs text-gray-600">
                    <Star size={12} className="text-yellow-500 mr-1 fill-yellow-500" />
                    <span className="font-semibold">
                      {getReviews(listing.id).length > 0
                        ? getAverageRating(listing.id).toFixed(1)
                        : 'New'
                      }
                    </span>
                    {getReviews(listing.id).length > 0 && (
                      <span className="ml-1 text-gray-400">({getReviews(listing.id).length})</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Trip Details */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <div className="font-bold text-sm text-gray-700 mb-2 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-500"></div>
                  Dates
                </div>
                <div className="text-sm text-gray-900 font-medium">
                  {new Date(pendingBooking.dates[0]).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                  })}
                  {pendingBooking.dates.length > 1 && (
                    <span className="ml-2 text-brand-600 font-semibold">
                      + {pendingBooking.dates.length - 1} more
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <div className="font-bold text-sm text-gray-700 mb-2 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-500"></div>
                  Guests
                </div>
                <div className="text-sm text-gray-900 font-medium">
                  {pendingBooking.guestCount} {pendingBooking.guestCount === 1 ? 'Guest' : 'Guests'}
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="mt-6 pt-6 border-t border-gray-200" id="price-breakdown-confirm">
              <h3 className="font-bold text-sm text-gray-900 mb-4 uppercase tracking-wide">Price Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(pendingBooking.fees.subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Service Fee</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(pendingBooking.fees.serviceFee)}</span>
                </div>
                {pendingBooking.fees.cautionFee > 0 && (
                  <div className="flex justify-between items-center text-amber-700 bg-amber-50 -mx-2 px-2 py-2 rounded-lg">
                    <div className="flex items-center gap-1">
                      <span className="font-medium">Caution Deposit</span>
                      <Info size={12} className="text-amber-600" />
                    </div>
                    <span className="font-semibold">{formatCurrency(pendingBooking.fees.cautionFee)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-3 mt-3 text-base">
                  <span>Total (USD)</span>
                  <span className="text-brand-600">{formatCurrency(pendingBooking.fees.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Review & Payment (Top on Mobile) */}
          <div className="w-full md:w-3/5 p-6 md:p-8 md:overflow-y-auto relative bg-white pb-6 md:pb-8">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close confirmation dialog"
              title="Close confirmation dialog"
              className="absolute top-4 right-4 md:top-6 md:right-6 p-2 hover:bg-gray-100 rounded-full transition-all active:scale-95 z-10"
            >
              <X size={20} className="text-gray-500" />
            </button>

            {/* Mobile Header (Listing Preview) */}
            <div className="md:hidden mb-6 pr-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-display">Review and pay</h2>
              <div className="flex gap-4 items-start">
                <div className="aspect-square w-20 rounded-lg overflow-hidden shrink-0">
                  <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="text-xs font-bold text-brand-600 uppercase tracking-wide mb-1">{listing.type}</div>
                  <h3 className="font-bold text-sm text-gray-900 line-clamp-2">{listing.title}</h3>
                  <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                    <Star size={12} className="fill-brand-500 text-brand-500" />
                    <span className="font-medium text-gray-900">{getAverageRating(listing.id).toFixed(1)}</span>
                    <span>({getReviews(listing.id).length})</span>
                  </div>
                </div>
              </div>
            </div>

            <h2 className="hidden md:block text-3xl font-bold text-gray-900 mb-8 font-display">Review and pay</h2>

            <div className="space-y-8">
              {/* Payment Method Selection */}
              <section>
                <h3 className="font-bold text-lg text-gray-900 mb-4">Pay with</h3>
                <div className="space-y-3">
                  {/* Wallet Option */}
                  <div
                    onClick={() => setPaymentMethod('WALLET')}
                    className={`group relative flex items-center justify-between p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${paymentMethod === 'WALLET'
                      ? 'border-brand-600 bg-gradient-to-br from-brand-50 to-brand-100/50 shadow-lg shadow-brand-500/10'
                      : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-md'
                      }`}
                  >
                    {/* Selected indicator bar */}
                    {paymentMethod === 'WALLET' && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-brand-600 rounded-r-full"></div>
                    )}

                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl transition-all ${paymentMethod === 'WALLET'
                        ? 'bg-brand-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                        }`}>
                        <Wallet size={22} />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 mb-0.5">Fiilar Wallet</div>
                        <div className={`text-sm font-semibold ${walletBalance >= pendingBooking.fees.total
                          ? 'text-green-600'
                          : 'text-gray-500'
                          }`}>
                          Balance: {formatCurrency(walletBalance)}
                        </div>
                      </div>
                    </div>

                    {/* Radio button */}
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${paymentMethod === 'WALLET'
                      ? 'border-brand-600 bg-brand-600 shadow-sm scale-110'
                      : 'border-gray-300 group-hover:border-gray-400'
                      }`}>
                      {paymentMethod === 'WALLET' && (
                        <div className="w-2.5 h-2.5 bg-white rounded-full animate-in zoom-in duration-200" />
                      )}
                    </div>
                  </div>

                  {/* Card Option */}
                  <div
                    onClick={() => setPaymentMethod('CARD')}
                    className={`group relative flex items-center justify-between p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${paymentMethod === 'CARD'
                      ? 'border-brand-600 bg-gradient-to-br from-brand-50 to-brand-100/50 shadow-lg shadow-brand-500/10'
                      : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-md'
                      }`}
                  >
                    {/* Selected indicator bar */}
                    {paymentMethod === 'CARD' && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-brand-600 rounded-r-full"></div>
                    )}

                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl transition-all ${paymentMethod === 'CARD'
                        ? 'bg-brand-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                        }`}>
                        <CreditCard size={22} />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 mb-0.5">Credit / Debit Card</div>
                        <div className="text-sm text-gray-500">Pay securely with card</div>
                      </div>
                    </div>

                    {/* Radio button */}
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${paymentMethod === 'CARD'
                      ? 'border-brand-600 bg-brand-600 shadow-sm scale-110'
                      : 'border-gray-300 group-hover:border-gray-400'
                      }`}>
                      {paymentMethod === 'CARD' && (
                        <div className="w-2.5 h-2.5 bg-white rounded-full animate-in zoom-in duration-200" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Insufficient Funds Warning */}
                {paymentMethod === 'WALLET' && walletBalance < pendingBooking.fees.total && (
                  <div className="mt-4 flex items-start gap-3 text-red-700 bg-red-50 p-4 rounded-xl border border-red-200 text-sm animate-in slide-in-from-top-2">
                    <AlertCircle size={18} className="mt-0.5 shrink-0" />
                    <span className="font-medium">Insufficient wallet balance. Please top up or use a card.</span>
                  </div>
                )}
              </section>

              {/* Cancellation Policy */}
              <section>
                <h3 className="font-bold text-lg text-gray-900 mb-4">Cancellation Policy</h3>
                <div className="text-sm text-gray-700 bg-gray-50 p-5 rounded-xl border border-gray-200">
                  <span className="font-bold text-gray-900">
                    {listing.cancellationPolicy || CancellationPolicy.MODERATE}:{' '}
                  </span>
                  {listing.cancellationPolicy === CancellationPolicy.FLEXIBLE && "Cancel up to 24 hours before check-in for a full refund."}
                  {listing.cancellationPolicy === CancellationPolicy.MODERATE && "Cancel up to 5 days before check-in for a full refund."}
                  {(listing.cancellationPolicy === CancellationPolicy.STRICT || !listing.cancellationPolicy) && "Bookings are non-refundable."}
                </div>
              </section>

              {/* Agreement & Payment Button (Desktop Only) */}
              <div className="hidden md:block pt-6 border-t border-gray-200 space-y-6">
                <div
                  onClick={() => setAgreedToTerms(!agreedToTerms)}
                  className="flex items-start gap-3 cursor-pointer group"
                >
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${agreedToTerms
                    ? 'bg-brand-600 border-brand-600 text-white shadow-sm scale-105'
                    : 'border-gray-300 bg-white group-hover:border-brand-400'
                    }`}>
                    {agreedToTerms && <Check size={14} strokeWidth={3} className="animate-in zoom-in duration-200" />}
                  </div>
                  <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors select-none">
                    I agree to the{' '}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); navigate('/terms'); }}
                      className="text-brand-600 hover:text-brand-700 font-semibold underline decoration-brand-600/30 hover:decoration-brand-700 underline-offset-2"
                    >
                      Host's House Rules
                    </button>
                    , Ground rules for guests, and Fiilar's{' '}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); navigate('/terms'); }}
                      className="text-brand-600 hover:text-brand-700 font-semibold underline decoration-brand-600/30 hover:decoration-brand-700 underline-offset-2"
                    >
                      Rebooking and Refund Policy
                    </button>
                    .
                  </span>
                </div>
                <Button
                  onClick={handleConfirmBooking}
                  disabled={!agreedToTerms || isBookingLoading || (paymentMethod === 'WALLET' && walletBalance < pendingBooking.fees.total)}
                  variant="primary"
                  size="lg"
                  className="w-full shadow-xl hover:shadow-2xl transition-all text-lg font-bold py-4"
                  isLoading={isBookingLoading}
                >
                  {!isBookingLoading && `Pay ${formatCurrency(pendingBooking.fees.total)}`}
                </Button>
              </div>

              {/* Mobile Agreement (Visible on Mobile) */}
              <div className="md:hidden pt-4 border-t border-gray-200">
                <div
                  onClick={() => setAgreedToTerms(!agreedToTerms)}
                  className="flex items-start gap-3 cursor-pointer group"
                >
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all shrink-0 ${agreedToTerms
                    ? 'bg-brand-600 border-brand-600 text-white shadow-sm scale-105'
                    : 'border-gray-300 bg-white group-hover:border-brand-400'
                    }`}>
                    {agreedToTerms && <Check size={14} strokeWidth={3} className="animate-in zoom-in duration-200" />}
                  </div>
                  <span className="text-sm text-gray-700 select-none">
                    I agree to the <span className="underline font-medium text-gray-900">House Rules</span> and <span className="underline font-medium text-gray-900">Policy</span>.
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Mobile Sticky Footer */}
        <div className="md:hidden border-t border-gray-200 bg-white p-4 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-20">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-gray-500 font-medium">Total to pay</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(pendingBooking.fees.total)}</p>
            </div>
            <button
              onClick={() => {
                document.getElementById('price-breakdown-confirm')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-xs font-medium text-gray-500 underline"
            >
              View details
            </button>
          </div>
          <Button
            onClick={handleConfirmBooking}
            disabled={!agreedToTerms || isBookingLoading || (paymentMethod === 'WALLET' && walletBalance < pendingBooking.fees.total)}
            variant="primary"
            size="lg"
            className="w-full py-3.5 text-lg shadow-lg shadow-brand-500/20"
            isLoading={isBookingLoading}
          >
            {!isBookingLoading && 'Confirm & Pay'}
          </Button>
        </div>

      </div>
    </div>
  );
};
