import React from 'react';
import { Listing, BookingType } from '@fiilar/types';
import { UserCheck, MapPin, Users, Clock, Calendar, Zap, Repeat, Timer } from 'lucide-react';

interface ListingHeaderProps {
  listing: Listing;
}

export const ListingHeader: React.FC<ListingHeaderProps> = ({ listing }) => {
  const isHourly = listing.priceUnit === BookingType.HOURLY;

  return (
    <div className="mb-8">
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 font-display leading-tight">{listing.title}</h1>

      {/* Quick Info Pills */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {/* Capacity */}
        {listing.capacity && (
          <div className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200">
            <Users size={14} className="text-gray-500" />
            <span>Max {listing.capacity}</span>
          </div>
        )}

        {/* Booking Type */}
        <div className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200">
          {isHourly ? <Clock size={14} className="text-gray-500" /> : <Calendar size={14} className="text-gray-500" />}
          <span>{isHourly ? 'Hourly' : 'Daily'} Booking</span>
        </div>

        {/* Instant Book */}
        {/* Instant Book or Approval Time */}
        {listing.settings?.instantBook ? (
          <div className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg text-xs font-semibold border border-green-200">
            <Zap size={14} className="text-green-600 fill-green-600" />
            <span>Instant Book</span>
          </div>
        ) : listing.approvalTime ? (
          <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-semibold border border-blue-200">
            <Clock size={14} className="text-blue-600" />
            <span>Responds in {listing.approvalTime}</span>
          </div>
        ) : null}

        {/* Minimum Duration (for non-hourly - hourly shows in AccessInfo) */}
        {listing.settings?.minDuration && listing.settings.minDuration > 1 && !isHourly && (
          <div className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200">
            <Timer size={14} className="text-gray-500" />
            <span>Min {listing.settings.minDuration} {isHourly ? 'hrs' : 'nights'}</span>
          </div>
        )}

        {/* Recurring Available */}
        {listing.settings?.allowRecurring && (
          <div className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg text-xs font-semibold border border-purple-200">
            <Repeat size={14} className="text-purple-600" />
            <span>Recurring</span>
          </div>
        )}
      </div>

      <div className="flex flex-row flex-wrap items-center gap-3 text-sm">
        <div className="flex items-center gap-2">
          <div className="bg-brand-50 text-brand-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border border-brand-100">
            {listing.type}
          </div>
          {listing.requiresIdentityVerification && (
            <div className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
              <UserCheck size={14} />
              <span className="hidden xs:inline">ID Required</span>
            </div>
          )}
        </div>

        <div className="w-1 h-1 bg-gray-300 rounded-full"></div>

        <button
          onClick={() => {
            const mobileLoc = document.getElementById('location-mobile');
            const desktopLoc = document.getElementById('location');
            if (mobileLoc && window.getComputedStyle(mobileLoc).display !== 'none') {
              mobileLoc.scrollIntoView({ behavior: 'smooth' });
            } else {
              desktopLoc?.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          className="flex items-center text-gray-500 font-medium hover:text-brand-600 hover:underline transition-colors cursor-pointer"
        >
          <MapPin size={16} className="mr-1.5 shrink-0 text-gray-400 group-hover:text-brand-500" />
          <span>{listing.location}</span>
        </button>

        {/* Address (if different from location) */}
        {listing.address && listing.address !== listing.location && (
          <>
            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
            <span className="text-gray-400 text-sm">{listing.address}</span>
          </>
        )}
      </div>

      {/* Tags */}
      {listing.tags && listing.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {listing.tags.map(tag => (
            <span
              key={tag}
              className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium hover:bg-gray-200 transition-colors"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
