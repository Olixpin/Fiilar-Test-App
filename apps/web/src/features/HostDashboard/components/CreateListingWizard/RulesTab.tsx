import React from 'react';
import { Listing, CancellationPolicy, PricingModel, NightlyConfig, DailyConfig, HourlyConfig } from '@fiilar/types';
import { Button, useLocale } from '@fiilar/ui';
import { X, Plus, FileText, PackagePlus, Settings, Repeat, Zap, Shield, Clock } from 'lucide-react';

const SAFETY_OPTIONS = ['Smoke Alarm', 'Carbon Monoxide Alarm', 'Fire Extinguisher', 'First Aid Kit', 'Emergency Exit'];

const COMMON_RULES = [
    { id: 'no-smoking', label: 'No smoking', icon: '🚭' },
    { id: 'no-pets', label: 'No pets allowed', icon: '🐾' },
    { id: 'no-parties', label: 'No parties without permission', icon: '🎉' },
    { id: 'no-loud-music', label: 'No loud music after 10 PM', icon: '🔇' },
    { id: 'remove-shoes', label: 'Remove shoes indoors', icon: '👟' },
    { id: 'clean-up', label: 'Clean up after use', icon: '🧹' },
    { id: 'respect-neighbors', label: 'Respect neighbors', icon: '🤝' },
    { id: 'no-illegal', label: 'No illegal activities', icon: '⚠️' },
];

interface RulesTabProps {
    newListing: Partial<Listing>;
    setNewListing: React.Dispatch<React.SetStateAction<Partial<Listing>>>;
    tempRule: string;
    setTempRule: (rule: string) => void;
    handleAddRule: () => void;
    tempAddOn: { id?: string; name: string; price: string; description: string; image?: string };
    setTempAddOn: React.Dispatch<React.SetStateAction<{ id?: string; name: string; price: string; description: string; image?: string }>>;
    handleAddAddOn: () => void;
    handleRemoveAddOn: (id: string) => void;
    customSafety: string;
    setCustomSafety: (safety: string) => void;
    handleAddCustomSafety: () => void;
    toggleSafetyItem: (item: string) => void;
}

