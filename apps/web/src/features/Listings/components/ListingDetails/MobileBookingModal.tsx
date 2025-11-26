import React from 'react';
import { Listing, User } from '@fiilar/types';
import { X, Minus, Plus, Calendar as CalendarIcon, PackagePlus, CheckCircle, Repeat, Ban, Info, AlertCircle, Loader2 } from 'lucide-react';
import { formatCurrency } from '../../../../utils/currency';
import { ListingCalendar } from '@fiilar/calendar';

interface MobileBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: Listing;
  user: User | null;
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
  isHourly: boolean;
  selectedHours: number[];
  handleHourToggle: (hour: number) => void;
  hostOpenHours: number[];
  isSlotBooked: (date: string, hour: number) => boolean;
  selectedDays: number;
  setSelectedDays: (days: number) => void;
  fees: { subtotal: number; serviceFee: number; cautionFee: number; total: number };
  isBookingLoading: boolean;
  handleBookClick: () => void;
  currentMonth: Date;
  setCurrentMonth: (date: Date) => void;
  checkDateAvailability: (date: string) => string;
  setSelectedHours: (hours: number[]) => void;
}

export const MobileBookingModal: React.FC<MobileBookingModalProps> = ({
  isOpen,
  onClose,
  listing,
  user,
  isHost,
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
  isHourly,
  selectedHours,
  handleHourToggle,
  hostOpenHours,
  isSlotBooked,
  selectedDays,
  setSelectedDays,
  fees,
  isBookingLoading,
  handleBookClick,
  currentMonth,
  setCurrentMonth,
  checkDateAvailability,
  setSelectedHours
}) => {
  if (!isOpen) return null;

  return (
    <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm">
      <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold">Booking Options</h2>
          <button onClick={onClose} aria-label="Close booking options" title="Close booking options" className="p-2 hover:bg-gray-100 rounded-full">
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Guests</label>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <button type="button" onClick={() => setGuestCount(Math.max(1, guestCount - 1))} disabled={guestCount <= 1} aria-label="Decrease guests" title="Decrease guests" className="px-4 py-3 bg-gray-50 hover:bg-gray-100 border-r border-gray-300 disabled:opacity-50"><Minus size={16} /></button>
              <div className="flex-1 text-center py-3 bg-white font-medium">{guestCount} {guestCount === 1 ? 'Guest' : 'Guests'}</div>
              <button type="button" onClick={() => setGuestCount(Math.min(listing.capacity || 10, guestCount + 1))} disabled={guestCount >= (listing.capacity || 10)} aria-label="Increase guests" title="Increase guests" className="px-4 py-3 bg-gray-50 hover:bg-gray-100 border-l border-gray-300 disabled:opacity-50"><Plus size={16} /></button>
            </div>
            {guestCount > (listing.includedGuests || 1) && (listing.pricePerExtraGuest || 0) > 0 && (
              <div className="mt-1 text-xs text-gray-500 flex justify-between">
                <span>Included: {listing.includedGuests} guests</span>
                <span className="font-medium text-green-700">+{formatCurrency((guestCount - (listing.includedGuests || 1)) * (listing.pricePerExtraGuest || 0))}/unit extra</span>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <button type="button" onClick={() => setIsCalendarOpen(!isCalendarOpen)} className="w-full p-3 pl-10 border border-gray-300 rounded-lg text-left flex items-center bg-white relative">
              <CalendarIcon className="absolute left-3 top-3.5 text-gray-500" size={18} />
              <span className="font-medium text-gray-900">{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
            </button>
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
          {listing.addOns && listing.addOns.length > 0 && (
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-2">
                <PackagePlus size={16} className="text-brand-600" /> Optional Extras
              </div>
              <div className="space-y-2">
                {listing.addOns.map(addon => (
                  <div key={addon.id} onClick={() => toggleAddOn(addon.id)} className={`flex items-center justify-between p-2 rounded border cursor-pointer transition-colors ${selectedAddOns.includes(addon.id) ? 'bg-white border-brand-500 ring-1 ring-brand-500' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
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
                    <div className="text-sm font-bold whitespace-nowrap">+{formatCurrency(addon.price)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {listing.settings?.allowRecurring && (
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2 cursor-pointer" onClick={() => setIsRecurring(!isRecurring)}>
                <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                  <Repeat size={16} className={isRecurring ? "text-brand-600" : "text-gray-400"} />
                  {isHourly ? 'Repeat Booking?' : 'Book Series?'}
                </div>
                <div className={`w-10 h-5 rounded-full relative transition-colors ${isRecurring ? 'bg-brand-600' : 'bg-gray-300'}`}>
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isRecurring ? 'left-6' : 'left-1'}`} />
                </div>
              </div>
              {isRecurring && (
                <div className="space-y-3 mt-3 pt-3 border-t border-gray-200">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Frequency</label>
                    <div className="flex gap-2">
                      {isHourly && <button onClick={() => setRecurrenceFreq('DAILY')} className={`flex-1 py-1.5 text-xs rounded border ${recurrenceFreq === 'DAILY' ? 'bg-white border-brand-500 text-brand-600 ring-1 ring-brand-500' : 'bg-white border-gray-300 text-gray-600'}`}>Daily</button>}
                      <button onClick={() => setRecurrenceFreq('WEEKLY')} className={`py-1.5 text-xs rounded border ${isHourly ? 'flex-1' : 'w-full'} ${recurrenceFreq === 'WEEKLY' ? 'bg-white border-brand-500 text-brand-600 ring-1 ring-brand-500' : 'bg-white border-gray-300 text-gray-600'}`}>Weekly</button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Occurrences</label>
                    <div className="flex items-center gap-3">
                      <input type="range" min={2} max={8} value={recurrenceCount} onChange={(e) => setRecurrenceCount(parseInt(e.target.value))} aria-label="Number of occurrences" title="Number of occurrences" className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-600" />
                      <span className="text-sm font-bold w-8 text-center">{recurrenceCount}</span>
                    </div>
                  </div>
                  <div className="text-[10px] bg-white p-2 rounded border border-gray-100">
                    <div className="font-bold mb-1 text-gray-700">Series Preview:</div>
                    <div className="grid grid-cols-2 gap-y-1 gap-x-2">
                      {bookingSeries.map((item, i) => (
                        <div key={i} className={`flex items-center gap-1 truncate ${item.status !== 'AVAILABLE' ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                          {item.status === 'AVAILABLE' ? <CheckCircle size={10} className="text-green-500" /> : <X size={10} />}
                          <span>{item.date.slice(5)}</span>
                          {item.status !== 'AVAILABLE' && <span className="text-[8px] uppercase ml-auto border border-red-200 px-1 rounded">Blocked</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          {isHourly && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">Select Hours</label>
                <span className="text-xs text-gray-500">{selectedHours.length} selected</span>
              </div>
              {hostOpenHours.length === 0 ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center text-gray-500 text-sm"><Ban className="mx-auto mb-2 text-gray-400" size={20} />Host is unavailable on this date.</div>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {hostOpenHours.map(hour => {
                    const booked = isSlotBooked(selectedDate, hour);
                    const isSelected = selectedHours.includes(hour);
                    return (
                      <button key={hour} onClick={() => !booked && handleHourToggle(hour)} disabled={booked} className={`py-2 rounded text-xs font-medium transition-all relative border ${booked ? 'bg-gray-100 text-gray-300 border-transparent cursor-not-allowed' : (isSelected ? 'bg-brand-600 text-white border-brand-600' : 'bg-white border-gray-200 text-gray-700 hover:border-brand-300')}`}>
                        {hour.toString().padStart(2, '0')}:00
                        {booked && <div className="absolute inset-0 flex items-center justify-center"><div className="w-[60%] h-px bg-gray-300 transform -rotate-12"></div></div>}
                      </button>
                    );
                  })}
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
          )}
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
        <div className="p-4 border-t border-gray-200 bg-white space-y-4">
          <div className="space-y-2">
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
                  <Info size={12} className="text-gray-400" />
                </span>
                <span>{formatCurrency(fees.cautionFee)}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-lg font-bold text-gray-900 border-t border-gray-200 pt-2">
              <span>Total</span>
              <span>{formatCurrency(fees.total)}</span>
            </div>
          </div>
          {user && !user.kycVerified && listing.requiresIdentityVerification && (
            <div className="flex items-start gap-2 bg-yellow-50 p-3 rounded-lg text-xs text-yellow-800">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              <span>One-time verification required to book.</span>
            </div>
          )}
          <button onClick={() => { onClose(); handleBookClick(); }} disabled={isHost || (isHourly && selectedHours.length === 0) || isBookingLoading || bookingSeries.some(s => s.status !== 'AVAILABLE')} className={`w-full font-bold py-3 rounded-lg transition ${isHost || (isHourly && selectedHours.length === 0) || bookingSeries.some(s => s.status !== 'AVAILABLE') ? 'bg-gray-300 text-gray-500' : 'bg-brand-600 text-white hover:bg-brand-700'}`}>
            {isBookingLoading ? <Loader2 className="animate-spin" size={18} /> : (isHost ? 'You host this space' : bookingSeries.some(s => s.status !== 'AVAILABLE') ? 'Dates Unavailable' : (user ? (listing.requiresIdentityVerification && !user.kycVerified ? 'Verify & Book' : (isRecurring ? 'Book Series' : 'Book Now')) : 'Sign in to Book'))}
          </button>
        </div>
      </div>
    </div>
  );
};
