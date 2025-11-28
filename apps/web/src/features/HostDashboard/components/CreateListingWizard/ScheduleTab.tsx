import React from 'react';
import { Briefcase, ChevronDown } from 'lucide-react';
import { Button } from '@fiilar/ui';

interface ScheduleTabProps {
    weeklySchedule: Record<number, { enabled: boolean; start: number; end: number }>;
    toggleDaySchedule: (dayIndex: number) => void;
    updateDayTime: (dayIndex: number, field: 'start' | 'end', value: number) => void;
    applyWeeklySchedule: () => void;
}

const ScheduleTab: React.FC<ScheduleTabProps> = ({
    weeklySchedule,
    toggleDaySchedule,
    updateDayTime,
    applyWeeklySchedule
}) => {
    return (
        <div className="space-y-4 animate-in fade-in">
            <div className="bg-blue-50 p-4 rounded-xl flex gap-3 text-sm text-blue-800 mb-4">
                <Briefcase className="shrink-0 mt-0.5" size={18} />
                <p>Set your standard weekly availability. You can override specific dates in the Calendar tab.</p>
            </div>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
                <div key={day} className="flex items-center gap-4 p-3 bg-white border border-gray-200 rounded-xl">
                    <div className="w-12 font-bold text-gray-900">{day}</div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={weeklySchedule[idx].enabled}
                            onChange={() => toggleDaySchedule(idx)}
                            title={`Enable ${day} schedule`}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500 shadow-inner"></div>
                    </label>
                    <div className="flex items-center gap-2 flex-1 justify-end h-[38px]">
                        {weeklySchedule[idx].enabled ? (
                            <>
                                <div className="relative">
                                    <select
                                        className="appearance-none p-2 pl-3 pr-8 border rounded-lg text-sm bg-gray-50 border-gray-200 text-gray-900 transition-all focus:ring-2 focus:ring-brand-100 focus:border-brand-300 outline-none cursor-pointer"
                                        value={weeklySchedule[idx].start}
                                        onChange={(e) => updateDayTime(idx, 'start', parseInt(e.target.value))}
                                        title="Start Time"
                                    >
                                        {Array.from({ length: 24 }).map((_, i) => <option key={i} value={i}>{i}:00</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                                </div>
                                <span className="text-gray-400">-</span>
                                <div className="relative">
                                    <select
                                        className="appearance-none p-2 pl-3 pr-8 border rounded-lg text-sm bg-gray-50 border-gray-200 text-gray-900 transition-all focus:ring-2 focus:ring-brand-100 focus:border-brand-300 outline-none cursor-pointer"
                                        value={weeklySchedule[idx].end}
                                        onChange={(e) => updateDayTime(idx, 'end', parseInt(e.target.value))}
                                        title="End Time"
                                    >
                                        {Array.from({ length: 24 }).map((_, i) => <option key={i} value={i}>{i}:00</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                                </div>
                            </>
                        ) : (
                            <span className="text-sm text-gray-400 italic font-medium">Unavailable</span>
                        )}
                    </div>
                </div>
            ))}
            <div className="mt-6">
                <Button
                    onClick={applyWeeklySchedule}
                    variant="primary"
                    className="w-full shadow-lg shadow-brand-500/20 hover:shadow-brand-500/30 transition-all"
                >
                    Apply Schedule (Next 3 Months)
                </Button>
                <p className="text-xs text-gray-500 text-center mt-2">
                    This will apply your weekly schedule to the next 3 months. You can override specific dates in the Calendar tab.
                </p>
            </div>
        </div>
    );
};

export default ScheduleTab;
