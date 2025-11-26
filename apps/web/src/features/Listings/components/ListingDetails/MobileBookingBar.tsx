import React from 'react';
import { Listing, BookingType } from '@fiilar/types';

interface MobileBookingBarProps {
  listing: Listing;
  isHost: boolean;
  onReserve: () => void;
}

export const MobileBookingBar: React.FC<MobileBookingBarProps> = ({ listing, isHost, onReserve }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 glass-premium z-40 lg:hidden safe-area-pb">
      <div className="flex items-center justify-between gap-4 max-w-md mx-auto">
        <div>
          <div className="text-lg font-bold text-gray-900">
            ${listing.price}
            <span className="text-sm font-normal text-gray-500">/{listing.priceUnit === BookingType.HOURLY ? 'hr' : 'day'}</span>
          </div>
          <div className="text-xs text-gray-500 font-medium">
            {listing.settings?.minDuration || 1} {listing.priceUnit === BookingType.HOURLY ? 'hr' : 'day'} min
          </div>
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
