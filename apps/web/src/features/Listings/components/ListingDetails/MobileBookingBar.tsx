import React from 'react';
import { Listing, BookingType, PricingModel } from '@fiilar/types';

interface MobileBookingBarProps {
  listing: Listing;
  isHost: boolean;
  onReserve: () => void;
  onShowPriceBreakdown: () => void;
}

export const MobileBookingBar: React.FC<MobileBookingBarProps> = ({ listing, isHost, onReserve, onShowPriceBreakdown }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 glass-premium z-40 lg:hidden safe-area-pb">
      <div className="flex items-center justify-between gap-4 max-w-md mx-auto">
        <div>
          <div className="text-lg font-bold text-gray-900">
            ${listing.price}
            <span className="text-sm font-normal text-gray-500">/{
              listing.pricingModel === PricingModel.NIGHTLY ? 'night' :
                listing.pricingModel === PricingModel.DAILY ? 'day' :
                  listing.pricingModel === PricingModel.HOURLY ? 'hr' :
                    listing.priceUnit === BookingType.HOURLY ? 'hr' : 'night'
            }</span>
          </div>
          <button
            onClick={onShowPriceBreakdown}
            className="text-xs text-gray-600 underline hover:text-gray-900 transition-colors"
          >
            Show price breakdown
          </button>
        </div>
        <button
          onClick={onReserve}
          disabled={isHost}
          className={`px-8 py-3 rounded-xl font-bold shadow-lg transition-all ${isHost ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none' : 'bg-brand-600 text-white shadow-brand-600/20 active:scale-95'}`}
        >
          {isHost ? 'You host this space' : 'Reserve'}
        </button>
      </div>
    </div>
  );
};
