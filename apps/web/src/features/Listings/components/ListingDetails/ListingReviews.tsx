import React from 'react';
import { Listing, User } from '@fiilar/types';
import { Star, MessageSquare } from 'lucide-react';
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
    <div className="py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 font-display">Reviews</h3>
          {avgRating > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1">
                <Star size={20} className="fill-brand-500 text-brand-500" />
                <span className="text-xl font-bold text-gray-900">{avgRating.toFixed(1)}</span>
              </div>
              <span className="text-gray-400">•</span>
              <span className="text-gray-600 font-medium underline decoration-gray-300 underline-offset-4">
                {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
              </span>
            </div>
          )}
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-3xl border border-dashed border-gray-300">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100">
            <MessageSquare size={32} className="text-gray-400" />
          </div>
          <h4 className="text-lg font-bold text-gray-900 mb-2">No reviews yet</h4>
          <p className="text-gray-500 max-w-xs mx-auto">This space is new to Fiilar. Be the first to book and share your experience!</p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {reviews.slice(0, 4).map(review => {
              const users = getAllUsers();
              const user = users.find((u: User) => u.id === review.userId);
              return (
                <div key={review.id} className="bg-gray-50 p-6 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-gray-600 font-bold text-lg shadow-sm border border-gray-100 shrink-0">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{user?.name || 'Anonymous'}</p>
                      <p className="text-xs text-gray-500 font-medium">
                        {new Date(review.createdAt).toLocaleDateString('en-US', {
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={i < review.rating ? 'fill-brand-500 text-brand-500' : 'text-gray-300'}
                      />
                    ))}
                  </div>

                  <p className="text-gray-700 leading-relaxed line-clamp-4">{review.comment}</p>
                </div>
              );
            })}
          </div>

          {reviews.length > 4 && (
            <button
              onClick={onShowAllReviews}
              className="px-8 py-3 rounded-xl border border-gray-900 text-gray-900 font-semibold hover:bg-gray-50 transition-all active:scale-95"
            >
              Show all {reviews.length} reviews
            </button>
          )}
        </div>
      )}
    </div>
  );
};
