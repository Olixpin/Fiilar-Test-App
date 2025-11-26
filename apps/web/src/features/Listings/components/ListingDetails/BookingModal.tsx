import React from 'react';
import { Listing, User } from '@fiilar/types';
import { Star, Minus, Plus, Calendar as CalendarIcon, CheckCircle, Repeat, X, Info } from 'lucide-react';
import { formatCurrency } from '../../../../utils/currency';
import { getAverageRating, getReviews } from '@fiilar/reviews';
import { ListingCalendar } from '@fiilar/calendar';
import { Button } from '@fiilar/ui';

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
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
    _handleHourToggle: (hour: number) => void;
    hostOpenHours: number[];
    isSlotBooked: (date: string, hour: number) => boolean;
    selectedDays: number;
    _setSelectedDays: (days: number) => void;
    fees: { subtotal: number; serviceFee: number; cautionFee: number; total: number };
    isBookingLoading: boolean;
    handleBookClick: () => void;
    _isSavedForLater: boolean;
    _handleSaveToReserveList: () => void;
    currentMonth: Date;
    setCurrentMonth: (date: Date) => void;
    checkDateAvailability: (date: string) => string;
    setSelectedHours: (hours: number[]) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
    isOpen,
    onClose,
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
    _handleHourToggle,
    hostOpenHours,
    isSlotBooked,
    selectedDays,
    _setSelectedDays,
    fees,
    isBookingLoading,
    handleBookClick,
    _isSavedForLater,
    _handleSaveToReserveList,
    currentMonth,
    setCurrentMonth,
    checkDateAvailability,
    setSelectedHours
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200 overflow-hidden">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur rounded-full hover:bg-gray-100 transition-colors"
                >
                    <X size={20} className="text-gray-500" />
                </button>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto md:overflow-hidden flex flex-col-reverse md:flex-row" id="booking-scroll-container">

                    {/* Left Column: The Receipt (Price Summary) */}
                    <div className="w-full md:w-2/5 bg-gradient-to-br from-gray-50 to-gray-100/50 p-6 md:p-8 flex flex-col md:overflow-y-auto border-t md:border-t-0 border-gray-200 pb-32 md:pb-8">
                        {/* Listing Preview (Desktop Only) */}
                        <div className="hidden md:block aspect-[4/3] rounded-xl overflow-hidden mb-4 shadow-md">
                            <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                        </div>

                        <h2 className="hidden md:block text-xl font-bold text-gray-900 mb-2 line-clamp-2 font-display">{listing.title}</h2>

                        <div className="hidden md:flex items-center gap-2 text-sm text-gray-600 mb-6">
                            <Star size={16} className="fill-brand-500 text-brand-500" />
                            <span className="font-medium text-gray-900">{getAverageRating(listing.id).toFixed(1)}</span>
                            <span>({getReviews(listing.id).length} reviews)</span>
                        </div>

                        {/* Price Breakdown - Enhanced for Transparency */}
                        <div className="mt-auto" id="price-breakdown">
                            <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Price Summary</h3>
                            <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">

                                {/* Base Rate Calculation */}
                                <div className="space-y-2">
                                    {/* Time/Duration Line */}
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">
                                            {isHourly
                                                ? `${selectedHours.length || 1} ${selectedHours.length === 1 ? 'hour' : 'hours'} × ${formatCurrency(listing.price)}/hr`
                                                : `${selectedDays} ${selectedDays === 1 ? 'day' : 'days'} × ${formatCurrency(listing.price)}/day`
                                            }
                                        </span>
                                        <span className="font-medium text-gray-900">
                                            {formatCurrency(listing.price * (isHourly ? (selectedHours.length || 1) : selectedDays))}
                                        </span>
                                    </div>

                                    {/* Guest Pricing Breakdown */}
                                    {typeof listing.includedGuests === 'number' && listing.includedGuests > 0 && typeof listing.pricePerExtraGuest === 'number' && listing.pricePerExtraGuest > 0 && guestCount > 0 && (
                                        <div className="pl-2 space-y-1 border-l-2 border-gray-200">
                                            {/* Base guests included */}
                                            <div className="flex justify-between text-xs text-gray-500">
                                                <span>Base ({Math.min(guestCount, listing.includedGuests)} {Math.min(guestCount, listing.includedGuests) === 1 ? 'guest' : 'guests'} included)</span>
                                                <span>—</span>
                                            </div>

                                            {/* Additional guests charge */}
                                            {guestCount > listing.includedGuests && (
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-gray-600">
                                                        + {guestCount - listing.includedGuests} extra {guestCount - listing.includedGuests === 1 ? 'guest' : 'guests'} × {formatCurrency(listing.pricePerExtraGuest)}
                                                    </span>
                                                    <span className="font-medium text-gray-900">
                                                        {formatCurrency((guestCount - listing.includedGuests) * listing.pricePerExtraGuest)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Simple guest count (when no tiered pricing) */}
                                    {(!listing.includedGuests || !listing.pricePerExtraGuest) && guestCount > 1 && (
                                        <div className="text-xs text-gray-500 pl-1">
                                            For {guestCount} guests
                                        </div>
                                    )}
                                </div>

                                {/* Add-ons Itemized */}
                                {selectedAddOns.length > 0 && listing.addOns && (
                                    <div className="space-y-2 pt-2 border-t border-gray-100">
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Optional Extras</p>
                                        {listing.addOns
                                            .filter(addOn => selectedAddOns.includes(addOn.id))
                                            .map(addOn => (
                                                <div key={addOn.id} className="flex justify-between text-sm">
                                                    <span className="text-gray-600">+ {addOn.name}</span>
                                                    <span className="font-medium text-gray-900">{formatCurrency(addOn.price)}</span>
                                                </div>
                                            ))
                                        }
                                    </div>
                                )}

                                {/* Recurring Multiplier */}
                                {isRecurring && recurrenceCount > 1 && (
                                    <div className="flex justify-between text-sm pt-2 border-t border-gray-100">
                                        <span className="text-gray-600">× {recurrenceCount} bookings</span>
                                        <span className="font-medium text-gray-900">{formatCurrency(fees.subtotal)}</span>
                                    </div>
                                )}

                                {/* Subtotal */}
                                {!isRecurring && (
                                    <div className="flex justify-between text-sm pt-2 border-t border-gray-100">
                                        <span className="font-medium text-gray-700">Subtotal</span>
                                        <span className="font-semibold text-gray-900">{formatCurrency(fees.subtotal)}</span>
                                    </div>
                                )}

                                {/* Service Fee with Tooltip */}
                                <div className="flex justify-between text-sm group relative">
                                    <span className="flex items-center gap-1 text-gray-600">
                                        Service Fee (10%)
                                        <Info size={12} className="text-gray-400 cursor-help" />
                                        <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-56 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
                                            Helps us run and improve the platform, provide customer support, and keep your data secure.
                                        </div>
                                    </span>
                                    <span className="font-medium text-gray-900">{formatCurrency(fees.serviceFee)}</span>
                                </div>

                                {/* Caution Fee with Tooltip */}
                                {fees.cautionFee > 0 && (
                                    <div className="flex justify-between text-sm group relative pb-2 border-b border-gray-100">
                                        <span className="flex items-center gap-1 text-amber-700">
                                            Caution Deposit
                                            <Info size={12} className="text-amber-600 cursor-help" />
                                            <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-56 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
                                                <strong>Refundable deposit</strong> held during your booking. Returned within 48 hours after checkout if no damages occur.
                                            </div>
                                        </span>
                                        <span className="font-medium text-amber-700">{formatCurrency(fees.cautionFee)}</span>
                                    </div>
                                )}

                                {/* Total */}
                                <div className="flex justify-between items-center text-lg font-bold text-gray-900 pt-2 font-display">
                                    <span>Total Due</span>
                                    <span>{formatCurrency(fees.total)}</span>
                                </div>

                                {/* Refund Note */}
                                {fees.cautionFee > 0 && (
                                    <p className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                                        You'll pay <strong>{formatCurrency(fees.total)}</strong> now.
                                        <strong className="text-amber-700"> {formatCurrency(fees.cautionFee)}</strong> will be refunded after checkout.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: The Configurator */}
                    <div className="w-full md:w-3/5 p-6 md:p-10 md:overflow-y-auto custom-scrollbar pb-6 md:pb-10">

                        {/* Mobile Header (Image + Title) */}
                        <div className="md:hidden mb-8">
                            <div className="aspect-video rounded-xl overflow-hidden mb-4 shadow-sm">
                                <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2 font-display">{listing.title}</h2>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Star size={16} className="fill-brand-500 text-brand-500" />
                                <span className="font-medium text-gray-900">{getAverageRating(listing.id).toFixed(1)}</span>
                                <span>({getReviews(listing.id).length} reviews)</span>
                            </div>
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 mb-6 font-display hidden md:block">Booking Details</h3>
                        <div className="space-y-10">

                            {/* Guest Selection */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Guests</label>
                                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden p-1 bg-white hover:border-brand-500 hover:ring-1 hover:ring-brand-500 transition-all">
                                    <button
                                        type="button"
                                        onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                                        disabled={guestCount <= 1}
                                        className="p-3 hover:bg-gray-100 rounded-lg disabled:opacity-50 transition-all active:scale-95"
                                    >
                                        <Minus size={18} />
                                    </button>
                                    <div className="flex-1 text-center">
                                        <div className="font-semibold text-gray-900">
                                            {guestCount} {guestCount === 1 ? 'Guest' : 'Guests'}
                                            {listing.capacity && (
                                                <span className="text-gray-500 font-normal"> | max {listing.capacity}</span>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setGuestCount(Math.min(listing.capacity || 10, guestCount + 1))}
                                        disabled={guestCount >= (listing.capacity || 10)}
                                        className="p-3 hover:bg-gray-100 rounded-lg disabled:opacity-50 transition-all active:scale-95"
                                    >
                                        <Plus size={18} />
                                    </button>
                                </div>
                                {/* Pricing tier info - below field */}
                                {typeof listing.includedGuests === 'number' && listing.includedGuests > 0 && typeof listing.pricePerExtraGuest === 'number' && listing.pricePerExtraGuest > 0 && (
                                    <p className="text-xs text-gray-600 mt-2 font-medium">
                                        First {listing.includedGuests} {listing.includedGuests === 1 ? 'guest' : 'guests'} included, then {formatCurrency(listing.pricePerExtraGuest)} per guest
                                    </p>
                                )}
                            </div>

                            {/* Date Selection */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Date</label>
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                                        className="w-full p-4 pl-12 border border-gray-200 rounded-xl hover:border-brand-500 hover:ring-1 hover:ring-brand-500 text-left flex items-center transition-all bg-white font-medium"
                                    >
                                        <CalendarIcon className="absolute left-4 text-gray-500" size={20} />
                                        {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })}
                                    </button>
                                </div>
                                {isCalendarOpen && (
                                    <div className="mt-4 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden animate-in fade-in zoom-in-95">
                                        <div className="p-4">
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
                                        </div>
                                        <div className="bg-gray-50 p-3 border-t border-gray-100 flex justify-end gap-2">
                                            <button
                                                onClick={() => setIsCalendarOpen(false)}
                                                className="text-sm font-medium text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => setIsCalendarOpen(false)}
                                                className="text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 px-6 py-2 rounded-lg shadow-sm transition-all transform active:scale-95"
                                            >
                                                Apply Date
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Hourly Selection (Start/End Dropdowns) */}
                            {isHourly && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Start Time</label>
                                        <select
                                            className="w-full p-4 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-500 focus:border-brand-500 hover:border-brand-500 outline-none transition-all appearance-none cursor-pointer"
                                            value={selectedHours.length > 0 ? Math.min(...selectedHours) : ''}
                                            onChange={(e) => {
                                                const start = parseInt(e.target.value);
                                                const currentEnd = selectedHours.length > 0 ? Math.max(...selectedHours) + 1 : start + 1;

                                                // End must be at least start + 1
                                                const end = Math.max(currentEnd, start + 1);

                                                // Build range from start to end, skipping booked slots
                                                const newRange = [];
                                                for (let h = start; h < end; h++) {
                                                    if (!isSlotBooked(selectedDate, h)) {
                                                        newRange.push(h);
                                                    }
                                                }

                                                // If range is empty (all booked), just select the start hour if available
                                                if (newRange.length === 0 && !isSlotBooked(selectedDate, start)) {
                                                    newRange.push(start);
                                                }

                                                setSelectedHours(newRange);
                                            }}
                                        >
                                            <option value="" disabled>Select Start Time</option>
                                            {hostOpenHours.map(h => (
                                                <option key={h} value={h} disabled={isSlotBooked(selectedDate, h)}>
                                                    {h.toString().padStart(2, '0')}:00
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">End Time</label>
                                        <select
                                            className="w-full p-4 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-500 focus:border-brand-500 hover:border-brand-500 outline-none transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50"
                                            value={selectedHours.length > 0 ? Math.max(...selectedHours) + 1 : ''}
                                            disabled={selectedHours.length === 0}
                                            onChange={(e) => {
                                                const end = parseInt(e.target.value);
                                                const currentStart = selectedHours.length > 0 ? Math.min(...selectedHours) : 0;

                                                // CRITICAL: End must be greater than start
                                                if (end <= currentStart) {
                                                    // Don't allow selecting an end time <= start time
                                                    return;
                                                }

                                                // Build range from start to end, skipping booked slots
                                                const newRange = [];
                                                for (let h = currentStart; h < end; h++) {
                                                    if (!isSlotBooked(selectedDate, h)) {
                                                        newRange.push(h);
                                                    }
                                                }

                                                // Only update if we have a valid range
                                                if (newRange.length > 0) {
                                                    setSelectedHours(newRange);
                                                }
                                            }}
                                        >
                                            <option value="" disabled>Select End Time</option>
                                            {hostOpenHours.map(h => {
                                                const endValue = h + 1;
                                                const currentStart = selectedHours.length > 0 ? Math.min(...selectedHours) : -1;
                                                // Disable end times that are <= current start time
                                                const isDisabled = endValue <= currentStart;

                                                return (
                                                    <option key={h} value={endValue} disabled={isDisabled}>
                                                        {endValue.toString().padStart(2, '0')}:00
                                                    </option>
                                                );
                                            })}
                                        </select>
                                    </div>
                                </div>
                            )}

                            {/* Recurrence Toggle */}
                            {listing.settings?.allowRecurring && (
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                    <div className="flex items-center justify-between cursor-pointer select-none" onClick={() => setIsRecurring(!isRecurring)}>
                                        <div className="flex items-center gap-3 font-bold text-gray-900">
                                            <Repeat size={18} className={isRecurring ? "text-brand-600" : "text-gray-400"} />
                                            {isHourly ? 'Repeat Booking?' : 'Book Series?'}
                                        </div>
                                        <div className={`w-11 h-6 rounded-full relative transition-colors ${isRecurring ? 'bg-brand-600' : 'bg-gray-300'}`}>
                                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${isRecurring ? 'left-6' : 'left-1'}`} />
                                        </div>
                                    </div>

                                    {isRecurring && (
                                        <div className="mt-4 pt-4 border-t border-gray-200 animate-in slide-in-from-top-2">
                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Frequency</label>
                                                    <div className="flex gap-2">
                                                        {isHourly && (
                                                            <button
                                                                onClick={() => setRecurrenceFreq('DAILY')}
                                                                className={`flex-1 py-2 text-xs rounded-lg border font-medium transition-colors ${recurrenceFreq === 'DAILY' ? 'bg-brand-50 border-brand-500 text-brand-700' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}
                                                            >
                                                                Daily
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => setRecurrenceFreq('WEEKLY')}
                                                            className={`py-2 text-xs rounded-lg border font-medium transition-colors ${isHourly ? 'flex-1' : 'w-full'} ${recurrenceFreq === 'WEEKLY' ? 'bg-brand-50 border-brand-500 text-brand-700' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}
                                                        >
                                                            Weekly
                                                        </button>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Repeats</label>
                                                    <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-2">
                                                        <input
                                                            type="range"
                                                            min={2}
                                                            max={recurrenceFreq === 'DAILY' ? 30 : 12}
                                                            value={Math.min(recurrenceCount, recurrenceFreq === 'DAILY' ? 30 : 12)}
                                                            onChange={(e) => setRecurrenceCount(parseInt(e.target.value))}
                                                            className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
                                                        />
                                                        <span className="text-sm font-bold w-6 text-center">{recurrenceCount}</span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {recurrenceFreq === 'DAILY' ? 'Up to 30 days' : 'Up to 12 weeks'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Series Preview */}
                                            {bookingSeries.length > 0 && (
                                                <div className="mt-4 pt-4 border-t border-gray-200">
                                                    <div className="font-semibold text-sm text-gray-700 mb-2">Series Preview:</div>
                                                    <div className="bg-white border border-gray-100 rounded-lg p-3">
                                                        <div className="grid grid-cols-2 gap-2">
                                                            {bookingSeries.map((item, i) => (
                                                                <div
                                                                    key={i}
                                                                    className={`flex items-center gap-2 text-xs ${item.status !== 'AVAILABLE'
                                                                        ? 'text-red-600 font-medium'
                                                                        : 'text-gray-600'
                                                                        }`}
                                                                >
                                                                    {item.status === 'AVAILABLE' ? (
                                                                        <CheckCircle size={14} className="text-green-500 shrink-0" />
                                                                    ) : (
                                                                        <X size={14} className="text-red-500 shrink-0" />
                                                                    )}
                                                                    <span className="truncate">{item.date.slice(5)}</span>
                                                                    {item.status !== 'AVAILABLE' && (
                                                                        <span className="ml-auto text-[10px] uppercase bg-red-50 text-red-600 px-1.5 py-0.5 rounded border border-red-200">
                                                                            BLOCKED
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Add-ons / Optional Extras */}
                            {listing.addOns && listing.addOns.length > 0 && (
                                <div className="bg-gray-50/50 rounded-xl p-5 border border-gray-100">
                                    <label className="block text-sm font-bold text-gray-700 mb-3">Optional Extras</label>
                                    <div className="space-y-3">
                                        {listing.addOns.map(addOn => (
                                            <div
                                                key={addOn.id}
                                                onClick={() => toggleAddOn(addOn.id)}
                                                className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all transform ${selectedAddOns.includes(addOn.id)
                                                    ? 'border-brand-500 bg-white ring-2 ring-brand-500 shadow-sm scale-[1.02]'
                                                    : 'border-gray-200 bg-white hover:border-brand-300 hover:shadow-sm'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${selectedAddOns.includes(addOn.id)
                                                        ? 'bg-brand-500 border-brand-500 text-white scale-110'
                                                        : 'border-gray-300 bg-white'
                                                        }`}>
                                                        {selectedAddOns.includes(addOn.id) && <CheckCircle size={12} strokeWidth={3} className="animate-in zoom-in duration-200" />}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{addOn.name}</p>
                                                        {addOn.description && <p className="text-xs text-gray-500">{addOn.description}</p>}
                                                    </div>
                                                </div>
                                                <p className="font-medium text-gray-900">{formatCurrency(addOn.price)}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}


                            {/* Action Buttons (Desktop Only) */}
                            <div className="hidden md:block pt-2">
                                <Button
                                    onClick={handleBookClick}
                                    disabled={isHost || (isHourly && hostOpenHours.length === 0) || isBookingLoading || bookingSeries.some(s => s.status !== 'AVAILABLE')}
                                    variant="primary"
                                    size="lg"
                                    className="w-full py-4 text-lg shadow-xl shadow-brand-500/20"
                                    isLoading={isBookingLoading}
                                >
                                    {!isBookingLoading && (
                                        isHost ? 'You host this space' :
                                            bookingSeries.some(s => s.status !== 'AVAILABLE') ? 'Dates Unavailable' :
                                                (user ?
                                                    (listing.requiresIdentityVerification && !user.kycVerified ? 'Verify & Book' : (isRecurring ? `Book Series` : 'Confirm & Pay'))
                                                    : 'Sign in to Book'
                                                )
                                    )}
                                </Button>

                                {!user && (
                                    <p className="text-center text-xs text-gray-500 mt-3">You won't be charged yet</p>
                                )}
                            </div>

                        </div>
                    </div>
                </div>

                {/* Mobile Sticky Footer */}
                <div className="md:hidden border-t border-gray-200 bg-white p-4 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-20">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <p className="text-xs text-gray-500 font-medium">Total Price</p>
                            <p className="text-xl font-bold text-gray-900">{formatCurrency(fees.total)}</p>
                        </div>
                        <button
                            onClick={() => {
                                document.getElementById('price-breakdown')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="text-xs font-medium text-gray-500 underline"
                        >
                            View details
                        </button>
                    </div>
                    <Button
                        onClick={handleBookClick}
                        disabled={isHost || (isHourly && hostOpenHours.length === 0) || isBookingLoading || bookingSeries.some(s => s.status !== 'AVAILABLE')}
                        variant="primary"
                        size="lg"
                        className="w-full py-3.5 text-lg shadow-lg shadow-brand-500/20"
                        isLoading={isBookingLoading}
                    >
                        {!isBookingLoading && (
                            isHost ? 'Manage' :
                                bookingSeries.some(s => s.status !== 'AVAILABLE') ? 'Unavailable' :
                                    (user ? 'Book Now' : 'Sign in')
                        )}
                    </Button>
                </div>
            </div >
        </div >
    );
};
