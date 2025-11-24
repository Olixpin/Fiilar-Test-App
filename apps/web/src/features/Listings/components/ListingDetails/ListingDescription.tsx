import React from 'react';
import { Listing } from '@fiilar/types';

interface ListingDescriptionProps {
  listing: Listing;
}

export const ListingDescription: React.FC<ListingDescriptionProps> = ({ listing }) => {
  return (
    <div className="prose text-gray-600 max-w-none">
      <h3 className="text-lg font-bold text-gray-900 mb-2">About this space</h3>
      <p>{listing.description}</p>
    </div>
  );
};
