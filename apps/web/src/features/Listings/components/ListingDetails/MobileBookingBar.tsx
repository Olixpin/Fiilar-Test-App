import React from 'react';
import { Listing, BookingType } from '@fiilar/types';

interface MobileBookingBarProps {
  listing: Listing;
  onReserve: () => void;
}

export const MobileBookingBar: React.FC<MobileBookingBarProps> = ({ listing, onReserve }) => {
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
          className="bg-brand-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-brand-600/20 active:scale-95 transition-all"
        >
          Reserve
        </button>
      </div>
    </div>
  );
};
