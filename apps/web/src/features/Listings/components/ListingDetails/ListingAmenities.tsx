import React, { useState } from 'react';
import { Listing } from '@fiilar/types';
import { Wifi, Wind, Utensils, Car, Dumbbell, Waves, Briefcase, Tv, Shirt, Scissors, Zap, Coffee, Music, Video, Shield, Sun, Star, CheckCircle } from 'lucide-react';

interface ListingAmenitiesProps {
  listing: Listing;
}

export const ListingAmenities: React.FC<ListingAmenitiesProps> = ({ listing }) => {
  const [showAll, setShowAll] = useState(false);

  const getIcon = (name: string, size: number = 22) => {
    switch (name) {
      case 'Wifi': return <Wifi size={size} />;
      case 'Wind': return <Wind size={size} />;
      case 'Utensils': return <Utensils size={size} />;
      case 'Car': return <Car size={size} />;
      case 'Dumbbell': return <Dumbbell size={size} />;
      case 'Waves': return <Waves size={size} />;
      case 'Briefcase': return <Briefcase size={size} />;
      case 'Tv': return <Tv size={size} />;
      case 'Shirt': return <Shirt size={size} />;
      case 'Scissors': return <Scissors size={size} />;
      case 'Zap': return <Zap size={size} />;
      case 'Coffee': return <Coffee size={size} />;
      case 'Music': return <Music size={size} />;
      case 'Video': return <Video size={size} />;
      case 'Shield': return <Shield size={size} />;
      case 'Sun': return <Sun size={size} />;
      case 'Star': return <Star size={size} />;
      default: return <CheckCircle size={size} />;
    }
  };

  const displayedAmenities = showAll ? listing.amenities : listing.amenities?.slice(0, 6);
  const remainingCount = (listing.amenities?.length || 0) - 6;

  return (
    <div className="py-8">
      <h3 className="text-2xl font-bold text-gray-900 mb-8 font-display">What this place offers</h3>

      {listing.amenities && listing.amenities.length > 0 && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:flex md:flex-wrap gap-3">
            {displayedAmenities?.map(amenity => (
              <div key={amenity.name} className="group flex items-center gap-3 px-3 py-2.5 md:px-4 md:py-3 rounded-xl border border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm hover:scale-[1.02] transition-all duration-300 cursor-default w-full md:w-auto">
                <div className="w-8 h-8 rounded-lg bg-gray-50 group-hover:bg-brand-50 flex items-center justify-center text-gray-500 group-hover:text-brand-600 transition-colors shrink-0">
                  {getIcon(amenity.icon, 18)}
                </div>
                <span className="font-medium text-gray-700 group-hover:text-gray-900 transition-colors text-sm truncate">{amenity.name}</span>
              </div>
            ))}
          </div>

          {!showAll && remainingCount > 0 && (
            <button
              onClick={() => setShowAll(true)}
              className="mt-6 px-8 py-3 rounded-xl border border-gray-900 text-gray-900 font-semibold hover:bg-gray-50 transition-all active:scale-95"
            >
              Show all {listing.amenities.length} amenities
            </button>
          )}
        </div>
      )}
    </div>
  );
};
