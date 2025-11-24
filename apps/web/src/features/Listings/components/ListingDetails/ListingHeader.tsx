import React from 'react';
import { Listing } from '@fiilar/types';
import { UserCheck, MapPin } from 'lucide-react';

interface ListingHeaderProps {
  listing: Listing;
}

export const ListingHeader: React.FC<ListingHeaderProps> = ({ listing }) => {
  return (
    <div className="mb-4">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{listing.title}</h1>
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <div className="bg-brand-50 text-brand-700 px-2.5 py-1 rounded-full text-xs font-bold uppercase">
          {listing.type}
        </div>
        {listing.requiresIdentityVerification && (
          <div className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-xs font-medium">
            <UserCheck size={14} />
            <span>ID Required</span>
          </div>
        )}
      </div>
      <div className="flex items-center text-gray-500 text-sm">
        <MapPin size={16} className="mr-1 shrink-0" />
        <span>{listing.location}</span>
      </div>
    </div>
  );
};
