import React from 'react';
import { Listing, User, BookingType } from '@fiilar/types';
import { Star, Minus, Plus, Calendar as CalendarIcon, PackagePlus, CheckCircle, Repeat, X, Ban, Info, AlertCircle, Heart } from 'lucide-react';
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
    handleHourToggle,
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
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in-95 duration-200">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur rounded-full hover:bg-gray-100 transition-colors"
                >
                    <X size={20} className="text-gray-500" />
                </button>

                {/* Left Column: Visuals & Summary */}
                <div className="w-full md:w-2/5 bg-gray-50 p-6 md:p-8 flex flex-col">
                    <div className="aspect-[4/3] rounded-xl overflow-hidden mb-6 shadow-md">
                        <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{listing.title}</h2>

                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
                        <Star size={16} className="fill-brand-500 text-brand-500" />
                        <span className="font-medium text-gray-900">{getAverageRating(listing.id).toFixed(1)}</span>
                        <span>({getReviews(listing.id).length} reviews)</span>
                    </div>

                    <div className="mt-auto pt-6 border-t border-gray-200">
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Total Price</p>
                                <p className="text-3xl font-bold text-gray-900">{formatCurrency(fees.total)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500 mb-1">Rate</p>
                                <p className="font-medium text-gray-900">{formatCurrency(listing.price)} <span className="text-sm font-normal text-gray-500">/{listing.priceUnit === BookingType.HOURLY ? 'hr' : 'day'}</span></p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Booking Form */}
                <div className="w-full md:w-3/5 p-6 md:p-8 overflow-y-auto">
                    <div className="space-y-6">

                        {/* Guest Selection */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Guests</label>
                            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden p-1">
                                <button
                                    type="button"
                                    onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                                    disabled={guestCount <= 1}
                                    className="p-3 hover:bg-gray-100 rounded-lg disabled:opacity-50 transition-colors"
                                >
                                    <Minus size={18} />
                                </button>
                                <div className="flex-1 text-center font-semibold text-gray-900">
                                    {guestCount} {guestCount === 1 ? 'Guest' : 'Guests'}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setGuestCount(Math.min(listing.capacity || 10, guestCount + 1))}
                                    disabled={guestCount >= (listing.capacity || 10)}
                                    className="p-3 hover:bg-gray-100 rounded-lg disabled:opacity-50 transition-colors"
                                >
                                    <Plus size={18} />
                                </button>
                            </div>
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
                                <div className="mt-4 p-4 border border-gray-100 rounded-xl shadow-sm">
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
                            )}
                        </div>

                        {/* Hourly Selection (Start/End Dropdowns) */}
                        {isHourly && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Start Time</label>
                                    <select
                                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all appearance-none"
                                        value={selectedHours.length > 0 ? Math.min(...selectedHours) : ''}
                                        onChange={(e) => {
                                            const start = parseInt(e.target.value);
                                            const currentEnd = selectedHours.length > 0 ? Math.max(...selectedHours) + 1 : start + 1;
                                            const end = Math.max(currentEnd, start + 1);

                                            const newRange = [];
                                            for (let h = start; h < end; h++) newRange.push(h);
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
                                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all appearance-none"
                                        value={selectedHours.length > 0 ? Math.max(...selectedHours) + 1 : ''}
                                        onChange={(e) => {
                                            const end = parseInt(e.target.value);
                                            const currentStart = selectedHours.length > 0 ? Math.min(...selectedHours) : end - 1;
                                            const start = Math.min(currentStart, end - 1);

                                            const newRange = [];
                                            for (let h = start; h < end; h++) newRange.push(h);
                                            setSelectedHours(newRange);
                                        }}
                                    >
                                        <option value="" disabled>Select End Time</option>
                                        {hostOpenHours.map(h => (
                                            <option key={h} value={h + 1}>
                                                {(h + 1).toString().padStart(2, '0')}:00
                                            </option>
                                        ))}
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
                                                        max={8}
                                                        value={recurrenceCount}
                                                        onChange={(e) => setRecurrenceCount(parseInt(e.target.value))}
                                                        className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
                                                    />
                                                    <span className="text-sm font-bold w-6 text-center">{recurrenceCount}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Price Breakdown */}
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
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
                                    <span className="flex items-center gap-1">Caution Fee <Info size={12} /></span>
                                    <span>{formatCurrency(fees.cautionFee)}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center text-lg font-bold text-gray-900 border-t border-gray-200 pt-3 mt-2">
                                <span>Total</span>
                                <span>{formatCurrency(fees.total)}</span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-2">
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
        </div>
    );
};
