import React from 'react';
import { Listing, PricingModel } from '@fiilar/types';
import StepWrapper from './StepWrapper';
import { Calendar, Clock, Sparkles, Check } from 'lucide-react';

// Type for hourly booking config
interface HourlyConfig {
    operatingHours?: { start: string; end: string };
    bufferMinutes?: number;
    minHoursBooking?: number;
}

interface StepBookingSettingsProps {
    newListing: Partial<Listing>;
    setNewListing: React.Dispatch<React.SetStateAction<Partial<Listing>>>;
    currentStep: number;
    totalSteps: number;
    onNext: () => void;
    onBack: () => void;
}

const BOOKING_WINDOWS = [
    { value: 30, label: '1 month', description: 'Short-term planning' },
    { value: 90, label: '3 months', description: 'Recommended for most hosts' },
    { value: 180, label: '6 months', description: 'Good for popular spaces' },
    { value: 365, label: '1 year', description: 'Maximum flexibility' },
];

// Notice periods for daily/nightly (in days)
const NOTICE_PERIODS_DAYS = [
    { value: 0, label: 'Same day', description: 'Accept last-minute bookings' },
    { value: 1, label: '1 day', description: 'A little time to prepare' },
    { value: 2, label: '2 days', description: 'Comfortable buffer' },
    { value: 3, label: '3 days', description: 'More preparation time' },
    { value: 7, label: '1 week', description: 'Plan ahead' },
];

// Notice periods for hourly (in hours) 
const NOTICE_PERIODS_HOURS = [
    { value: 0, label: 'None', description: 'Accept immediate bookings' },
    { value: 1, label: '1 hour', description: 'A little heads up' },
    { value: 2, label: '2 hours', description: 'Time to prepare' },
    { value: 4, label: '4 hours', description: 'Half day notice' },
    { value: 24, label: '24 hours', description: 'Day before' },
];

// Prep times for daily/nightly (in days)
const PREP_TIMES_DAYS = [
    { value: 0, label: 'None', description: 'Back-to-back guests OK', descNightly: 'Back-to-back guests OK', descDaily: 'Back-to-back events OK' },
    { value: 1, label: '1 day', description: 'Time for turnover', descNightly: 'Time for turnover', descDaily: 'Time for cleanup' },
    { value: 2, label: '2 days', description: 'Extra buffer between guests', descNightly: 'Extra buffer between guests', descDaily: 'Extra buffer between events' },
];

// Buffer times for hourly (in minutes)
const BUFFER_TIMES_MINUTES = [
    { value: 0, label: 'None', description: 'Back-to-back OK' },
    { value: 15, label: '15 min', description: 'Quick turnaround' },
    { value: 30, label: '30 min', description: 'Standard cleaning' },
    { value: 60, label: '1 hour', description: 'Deep cleaning' },
    { value: 120, label: '2 hours', description: 'Extra buffer' },
];

