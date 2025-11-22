import React, { useState, useEffect } from 'react';
import { Listing, BookingType } from '../types';
import { Star, Heart, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, toggleFavorite } from '../services/storage';

interface ListingCardProps {
  listing: Listing;
}

const ListingCard: React.FC<ListingCardProps> = ({ listing }) => {
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const u = getCurrentUser();
    if (u && u.favorites && u.favorites.includes(listing.id)) {
      setIsFavorite(true);
    } else {
      setIsFavorite(false);
    }
  }, [listing.id]);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation when clicking favorite
    e.stopPropagation();

    const u = getCurrentUser();
    if (!u) {
      // If not logged in, send user to login so they can save items
      navigate('/login');
      return;
    }

    const newFavs = toggleFavorite(u.id, listing.id);
    setIsFavorite(newFavs.includes(listing.id));
  };

  return (
    <Link
      to={`/listing/${listing.id}`}
      className="group cursor-pointer flex flex-col gap-2 hover:-translate-y-1 transition-all duration-300"
    >
      <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-200 shadow-sm hover:shadow-xl transition-shadow duration-300">
        <img
          src={listing.images[0]}
          alt={listing.title}
          className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <button
          type="button"
          onClick={handleFavoriteClick}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          className="absolute top-3 right-3 p-2 hover:scale-125 active:scale-95 transition-all duration-200 z-10"
        >
          <Heart
            className={`w-6 h-6 transition-all duration-200 ${isFavorite ? 'text-red-500 fill-red-500' : 'text-white fill-black/50 hover:fill-red-500'}`}
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
            <span> / {listing.priceUnit === BookingType.HOURLY ? 'hour' : 'night'}</span>
          </p>

          {listing.requiresIdentityVerification && (
            <div title="Identity Verification Required" className="flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-100">
              <UserCheck size={12} />
              <span>ID REQ</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ListingCard;