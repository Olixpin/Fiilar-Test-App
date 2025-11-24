import React from 'react';
import { Listing } from '@fiilar/types';
import { Wifi, Wind, Utensils, Car, Dumbbell, Waves, Briefcase, Tv, Shirt, Scissors, Zap, Coffee, Music, Video, Shield, Sun, Star, CheckCircle } from 'lucide-react';

interface ListingAmenitiesProps {
  listing: Listing;
}

export const ListingAmenities: React.FC<ListingAmenitiesProps> = ({ listing }) => {
  const getIcon = (name: string) => {
    switch (name) {
      case 'Wifi': return <Wifi size={20} />;
      case 'Wind': return <Wind size={20} />;
      case 'Utensils': return <Utensils size={20} />;
      case 'Car': return <Car size={20} />;
      case 'Dumbbell': return <Dumbbell size={20} />;
      case 'Waves': return <Waves size={20} />;
      case 'Briefcase': return <Briefcase size={20} />;
      case 'Tv': return <Tv size={20} />;
      case 'Shirt': return <Shirt size={20} />;
      case 'Scissors': return <Scissors size={20} />;
      case 'Zap': return <Zap size={20} />;
      case 'Coffee': return <Coffee size={20} />;
      case 'Music': return <Music size={20} />;
      case 'Video': return <Video size={20} />;
      case 'Shield': return <Shield size={20} />;
      case 'Sun': return <Sun size={20} />;
      case 'Star': return <Star size={20} />;
      default: return <CheckCircle size={20} />;
    }
  };

  return (
    <div className="mt-10 border-t border-gray-100 pt-10">
      <h3 className="text-xl font-bold text-gray-900 mb-6">What this place offers</h3>

      {/* Amenities */}
      {listing.amenities && listing.amenities.length > 0 && (
        <div className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {listing.amenities.map(amenity => (
              <div key={amenity.name} className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all bg-white">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-700 shrink-0">
                  {getIcon(amenity.icon)}
                </div>
                <span className="font-medium text-gray-700">{amenity.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {listing.tags && listing.tags.length > 0 && (
        <div>
          <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Tags</h4>
          <div className="flex flex-wrap gap-2">
            {listing.tags.map(tag => (
              <span key={tag} className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-full text-sm font-medium transition-colors border border-gray-200">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