const StepBookingSettings: React.FC<StepBookingSettingsProps> = ({
    newListing,
    setNewListing,
    currentStep,
    totalSteps,
    onNext,
    onBack,
}) => {
    const pricingModel = newListing.pricingModel || PricingModel.DAILY;
    const isHourly = pricingModel === PricingModel.HOURLY;
    const isNightly = pricingModel === PricingModel.NIGHTLY;
    const isDaily = pricingModel === PricingModel.DAILY;
    
    const bookingWindow = newListing.bookingWindow ?? 90;
    const minNotice = newListing.minNotice ?? 1;
    const prepTime = newListing.prepTime ?? 0;
    
    // For hourly: use bufferMinutes from bookingConfig
    const bookingConfig = newListing.bookingConfig as HourlyConfig | undefined;
    const bufferMinutes = bookingConfig?.bufferMinutes ?? 30;

    const updateSetting = (field: string, value: number) => {
        setNewListing(prev => ({ ...prev, [field]: value }));
    };
    
    const updateBufferMinutes = (minutes: number) => {
        setNewListing(prev => ({
            ...prev,
            bookingConfig: {
                ...(prev.bookingConfig as HourlyConfig || {}),
                operatingHours: (prev.bookingConfig as HourlyConfig)?.operatingHours || { start: '09:00', end: '18:00' },
                bufferMinutes: minutes,
                minHoursBooking: (prev.bookingConfig as HourlyConfig)?.minHoursBooking || 1,
            }
        }));
    };
    
    // Choose correct options based on pricing model
    const noticePeriods = isHourly ? NOTICE_PERIODS_HOURS : NOTICE_PERIODS_DAYS;
    const bufferOptions = isHourly ? BUFFER_TIMES_MINUTES : PREP_TIMES_DAYS;
    
    // Context-aware labels
    const prepTimeLabel = isNightly 
        ? 'Block time after each checkout for cleaning or turnover'
        : isDaily 
            ? 'Block time after each event for cleanup or reset'
            : 'Buffer time after each booking for cleaning or reset';

    return (
        <StepWrapper
            title="Availability & timing"
            subtitle="Set when and how far ahead guests can book"
            currentStep={currentStep}
            totalSteps={totalSteps}
            phaseName="Pricing"
            onNext={onNext}
            onBack={onBack}
            canContinue={true}
        >
            <div className="space-y-8">
                {/* Booking Window */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Calendar size={18} className="text-brand-600" />
                        <h3 className="font-medium text-gray-900">How far in advance can guests book?</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {BOOKING_WINDOWS.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => updateSetting('bookingWindow', option.value)}
                                className={`p-4 rounded-xl border-2 text-left transition-all ${
                                    bookingWindow === option.value
                                        ? 'border-brand-600 bg-brand-50'
                                        : 'border-gray-200 hover:border-gray-300 bg-white'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className={`font-semibold ${
                                        bookingWindow === option.value ? 'text-brand-700' : 'text-gray-900'
                                    }`}>
                                        {option.label}
                                    </span>
                                    {bookingWindow === option.value && (
                                        <div className="w-5 h-5 rounded-full bg-brand-600 flex items-center justify-center">
                                            <Check size={12} className="text-white" />
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500">{option.description}</p>
                                {option.value === 90 && bookingWindow !== 90 && (
                                    <span className="inline-block mt-2 text-[10px] font-medium text-brand-600 bg-brand-100 px-2 py-0.5 rounded">
                                        Recommended
                                    </span>
                                )}
                                {option.value === 90 && bookingWindow === 90 && (
                                    <span className="inline-block mt-2 text-[10px] font-medium text-brand-700 bg-brand-200 px-2 py-0.5 rounded">
                                        Recommended
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Minimum Notice */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Clock size={18} className="text-brand-600" />
                        <h3 className="font-medium text-gray-900">
                            How much notice do you need?
                        </h3>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">
                        {isHourly 
                            ? 'Minimum time before an hourly booking can start'
                            : isNightly
                                ? 'Minimum time before a guest can check in'
                                : 'Minimum time before an event booking can start'
                        }
                    </p>
                    <div className="space-y-2">
                        {noticePeriods.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => updateSetting('minNotice', option.value)}
                                className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between ${
                                    minNotice === option.value
                                        ? 'border-brand-600 bg-brand-50'
                                        : 'border-gray-200 hover:border-gray-300 bg-white'
                                }`}
                            >
                                <div>
                                    <span className={`font-medium ${
                                        minNotice === option.value ? 'text-brand-700' : 'text-gray-900'
                                    }`}>
                                        {option.label}
                                    </span>
                                    <p className="text-xs text-gray-500">{option.description}</p>
                                </div>
                                {minNotice === option.value && (
                                    <div className="w-5 h-5 rounded-full bg-brand-600 flex items-center justify-center shrink-0">
                                        <Check size={12} className="text-white" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Preparation Time / Buffer Between Bookings */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Sparkles size={18} className="text-brand-600" />
                        <h3 className="font-medium text-gray-900">
                            {isNightly ? 'Time between guests?' : 'Time between bookings?'}
                        </h3>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">
                        {prepTimeLabel}
                    </p>
                    <div className={`grid gap-3 ${isHourly ? 'grid-cols-5' : 'grid-cols-3'}`}>
                        {bufferOptions.map((option) => {
                            const isSelected = isHourly 
                                ? bufferMinutes === option.value 
                                : prepTime === option.value;
                            
                            // Get the right description based on pricing model
                            const description = isHourly 
                                ? option.description 
                                : isNightly 
                                    ? (option as typeof PREP_TIMES_DAYS[0]).descNightly 
                                    : (option as typeof PREP_TIMES_DAYS[0]).descDaily;
                            
                            return (
                                <button
                                    key={option.value}
                                    onClick={() => isHourly 
                                        ? updateBufferMinutes(option.value)
                                        : updateSetting('prepTime', option.value)
                                    }
                                    className={`p-3 sm:p-4 rounded-xl border-2 text-center transition-all ${
                                        isSelected
                                            ? 'border-brand-600 bg-brand-50'
                                            : 'border-gray-200 hover:border-gray-300 bg-white'
                                    }`}
                                >
                                    <span className={`font-semibold block text-sm sm:text-base ${
                                        isSelected ? 'text-brand-700' : 'text-gray-900'
                                    }`}>
                                        {option.label}
                                    </span>
                                    <p className="text-[10px] sm:text-xs text-gray-500 mt-1 hidden sm:block">
                                        {description}
                                    </p>
                                </button>
                            );
                        })}
                    </div>
                </section>

                {/* Summary */}
                <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-600">
                        <strong>Summary:</strong> {isNightly ? 'Guests' : 'Bookings'} can be made up to {BOOKING_WINDOWS.find(b => b.value === bookingWindow)?.label} ahead
                        {isHourly ? (
                            <>
                                {minNotice > 0 
                                    ? `, with at least ${noticePeriods.find(n => n.value === minNotice)?.label} notice` 
                                    : ', with no notice required'
                                }
                                {bufferMinutes > 0 
                                    ? `. ${bufferMinutes} minute buffer between bookings.` 
                                    : '.'
                                }
                            </>
                        ) : isNightly ? (
                            <>
                                {minNotice > 0 
                                    ? `, with at least ${noticePeriods.find(n => n.value === minNotice)?.label} notice before check-in` 
                                    : ', including same-day check-ins'
                                }
                                {prepTime > 0 
                                    ? `. ${prepTime} day${prepTime > 1 ? 's' : ''} blocked between guests.` 
                                    : '.'
                                }
                            </>
                        ) : (
                            <>
                                {minNotice > 0 
                                    ? `, with at least ${noticePeriods.find(n => n.value === minNotice)?.label} notice` 
                                    : ', including same-day bookings'
                                }
                                {prepTime > 0 
                                    ? `. ${prepTime} day${prepTime > 1 ? 's' : ''} blocked between events.` 
                                    : '.'
                                }
                            </>
                        )}
                    </p>
                </div>
            </div>
        </StepWrapper>
    );
};

export default StepBookingSettings;
