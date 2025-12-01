
import React, { useState } from 'react';
import { Briefcase, ChevronDown, Copy, Calendar, X, Clock } from 'lucide-react';
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
    const [showModal, setShowModal] = useState(false);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const handleCopyMonToAll = () => {
        const mon = weeklySchedule[1]; // Monday
        days.forEach((_, idx) => {
            if (idx === 1) return; // Skip Monday
            // Sync enabled state
            if (weeklySchedule[idx].enabled !== mon.enabled) {
                toggleDaySchedule(idx);
            }
            // Sync times if enabled (or will be enabled)
            if (mon.enabled) {
                updateDayTime(idx, 'start', mon.start);
                updateDayTime(idx, 'end', mon.end);
            }
        });
    };

    const handleSetWeekdays9to5 = () => {
        days.forEach((_, idx) => {
            const isWeekday = idx >= 1 && idx <= 5;
            // Enable weekdays, disable weekends
            if (weeklySchedule[idx].enabled !== isWeekday) {
                toggleDaySchedule(idx);
            }
            // Set 9-5 (17)
            if (isWeekday) {
                updateDayTime(idx, 'start', 9);
                updateDayTime(idx, 'end', 17);
            }
        });
    };

    const getScheduleSummary = () => {
        const enabledDays = days.filter((_, idx) => weeklySchedule[idx].enabled);
        if (enabledDays.length === 0) return 'No days set';
        if (enabledDays.length === 7) return 'All days';
        if (enabledDays.length === 5 && enabledDays.every(d => !['Sun', 'Sat'].includes(d))) return 'Weekdays';
        return enabledDays.join(', ');
    };

    // Inline schedule editor content (not a nested component to avoid remount issues)
    const scheduleEditorContent = (
        <div className="space-y-4">
            {/* Quick Actions */}
            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={handleCopyMonToAll}
                    className="flex-1 px-3 py-2.5 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    <Copy size={14} /> Copy Mon
                </button>
                <button
                    type="button"
                    onClick={handleSetWeekdays9to5}
                    className="flex-1 px-3 py-2.5 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    <Calendar size={14} /> 9-5 Weekdays
                </button>
            </div>

            {/* Days List */}
            <div className="space-y-4 pb-2">
                {days.map((day, idx) => (
                    <div key={day} className={`p-5 rounded-xl border transition-all ${weeklySchedule[idx].enabled ? 'bg-white border-gray-200 shadow-sm' : 'bg-gray-50 border-gray-100'}`}>
                        <div className="flex items-center justify-between mb-4">
                            <span className={`font-bold text-base ${weeklySchedule[idx].enabled ? 'text-gray-900' : 'text-gray-400'}`}>{day}</span>
                            <button
                                type="button"
                                onClick={() => toggleDaySchedule(idx)}
                                aria-label={`Toggle ${day} availability`}
                                className={`relative w-12 h-7 rounded-full transition-colors flex items-center px-[3px] ${
                                    weeklySchedule[idx].enabled ? 'bg-brand-500' : 'bg-gray-200'
                                }`}
                            >
                                <span
                                    className={`h-5 w-5 rounded-full bg-white shadow-inner transform transition-transform ${
                                        weeklySchedule[idx].enabled ? 'translate-x-[22px]' : 'translate-x-0'
                                    }`}
                                />
                            </button>
                        </div>
                        {weeklySchedule[idx].enabled && (
                            <div className="flex items-center gap-3">
                                <select
                                    className="flex-1 p-2.5 pr-8 border rounded-lg text-sm bg-white border-gray-200 appearance-none font-medium"
                                    value={weeklySchedule[idx].start}
                                    onChange={(e) => updateDayTime(idx, 'start', parseInt(e.target.value))}
                                    aria-label={`${day} start time`}
                                >
                                    {Array.from({ length: 24 }).map((_, i) => <option key={i} value={i}>{i}:00</option>)}
                                </select>
                                <span className="text-gray-400 text-sm font-medium">to</span>
                                <select
                                    className="flex-1 p-2.5 pr-8 border rounded-lg text-sm bg-white border-gray-200 appearance-none font-medium"
                                    value={weeklySchedule[idx].end}
                                    onChange={(e) => updateDayTime(idx, 'end', parseInt(e.target.value))}
                                    aria-label={`${day} end time`}
                                >
                                    {Array.from({ length: 24 }).map((_, i) => <option key={i} value={i}>{i}:00</option>)}
                                </select>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* Mobile: Collapsible Inline Weekly Schedule */}
            <div className="md:hidden">
                <button
                    type="button"
                    onClick={() => setShowModal((prev) => !prev)}
                    className="w-full bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all text-left"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-brand-50 text-brand-600 rounded-lg">
                                <Clock size={20} />
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm text-gray-900">Weekly Schedule</h4>
                                <p className="text-xs text-gray-500 mt-0.5">{getScheduleSummary()}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-brand-600 font-medium">{showModal ? 'Hide' : 'Edit'}</span>
                            <ChevronDown
                                size={16}
                                className={`text-gray-400 transition-transform ${showModal ? 'rotate-180' : ''}`}
                            />
                        </div>
                    </div>
                </button>

                {showModal && (
                    <div className="mt-3 bg-white border border-gray-200 rounded-xl shadow-sm max-h-[60vh] overflow-y-auto px-4 py-4">
                        {scheduleEditorContent}
                        <div className="mt-4">
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="w-full px-4 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-semibold transition-colors"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Desktop: Full Inline View */}
            <div className="hidden md:block space-y-6">
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                        <div className="p-2 bg-brand-50 text-brand-600 rounded-lg">
                            <Briefcase size={18} />
                        </div>
                        <span>Quickly set your availability</span>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button
                            onClick={handleCopyMonToAll}
                            className="flex-1 sm:flex-none px-3 py-2 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors flex items-center justify-center gap-2"
                            title="Copy Monday's schedule to all days"
                        >
                            <Copy size={14} /> Copy Mon to All
                        </button>
                        <button
                            onClick={handleSetWeekdays9to5}
                            className="flex-1 sm:flex-none px-3 py-2 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            <Calendar size={14} /> Weekdays 9-5
                        </button>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100 shadow-sm overflow-hidden">
                    {days.map((day, idx) => (
                        <div
                            key={day}
                            className={`flex flex-wrap sm:flex-nowrap items-center gap-y-3 gap-x-4 p-4 transition-colors ${
                                weeklySchedule[idx].enabled ? 'bg-white' : 'bg-gray-50/50'
                            }`}
                        >
                            <div className="flex items-center justify-between w-full sm:w-auto gap-4 min-w-[120px]">
                                <div className={`font-bold ${weeklySchedule[idx].enabled ? 'text-gray-900' : 'text-gray-400'}`}>{day}</div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={weeklySchedule[idx].enabled}
                                        onChange={() => toggleDaySchedule(idx)}
                                        title={`Enable ${day} schedule`}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500 shadow-inner"></div>
                                </label>
                            </div>

                            <div className="flex items-center gap-2 w-full sm:w-auto sm:flex-1 justify-end h-[38px] sm:h-auto border-t sm:border-t-0 border-gray-100 pt-3 sm:pt-0">
                                {weeklySchedule[idx].enabled ? (
                                    <div className="flex items-center gap-2 w-full sm:w-auto">
                                        <div className="relative flex-1 sm:flex-none w-full sm:w-32">
                                            <select
                                                className="w-full appearance-none p-2 pl-3 pr-8 border rounded-lg text-sm bg-white border-gray-200 text-gray-900 transition-all focus:ring-2 focus:ring-brand-100 focus:border-brand-300 outline-none cursor-pointer hover:border-gray-300"
                                                value={weeklySchedule[idx].start}
                                                onChange={(e) => updateDayTime(idx, 'start', parseInt(e.target.value))}
                                                aria-label={`${days[idx]} start time`}
                                            >
                                                {Array.from({ length: 24 }).map((_, i) => <option key={i} value={i}>{i}:00</option>)}
                                            </select>
                                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                                        </div>
                                        <span className="text-gray-300 font-light px-1">to</span>
                                        <div className="relative flex-1 sm:flex-none w-full sm:w-32">
                                            <select
                                                className="w-full appearance-none p-2 pl-3 pr-8 border rounded-lg text-sm bg-white border-gray-200 text-gray-900 transition-all focus:ring-2 focus:ring-brand-100 focus:border-brand-300 outline-none cursor-pointer hover:border-gray-300"
                                                value={weeklySchedule[idx].end}
                                                onChange={(e) => updateDayTime(idx, 'end', parseInt(e.target.value))}
                                                aria-label={`${days[idx]} end time`}
                                            >
                                                {Array.from({ length: 24 }).map((_, i) => <option key={i} value={i}>{i}:00</option>)}
                                            </select>
                                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                                        </div>
                                    </div>
                                ) : (
                                    <span className="text-sm text-gray-400 italic font-medium w-full text-center sm:text-right sm:w-auto py-2">Unavailable</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-6">
                <Button
                    onClick={applyWeeklySchedule}
                    variant="primary"
                    className="w-full shadow-lg shadow-brand-500/20 hover:shadow-brand-500/30 transition-all py-3"
                >
                    Apply Schedule (Next 3 Months)
                </Button>
                <p className="text-xs text-gray-500 text-center mt-3">
                    This will apply your weekly schedule to the next 3 months. You can override specific dates in the Calendar tab.
                </p>
            </div>
        </div >
    );
};

export default ScheduleTab;
