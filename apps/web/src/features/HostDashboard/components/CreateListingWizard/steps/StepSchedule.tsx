import React from 'react';
import { Listing } from '@fiilar/types';
import StepWrapper from './StepWrapper';
import { Clock, Check, ChevronDown } from 'lucide-react';

interface StepScheduleProps {
    newListing: Partial<Listing>;
    setNewListing: React.Dispatch<React.SetStateAction<Partial<Listing>>>;
    currentStep: number;
    totalSteps: number;
    onNext: () => void;
    onBack: () => void;
    weeklySchedule: Record<number, { enabled: boolean; start: number; end: number }>;
    toggleDaySchedule: (dayIndex: number) => void;
    updateDayTime: (dayIndex: number, field: 'start' | 'end', value: number) => void;
    applyWeeklySchedule: () => void;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

const formatHour = (hour: number) => {
    if (hour === 0) return '12:00 AM';
    if (hour === 12) return '12:00 PM';
    if (hour < 12) return `${hour}:00 AM`;
    return `${hour - 12}:00 PM`;
};

const StepSchedule: React.FC<StepScheduleProps> = ({
    currentStep,
    totalSteps,
    onNext,
    onBack,
    weeklySchedule,
    toggleDaySchedule,
    updateDayTime,
    applyWeeklySchedule,
}) => {
    const enabledDays = Object.values(weeklySchedule).filter(d => d.enabled).length;

    return (
        <StepWrapper
            title="Set your availability"
            subtitle="When can guests book your space?"
            currentStep={currentStep}
            totalSteps={totalSteps}
            phaseName="Pricing"
            onNext={() => {
                applyWeeklySchedule();
                onNext();
            }}
            onBack={onBack}
            canContinue={enabledDays > 0}
        >
            <div className="space-y-4">
                {/* Quick Status */}
                <div className="text-sm text-gray-600 mb-2">
                    Available {enabledDays} day{enabledDays !== 1 ? 's' : ''} per week
                </div>

                {/* Days List */}
                <div className="space-y-3">
                    {DAYS.map((day, index) => {
                        const schedule = weeklySchedule[index];
                        const isEnabled = schedule?.enabled ?? false;
                        
                        return (
                            <div
                                key={day}
                                className={`p-4 rounded-xl border-2 transition-all ${
                                    isEnabled 
                                        ? 'border-gray-900 bg-gray-50' 
                                        : 'border-gray-200 bg-white'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <button
                                        onClick={() => toggleDaySchedule(index)}
                                        className="flex items-center gap-3"
                                    >
                                        <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                                            isEnabled 
                                                ? 'bg-gray-900 border-gray-900' 
                                                : 'border-gray-300'
                                        }`}>
                                            {isEnabled && <Check size={14} className="text-white" />}
                                        </div>
                                        <span className={`font-medium ${isEnabled ? 'text-gray-900' : 'text-gray-500'}`}>
                                            {day}
                                        </span>
                                    </button>

                                    {isEnabled && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <div className="relative">
                                                <select
                                                    value={schedule.start}
                                                    onChange={(e) => updateDayTime(index, 'start', parseInt(e.target.value))}
                                                    className="appearance-none px-3 py-1.5 pr-8 bg-white border border-gray-200 rounded-lg text-gray-700 font-medium cursor-pointer focus:border-gray-900 focus:ring-0 outline-none"
                                                    title={`Start time for ${day}`}
                                                    aria-label={`Start time for ${day}`}
                                                >
                                                    {HOURS.map(h => (
                                                        <option key={h} value={h}>{formatHour(h)}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                            </div>
                                            <span className="text-gray-400">to</span>
                                            <div className="relative">
                                                <select
                                                    value={schedule.end}
                                                    onChange={(e) => updateDayTime(index, 'end', parseInt(e.target.value))}
                                                    className="appearance-none px-3 py-1.5 pr-8 bg-white border border-gray-200 rounded-lg text-gray-700 font-medium cursor-pointer focus:border-gray-900 focus:ring-0 outline-none"
                                                    title={`End time for ${day}`}
                                                    aria-label={`End time for ${day}`}
                                                >
                                                    {HOURS.filter(h => h > schedule.start).map(h => (
                                                        <option key={h} value={h}>{formatHour(h)}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                            </div>
                                        </div>
                                    )}

                                    {!isEnabled && (
                                        <span className="text-sm text-gray-400">Unavailable</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2 pt-4">
                    <button
                        onClick={() => DAYS.forEach((_, i) => !weeklySchedule[i]?.enabled && toggleDaySchedule(i))}
                        className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                    >
                        Select all days
                    </button>
                    <button
                        onClick={() => DAYS.forEach((_, i) => weeklySchedule[i]?.enabled && toggleDaySchedule(i))}
                        className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                    >
                        Clear all
                    </button>
                </div>

                {/* Info Note */}
                <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-start gap-3">
                        <Clock size={18} className="text-gray-400 shrink-0 mt-0.5" />
                        <p className="text-sm text-gray-600">
                            This sets your weekly availability pattern. You can block or unblock specific dates later from your calendar.
                        </p>
                    </div>
                </div>
            </div>
        </StepWrapper>
    );
};

export default StepSchedule;
