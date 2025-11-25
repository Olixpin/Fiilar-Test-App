import React from 'react';
import { Listing } from '@fiilar/types';
import { X, Star, Wifi, Wind, Utensils, Car, Dumbbell, Waves, Briefcase, Tv, Shirt, Scissors, Zap, Coffee, Music, Video, Shield, Sun, CheckCircle } from 'lucide-react';
import { getReviews, getAverageRating } from '@fiilar/reviews';
import { getAllUsers } from '@fiilar/storage'; // Re-import getAllUsers if still needed

interface ReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: Listing;
}

export const ReviewsModal: React.FC<ReviewsModalProps> = ({ isOpen, onClose, listing }) => {
  if (!isOpen) return null;

  const reviews = getReviews(listing.id);
  const avgRating = getAverageRating(listing.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Reviews</h2>
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
          <button
            onClick={onClose}
            aria-label="Close reviews modal"
            title="Close reviews modal"
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {reviews.length === 0 ? (
            <div className="text-center py-12">
              <div className="flex items-center gap-1 text-sm">
                <Star size={16} className="fill-yellow-400 text-yellow-400" />
                <p className="font-medium">
                  {getReviews(listing.id).length > 0
                    ? `${getAverageRating(listing.id).toFixed(1)} (${getReviews(listing.id).length} reviews)`
                    : 'New'
                  }
                </p>
              </div>

              {/* Amenities */}
              {listing.amenities && listing.amenities.length > 0 && (
                <div className="mt-8 border-t border-gray-100 pt-8">
                  <h3 className="font-bold text-gray-900 mb-4 text-lg">Amenities</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {listing.amenities.map(amenity => {
                      // Simple icon mapping for this view
                      const getIcon = (name: string) => {
                        switch (name) {
                          case 'Wifi': return <Wifi size={18} />;
                          case 'Wind': return <Wind size={18} />;
                          case 'Utensils': return <Utensils size={18} />;
                          case 'Car': return <Car size={18} />;
                          case 'Dumbbell': return <Dumbbell size={18} />;
                          case 'Waves': return <Waves size={18} />;
                          case 'Briefcase': return <Briefcase size={18} />;
                          case 'Tv': return <Tv size={18} />;
                          case 'Shirt': return <Shirt size={18} />;
                          case 'Scissors': return <Scissors size={18} />;
                          case 'Zap': return <Zap size={18} />;
                          case 'Coffee': return <Coffee size={18} />;
                          case 'Music': return <Music size={18} />;
                          case 'Video': return <Video size={18} />;
                          case 'Shield': return <Shield size={18} />;
                          case 'Sun': return <Sun size={18} />;
                          case 'Star': return <Star size={18} />;
                          default: return <CheckCircle size={18} />;
                        }
                      };
                      return (
                        <div key={amenity.name} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-brand-600 shadow-sm shrink-0">
                            {getIcon(amenity.icon)}
                          </div>
                          <span className="text-gray-700 font-medium text-sm">{amenity.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tags */}
              {listing.tags && listing.tags.length > 0 && (
                <div className="mt-8 border-t border-gray-100 pt-8">
                  <h3 className="font-bold text-gray-900 mb-4 text-lg">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {listing.tags.map(tag => (
                      <span key={tag} className="px-4 py-1.5 bg-brand-50 text-brand-700 rounded-full text-sm font-medium border border-brand-100">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-8">
              {reviews.map(review => {
                const reviewer = getAllUsers().find(u => u.id === review.userId);
                return (
                  <div key={review.id} className="border-b border-gray-100 pb-8 last:border-0">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold shrink-0">
                        {reviewer?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-semibold text-gray-900">{reviewer?.name || 'Anonymous'}</p>
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
                        <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
