import React from 'react';
import { Listing, PricingModel, NightlyConfig, DailyConfig, HourlyConfig } from '@fiilar/types';
import { Clock, Calendar, Hourglass } from 'lucide-react';

interface ListingAccessInfoProps {
    listing: Listing;
}

export const ListingAccessInfo: React.FC<ListingAccessInfoProps> = ({ listing }) => {
    if (!listing.pricingModel || !listing.bookingConfig) {
        return null;
    }

    const formatTime = (time: string) => {
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    return (
        <div id="access-info" className="py-8 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Access Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* NIGHTLY: Check-in/Check-out */}
                {listing.pricingModel === PricingModel.NIGHTLY && (
                    <>
                        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                            <div className="p-3 bg-brand-100 rounded-lg">
                                <Clock size={24} className="text-brand-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1">Check-In</h3>
                                <p className="text-gray-600">
                                    From {formatTime((listing.bookingConfig as NightlyConfig).checkInTime)}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    You can arrive anytime after this hour
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                            <div className="p-3 bg-brand-100 rounded-lg">
                                <Clock size={24} className="text-brand-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1">Check-Out</h3>
                                <p className="text-gray-600">
                                    By {formatTime((listing.bookingConfig as NightlyConfig).checkOutTime)}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    Please vacate the space by this time
                                </p>
                            </div>
                        </div>
                    </>
                )}

                {/* DAILY: Access Hours */}
                {listing.pricingModel === PricingModel.DAILY && (
                    <>
                        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                            <div className="p-3 bg-brand-100 rounded-lg">
                                <Calendar size={24} className="text-brand-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1">Venue Opens</h3>
                                <p className="text-gray-600">
                                    {formatTime((listing.bookingConfig as DailyConfig).accessStartTime)}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    Earliest access time for your event
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                            <div className="p-3 bg-brand-100 rounded-lg">
                                <Calendar size={24} className="text-brand-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1">Event Must End</h3>
                                <p className="text-gray-600">
                                    By {formatTime((listing.bookingConfig as DailyConfig).accessEndTime)}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    Latest time for your event to conclude
                                </p>
                            </div>
                        </div>
                    </>
                )}

                {/* HOURLY: Operating Hours + Buffer */}
                {listing.pricingModel === PricingModel.HOURLY && (
                    <>
                        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                            <div className="p-3 bg-brand-100 rounded-lg">
                                <Hourglass size={24} className="text-brand-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1">Operating Hours</h3>
                                <p className="text-gray-600">
                                    {formatTime((listing.bookingConfig as HourlyConfig).operatingHours.start)} - {formatTime((listing.bookingConfig as HourlyConfig).operatingHours.end)}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    Space is available during these hours
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                            <div className="p-3 bg-brand-100 rounded-lg">
                                <Clock size={24} className="text-brand-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1">Minimum Booking</h3>
                                <p className="text-gray-600">
                                    {(listing.bookingConfig as HourlyConfig).minHoursBooking} {(listing.bookingConfig as HourlyConfig).minHoursBooking === 1 ? 'hour' : 'hours'}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    Minimum duration required for booking
                                </p>
                            </div>
                        </div>

                        {(listing.bookingConfig as HourlyConfig).bufferMinutes > 0 && (
                            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl md:col-span-2">
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <Clock size={24} className="text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-1">Cleaning Buffer</h3>
                                    <p className="text-gray-600">
                                        {(listing.bookingConfig as HourlyConfig).bufferMinutes} minutes between bookings
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Time reserved for cleaning and preparation between sessions
                                    </p>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
