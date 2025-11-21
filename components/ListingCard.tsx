import React, { useState } from 'react';
import { Listing, BookingType } from '../types';
import { Star, Heart, UserCheck } from 'lucide-react';

interface ListingCardProps {
  listing: Listing;
  onClick: () => void;
}

const ListingCard: React.FC<ListingCardProps> = ({ listing, onClick }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  return (
    <div 
      onClick={onClick}
      className="group cursor-pointer flex flex-col gap-2"
    >
      <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-200">
        <img 
          src={listing.images[0]} 
          alt={listing.title} 
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <button 
          onClick={handleFavoriteClick}
          className="absolute top-3 right-3 p-2 hover:scale-110 transition-transform z-10"
        >
            <Heart 
              className={`w-6 h-6 transition-colors ${isFavorite ? 'text-red-500 fill-red-500' : 'text-white fill-black/50 hover:fill-red-500'}`} 
            />
        </button>
        {listing.type && (
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-md text-[10px] font-bold text-gray-900 uppercase tracking-wide shadow-sm">
            {listing.type}
            </div>
        )}
      </div>
      
      <div className="mt-1">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-gray-900 leading-tight truncate">{listing.location}</h3>
          <div className="flex items-center gap-1 text-sm">
            <Star size={14} className="fill-black text-black" />
            <span>4.9</span>
          </div>
        </div>
        <p className="text-gray-500 text-sm line-clamp-1">{listing.title}</p>
        
        <div className="flex justify-between items-center mt-1">
            <p className="text-gray-500 text-sm">
                <span className="font-semibold text-gray-900">${listing.price}</span> 
                <span> {listing.priceUnit === BookingType.HOURLY ? 'hour' : 'night'}</span>
            </p>
            
            {listing.requiresIdentityVerification && (
               <div title="Identity Verification Required" className="flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-100">
                   <UserCheck size={12} />
                   <span>ID REQ</span> 
               </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ListingCard;