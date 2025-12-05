import React, { useState } from 'react';
import { Listing, CancellationPolicy } from '@fiilar/types';
import { X, CreditCard, Wallet, Loader2, Star, Info, Check, Plus, ArrowRight } from 'lucide-react';
import { useScrollLock } from '../../../../hooks/useScrollLock';
import { formatCurrency } from '../../../../utils/currency';
import { getAverageRating, getReviews } from '@fiilar/reviews';
import { Button, useToast } from '@fiilar/ui';
import { paymentService } from '@fiilar/escrow';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: Listing;
  pendingBooking: any;
  paymentMethod: 'WALLET' | 'CARD';
  setPaymentMethod: (method: 'WALLET' | 'CARD') => void;
  walletBalance: number;
  setWalletBalance?: (balance: number) => void;
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
  setWalletBalance,
  agreedToTerms,
  setAgreedToTerms,
  isBookingLoading,
  handleConfirmBooking
}) => {
  useScrollLock(isOpen);
  const toast = useToast();
  
  // Top-up state
  const [isTopUpMode, setIsTopUpMode] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [isAddingFunds, setIsAddingFunds] = useState(false);
  
  // Calculate shortfall
  const totalAmount = pendingBooking?.fees?.total || 0;
  const shortfall = Math.max(0, totalAmount - walletBalance);
  const hasInsufficientFunds = paymentMethod === 'WALLET' && walletBalance < totalAmount;

  // Handle quick top-up
  const handleTopUp = async (amount: number) => {
    setIsAddingFunds(true);
    try {
      await paymentService.addFunds(amount, 'mock_pm_id');
      const newBalance = walletBalance + amount;
      if (setWalletBalance) {
        setWalletBalance(newBalance);
      }
      setIsTopUpMode(false);
      setTopUpAmount('');
      toast.showToast({ message: `₦${amount.toLocaleString()} added to wallet!`, type: 'success' });
    } catch (error) {
      console.error('Failed to add funds', error);
      toast.showToast({ message: 'Failed to add funds. Please try again.', type: 'error' });
    } finally {
      setIsAddingFunds(false);
    }
  };

  if (!isOpen || !pendingBooking) return null;

  return (
    <div className="fixed inset-0 z-[110] md:flex md:items-center md:justify-center md:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      {/* Backdrop for desktop */}
      <div className="hidden md:block absolute inset-0" onClick={onClose}></div>
      
      {/* Modal Container - Full screen on mobile, centered card on desktop */}
      <div className="absolute inset-0 md:relative md:inset-auto bg-white md:rounded-3xl md:max-w-5xl w-full shadow-2xl overflow-hidden flex flex-col md:max-h-[92vh] animate-in slide-in-from-bottom md:zoom-in-95 duration-300">

        {/* Mobile Header - Fixed */}
        <div className="md:hidden shrink-0 bg-white border-b border-gray-100 relative z-10">
          {/* Drag Handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
          </div>
          {/* Title Bar */}
          <div className="flex items-center justify-between px-4 pb-3">
            <h2 className="text-lg font-bold text-gray-900">Review and pay</h2>
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onClose();
              }}
              type="button"
              title="Close modal"
              aria-label="Close modal"
              className="p-2 hover:bg-gray-100 rounded-full transition-colors active:bg-gray-200 touch-manipulation"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Wrapper */}
        <div className="flex-1 min-h-0 overflow-y-auto md:overflow-hidden flex flex-col md:flex-row-reverse" id="confirm-scroll-container">

          {/* Right Column: Review & Payment (Now First in DOM for Mobile Scroll Fix) */}
          <div className="w-full md:w-3/5 p-4 md:p-8 md:overflow-y-auto relative bg-white pb-4 md:pb-8">
            {/* Desktop Close Button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close confirmation dialog"
              title="Close confirmation dialog"
              className="hidden md:flex absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-all active:scale-95 z-10"
            >
              <X size={20} className="text-gray-500" />
            </button>

            {/* Mobile Listing Preview */}
            <div className="md:hidden mb-6">
              <div className="flex gap-3 items-start">
                <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
                  <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{listing.title}</h3>
                  <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                    <Star size={14} className="fill-brand-500 text-brand-500" />
                    <span>{getAverageRating(listing.id).toFixed(1)}</span>
                    <span className="text-gray-400">({getReviews(listing.id).length})</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 mt-1">
                    {formatCurrency(listing.price)}<span className="text-gray-500 font-normal">/{listing.pricingModel === 'HOURLY' ? 'hr' : 'night'}</span>
                  </p>
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

                {/* Insufficient Funds - Enhanced UX */}
                {hasInsufficientFunds && (
                  <div className="mt-4 animate-in slide-in-from-top-2">
                    {!isTopUpMode ? (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-amber-100 rounded-lg shrink-0">
                            <Wallet size={18} className="text-amber-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-amber-900 mb-1">
                              You need {formatCurrency(shortfall)} more
                            </p>
                            <p className="text-sm text-amber-700 mb-3">
                              Your balance: {formatCurrency(walletBalance)} • Total: {formatCurrency(totalAmount)}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => handleTopUp(shortfall)}
                                disabled={isAddingFunds}
                                className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
                              >
                                {isAddingFunds ? (
                                  <Loader2 size={14} className="animate-spin" />
                                ) : (
                                  <Plus size={14} />
                                )}
                                Add {formatCurrency(shortfall)}
                              </button>
                              <button
                                onClick={() => setIsTopUpMode(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-amber-100 text-amber-700 text-sm font-medium rounded-lg border border-amber-300 transition-colors"
                              >
                                Custom amount
                              </button>
                              <button
                                onClick={() => setPaymentMethod('CARD')}
                                className="flex items-center gap-1 px-4 py-2 text-amber-700 hover:text-amber-900 text-sm font-medium transition-colors"
                              >
                                Use card instead <ArrowRight size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-semibold text-gray-900">Add funds to wallet</span>
                          <button
                            onClick={() => setIsTopUpMode(false)}
                            className="text-gray-400 hover:text-gray-600 p-1"
                            title="Close top-up form"
                            aria-label="Close top-up form"
                          >
                            <X size={16} />
                          </button>
                        </div>
                        <div className="flex gap-2 mb-3">
                          <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₦</span>
                            <input
                              type="number"
                              value={topUpAmount}
                              onChange={(e) => setTopUpAmount(e.target.value)}
                              placeholder="Enter amount"
                              className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                              min={shortfall}
                            />
                          </div>
                          <button
                            onClick={() => handleTopUp(Number(topUpAmount))}
                            disabled={isAddingFunds || !topUpAmount || Number(topUpAmount) < 100}
                            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            {isAddingFunds ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              'Add'
                            )}
                          </button>
                        </div>
                        {/* Quick amount buttons */}
                        <div className="flex flex-wrap gap-2">
                          <span className="text-xs text-gray-500 mr-1 self-center">Quick:</span>
                          {[shortfall, Math.ceil(shortfall / 1000) * 1000 + 5000, 50000, 100000].filter((v, i, arr) => arr.indexOf(v) === i).slice(0, 4).map((amount) => (
                            <button
                              key={amount}
                              onClick={() => setTopUpAmount(amount.toString())}
                              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                                topUpAmount === amount.toString()
                                  ? 'bg-brand-600 text-white border-brand-600'
                                  : 'bg-white text-gray-600 border-gray-300 hover:border-brand-400'
                              }`}
                            >
                              {formatCurrency(amount)}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
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
                    <a
                      href="/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-brand-600 hover:text-brand-700 font-semibold underline decoration-brand-600/30 hover:decoration-brand-700 underline-offset-2"
                    >
                      Host's House Rules
                    </a>
                    , Ground rules for guests, and Fiilar's{' '}
                    <a
                      href="/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-brand-600 hover:text-brand-700 font-semibold underline decoration-brand-600/30 hover:decoration-brand-700 underline-offset-2"
                    >
                      Rebooking and Refund Policy
                    </a>
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

          {/* Left Column: Trip Details (Now Second in DOM) */}
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
        </div>

        {/* Mobile Sticky Footer - Matches BookingModal footer style */}
        <div className="md:hidden shrink-0 border-t border-gray-200 bg-white p-4 flex justify-between items-center shadow-[0_-4px_20px_rgba(0,0,0,0.08)]" style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-gray-900">{formatCurrency(pendingBooking.fees.total)}</span>
              <span className="text-sm text-gray-500">total</span>
            </div>
            <button
              onClick={() => {
                document.getElementById('price-breakdown-confirm')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-xs text-gray-500 underline cursor-pointer hover:text-gray-900 transition-colors text-left"
            >
              Show price breakdown
            </button>
          </div>
          <Button
            onClick={handleConfirmBooking}
            disabled={!agreedToTerms || isBookingLoading || (paymentMethod === 'WALLET' && walletBalance < pendingBooking.fees.total)}
            variant="primary"
            size="lg"
            className="px-6 py-3 rounded-xl font-bold text-base shadow-lg shadow-brand-500/30"
            isLoading={isBookingLoading}
          >
            {!isBookingLoading && 'Confirm & Pay'}
          </Button>
        </div>

      </div>
    </div>
  );
};

