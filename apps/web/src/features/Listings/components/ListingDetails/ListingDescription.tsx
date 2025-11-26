import React, { useState } from 'react';
import { Listing } from '@fiilar/types';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ListingDescriptionProps {
  listing: Listing;
}

export const ListingDescription: React.FC<ListingDescriptionProps> = ({ listing }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLongText = listing.description.length > 300;

  return (
    <div className="py-8">
      <h3 className="text-2xl font-bold text-gray-900 mb-6 font-display">About this space</h3>
      <div className={`prose prose-lg max-w-none text-gray-600 leading-relaxed ${!isExpanded && isLongText ? 'line-clamp-4' : ''}`}>
        <p className="whitespace-pre-line">{listing.description}</p>
      </div>

      {isLongText && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-4 flex items-center gap-2 font-semibold text-gray-900 hover:underline decoration-2 underline-offset-4 transition-all"
        >
          {isExpanded ? (
            <>Show less <ChevronUp size={18} /></>
          ) : (
            <>Show more <ChevronDown size={18} /></>
          )}
        </button>
      )}
    </div>
  );
};
