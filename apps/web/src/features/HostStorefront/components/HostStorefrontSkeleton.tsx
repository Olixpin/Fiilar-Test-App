/**
 * HostStorefrontSkeleton Component
 * 
 * Loading skeleton for the host storefront page.
 * Provides visual feedback while data is loading.
 */

import React from 'react';

export const HostStorefrontSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar Skeleton */}
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gray-200" />
            
            {/* Info Skeleton */}
            <div className="flex-1 text-center sm:text-left">
              <div className="h-8 bg-gray-200 rounded-lg w-48 mx-auto sm:mx-0 mb-4" />
              <div className="h-4 bg-gray-200 rounded w-64 mx-auto sm:mx-0 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-56 mx-auto sm:mx-0 mb-4" />
              
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
                <div className="h-4 bg-gray-200 rounded w-20" />
                <div className="h-4 bg-gray-200 rounded w-24" />
                <div className="h-4 bg-gray-200 rounded w-28" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Skeleton */}
        <div className="flex gap-2 mb-6">
          <div className="h-10 bg-gray-200 rounded-full w-20" />
          <div className="h-10 bg-gray-200 rounded-full w-32" />
          <div className="h-10 bg-gray-200 rounded-full w-28" />
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm">
              {/* Image Skeleton */}
              <div className="aspect-[4/3] bg-gray-200" />
              
              {/* Content Skeleton */}
              <div className="p-4">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
                <div className="flex justify-between items-center">
                  <div className="h-5 bg-gray-200 rounded w-24" />
                  <div className="h-4 bg-gray-200 rounded w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HostStorefrontSkeleton;
