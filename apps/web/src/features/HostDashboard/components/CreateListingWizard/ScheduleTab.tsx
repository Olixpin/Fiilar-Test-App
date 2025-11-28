import React from 'react';
import { Briefcase } from 'lucide-react';
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
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                    </label>
                    {weeklySchedule[idx].enabled ? (
                        <div className="flex items-center gap-2 flex-1 justify-end">
                            <select
                                className="p-2 border rounded-lg text-sm bg-gray-50"
                                value={weeklySchedule[idx].start}
                                onChange={(e) => updateDayTime(idx, 'start', parseInt(e.target.value))}
                                title="Start Time"
                            >
                                {Array.from({ length: 24 }).map((_, i) => <option key={i} value={i}>{i}:00</option>)}
                            </select>
                            <span className="text-gray-400">-</span>
                            <select
                                className="p-2 border rounded-lg text-sm bg-gray-50"
                                value={weeklySchedule[idx].end}
                                onChange={(e) => updateDayTime(idx, 'end', parseInt(e.target.value))}
                                title="End Time"
                            >
                                {Array.from({ length: 24 }).map((_, i) => <option key={i} value={i}>{i}:00</option>)}
                            </select>
                        </div>
                    ) : (
                        <div className="flex-1 text-right text-sm text-gray-400 italic">Unavailable</div>
                    )}
                </div>
            ))}
            <Button onClick={applyWeeklySchedule} variant="primary" className="w-full mt-4">Apply Schedule</Button>
        </div>
    );
};

export default ScheduleTab;
