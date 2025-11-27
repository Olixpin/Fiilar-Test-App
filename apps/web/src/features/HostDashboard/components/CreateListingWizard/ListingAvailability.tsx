import React from 'react';
import { Listing, BookingType, Booking, CancellationPolicy, PricingModel, NightlyConfig, DailyConfig, HourlyConfig } from '@fiilar/types';
import { Button, useLocale } from '@fiilar/ui';
import {
    ArrowRight, Briefcase, X, Plus, FileText, PackagePlus, Settings, Repeat, Zap, Shield, Image, Clock
} from 'lucide-react';

const SAFETY_OPTIONS = ['Smoke Alarm', 'Carbon Monoxide Alarm', 'Fire Extinguisher', 'First Aid Kit', 'Emergency Exit'];

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
    handleRemoveRule: (index: number) => void;
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
    tempRule, setTempRule, handleAddRule, handleRemoveRule,
    tempAddOn, setTempAddOn, handleAddAddOn, handleRemoveAddOn,
    customSafety, setCustomSafety, handleAddCustomSafety, toggleSafetyItem
}) => {
    const { locale } = useLocale();
    
    return (
        <div className="space-y-8 max-w-4xl mx-auto animate-in slide-in-from-right duration-300">
            {/* Modern Pill Tabs */}
            <div className="flex gap-2 bg-linear-to-r from-gray-100 to-gray-50 p-1.5 rounded-2xl mb-6 border border-gray-200">
                <button
                    onClick={() => setAvailTab('schedule')}
                    className={`flex-1 py-3 px-4 text-sm font-semibold rounded-xl transition-all duration-200 ${availTab === 'schedule'
                        ? 'bg-white shadow-md text-brand-600 scale-105'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                        }`}
                >
                    Weekly Schedule
                </button>
                <button
                    onClick={() => setAvailTab('calendar')}
                    className={`flex-1 py-3 px-4 text-sm font-semibold rounded-xl transition-all duration-200 ${availTab === 'calendar'
                        ? 'bg-white shadow-md text-brand-600 scale-105'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                        }`}
                >
                    Calendar Override
                </button>
                <button
                    onClick={() => setAvailTab('rules')}
                    className={`flex-1 py-3 px-4 text-sm font-semibold rounded-xl transition-all duration-200 ${availTab === 'rules'
                        ? 'bg-white shadow-md text-brand-600 scale-105'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                        }`}
                >
                    Rules & Extras
                </button>
            </div>

            <div className="min-h-[400px]">
                {availTab === 'schedule' && (
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
                )}

                {availTab === 'calendar' && (
                    <div className="space-y-4 animate-in fade-in">
                        <div className="flex items-center justify-between mb-4">
                            <Button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))} variant="ghost" size="sm" className="rounded-full p-2 h-auto min-w-0" title="Previous month"><ArrowRight className="rotate-180" size={20} /></Button>
                            <h3 className="font-bold text-lg">{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                            <Button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))} variant="ghost" size="sm" className="rounded-full p-2 h-auto min-w-0" title="Next month"><ArrowRight size={20} /></Button>
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-center mb-2">
                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d} className="text-xs font-bold text-gray-400 uppercase">{d}</div>)}
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
                                    <Button onClick={() => setSelectedCalendarDate(null)} variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600 p-1 h-auto min-w-0" title="Close"><X size={18} /></Button>
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
                )}

                {availTab === 'rules' && (
                    <div className="space-y-8 animate-in fade-in">
                        {/* Booking Settings Card */}
                        <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm overflow-hidden">
                            <div className="bg-linear-to-r from-gray-50 to-gray-100 px-5 py-4 border-b border-gray-200">
                                <label className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                    <Settings size={16} className="text-brand-600" />
                                    Booking Settings
                                </label>
                                <p className="text-xs text-gray-600 mt-1">Configure how guests can book your space</p>
                            </div>
                            <div className="p-5 space-y-5">
                                {/* Allow Recurring Bookings Toggle */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-medium text-gray-900 text-sm flex items-center gap-2">
                                            <Repeat size={16} className="text-gray-400" /> Allow Recurring Bookings
                                        </div>
                                        <p className="text-xs text-gray-500 mt-0.5 max-w-xs">
                                            {newListing.settings?.allowRecurring
                                                ? "Guests can book multiple days in a sequence."
                                                : "Guests can only book single sessions."}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setNewListing({
                                            ...newListing,
                                            settings: {
                                                ...newListing.settings,
                                                allowRecurring: !newListing.settings?.allowRecurring,
                                                minDuration: newListing.settings?.minDuration || 1,
                                                instantBook: newListing.settings?.instantBook || false
                                            }
                                        })}
                                        className={`
                                           relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none
                                           ${newListing.settings?.allowRecurring ? 'bg-brand-600' : 'bg-gray-200'}
`}
                                        title="Toggle recurring bookings"
                                    >
                                        <span
                                            className={`
inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm
                                            ${newListing.settings?.allowRecurring ? 'translate-x-6' : 'translate-x-1'}
`}
                                        />
                                    </button>
                                </div>

                                {/* Instant Book Toggle */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-medium text-gray-900 text-sm flex items-center gap-2">
                                            <Zap size={16} className="text-gray-400" /> Instant Book
                                        </div>
                                        <p className="text-xs text-gray-500 mt-0.5 max-w-xs">
                                            Allow guests to book without waiting for your approval.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setNewListing({
                                            ...newListing,
                                            settings: {
                                                ...newListing.settings,
                                                instantBook: !newListing.settings?.instantBook,
                                                allowRecurring: newListing.settings?.allowRecurring || false,
                                                minDuration: newListing.settings?.minDuration || 1
                                            }
                                        })}
                                        className={`
                                           relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none
                                           ${newListing.settings?.instantBook ? 'bg-brand-600' : 'bg-gray-200'}
`}
                                        title="Toggle instant book"
                                    >
                                        <span
                                            className={`
inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm
                                            ${newListing.settings?.instantBook ? 'translate-x-6' : 'translate-x-1'}
`}
                                        />
                                    </button>
                                </div>

                                {/* Minimum Duration */}
                                <div className="pt-4 border-t border-gray-100">
                                    <label className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                                        <Clock size={16} className="text-gray-400" /> Minimum Booking Duration
                                    </label>
                                    <div className="relative">
                                        <select
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none appearance-none bg-white transition-all hover:border-gray-300 cursor-pointer text-sm"
                                            value={newListing.settings?.minDuration || 1}
                                            onChange={(e) => setNewListing({
                                                ...newListing,
                                                settings: {
                                                    ...newListing.settings,
                                                    minDuration: parseInt(e.target.value),
                                                    allowRecurring: newListing.settings?.allowRecurring || false,
                                                    instantBook: newListing.settings?.instantBook || false
                                                }
                                            })}
                                            title="Minimum Booking Duration"
                                        >
                                            {newListing.pricingModel === PricingModel.HOURLY ? (
                                                <>
                                                    <option value="1">1 hour</option>
                                                    <option value="2">2 hours</option>
                                                    <option value="3">3 hours</option>
                                                    <option value="4">4 hours</option>
                                                    <option value="6">6 hours</option>
                                                    <option value="8">8 hours</option>
                                                </>
                                            ) : newListing.pricingModel === PricingModel.NIGHTLY ? (
                                                <>
                                                    <option value="1">1 night</option>
                                                    <option value="2">2 nights</option>
                                                    <option value="3">3 nights</option>
                                                    <option value="5">5 nights</option>
                                                    <option value="7">7 nights (1 week)</option>
                                                    <option value="14">14 nights (2 weeks)</option>
                                                    <option value="30">30 nights (1 month)</option>
                                                </>
                                            ) : (
                                                <>
                                                    <option value="1">1 day</option>
                                                    <option value="2">2 days</option>
                                                    <option value="3">3 days</option>
                                                    <option value="5">5 days</option>
                                                    <option value="7">7 days (1 week)</option>
                                                </>
                                            )}
                                        </select>
                                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1.5">
                                        Set the minimum booking length guests must book.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Approval Time (Only if Instant Book is OFF) */}
                        {!newListing.settings?.instantBook && (
                            <div className="animate-in fade-in slide-in-from-top-2">
                                <label className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                                    <Clock size={16} className="text-gray-400" /> Approval Time
                                </label>
                                <div className="relative">
                                    <select
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none appearance-none bg-white transition-all hover:border-gray-300 cursor-pointer text-sm"
                                        value={newListing.approvalTime || ''}
                                        onChange={(e) => setNewListing({ ...newListing, approvalTime: e.target.value })}
                                        title="Approval Time"
                                    >
                                        <option value="" disabled>Select typical response time</option>
                                        <option value="0-15 mins">0-15 mins</option>
                                        <option value="15-30 mins">15-30 mins</option>
                                        <option value="30-60 mins">30-60 mins</option>
                                    </select>
                                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-1.5">
                                    Let guests know how quickly you usually respond to booking requests.
                                </p>
                            </div>
                        )}

                        {/* Model-Specific Time Configuration */}
                        {newListing.pricingModel && (
                            <div className="space-y-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                                <h4 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                                    <Clock size={16} className="text-blue-600" />
                                    {newListing.pricingModel === PricingModel.NIGHTLY && 'Check-In & Check-Out Times'}
                                    {newListing.pricingModel === PricingModel.DAILY && 'Venue Access Hours'}
                                    {newListing.pricingModel === PricingModel.HOURLY && 'Operating Hours & Rules'}
                                </h4>

                                {/* NIGHTLY: Check-in/Check-out */}
                                {newListing.pricingModel === PricingModel.NIGHTLY && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-medium text-gray-700 mb-1.5 block">Check-In Time</label>
                                            <select
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none bg-white"
                                                value={(newListing.bookingConfig as NightlyConfig)?.checkInTime || '15:00'}
                                                title="Select check-in time"
                                                onChange={(e) => setNewListing({
                                                    ...newListing,
                                                    bookingConfig: {
                                                        ...(newListing.bookingConfig as NightlyConfig || {}),
                                                        checkInTime: e.target.value,
                                                        checkOutTime: (newListing.bookingConfig as NightlyConfig)?.checkOutTime || '11:00',
                                                        allowLateCheckout: (newListing.bookingConfig as NightlyConfig)?.allowLateCheckout || false
                                                    } as NightlyConfig
                                                })}
                                            >
                                                <option value="12:00">12:00 PM</option>
                                                <option value="13:00">1:00 PM</option>
                                                <option value="14:00">2:00 PM</option>
                                                <option value="15:00">3:00 PM</option>
                                                <option value="16:00">4:00 PM</option>
                                                <option value="17:00">5:00 PM</option>
                                            </select>
                                            <p className="text-xs text-gray-500 mt-1">Guests can arrive from this time</p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-700 mb-1.5 block">Check-Out Time</label>
                                            <select
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none bg-white"
                                                value={(newListing.bookingConfig as NightlyConfig)?.checkOutTime || '11:00'}
                                                title="Select check-out time"
                                                onChange={(e) => setNewListing({
                                                    ...newListing,
                                                    bookingConfig: {
                                                        ...(newListing.bookingConfig as NightlyConfig || {}),
                                                        checkInTime: (newListing.bookingConfig as NightlyConfig)?.checkInTime || '15:00',
                                                        checkOutTime: e.target.value,
                                                        allowLateCheckout: (newListing.bookingConfig as NightlyConfig)?.allowLateCheckout || false
                                                    } as NightlyConfig
                                                })}
                                            >
                                                <option value="09:00">9:00 AM</option>
                                                <option value="10:00">10:00 AM</option>
                                                <option value="11:00">11:00 AM</option>
                                                <option value="12:00">12:00 PM</option>
                                                <option value="13:00">1:00 PM</option>
                                            </select>
                                            <p className="text-xs text-gray-500 mt-1">Guests must leave by this time</p>
                                        </div>
                                    </div>
                                )}

                                {/* DAILY: Access Hours */}
                                {newListing.pricingModel === PricingModel.DAILY && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-medium text-gray-700 mb-1.5 block">Venue Opens At</label>
                                            <select
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none bg-white"
                                                value={(newListing.bookingConfig as DailyConfig)?.accessStartTime || '08:00'}
                                                title="Select venue opening time"
                                                onChange={(e) => setNewListing({
                                                    ...newListing,
                                                    bookingConfig: {
                                                        ...(newListing.bookingConfig as DailyConfig || {}),
                                                        accessStartTime: e.target.value,
                                                        accessEndTime: (newListing.bookingConfig as DailyConfig)?.accessEndTime || '23:00',
                                                        overnightAllowed: (newListing.bookingConfig as DailyConfig)?.overnightAllowed || false
                                                    } as DailyConfig
                                                })}
                                            >
                                                <option value="06:00">6:00 AM</option>
                                                <option value="07:00">7:00 AM</option>
                                                <option value="08:00">8:00 AM</option>
                                                <option value="09:00">9:00 AM</option>
                                                <option value="10:00">10:00 AM</option>
                                            </select>
                                            <p className="text-xs text-gray-500 mt-1">When guests can start accessing</p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-700 mb-1.5 block">Events Must End By</label>
                                            <select
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none bg-white"
                                                value={(newListing.bookingConfig as DailyConfig)?.accessEndTime || '23:00'}
                                                title="Select event end time"
                                                onChange={(e) => setNewListing({
                                                    ...newListing,
                                                    bookingConfig: {
                                                        ...(newListing.bookingConfig as DailyConfig || {}),
                                                        accessStartTime: (newListing.bookingConfig as DailyConfig)?.accessStartTime || '08:00',
                                                        accessEndTime: e.target.value,
                                                        overnightAllowed: (newListing.bookingConfig as DailyConfig)?.overnightAllowed || false
                                                    } as DailyConfig
                                                })}
                                            >
                                                <option value="20:00">8:00 PM</option>
                                                <option value="21:00">9:00 PM</option>
                                                <option value="22:00">10:00 PM</option>
                                                <option value="23:00">11:00 PM</option>
                                                <option value="00:00">12:00 AM</option>
                                            </select>
                                            <p className="text-xs text-gray-500 mt-1">Latest time for events to end</p>
                                        </div>
                                    </div>
                                )}

                                {/* HOURLY: Operating Hours + Buffer */}
                                {newListing.pricingModel === PricingModel.HOURLY && (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs font-medium text-gray-700 mb-1.5 block">Operating Hours Start</label>
                                                <select
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none bg-white"
                                                    value={(newListing.bookingConfig as HourlyConfig)?.operatingHours?.start || '09:00'}
                                                    title="Select operating hours start time"
                                                    onChange={(e) => setNewListing({
                                                        ...newListing,
                                                        bookingConfig: {
                                                            ...(newListing.bookingConfig as HourlyConfig || {}),
                                                            operatingHours: {
                                                                start: e.target.value,
                                                                end: (newListing.bookingConfig as HourlyConfig)?.operatingHours?.end || '18:00'
                                                            },
                                                            bufferMinutes: (newListing.bookingConfig as HourlyConfig)?.bufferMinutes || 30,
                                                            minHoursBooking: (newListing.bookingConfig as HourlyConfig)?.minHoursBooking || 2
                                                        } as HourlyConfig
                                                    })}
                                                >
                                                    {Array.from({ length: 24 }, (_, i) => (
                                                        <option key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                                                            {i === 0 ? '12:00 AM' : i < 12 ? `${i}:00 AM` : i === 12 ? '12:00 PM' : `${i - 12}:00 PM`}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium text-gray-700 mb-1.5 block">Operating Hours End</label>
                                                <select
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none bg-white"
                                                    value={(newListing.bookingConfig as HourlyConfig)?.operatingHours?.end || '18:00'}
                                                    title="Select operating hours end time"
                                                    onChange={(e) => setNewListing({
                                                        ...newListing,
                                                        bookingConfig: {
                                                            ...(newListing.bookingConfig as HourlyConfig || {}),
                                                            operatingHours: {
                                                                start: (newListing.bookingConfig as HourlyConfig)?.operatingHours?.start || '09:00',
                                                                end: e.target.value
                                                            },
                                                            bufferMinutes: (newListing.bookingConfig as HourlyConfig)?.bufferMinutes || 30,
                                                            minHoursBooking: (newListing.bookingConfig as HourlyConfig)?.minHoursBooking || 2
                                                        } as HourlyConfig
                                                    })}
                                                >
                                                    {Array.from({ length: 24 }, (_, i) => (
                                                        <option key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                                                            {i === 0 ? '12:00 AM' : i < 12 ? `${i}:00 AM` : i === 12 ? '12:00 PM' : `${i - 12}:00 PM`}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs font-medium text-gray-700 mb-1.5 block">Cleaning Buffer (minutes)</label>
                                                <select
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none bg-white"
                                                    value={(newListing.bookingConfig as HourlyConfig)?.bufferMinutes || 30}
                                                    title="Select cleaning buffer time"
                                                    onChange={(e) => setNewListing({
                                                        ...newListing,
                                                        bookingConfig: {
                                                            ...(newListing.bookingConfig as HourlyConfig || {}),
                                                            operatingHours: (newListing.bookingConfig as HourlyConfig)?.operatingHours || { start: '09:00', end: '18:00' },
                                                            bufferMinutes: parseInt(e.target.value),
                                                            minHoursBooking: (newListing.bookingConfig as HourlyConfig)?.minHoursBooking || 2
                                                        } as HourlyConfig
                                                    })}
                                                >
                                                    <option value="0">No buffer</option>
                                                    <option value="15">15 minutes</option>
                                                    <option value="30">30 minutes</option>
                                                    <option value="45">45 minutes</option>
                                                    <option value="60">1 hour</option>
                                                </select>
                                                <p className="text-xs text-gray-500 mt-1">Time between bookings for cleaning</p>
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium text-gray-700 mb-1.5 block">Minimum Booking (hours)</label>
                                                <select
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none bg-white"
                                                    value={(newListing.bookingConfig as HourlyConfig)?.minHoursBooking || 2}
                                                    title="Select minimum booking hours"
                                                    onChange={(e) => setNewListing({
                                                        ...newListing,
                                                        bookingConfig: {
                                                            ...(newListing.bookingConfig as HourlyConfig || {}),
                                                            operatingHours: (newListing.bookingConfig as HourlyConfig)?.operatingHours || { start: '09:00', end: '18:00' },
                                                            bufferMinutes: (newListing.bookingConfig as HourlyConfig)?.bufferMinutes || 30,
                                                            minHoursBooking: parseInt(e.target.value)
                                                        } as HourlyConfig
                                                    })}
                                                >
                                                    <option value="1">1 hour</option>
                                                    <option value="2">2 hours</option>
                                                    <option value="3">3 hours</option>
                                                    <option value="4">4 hours</option>
                                                </select>
                                                <p className="text-xs text-gray-500 mt-1">Minimum hours per booking</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}


                        {/* Cancellation Policy Dropdown */}
                        <div>
                            <label className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                                <Shield size={16} className="text-gray-400" /> Cancellation Policy
                            </label>
                            <div className="relative">
                                <select
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none appearance-none bg-white transition-all hover:border-gray-300 cursor-pointer text-sm"
                                    value={newListing.cancellationPolicy || CancellationPolicy.MODERATE}
                                    onChange={(e) => setNewListing({ ...newListing, cancellationPolicy: e.target.value as CancellationPolicy })}
                                    title="Cancellation Policy"
                                >
                                    <option value={CancellationPolicy.FLEXIBLE}>Flexible (Full refund 24h prior)</option>
                                    <option value={CancellationPolicy.MODERATE}>Moderate (Full refund 5 days prior)</option>
                                    <option value={CancellationPolicy.STRICT}>Strict (No refund)</option>
                                    <option value={CancellationPolicy.NON_REFUNDABLE}>Non-refundable</option>
                                </select>
                                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1.5">
                                {newListing.cancellationPolicy === CancellationPolicy.FLEXIBLE && "Guests get a full refund if they cancel at least 24 hours before check-in."}
                                {newListing.cancellationPolicy === CancellationPolicy.MODERATE && "Guests get a full refund if they cancel at least 5 days before check-in."}
                                {newListing.cancellationPolicy === CancellationPolicy.STRICT && "No refunds are provided for cancellations."}
                                {newListing.cancellationPolicy === CancellationPolicy.NON_REFUNDABLE && "Bookings are non-refundable under any circumstances."}
                                {!newListing.cancellationPolicy && "Guests get a full refund if they cancel at least 5 days before check-in."}
                            </p>
                        </div>
                    </div>
                )}

                {/* House Rules Card */}
                <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm overflow-hidden">
                    <div className="bg-linear-to-r from-gray-50 to-gray-100 px-5 py-4 border-b border-gray-200">
                        <label className="text-sm font-bold text-gray-900 flex items-center gap-2">
                            <FileText size={16} className="text-brand-600" />
                            House Rules
                        </label>
                        <p className="text-xs text-gray-600 mt-1">Set clear expectations for your guests</p>
                    </div>
                    <div className="p-5">
                        <div className="flex gap-2 mb-4">
                            <input
                                type="text"
                                className="flex-1 p-3 text-sm border-2 border-gray-200 rounded-xl outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all"
                                placeholder="e.g. No smoking, No pets..."
                                value={tempRule}
                                onChange={(e) => setTempRule(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddRule()}
                            />
                            <Button
                                onClick={handleAddRule}
                                variant="primary"
                                className="p-3"
                                title="Add rule"
                            >
                                <Plus size={20} />
                            </Button>
                        </div>
                        <div className="space-y-2">
                            {newListing.houseRules?.map((rule, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3.5 bg-linear-to-r from-gray-50 to-gray-100 rounded-xl text-sm group hover:shadow-sm transition-all border border-gray-200">
                                    <span className="font-medium text-gray-900">{rule}</span>
                                    <Button
                                        onClick={() => handleRemoveRule(idx)}
                                        variant="ghost"
                                        size="sm"
                                        className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 p-1 h-auto min-w-0"
                                        title="Remove rule"
                                    >
                                        <X size={18} />
                                    </Button>
                                </div>
                            ))}
                            {(!newListing.houseRules || newListing.houseRules.length === 0) && (
                                <p className="text-xs text-gray-400 italic text-center py-4">No rules added yet. Add your first rule above.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Optional Add-Ons Card */}
                <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm overflow-hidden">
                    <div className="bg-linear-to-r from-gray-50 to-gray-100 px-5 py-4 border-b border-gray-200">
                        <label className="text-sm font-bold text-gray-900 flex items-center gap-2">
                            <PackagePlus size={16} className="text-brand-600" />
                            Optional Extras
                        </label>
                        <p className="text-xs text-gray-600 mt-1">Add items or services guests can rent (e.g. Cameras, Lighting, Cleaning).</p>
                    </div>
                    <div className="p-5">
                        <div className="flex flex-col gap-3 mb-4">
                            <div className="flex gap-3">
                                {/* Image Upload */}
                                <div className="relative w-12 h-12 bg-gray-100 rounded-xl overflow-hidden border-2 border-gray-200 flex items-center justify-center shrink-0 hover:border-brand-300 transition-colors group">
                                    {tempAddOn.image ? (
                                        <img src={tempAddOn.image} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <Image size={20} className="text-gray-400 group-hover:text-brand-500" />
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    setTempAddOn({ ...tempAddOn, image: reader.result as string });
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                        title="Upload image"
                                    />
                                </div>

                                {/* Name Input */}
                                <input
                                    type="text"
                                    className="flex-1 p-3 text-sm border-2 border-gray-200 rounded-xl outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all"
                                    placeholder="Item Name (e.g. Camera, Cleaning)"
                                    value={tempAddOn.name}
                                    onChange={(e) => setTempAddOn({ ...tempAddOn, name: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-3">
                                {/* Price Input */}
                                <div className="relative flex-1">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-sm">{locale.currencySymbol}</span>
                                    <input
                                        type="number"
                                        className="w-full pl-8 pr-3 py-3 text-sm border-2 border-gray-200 rounded-xl outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all"
                                        placeholder="Price"
                                        value={tempAddOn.price}
                                        onChange={(e) => setTempAddOn({ ...tempAddOn, price: e.target.value })}
                                    />
                                </div>

                                {/* Add Button */}
                                <Button
                                    onClick={handleAddAddOn}
                                    variant="primary"
                                    leftIcon={<Plus size={20} />}
                                    className="px-6"
                                >
                                    Add
                                </Button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            {newListing.addOns?.map((addon) => (
                                <div key={addon.id} className="flex items-center justify-between p-3.5 bg-linear-to-r from-green-50 to-emerald-50 rounded-xl text-sm group hover:shadow-sm transition-all border border-green-200">
                                    <div className="flex items-center gap-3">
                                        {addon.image && (
                                            <img src={addon.image} alt={addon.name} className="w-10 h-10 rounded-lg object-cover border border-green-200" />
                                        )}
                                        <div>
                                            <span className="font-semibold text-gray-900 block">{addon.name}</span>
                                            <span className="text-green-700 font-bold">{locale.currencySymbol}{addon.price}</span>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => handleRemoveAddOn(addon.id)}
                                        variant="ghost"
                                        size="sm"
                                        className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 p-1 h-auto min-w-0"
                                        title="Remove add-on"
                                    >
                                        <X size={18} />
                                    </Button>
                                </div>
                            ))}
                            {(!newListing.addOns || newListing.addOns.length === 0) && (
                                <p className="text-xs text-gray-400 italic text-center py-4">No add-ons yet. Offer extras like equipment or services.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Safety Items */}
                <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Safety Items</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                        {SAFETY_OPTIONS.map(item => (
                            <button
                                key={item}
                                onClick={() => toggleSafetyItem(item)}
                                className={`px-3 py-1 text-xs rounded-full border transition-colors ${newListing.safetyItems?.includes(item) ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'}`}
                            >
                                {item}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            className="flex-1 p-2 text-sm border border-gray-300 rounded-lg outline-none"
                            placeholder="Add custom safety item..."
                            value={customSafety}
                            onChange={(e) => setCustomSafety(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddCustomSafety()}
                        />
                        <button onClick={handleAddCustomSafety} className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200" title="Add custom safety item"><Plus size={18} /></button>
                    </div>

                    {/* Display Custom Items */}
                    <div className="flex flex-wrap gap-2 mt-2">
                        {newListing.safetyItems?.filter(i => !SAFETY_OPTIONS.includes(i)).map((item, i) => (
                            <div key={i} className="flex items-center gap-1 px-2 py-1 bg-brand-50 text-brand-800 rounded-full text-xs border border-brand-100">
                                <span>{item}</span>
                                <button onClick={() => toggleSafetyItem(item)} className="hover:text-red-600" title="Remove custom safety item"><X size={10} /></button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-8">
                <Button
                    onClick={() => setStep(2)}
                    variant="outline"
                    size="lg"
                >
                    Back
                </Button>
                <Button
                    onClick={() => setStep(4)}
                    variant="primary"
                    size="lg"
                    className="w-full sm:w-auto min-w-[200px]"
                >
                    Continue to Verification
                </Button>
            </div>
        </div>
    );
};

export default ListingAvailability;
