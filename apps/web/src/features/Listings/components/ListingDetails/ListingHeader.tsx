import React from 'react';
import { Listing } from '@fiilar/types';
import { UserCheck, MapPin } from 'lucide-react';

interface ListingHeaderProps {
  listing: Listing;
}

export const ListingHeader: React.FC<ListingHeaderProps> = ({ listing }) => {
  return (
    <div className="mb-8">
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 font-display leading-tight">{listing.title}</h1>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-brand-50 text-brand-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border border-brand-100">
            {listing.type}
          </div>
          {listing.requiresIdentityVerification && (
            <div className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
              <UserCheck size={14} />
              <span>ID Required</span>
            </div>
          )}
        </div>

        <div className="hidden sm:block w-1 h-1 bg-gray-300 rounded-full"></div>

        <div className="flex items-center text-gray-500 font-medium">
          <MapPin size={16} className="mr-1.5 shrink-0 text-gray-400" />
          <span>{listing.location}</span>
        </div>
      </div>
    </div>
  );
};
