/**
 * HostStorefrontPage Component
 * 
 * Main page for viewing a host's public storefront.
 * Accessed via shareable link at /s/:shortCode
 */

import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';
import { useHostStorefront } from '../hooks/useHostStorefront';
import { HostStorefrontHeader } from './HostStorefrontHeader';
import { HostListingGrid } from './HostListingGrid';
import { HostStorefrontSkeleton } from './HostStorefrontSkeleton';

export const HostStorefrontPage: React.FC = () => {
  const { shortCode } = useParams<{ shortCode: string }>();
  const { data, isLoading, error, recordClick } = useHostStorefront(shortCode || '');

  // Record analytics click on mount
  useEffect(() => {
    if (shortCode && data) {
      recordClick();
    }
  }, [shortCode, data, recordClick]);

  // Loading state
  if (isLoading) {
    return <HostStorefrontSkeleton />;
  }

  // Error state
  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Profile Not Found
          </h1>
          <p className="text-gray-500 mb-6">
            {error || "This link may be invalid or the host's profile is no longer available."}
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Home className="w-5 h-5" />
            Browse All Spaces
          </Link>
        </div>
      </div>
    );
  }

  const { host, listings } = data;

  // Empty listings state
  if (listings.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <HostStorefrontHeader host={host} listingCount={0} />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Home className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No Available Spaces
            </h2>
            <p className="text-gray-500 mb-6">
              This host doesn't have any spaces available at the moment.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse All Spaces
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Host Header */}
      <HostStorefrontHeader host={host} listingCount={listings.length} />
      
      {/* Listings Grid */}
      <HostListingGrid listings={listings} hostName={host.displayName} />
      
      {/* Footer CTA */}
      <div className="bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Looking for more options?
              </h3>
              <p className="text-gray-500">
                Discover thousands of unique spaces on Fiilar
              </p>
            </div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Home className="w-5 h-5" />
              Explore All Spaces
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostStorefrontPage;
