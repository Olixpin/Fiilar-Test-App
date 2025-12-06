/**
 * HostStorefrontHeader Component
 * 
 * Displays the host's public profile information at the top of their storefront.
 * Shows avatar, name, badge status, ratings, and verification status.
 */

import React from 'react';
import { PublicHostProfile } from '@fiilar/types';
import { 
  Star, 
  Shield, 
  Clock, 
  Calendar,
  Award,
  BadgeCheck,
  Gem,
  Home
} from 'lucide-react';

interface HostStorefrontHeaderProps {
  host: PublicHostProfile;
  totalListings: number;
}

export const HostStorefrontHeader: React.FC<HostStorefrontHeaderProps> = ({
  host,
  totalListings,
}) => {
  // Get badge icon and color based on status
  const getBadgeInfo = () => {
    switch (host.badgeStatus) {
      case 'super_host':
        return { 
          icon: Award, 
          label: 'Superhost', 
          className: 'bg-gradient-to-r from-amber-500 to-yellow-400 text-white' 
        };
      case 'premium':
        return { 
          icon: Gem, 
          label: 'Premium Host', 
          className: 'bg-gradient-to-r from-purple-600 to-indigo-500 text-white' 
        };
      default:
        return null;
    }
  };

  const badgeInfo = getBadgeInfo();

  return (
    <div className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-gray-100 ring-4 ring-white shadow-lg">
              {host.avatar ? (
                <img
                  src={host.avatar}
                  alt={host.displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-500 to-brand-600 text-white text-3xl sm:text-4xl font-bold">
                  {host.displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            
            {/* Verified Badge */}
            {host.verifiedHost && (
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-md">
                <BadgeCheck className="w-6 h-6 text-blue-500" />
              </div>
            )}
          </div>

          {/* Host Info */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {host.displayName}
              </h1>
              
              {/* Badge */}
              {badgeInfo && (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${badgeInfo.className}`}>
                  <badgeInfo.icon className="w-4 h-4" />
                  {badgeInfo.label}
                </span>
              )}
            </div>

            {/* Bio */}
            {host.bio && (
              <p className="text-gray-600 mb-4 max-w-2xl line-clamp-2">
                {host.bio}
              </p>
            )}

            {/* Stats Row */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-gray-600">
              {/* Rating */}
              {host.rating && host.reviewCount && host.reviewCount > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-semibold text-gray-900">{host.rating.toFixed(1)}</span>
                  <span>({host.reviewCount} reviews)</span>
                </div>
              )}

              {/* Total Listings */}
              <div className="flex items-center gap-1">
                <Home className="w-4 h-4 text-gray-400" />
                <span>{totalListings} {totalListings === 1 ? 'listing' : 'listings'}</span>
              </div>

              {/* Member Since */}
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>Hosting since {host.memberSince}</span>
              </div>

              {/* Verified Status */}
              {host.verifiedHost && (
                <div className="flex items-center gap-1 text-blue-600">
                  <Shield className="w-4 h-4" />
                  <span>Identity verified</span>
                </div>
              )}

              {/* Response Time */}
              {host.responseTime && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>Responds {host.responseTime}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostStorefrontHeader;