const RulesTab: React.FC<RulesTabProps> = ({
    newListing,
    setNewListing,
    tempRule,
    setTempRule,
    handleAddRule,
    tempAddOn,
    setTempAddOn,
    handleAddAddOn,
    handleRemoveAddOn,
    customSafety,
    setCustomSafety,
    handleAddCustomSafety,
    toggleSafetyItem
}) => {
    const { locale } = useLocale();

    return (
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
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={newListing.settings?.allowRecurring}
                                onChange={() => setNewListing({
                                    ...newListing,
                                    settings: {
                                        ...newListing.settings,
                                        allowRecurring: !newListing.settings?.allowRecurring,
                                        minDuration: newListing.settings?.minDuration || 1,
                                        instantBook: newListing.settings?.instantBook || false
                                    }
                                })}
                                title="Toggle recurring bookings"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500 shadow-inner"></div>
                        </label>
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
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={newListing.settings?.instantBook}
                                onChange={() => setNewListing({
                                    ...newListing,
                                    settings: {
                                        ...newListing.settings,
                                        instantBook: !newListing.settings?.instantBook,
                                        allowRecurring: newListing.settings?.allowRecurring || false,
                                        minDuration: newListing.settings?.minDuration || 1
                                    }
                                })}
                                title="Toggle instant book"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500 shadow-inner"></div>
                        </label>
                    </div>

                    {/* Minimum Duration */}
                    <div className="pt-4 border-t border-gray-100">
                        <label className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                            <Clock size={16} className="text-gray-400" /> Minimum Booking Duration
                        </label>
                        <div className="relative">
                            <select
                                className="w-full px-4 py-3 pr-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-100 focus:border-brand-300 outline-none appearance-none bg-gray-50 transition-all hover:border-gray-300 cursor-pointer text-sm"
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
                                        <option value={1}>1 hour</option>
                                        <option value={2}>2 hours</option>
                                        <option value={3}>3 hours</option>
                                        <option value={4}>4 hours</option>
                                        <option value={8}>8 hours (Full day)</option>
                                        <option value={24}>1 day</option>
                                        <option value={48}>2 days</option>
                                        <option value={72}>3 days</option>
                                        <option value={168}>1 week</option>
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

            {/* Response Time - Always visible */}
            <div>
                <label className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <Clock size={16} className="text-gray-400" /> Response Time
                </label>
                <div className="relative">
                    <select
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none appearance-none bg-white transition-all hover:border-gray-300 cursor-pointer text-sm"
                        value={newListing.approvalTime || ''}
                        onChange={(e) => setNewListing({ ...newListing, approvalTime: e.target.value })}
                        title="Response Time"
                    >
                        <option value="" disabled>Select typical response time</option>
                        <option value="Within 1 hour">Within 1 hour</option>
                        <option value="Within 2 hours">Within 2 hours</option>
                        <option value="Within 4 hours">Within 4 hours</option>
                        <option value="Within 12 hours">Within 12 hours</option>
                        <option value="Within 24 hours">Within 24 hours</option>
                    </select>
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
                <p className="text-xs text-gray-500 mt-1.5">
                    {newListing.settings?.instantBook
                        ? "Let guests know how quickly you respond to messages and inquiries."
                        : "Let guests know how quickly you respond to booking requests. Pending bookings auto-cancel after 24 hours (or 4 hours for same-day bookings) to protect guests."}
                </p>
            </div>

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

            {/* House Rules Card */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-linear-to-r from-gray-50 to-gray-100 px-5 py-4 border-b border-gray-200">
                    <label className="text-sm font-bold text-gray-900 flex items-center gap-2">
                        <FileText size={16} className="text-brand-600" />
                        House Rules
                    </label>
                    <p className="text-xs text-gray-600 mt-1">Set clear expectations for your guests</p>
                </div>
                <div className="p-5 space-y-4">
                    {/* Combined Rules Checklist */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {[
                            ...COMMON_RULES,
                            ...(newListing.houseRules || [])
                                .filter(rule => !COMMON_RULES.map(r => r.label).includes(rule))
                                .map(rule => ({ id: rule, label: rule, icon: '✨' }))
                        ].map((rule) => {
                            const isChecked = newListing.houseRules?.includes(rule.label) || false;
                            return (
                                <label
                                    key={rule.id}
                                    className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all group ${isChecked
                                        ? 'border-brand-500 bg-brand-50'
                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setNewListing({
                                                    ...newListing,
                                                    houseRules: [...(newListing.houseRules || []), rule.label]
                                                });
                                            } else {
                                                setNewListing({
                                                    ...newListing,
                                                    houseRules: (newListing.houseRules || []).filter(r => r !== rule.label)
                                                });
                                            }
                                        }}
                                        className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
                                    />
                                    <span className="text-lg">{rule.icon}</span>
                                    <span className={`text-sm flex-1 ${isChecked ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                                        {rule.label}
                                    </span>
                                    {/* Show delete button only for custom rules (those with the sparkle icon) */}
                                    {rule.icon === '✨' && (
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault(); // Prevent toggling the checkbox
                                                setNewListing({
                                                    ...newListing,
                                                    houseRules: (newListing.houseRules || []).filter(r => r !== rule.label)
                                                });
                                            }}
                                            className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                            title="Remove custom rule"
                                        >
                                            <X size={16} />
                                        </button>
                                    )}
                                </label>
                            );
                        })}
                    </div>

                    {/* Add Custom Rule Input */}
                    <div className="pt-4 border-t border-gray-200">
                        <p className="text-xs font-medium text-gray-600 mb-3">Add custom rules:</p>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                className="flex-1 p-3 text-sm border-2 border-gray-200 rounded-xl outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all"
                                placeholder="e.g. No food in studio area..."
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
                            <div className="relative w-16 h-16 bg-gray-50 rounded-xl overflow-hidden border-2 border-dashed border-gray-300 flex flex-col items-center justify-center shrink-0 hover:border-brand-400 hover:bg-brand-50 transition-colors group cursor-pointer">
                                {tempAddOn.image ? (
                                    <>
                                        <img src={tempAddOn.image} alt="Preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="text-white text-xs font-medium">Change</span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <Plus size={16} className="text-gray-400 group-hover:text-brand-500 mb-0.5" />
                                        <span className="text-[10px] text-gray-400 group-hover:text-brand-500 font-medium">Photo</span>
                                    </>
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
                                    title="Upload image for add-on"
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

                            {/* Add/Update Button */}
                            <div className="flex gap-2">
                                {tempAddOn.id && (
                                    <Button
                                        onClick={() => setTempAddOn({ name: '', price: '', description: '', image: '' })}
                                        variant="ghost"
                                        className="px-4 text-gray-500 hover:text-gray-700"
                                    >
                                        Cancel
                                    </Button>
                                )}
                                <Button
                                    onClick={handleAddAddOn}
                                    variant="primary"
                                    leftIcon={tempAddOn.id ? undefined : <Plus size={20} />}
                                    className="px-6"
                                >
                                    {tempAddOn.id ? 'Update' : 'Add'}
                                </Button>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        {newListing.addOns?.map((addon) => (
                            <div
                                key={addon.id}
                                onClick={() => setTempAddOn({ ...addon, price: addon.price.toString(), description: addon.description || '' })}
                                className="flex items-center justify-between p-3.5 bg-white border border-gray-200 rounded-xl text-sm group hover:border-brand-300 hover:shadow-md hover:shadow-brand-500/5 transition-all cursor-pointer"
                            >
                                <div className="flex items-center gap-3">
                                    {addon.image && (
                                        <img src={addon.image} alt={addon.name} className="w-10 h-10 rounded-lg object-cover border border-gray-100" />
                                    )}
                                    <div>
                                        <span className="font-semibold text-gray-900 block">{addon.name}</span>
                                        <span className="text-brand-600 font-bold">{locale.currencySymbol}{addon.price}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity">Edit</span>
                                    <Button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveAddOn(addon.id);
                                        }}
                                        variant="ghost"
                                        size="sm"
                                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1 h-auto min-w-0"
                                        title="Remove add-on"
                                    >
                                        <X size={18} />
                                    </Button>
                                </div>
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
    );
};

export default RulesTab;
