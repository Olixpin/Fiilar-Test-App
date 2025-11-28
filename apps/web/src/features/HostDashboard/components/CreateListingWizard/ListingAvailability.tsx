import React, { useState } from 'react';
import { Listing, Booking } from '@fiilar/types';
import { Button } from '@fiilar/ui';
import { ArrowRight, ChevronDown, ChevronUp, Calendar, Clock, Shield } from 'lucide-react';
import ScheduleTab from './ScheduleTab';
import CalendarTab from './CalendarTab';
import RulesTab from './RulesTab';

interface ListingAvailabilityProps {
    newListing: Partial<Listing>;
    setNewListing: React.Dispatch<React.SetStateAction<Partial<Listing>>>;
    setStep: (step: number) => void;
    // availTab props removed as we're switching to collapsible sections
    weeklySchedule: Record<number, { enabled: boolean; start: number; end: number }>;
    toggleDaySchedule: (dayIndex: number) => void;
    updateDayTime: (dayIndex: number, field: 'start' | 'end', value: number) => void;
    applyWeeklySchedule: () => void;
    currentMonth: Date;
    setCurrentMonth: React.Dispatch<React.SetStateAction<Date>>;
    getDaysInMonth: (date: Date) => (Date | null)[];
    handleDateClick: (dateStr: string) => void;
    toggleHourOverride: (dateStr: string, hour: number) => void;
    activeBookings: Booking[];
    formatDate: (date: Date) => string;
    selectedCalendarDate: string | null;
    setSelectedCalendarDate: (date: string | null) => void;
    tempRule: string;
    setTempRule: (rule: string) => void;
    handleAddRule: () => void;
    tempAddOn: { name: string; price: string; description: string; image?: string };
    setTempAddOn: React.Dispatch<React.SetStateAction<{ name: string; price: string; description: string; image?: string }>>;
    handleAddAddOn: () => void;
    handleRemoveAddOn: (id: string) => void;
    customSafety: string;
    setCustomSafety: (safety: string) => void;
    handleAddCustomSafety: () => void;
    toggleSafetyItem: (item: string) => void;
}

const ListingAvailability: React.FC<ListingAvailabilityProps> = ({
    newListing, setNewListing, setStep,
    weeklySchedule, toggleDaySchedule, updateDayTime, applyWeeklySchedule,
    currentMonth, setCurrentMonth, getDaysInMonth, handleDateClick, toggleHourOverride,
    activeBookings, formatDate, selectedCalendarDate, setSelectedCalendarDate,
    tempRule, setTempRule, handleAddRule,
    tempAddOn, setTempAddOn, handleAddAddOn, handleRemoveAddOn,
    customSafety, setCustomSafety, handleAddCustomSafety, toggleSafetyItem
}) => {
    // Default to having the first section (Schedule) open
    const [expandedSections, setExpandedSections] = useState<number[]>([1]);

    const toggleSection = (section: number) => {
        setExpandedSections(prev =>
            prev.includes(section)
                ? prev.filter(s => s !== section)
                : [...prev, section]
        );
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-500">

            {/* Section 1: Weekly Schedule */}
            <div className="glass-card rounded-2xl border border-white/40 shadow-sm overflow-hidden transition-all duration-300">
                <button
                    onClick={() => toggleSection(1)}
                    className="w-full p-6 flex items-center justify-between hover:bg-white/40 transition-colors text-left"
                >
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-3">
                        <span className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shadow-sm">
                            <Clock size={20} />
                        </span>
                        Weekly Schedule
                    </h3>
                    {expandedSections.includes(1) ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
                </button>

                <div className={`transition-all duration-300 ease-in-out ${expandedSections.includes(1) ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                    <div className="p-6 pt-0 border-t border-white/20">
                        <ScheduleTab
                            weeklySchedule={weeklySchedule}
                            toggleDaySchedule={toggleDaySchedule}
                            updateDayTime={updateDayTime}
                            applyWeeklySchedule={applyWeeklySchedule}
                        />
                    </div>
                </div>
            </div>

            {/* Section 2: Calendar Override */}
            <div className="glass-card rounded-2xl border border-white/40 shadow-sm overflow-hidden transition-all duration-300">
                <button
                    onClick={() => toggleSection(2)}
                    className="w-full p-6 flex items-center justify-between hover:bg-white/40 transition-colors text-left"
                >
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-3">
                        <span className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shadow-sm">
                            <Calendar size={20} />
                        </span>
                        Calendar Override
                    </h3>
                    {expandedSections.includes(2) ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
                </button>

                <div className={`transition-all duration-300 ease-in-out ${expandedSections.includes(2) ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                    <div className="p-6 pt-0 border-t border-white/20">
                        <CalendarTab
                            newListing={newListing}
                            currentMonth={currentMonth}
                            setCurrentMonth={setCurrentMonth}
                            getDaysInMonth={getDaysInMonth}
                            handleDateClick={handleDateClick}
                            toggleHourOverride={toggleHourOverride}
                            activeBookings={activeBookings}
                            formatDate={formatDate}
                            selectedCalendarDate={selectedCalendarDate}
                            setSelectedCalendarDate={setSelectedCalendarDate}
                        />
                    </div>
                </div>
            </div>

            {/* Section 3: Rules & Extras */}
            <div className="glass-card rounded-2xl border border-white/40 shadow-sm overflow-hidden transition-all duration-300">
                <button
                    onClick={() => toggleSection(3)}
                    className="w-full p-6 flex items-center justify-between hover:bg-white/40 transition-colors text-left"
                >
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-3">
                        <span className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center shadow-sm">
                            <Shield size={20} />
                        </span>
                        Rules & Extras
                    </h3>
                    {expandedSections.includes(3) ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
                </button>

                <div className={`transition-all duration-300 ease-in-out ${expandedSections.includes(3) ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                    <div className="p-6 pt-0 border-t border-white/20">
                        <RulesTab
                            newListing={newListing}
                            setNewListing={setNewListing}
                            tempRule={tempRule}
                            setTempRule={setTempRule}
                            handleAddRule={handleAddRule}
                            tempAddOn={tempAddOn}
                            setTempAddOn={setTempAddOn}
                            handleAddAddOn={handleAddAddOn}
                            handleRemoveAddOn={handleRemoveAddOn}
                            customSafety={customSafety}
                            setCustomSafety={setCustomSafety}
                            handleAddCustomSafety={handleAddCustomSafety}
                            toggleSafetyItem={toggleSafetyItem}
                        />
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center pt-6 border-t border-white/20 mt-8">
                <Button
                    onClick={() => setStep(2)}
                    variant="ghost"
                    size="lg"
                    className="text-gray-500 hover:text-gray-900 hover:bg-white/50"
                    leftIcon={<span className="text-lg">←</span>}
                >
                    Back to Photos
                </Button>
                <Button
                    onClick={() => setStep(4)}
                    variant="primary"
                    size="lg"
                    className="shadow-xl shadow-brand-500/20 hover:shadow-brand-500/40 transition-all hover:scale-[1.02] px-8"
                    rightIcon={<ArrowRight size={18} />}
                >
                    Continue to Verification
                </Button>
            </div>
        </div>
    );
};

export default ListingAvailability;
