import React, { useState } from 'react';
import { Booking } from '@fiilar/types';
import { CheckCircle, Copy, Check, Clock, Send } from 'lucide-react';
import { useScrollLock } from '../../../../hooks/useScrollLock';
import { useNavigate } from 'react-router-dom';

interface SuccessModalProps {
  isOpen: boolean;
  confirmedBookings: Booking[];
  isInstantBook?: boolean;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({ isOpen, confirmedBookings, isInstantBook = false }) => {
  useScrollLock(isOpen);
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  if (!isOpen || confirmedBookings.length === 0) return null;

  const guestCode = confirmedBookings[0]?.guestCode || 'N/A';
  const isRecurring = confirmedBookings.length > 1;
  
  // Determine if booking is confirmed based on status (fallback to isInstantBook prop)
  const isConfirmed = confirmedBookings[0]?.status === 'Confirmed' || isInstantBook;

  const handleCopy = async () => {
    if (!guestCode || guestCode === 'N/A') return;
    try {
      await navigator.clipboard.writeText(guestCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-300 border border-white/20">
        <div className={`h-2 w-full ${isConfirmed ? 'bg-green-500' : 'bg-amber-500'}`}></div>
        <div className="p-8 text-center">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg ${
            isConfirmed 
              ? 'bg-green-100 text-green-600 shadow-green-200' 
              : 'bg-amber-100 text-amber-600 shadow-amber-200'
          }`}>
            {isConfirmed ? (
              <CheckCircle size={40} strokeWidth={3} />
            ) : (
              <Send size={40} strokeWidth={2} />
            )}
          </div>
          
          {isConfirmed ? (
            <>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {isRecurring ? 'Bookings Confirmed!' : 'Booking Confirmed!'}
              </h2>
              <p className="text-gray-500 mb-8">
                {isRecurring 
                  ? `You're all set! ${confirmedBookings.length} bookings have been confirmed. Here is your verification code for check-in.`
                  : "You're all set! Here is your verification code for check-in."
                }
              </p>

              <div className="bg-gray-50 rounded-2xl p-6 border-2 border-dashed border-gray-200 mb-8 relative group">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Your Guest Code</p>
                <div className="flex items-center justify-center gap-3">
                  <div className="text-4xl font-mono font-black text-gray-900 tracking-widest">
                    {guestCode}
                  </div>
                  <button
                    onClick={handleCopy}
                    className={`p-2 rounded-lg transition-all ${
                      copied 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-gray-200 text-gray-500 hover:bg-gray-300 hover:text-gray-700'
                    }`}
                    title={copied ? 'Copied!' : 'Copy code'}
                    aria-label={copied ? 'Code copied' : 'Copy guest code'}
                  >
                    {copied ? <Check size={20} /> : <Copy size={20} />}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-3">
                  {copied ? (
                    <span className="text-green-600 font-medium">Copied to clipboard!</span>
                  ) : (
                    'Tap to copy • Show this code to the host upon arrival.'
                  )}
                </p>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {isRecurring ? 'Requests Sent!' : 'Request Sent!'}
              </h2>
              <p className="text-gray-500 mb-6">
                {isRecurring 
                  ? `Your ${confirmedBookings.length} booking requests have been sent to the host for approval.`
                  : "Your booking request has been sent to the host for approval."
                }
              </p>

              <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200 mb-8">
                <div className="flex items-center justify-center gap-2 text-amber-700 mb-3">
                  <Clock size={20} />
                  <span className="font-semibold">Awaiting Host Approval</span>
                </div>
                <p className="text-sm text-amber-600">
                  The host typically responds within 24 hours. You'll receive a notification once they confirm your booking.
                </p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 mb-8">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Your Guest Code (for after approval)</p>
                <div className="flex items-center justify-center gap-3">
                  <div className="text-2xl font-mono font-bold text-gray-500 tracking-widest">
                    {guestCode}
                  </div>
                  <button
                    onClick={handleCopy}
                    className={`p-1.5 rounded-lg transition-all ${
                      copied 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-gray-200 text-gray-400 hover:bg-gray-300 hover:text-gray-600'
                    }`}
                    title={copied ? 'Copied!' : 'Copy code'}
                    aria-label={copied ? 'Code copied' : 'Copy guest code'}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {copied ? (
                    <span className="text-green-600 font-medium">Copied!</span>
                  ) : (
                    'Use this code once your booking is approved'
                  )}
                </p>
              </div>
            </>
          )}

          <button
            onClick={() => navigate('/dashboard?tab=bookings')}
            className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold text-lg hover:bg-black transition shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
          >
            Go to My Bookings
          </button>
        </div>
      </div>
    </div>
  );
};
