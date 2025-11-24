import React from 'react';
import { User, Listing } from '@fiilar/types';
import ListingCard from '../../Listings/components/ListingCard';
import { Heart } from 'lucide-react';

interface UserFavoritesTabProps {
  user: User;
  listings: Listing[];
}

export const UserFavoritesTab: React.FC<UserFavoritesTabProps> = ({ user, listings }) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Favorites</h2>
      {(!user.favorites || user.favorites.length === 0) ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
          <Heart size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">You haven't saved any spaces yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {listings.filter(l => user.favorites?.includes(l.id)).map(l => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      )}
    </div>
  );
};
