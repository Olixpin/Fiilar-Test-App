import React from 'react';
import { Listing, CancellationPolicy } from '@fiilar/types';
import { ShieldCheck } from 'lucide-react';

interface ListingPoliciesProps {
  listing: Listing;
}

export const ListingPolicies: React.FC<ListingPoliciesProps> = ({ listing }) => {
  return (
    <div className="mt-8 pt-8 border-t border-gray-200 pb-0">
      <h3 className="text-xl font-bold text-gray-900 mb-4 sm:mb-6">Things to know</h3>
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
                  <ShieldCheck size={14} className="mt-0.5 text-gray-400 shrink-0" />
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
