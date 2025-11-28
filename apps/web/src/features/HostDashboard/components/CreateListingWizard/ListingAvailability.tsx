import React from 'react';
import { Listing, Booking } from '@fiilar/types';
import { Button } from '@fiilar/ui';
import { ArrowRight } from 'lucide-react';
import ScheduleTab from './ScheduleTab';
import CalendarTab from './CalendarTab';
import RulesTab from './RulesTab';

interface ListingAvailabilityProps {
    newListing: Partial<Listing>;
    setNewListing: React.Dispatch<React.SetStateAction<Partial<Listing>>>;
    setStep: (step: number) => void;
    availTab: 'schedule' | 'calendar' | 'rules';
    setAvailTab: (tab: 'schedule' | 'calendar' | 'rules') => void;
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
    availTab, setAvailTab, weeklySchedule, toggleDaySchedule, updateDayTime, applyWeeklySchedule,
    currentMonth, setCurrentMonth, getDaysInMonth, handleDateClick, toggleHourOverride,
    activeBookings, formatDate, selectedCalendarDate, setSelectedCalendarDate,
    tempRule, setTempRule, handleAddRule,
    tempAddOn, setTempAddOn, handleAddAddOn, handleRemoveAddOn,
    customSafety, setCustomSafety, handleAddCustomSafety, toggleSafetyItem
}) => {
    return (
        <div className="space-y-8 animate-in slide-in-from-right duration-500">
            {/* Modern Pill Tabs */}
            <div className="flex p-1.5 rounded-2xl mb-6 bg-gray-100/50 backdrop-blur-sm border border-gray-200/50">
                <button
                    onClick={() => setAvailTab('schedule')}
                    className={`flex-1 py-3 px-4 text-sm font-bold rounded-xl transition-all duration-300 ${availTab === 'schedule'
                        ? 'bg-white shadow-lg shadow-brand-500/10 text-brand-600 scale-[1.02]'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
                        }`}
                >
                    Weekly Schedule
                </button>
                <button
                    onClick={() => setAvailTab('calendar')}
                    className={`flex-1 py-3 px-4 text-sm font-bold rounded-xl transition-all duration-300 ${availTab === 'calendar'
                        ? 'bg-white shadow-lg shadow-brand-500/10 text-brand-600 scale-[1.02]'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
                        }`}
                >
                    Calendar Override
                </button>
                <button
                    onClick={() => setAvailTab('rules')}
                    className={`flex-1 py-3 px-4 text-sm font-bold rounded-xl transition-all duration-300 ${availTab === 'rules'
                        ? 'bg-white shadow-lg shadow-brand-500/10 text-brand-600 scale-[1.02]'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
                        }`}
                >
                    Rules & Extras
                </button>
            </div>

            <div className="min-h-[400px] glass-card p-6 rounded-3xl border border-white/40 shadow-sm bg-white/40">
                {availTab === 'schedule' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <ScheduleTab
                            weeklySchedule={weeklySchedule}
                            toggleDaySchedule={toggleDaySchedule}
                            updateDayTime={updateDayTime}
                            applyWeeklySchedule={applyWeeklySchedule}
                        />
                    </div>
                )}

                {availTab === 'calendar' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                )}

                {availTab === 'rules' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                )}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center pt-6 border-t border-white/20">
                <Button
                    onClick={() => setStep(2)}
                    variant="outline"
                    size="lg"
                    className="border-gray-300 hover:bg-gray-50"
                >
                    Back
                </Button>
                <Button
                    onClick={() => setStep(4)}
                    variant="primary"
                    size="lg"
                    className="shadow-lg shadow-brand-500/20 hover:shadow-brand-500/40 transition-all hover:scale-[1.02]"
                    rightIcon={<ArrowRight size={18} />}
                >
                    Continue to Verification
                </Button>
            </div>
        </div>
    );
};

export default ListingAvailability;
