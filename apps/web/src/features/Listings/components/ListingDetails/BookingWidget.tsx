import React from 'react';
import { Listing, User, BookingType, PricingModel } from '@fiilar/types';
import { Star, Minus, Plus, Calendar as CalendarIcon, PackagePlus, CheckCircle, Repeat, X, Info, AlertCircle, Heart } from 'lucide-react';
import { formatCurrency } from '../../../../utils/currency';
import { getAverageRating, getReviews } from '@fiilar/reviews';
import { ListingCalendar } from '@fiilar/calendar';
import { Button } from '@fiilar/ui';

interface BookingWidgetProps {
  listing: Listing;
  user: User | null;
  isHourly: boolean;
  isHost: boolean;
  guestCount: number;
  setGuestCount: (count: number) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  isCalendarOpen: boolean;
  setIsCalendarOpen: (isOpen: boolean) => void;
  selectedAddOns: string[];
  toggleAddOn: (id: string) => void;
  isRecurring: boolean;
  setIsRecurring: (isRecurring: boolean) => void;
  recurrenceFreq: 'DAILY' | 'WEEKLY';
  setRecurrenceFreq: (freq: 'DAILY' | 'WEEKLY') => void;
  recurrenceCount: number;
  setRecurrenceCount: (count: number) => void;
  bookingSeries: { date: string; status: string }[];
  selectedHours: number[];
  handleHourToggle: (hour: number) => void;
  hostOpenHours: number[];
  isSlotBooked: (date: string, hour: number) => boolean;
  selectedDays: number;
  setSelectedDays: (days: number) => void;
  fees: { subtotal: number; serviceFee: number; cautionFee: number; total: number };
  isBookingLoading: boolean;
  handleBookClick: () => void;
  isSavedForLater: boolean;
  handleSaveToReserveList: () => void;
  currentMonth: Date;
  setCurrentMonth: (date: Date) => void;
  checkDateAvailability: (date: string) => string;
  setSelectedHours: (hours: number[]) => void;
}

