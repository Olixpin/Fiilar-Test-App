
import React from 'react';
import { User, Listing } from '@fiilar/types';
import { Star, CheckCircle, MessageSquare, User as UserIcon, Users } from 'lucide-react';
import { getReviews, getAverageRating } from '@fiilar/reviews';

interface HostInfoProps {
  listing: Listing;
  host?: User;
  handleContactHost: () => void;
}

export const HostInfo: React.FC<HostInfoProps> = ({ listing, host, handleContactHost }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 border-y border-gray-100 py-4 sm:py-6 mt-4 sm:mt-6 mb-6">
      <div className="flex items-center gap-3">
        <div className="relative">
          {host?.avatar ? (
            <img src={host.avatar} alt={host.name} className="w-12 h-12 rounded-full object-cover border border-gray-200" />
          ) : (
            <div className="p-2 bg-gray-100 rounded-full">
              <UserIcon size={24} className="text-gray-600" />
            </div>
          )}
          {host?.kycVerified && (
            <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-0.5 rounded-full border-2 border-white" title="Verified Host">
              <CheckCircle size={12} strokeWidth={3} />
            </div>
          )}
        </div>
        <div className="flex-1">
          <p className="text-xs text-gray-500 uppercase font-bold">Host</p>
          <div className="flex items-center gap-1.5">
            <p className="font-medium text-gray-900">{host?.name || 'Unknown Host'}</p>
            {host?.kycVerified && <CheckCircle size={14} className="text-blue-500 fill-blue-50" />}
          </div>
          <p className="text-sm text-gray-500 mb-1">Responds within 1 hour</p>
          <button
            onClick={handleContactHost}
            className="text-brand-600 text-sm font-semibold hover:underline mt-1 flex items-center gap-1"
          >
            <MessageSquare size={14} /> Contact Host
          </button>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gray-100 rounded-full">
          <Star size={20} className="text-yellow-500" />
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase font-bold">Rating</p>
          <p className="font-medium">
            {getReviews(listing.id).length > 0
              ? `${getAverageRating(listing.id).toFixed(1)} (${getReviews(listing.id).length} reviews)`
              : 'New'
            }
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gray-100 rounded-full">
          <Users size={20} className="text-gray-600" />
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase font-bold">Capacity</p>
          <p className="font-medium">Up to {listing.capacity || 1} Guests</p>
        </div>
      </div>
    </div>
  );
};
