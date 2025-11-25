import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface ListingCalendarProps {
    currentMonth: Date;
    setCurrentMonth: (date: Date) => void;
    selectedDate: string;
    setSelectedDate: (date: string) => void;
    setSelectedHours: (hours: number[]) => void;
    checkDateAvailability: (date: string) => string;
    isRecurring: boolean;
    bookingSeries: { date: string; status: string }[];
}

export const ListingCalendar: React.FC<ListingCalendarProps> = ({
    currentMonth,
    setCurrentMonth,
    selectedDate,
    setSelectedDate,
    setSelectedHours,
    checkDateAvailability,
    isRecurring,
    bookingSeries
}) => {
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();
        const daysArray = [];

        for (let i = 0; i < firstDay; i++) {
            daysArray.push(null);
        }
        for (let i = 1; i <= days; i++) {
            daysArray.push(new Date(year, month, i));
        }
        return daysArray;
    };

    const formatDate = (date: Date) => {
        return date.toISOString().split('T')[0];
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-4 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between mb-4">
                <button aria-label="Previous month" title="Previous month" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="p-1 hover:bg-gray-100 rounded"><ChevronLeft size={16} /></button>
                <span className="text-sm font-bold text-gray-900">
                    {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </span>
                <button aria-label="Next month" title="Next month" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="p-1 hover:bg-gray-100 rounded"><ChevronRight size={16} /></button>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2 text-center">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <span key={d} className="text-[10px] font-bold text-gray-400">{d}</span>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {getDaysInMonth(currentMonth).map((date, i) => {
                    if (!date) return <div key={`empty-${i}`} />;
                    const dateStr = formatDate(date);
                    const status = checkDateAvailability(dateStr);

                    const isSelected = dateStr === selectedDate;
                    const seriesMatch = isRecurring ? bookingSeries.find(s => s.date === dateStr) : null;
                    const isPartOfSeries = !!seriesMatch;
                    const isSeriesConflict = seriesMatch && seriesMatch.status !== 'AVAILABLE';
                    const isBaseDisabled = status !== 'AVAILABLE';

                    // Styles
                    let bgClass = 'bg-white hover:bg-gray-50 border-transparent';
                    let textClass = 'text-gray-700';

                    if (isSelected) {
                        bgClass = 'bg-gray-900 shadow-md scale-105 z-10 border-transparent';
                        textClass = 'text-white';
                    } else if (isSeriesConflict) {
                        bgClass = 'bg-red-100 border-red-200';
                        textClass = 'text-red-700 line-through decoration-red-400';
                    } else if (isPartOfSeries) {
                        bgClass = 'bg-brand-100 border-brand-200';
                        textClass = 'text-brand-700 font-bold';
                    } else if (isBaseDisabled) {
                        bgClass = 'bg-gray-50';
                        textClass = 'text-gray-300 cursor-not-allowed line-through decoration-gray-300';
                    }

                    return (
                        <button
                            key={dateStr}
                            disabled={isBaseDisabled && !isSeriesConflict}
                            onClick={() => {
                                setSelectedDate(dateStr);
                                setSelectedHours([]);
                            }}
                            className={`
                            relative w-full aspect-square rounded-md flex items-center justify-center text-xs font-medium transition-all border
                            ${bgClass} ${textClass}
                        `}
                        >
                            {date.getDate()}
                            {dateStr === new Date().toISOString().split('T')[0] && !isSelected && (
                                <div className="absolute bottom-1 w-1 h-1 bg-brand-500 rounded-full"></div>
                            )}
                        </button>
                    );
                })}
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-[10px] text-gray-500 border-t border-gray-100 pt-3">
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-gray-900"></div> Start</div>
                {isRecurring && <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-brand-200 border border-brand-300"></div> Series</div>}
                {isRecurring && <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-200 border border-red-300"></div> Conflict</div>}
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-gray-200"></div> Blocked</div>
            </div>
        </div>
    );
};
