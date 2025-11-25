import React from 'react';
import { Listing, User } from '@fiilar/types';
import { Star } from 'lucide-react';
import { getReviews, getAverageRating } from '@fiilar/reviews';
import { getAllUsers } from '@fiilar/storage';

interface ListingReviewsProps {
  listing: Listing;
  onShowAllReviews: () => void;
}

export const ListingReviews: React.FC<ListingReviewsProps> = ({ listing, onShowAllReviews }) => {
  const avgRating = getAverageRating(listing.id);
  const reviews = getReviews(listing.id);

  return (
    <div className="mt-10 pt-10 border-t border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Reviews</h3>
          {avgRating > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={i < Math.round(avgRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {avgRating.toFixed(1)} ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          )}
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <Star size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No reviews yet. Be the first to review this space!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.slice(0, 5).map(review => {
            const users = getAllUsers();
            const user = users.find((u: User) => u.id === review.userId);
            return (
              <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold shrink-0">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">{user?.name || 'Anonymous'}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString('en-US', {
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">{review.comment}</p>
                  </div>
                </div>
              </div>
            );
          })}
          {reviews.length > 5 && (
            <button onClick={onShowAllReviews} className="text-brand-600 font-semibold hover:text-brand-700 text-sm">
              Show all {reviews.length} reviews
            </button>
          )}
        </div>
      )}
    </div>
  );
};
