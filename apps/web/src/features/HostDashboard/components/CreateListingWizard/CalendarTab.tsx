import React from 'react';
import { ArrowRight, X } from 'lucide-react';
import { Listing, BookingType, Booking } from '@fiilar/types';
import { Button } from '@fiilar/ui';

interface CalendarTabProps {
    newListing: Partial<Listing>;
    currentMonth: Date;
    setCurrentMonth: React.Dispatch<React.SetStateAction<Date>>;
    getDaysInMonth: (date: Date) => (Date | null)[];
    handleDateClick: (dateStr: string) => void;
    toggleHourOverride: (dateStr: string, hour: number) => void;
    activeBookings: Booking[];
    formatDate: (date: Date) => string;
    selectedCalendarDate: string | null;
    setSelectedCalendarDate: (date: string | null) => void;
}

const CalendarTab: React.FC<CalendarTabProps> = ({
    newListing,
    currentMonth,
    setCurrentMonth,
    getDaysInMonth,
    handleDateClick,
    toggleHourOverride,
    activeBookings,
    formatDate,
    selectedCalendarDate,
    setSelectedCalendarDate
}) => {
    return (
        <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between mb-4">
                <Button
                    onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
                    variant="ghost"
                    size="sm"
                    className="rounded-full p-2 h-auto min-w-0"
                    title="Previous month"
                >
                    <ArrowRight className="rotate-180" size={20} />
                </Button>
                <h3 className="font-bold text-lg">
                    {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h3>
                <Button
                    onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
                    variant="ghost"
                    size="sm"
                    className="rounded-full p-2 h-auto min-w-0"
                    title="Next month"
                >
                    <ArrowRight size={20} />
                </Button>
            </div>

            <div className="bg-purple-50 p-4 rounded-xl flex gap-3 text-sm text-purple-800 mb-6">
                <div className="shrink-0 mt-0.5">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                </div>
                <div>
                    <p className="opacity-90">Click any date to toggle availability or set specific hours. This overrides your weekly schedule.</p>
                </div>
            </div>

            <div className="flex items-center gap-4 text-xs mb-4 px-2">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-white border border-green-200"></div>
                    <span className="text-gray-600">Open</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-50 border border-gray-200"></div>
                    <span className="text-gray-600">Blocked</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-brand-100 border border-brand-200"></div>
                    <span className="text-gray-600">Booked</span>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                    <div key={d} className="text-xs font-bold text-gray-400 uppercase">{d}</div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {getDaysInMonth(currentMonth).map((date, i) => {
                    if (!date) return <div key={i} />;
                    const dateStr = formatDate(date);
                    const isBlocked = !newListing.availability?.[dateStr];
                    const hasBooking = activeBookings.some(b => b.date === dateStr);
                    const isSelected = selectedCalendarDate === dateStr;

                    // Check if date is in the past
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const isPastDate = date < today;

                    return (
                        <button
                            key={i}
                            onClick={() => !isPastDate && handleDateClick(dateStr)}
                            disabled={isPastDate}
                            className={`
                                h-10 rounded-lg flex flex-col items-center justify-center text-xs relative transition-all border
                                ${isPastDate ? 'bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed' :
                                    hasBooking ? 'bg-brand-100 text-brand-700 border-brand-200 cursor-not-allowed' :
                                        isBlocked ? 'bg-gray-50 text-gray-400 border-gray-100 hover:bg-gray-100' :
                                            'bg-white text-gray-900 border-green-200 hover:border-green-400'
                                }
                                ${isSelected ? 'ring-2 ring-brand-500 z-10' : ''}
                            `}
                        >
                            <span className="font-bold">{date.getDate()}</span>
                            {hasBooking && <span className="w-1 h-1 bg-brand-600 rounded-full mt-0.5" />}
                            {!isBlocked && !hasBooking && !isPastDate && <span className="text-[9px] text-green-600 font-medium leading-none mt-0.5">Open</span>}
                        </button>
                    );
                })}
            </div>

            {/* Hourly Override Panel */}
            {selectedCalendarDate && newListing.priceUnit === BookingType.HOURLY && (
                <div className="mt-6 p-4 bg-white border border-gray-200 rounded-xl animate-in slide-in-from-bottom-4">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-gray-900">Hours for {selectedCalendarDate}</h4>
                        <Button
                            onClick={() => setSelectedCalendarDate(null)}
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-gray-600 p-1 h-auto min-w-0"
                            title="Close"
                        >
                            <X size={18} />
                        </Button>
                    </div>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                        {Array.from({ length: 24 }).map((_, h) => {
                            const isAvailable = newListing.availability?.[selectedCalendarDate]?.includes(h);
                            return (
                                <button
                                    key={h}
                                    onClick={() => toggleHourOverride(selectedCalendarDate, h)}
                                    className={`
                                        py-2 rounded text-xs font-medium transition-colors
                                        ${isAvailable
                                            ? 'bg-green-100 text-green-700 border border-green-200'
                                            : 'bg-gray-50 text-gray-400 border border-gray-100 hover:bg-gray-100'
                                        }
                                    `}
                                >
                                    {h}:00
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CalendarTab;
