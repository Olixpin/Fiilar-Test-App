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
                                h-14 rounded-lg flex flex-col items-center justify-center text-xs relative transition-all border
                                ${isPastDate ? 'bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed' :
                                    hasBooking ? 'bg-brand-100 text-brand-700 border-brand-200 cursor-not-allowed' :
                                        isBlocked ? 'bg-gray-50 text-gray-400 border-gray-100 hover:bg-gray-100' :
                                            'bg-white text-gray-900 border-green-200 hover:border-green-400'
                                }
                                ${isSelected ? 'ring-2 ring-brand-500 z-10' : ''}
                            `}
                        >
                            <span className="font-bold">{date.getDate()}</span>
                            {hasBooking && <span className="w-1.5 h-1.5 bg-brand-600 rounded-full mt-1" />}
                            {!isBlocked && !hasBooking && !isPastDate && <span className="text-[10px] text-green-600 font-medium">Open</span>}
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