export const BookingWidget: React.FC<BookingWidgetProps> = ({
  listing,
  user,
  isHost,
  isHourly,
  guestCount,
  setGuestCount,
  selectedDate,
  setSelectedDate,
  isCalendarOpen,
  setIsCalendarOpen,
  selectedAddOns,
  toggleAddOn,
  isRecurring,
  setIsRecurring,
  recurrenceFreq,
  setRecurrenceFreq,
  recurrenceCount,
  setRecurrenceCount,
  bookingSeries,
  selectedHours,
  hostOpenHours,
  isSlotBooked,
  selectedDays,
  setSelectedDays,
  fees,
  isBookingLoading,
  handleBookClick,
  isSavedForLater,
  handleSaveToReserveList,
  currentMonth,
  setCurrentMonth,
  checkDateAvailability,
  setSelectedHours
}) => {
  return (
    <div className="lg:col-span-1">
      {/* Desktop: Sticky sidebar */}
      <div className="hidden lg:block sticky top-24 glass-card rounded-2xl p-6 shadow-xl shadow-black/5">
        <div className="flex justify-between items-start mb-6">
          <div>
            <span className="text-2xl font-bold text-gray-900">{formatCurrency(listing.price, { compact: true })}</span>
            <span className="text-gray-500">/{
              listing.pricingModel === PricingModel.NIGHTLY ? 'night' :
                listing.pricingModel === PricingModel.DAILY ? 'day' :
                  listing.pricingModel === PricingModel.HOURLY ? 'hr' :
                    listing.priceUnit === BookingType.HOURLY ? 'hr' : 'night'
            }</span>
          </div>
          <div className="flex items-center gap-1 text-sm font-medium text-gray-700 bg-gray-100/50 px-2 py-1 rounded-lg">
            <Star size={14} className="fill-brand-500 text-brand-500" />
            <span>{getAverageRating(listing.id).toFixed(1)}</span>
            <span className="text-gray-400">({getReviews(listing.id).length})</span>
          </div>
        </div>

        <div className="space-y-4 mb-6">

          {/* Guest Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Guests</label>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                disabled={guestCount <= 1}
                aria-label="Decrease guests"
                title="Decrease guests"
                className="px-4 py-3 bg-gray-50 hover:bg-gray-100 border-r border-gray-300 disabled:opacity-50"
              >
                <Minus size={16} />
              </button>
              <div className="flex-1 text-center py-3 bg-white font-medium">
                {guestCount} {guestCount === 1 ? 'Guest' : 'Guests'}
              </div>
              <button
                type="button"
                onClick={() => setGuestCount(Math.min(listing.capacity || 10, guestCount + 1))}
                disabled={guestCount >= (listing.capacity || 10)}
                aria-label="Increase guests"
                title="Increase guests"
                className="px-4 py-3 bg-gray-50 hover:bg-gray-100 border-l border-gray-300 disabled:opacity-50"
              >
                <Plus size={16} />
              </button>
            </div>
            {/* Guest Price Info */}
            {guestCount > (listing.includedGuests || 1) && (listing.pricePerExtraGuest || 0) > 0 && (
              <div className="mt-1 text-xs text-gray-500 flex justify-between">
                <span>Included: {listing.includedGuests} guests</span>
                <span className="font-medium text-green-700">+{formatCurrency((guestCount - (listing.includedGuests || 1)) * (listing.pricePerExtraGuest || 0))}/unit extra</span>
              </div>
            )}
          </div>

          {/* Date Selection - Custom Calendar Trigger */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                aria-label="Open calendar"
                title="Open calendar"
                className="w-full p-3 pl-10 border border-gray-300 rounded-lg hover:border-brand-500 hover:ring-1 hover:ring-brand-500 text-left flex items-center transition-all bg-white"
              >
                <CalendarIcon className="absolute left-3 top-3.5 text-gray-500" size={18} />
                <span className="font-medium text-gray-900">{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
              </button>
            </div>
            {isCalendarOpen && (
              <ListingCalendar
                currentMonth={currentMonth}
                setCurrentMonth={setCurrentMonth}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                setSelectedHours={setSelectedHours}
                checkDateAvailability={checkDateAvailability}
                isRecurring={isRecurring}
                bookingSeries={bookingSeries}
              />
            )}
          </div>

          {/* Optional Extras Selection */}
          {listing.addOns && listing.addOns.length > 0 && (
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-2">
                <PackagePlus size={16} className="text-brand-600" /> Optional Extras
              </div>
              <div className="space-y-2">
                {listing.addOns.map(addon => (
                  <div key={addon.id}
                    onClick={() => toggleAddOn(addon.id)}
                    className={`flex items-center justify-between p-2 rounded border cursor-pointer transition-colors ${selectedAddOns.includes(addon.id) ? 'bg-white border-brand-500 ring-1 ring-brand-500' : 'bg-white border-gray-200 hover:border-gray-300'}`}
                  >
                    <div className="flex items-start gap-2 overflow-hidden">
                      <div className={`w-4 h-4 rounded border mt-0.5 flex items-center justify-center shrink-0 ${selectedAddOns.includes(addon.id) ? 'bg-brand-600 border-brand-600' : 'border-gray-300'}`}>
                        {selectedAddOns.includes(addon.id) && <CheckCircle size={12} className="text-white" />}
                      </div>
                      {addon.image && (
                        <img src={addon.image} alt={addon.name} className="w-10 h-10 rounded-md object-cover border border-gray-200 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{addon.name}</div>
                        {addon.description && <div className="text-[10px] text-gray-500 truncate">{addon.description}</div>}
                      </div>
                    </div>
                    <div className="text-sm font-bold whitespace-nowrap">
                      +{formatCurrency(addon.price)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recurrence Toggle */}
          {listing.settings?.allowRecurring && (
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 transition-colors">
              <div className="flex items-center justify-between cursor-pointer select-none" onClick={() => setIsRecurring(!isRecurring)}>
                <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                  <Repeat size={16} className={isRecurring ? "text-brand-600" : "text-gray-400"} />
                  {isHourly ? 'Repeat Booking?' : 'Book Series?'}
                </div>
                <div className={`w-10 h-5 rounded-full relative transition-colors ${isRecurring ? 'bg-brand-600' : 'bg-gray-300'}`}>
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isRecurring ? 'left-6' : 'left-1'}`} />
                </div>
              </div>

              {isRecurring && (
                <div className="mt-3 pt-3 border-t border-gray-200 animate-in slide-in-from-top-2">
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Frequency</label>
                      <div className="flex gap-1">
                        {isHourly && (
                          <button
                            onClick={() => setRecurrenceFreq('DAILY')}
                            className={`flex-1 py-1.5 text-[10px] rounded border ${recurrenceFreq === 'DAILY' ? 'bg-brand-50 border-brand-500 text-brand-700 font-bold' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}
                          >
                            Daily
                          </button>
                        )}
                        <button
                          onClick={() => setRecurrenceFreq('WEEKLY')}
                          className={`py-1.5 text-[10px] rounded border ${isHourly ? 'flex-1' : 'w-full'} ${recurrenceFreq === 'WEEKLY' ? 'bg-brand-50 border-brand-500 text-brand-700 font-bold' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}
                        >
                          Weekly
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Repeats</label>
                      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded p-1">
                        <input
                          type="range"
                          min={2}
                          max={8}
                          value={recurrenceCount}
                          onChange={(e) => setRecurrenceCount(parseInt(e.target.value))}
                          title="Number of repeats"
                          className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
                        />
                        <span className="text-xs font-bold w-4 text-center">{recurrenceCount}</span>
                      </div>
                    </div>
                  </div>

                  {/* Series Preview (Compact) */}
                  <div className="bg-gray-50 p-2 rounded border border-gray-100">
                    <div className="text-[10px] font-bold text-gray-500 mb-1 uppercase">Dates</div>
                    <div className="flex flex-wrap gap-1">
                      {bookingSeries.map((item, i) => (
                        <div key={i} className={`text-[10px] px-1.5 py-0.5 rounded border flex items-center gap-1 ${item.status === 'AVAILABLE' ? 'bg-white border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                          {item.status === 'AVAILABLE' ? <CheckCircle size={8} /> : <X size={8} />}
                          {item.date.slice(5)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Hourly Selection (Start/End Dropdowns) */}
          {isHourly && (
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Start Time</label>
                <select
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
                  value={selectedHours.length > 0 ? Math.min(...selectedHours) : ''}
                  title="Select start time"
                  onChange={(e) => {
                    const start = parseInt(e.target.value);
                    const currentEnd = selectedHours.length > 0 ? Math.max(...selectedHours) + 1 : start + 1;
                    const end = Math.max(currentEnd, start + 1);

                    const newRange = [];
                    for (let h = start; h < end; h++) newRange.push(h);
                    setSelectedHours(newRange);
                  }}
                >
                  <option value="" disabled>Select</option>
                  {hostOpenHours.map(h => (
                    <option key={h} value={h} disabled={isSlotBooked(selectedDate, h)}>
                      {h.toString().padStart(2, '0')}:00
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">End Time</label>
                <select
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
                  value={selectedHours.length > 0 ? Math.max(...selectedHours) + 1 : ''}
                  title="Select end time"
                  onChange={(e) => {
                    const end = parseInt(e.target.value);
                    const currentStart = selectedHours.length > 0 ? Math.min(...selectedHours) : end - 1;
                    const start = Math.min(currentStart, end - 1);

                    const newRange = [];
                    for (let h = start; h < end; h++) newRange.push(h);
                    setSelectedHours(newRange);
                  }}
                >
                  <option value="" disabled>Select</option>
                  {hostOpenHours.map(h => (
                    <option key={h} value={h + 1}>
                      {(h + 1).toString().padStart(2, '0')}:00
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
          {isRecurring && selectedHours.length > 0 && (
            <div className="mt-2 bg-blue-50 border border-blue-100 p-2 rounded flex items-start gap-2">
              <Info size={14} className="text-blue-600 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-800">
                Selected hours will apply to all {recurrenceCount} dates in the series.
                <span className="block text-gray-500 text-[10px] mt-1">We check availability for every single date.</span>
              </p>
            </div>
          )}
        </div>


        {/* Daily Selection */}
        {!isHourly && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (Nights)</label>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <button type="button" onClick={() => setSelectedDays(Math.max(1, selectedDays - 1))} aria-label="Decrease nights" title="Decrease nights" className="px-4 py-3 bg-gray-50 hover:bg-gray-100 border-r border-gray-300">-</button>
              <input type="number" value={selectedDays} readOnly aria-label="Number of nights" title="Number of nights" className="w-full text-center p-3 outline-none bg-white" />
              <button type="button" onClick={() => setSelectedDays(selectedDays + 1)} aria-label="Increase nights" title="Increase nights" className="px-4 py-3 bg-gray-50 hover:bg-gray-100 border-l border-gray-300">+</button>
            </div>
          </div>
        )}
      </div>

      {/* Total & Breakdown */}
      <div className="space-y-4">
        <div className="border-t border-gray-100 pt-4 space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal {isRecurring && `(${recurrenceCount} bookings)`}</span>
            <span>{formatCurrency(fees.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Service Fee (10%)</span>
            <span>{formatCurrency(fees.serviceFee)}</span>
          </div>
          {fees.cautionFee > 0 && (
            <div className="flex justify-between text-sm text-gray-600">
              <span className="flex items-center gap-1">
                Caution Fee
                <span title="Refundable Deposit">
                  <Info size={12} className="text-gray-400" />
                </span>
              </span>
              <span>{formatCurrency(fees.cautionFee)}</span>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center text-lg font-bold text-gray-900 border-t border-gray-200 pt-4">
          <span>Total</span>
          <div className="text-right">
            <div>{formatCurrency(fees.total)}</div>
          </div>
        </div>

        {user && !user.kycVerified && listing.requiresIdentityVerification && (
          <div className="flex items-start gap-2 bg-yellow-50 p-3 rounded-lg text-xs text-yellow-800">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <span>One-time verification required to book.</span>
          </div>
        )}

        {/* Smart Booking Button */}
        <Button
          onClick={handleBookClick}
          disabled={isHost || (isHourly && hostOpenHours.length === 0) || isBookingLoading || bookingSeries.some(s => s.status !== 'AVAILABLE')}
          variant="primary"
          size="lg"
          className="w-full shadow-lg"
          isLoading={isBookingLoading}
        >
          {!isBookingLoading && (
            isHost ? 'You host this space' :
              bookingSeries.some(s => s.status !== 'AVAILABLE') ? 'Dates Unavailable' :
                (user ?
                  (listing.requiresIdentityVerification && !user.kycVerified ? 'Verify & Book' : (isRecurring ? `Book Series` : 'Book Now'))
                  : 'Sign in to Book'
                )
          )}
        </Button>

        {/* Save for Later Button */}
        {user && (
          <Button
            onClick={handleSaveToReserveList}
            disabled={(isHourly && hostOpenHours.length === 0)}
            variant={isSavedForLater ? "outline" : "outline"}
            className={`w-full ${isSavedForLater
                ? 'bg-brand-50 text-brand-700 border-brand-200'
                : 'border-brand-600 text-brand-600 hover:bg-brand-50'
              }`}
            leftIcon={<Heart size={18} className={isSavedForLater ? 'fill-current' : ''} />}
          >
            {isSavedForLater ? 'Saved to Reserve List' : 'Save for Later'}
          </Button>
        )}

        {!user && (
          <p className="text-center text-xs text-gray-500">You won't be charged yet</p>
        )}
      </div>
    </div>

  );
};
