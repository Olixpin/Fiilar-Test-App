import React from 'react';
import { Listing, CancellationPolicy } from '@fiilar/types';
import { ShieldCheck, Flame, Cross, AlertTriangle, Camera, Lock, CircleParking } from 'lucide-react';

interface ListingPoliciesProps {
  listing: Listing;
}

// Map safety items to appropriate icons
const getSafetyIcon = (item: string) => {
  const lowerItem = item.toLowerCase();
  if (lowerItem.includes('fire') || lowerItem.includes('extinguisher') || lowerItem.includes('smoke')) {
    return <Flame size={14} className="text-orange-500" />;
  }
  if (lowerItem.includes('first aid') || lowerItem.includes('medical') || lowerItem.includes('kit')) {
    return <Cross size={14} className="text-red-500" />;
  }
  if (lowerItem.includes('camera') || lowerItem.includes('cctv') || lowerItem.includes('security camera')) {
    return <Camera size={14} className="text-blue-500" />;
  }
  if (lowerItem.includes('lock') || lowerItem.includes('secure') || lowerItem.includes('safe')) {
    return <Lock size={14} className="text-gray-600" />;
  }
  if (lowerItem.includes('parking') || lowerItem.includes('car')) {
    return <CircleParking size={14} className="text-gray-500" />;
  }
  if (lowerItem.includes('warning') || lowerItem.includes('hazard') || lowerItem.includes('caution')) {
    return <AlertTriangle size={14} className="text-yellow-500" />;
  }
  return <ShieldCheck size={14} className="text-green-500" />;
};

export const ListingPolicies: React.FC<ListingPoliciesProps> = ({ listing }) => {
  return (
    <div className="mt-0 pb-0">
      <h3 className="text-2xl font-bold text-gray-900 mb-8 font-display">Things to know</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 pb-0">
        {/* House Rules */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">House Rules</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            {listing.houseRules && listing.houseRules.length > 0 ? (
              listing.houseRules.map((rule, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="block w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 shrink-0"></span>
                  {rule}
                </li>
              ))
            ) : (
              <li className="text-gray-400 italic">No specific rules set by host.</li>
            )}
          </ul>
        </div>

        {/* Safety */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Safety & Property</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            {listing.safetyItems && listing.safetyItems.length > 0 ? (
              listing.safetyItems.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="mt-0.5 shrink-0">{getSafetyIcon(item)}</span>
                  {item}
                </li>
              ))
            ) : (
              <li className="text-gray-400 italic">No safety info provided.</li>
            )}
          </ul>
        </div>

        {/* Cancellation */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Cancellation Policy</h4>
          <p className="text-sm font-medium text-gray-900 mb-1">{listing.cancellationPolicy || CancellationPolicy.MODERATE}</p>
          <p className="text-sm text-gray-600">
            {listing.cancellationPolicy === CancellationPolicy.FLEXIBLE && "Free cancellation until 24 hours before check-in."}
            {listing.cancellationPolicy === CancellationPolicy.MODERATE && "Free cancellation until 5 days before check-in."}
            {(listing.cancellationPolicy === CancellationPolicy.STRICT || !listing.cancellationPolicy) && "Non-refundable."}
          </p>
        </div>
      </div>
    </div>
  );
};
