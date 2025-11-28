import React, { useState, useEffect } from 'react';
import { Listing, BookingType, PricingModel } from '@fiilar/types';
import { Star, Heart, ImageOff, MapPin, Gem, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, toggleFavorite, getAllUsers, hasBookingDraft } from '@fiilar/storage';
import { Badge } from '@fiilar/ui';
import { formatCurrency } from '../../../utils/currency';

// Badge variant types
type BadgeVariant = 'white' | 'gold' | 'premium';

// Badge variant styles - Thicker crisp glass border with top highlight
const badgeStyles: Record<BadgeVariant, string> = {
  white: '!bg-gradient-to-b !from-white/20 !to-white/5 !backdrop-blur-md !text-white !border !border-white/30',
  gold: '!bg-gradient-to-b !from-white/20 !to-white/5 !backdrop-blur-md !text-white !border !border-white/30',
  premium: '!bg-gradient-to-b !from-white/20 !to-white/5 !backdrop-blur-md !text-white !border !border-white/30',
};

interface ListingCardProps {
  listing: Listing;
  badgeVariant?: BadgeVariant;
  /** If true, this is a first-batch item (shows instantly) */
  priority?: boolean;
  /** Index of the card in the grid */
  index?: number;
  /** Callback when image finishes loading */
  onImageLoad?: (listingId: string) => void;
  /** Whether all images in the batch are ready */
  batchReady?: boolean;
}

const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  badgeVariant = 'white',
  priority = false,
  index: _index = 0,
  onImageLoad,
  batchReady = false,
}) => {
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentImageIndex] = useState(0);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [hostBadgeVariant, setHostBadgeVariant] = useState<BadgeVariant>(badgeVariant);
  const [isVisible, setIsVisible] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);

  // First 8 cards (priority) show instantly, others get simple CSS fade
  const isFirstBatch = priority;

  // Check if user has a draft for this listing
  useEffect(() => {
    const checkDraftStatus = () => {
      const user = getCurrentUser();
      if (user) {
        setHasDraft(hasBookingDraft(user.id, listing.id));
      } else {
        setHasDraft(false);
      }
    };

    checkDraftStatus();

    // Listen for draft updates (when drafts are deleted or changed)
    const handler = () => checkDraftStatus();
    window.addEventListener('fiilar:drafts-updated', handler);

    return () => {
      window.removeEventListener('fiilar:drafts-updated', handler);
    };
  }, [listing.id]);

  // Preload image via JavaScript for proper batch control
  useEffect(() => {
    const imageUrl = listing.images[currentImageIndex];
    if (!imageUrl) {
      setHasError(true);
      setIsImageLoaded(true);
      onImageLoad?.(listing.id);
      return;
    }

    const img = new Image();
    img.onload = () => {
      setIsImageLoaded(true);
      onImageLoad?.(listing.id);
    };
    img.onerror = () => {
      setHasError(true);
      setIsImageLoaded(true);
      onImageLoad?.(listing.id);
    };
    img.src = imageUrl;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [listing.images, currentImageIndex, listing.id, onImageLoad]);

  // Show card when ready
  useEffect(() => {
    if (isImageLoaded && batchReady) {
      setIsVisible(true);
    }
  }, [isImageLoaded, batchReady]);

  // Determine badge variant from host's badge status
  useEffect(() => {
    // If a specific badge variant is passed as prop (e.g. for demo purposes), use it
    if (badgeVariant !== 'white') {
      setHostBadgeVariant(badgeVariant);
      return;
    }

    // Otherwise, fetch host and check their badge status
    const users = getAllUsers();
    const host = users.find(u => u.id === listing.hostId);

    if (host?.badgeStatus === 'super_host') {
      setHostBadgeVariant('gold');
    } else if (host?.badgeStatus === 'premium') {
      setHostBadgeVariant('premium');
    } else {
      setHostBadgeVariant('white');
    }
  }, [listing.hostId, badgeVariant]);

  useEffect(() => {
    const checkFavoriteStatus = () => {
      const u = getCurrentUser();
      if (!u) return;
      setIsFavorite(u.favorites?.includes(listing.id) ?? false);
    };

    checkFavoriteStatus();

    const handler = () => checkFavoriteStatus();
    window.addEventListener('fiilar:user-updated', handler);

    return () => {
      window.removeEventListener('fiilar:user-updated', handler);
    };
  }, [listing.id]);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const user = getCurrentUser();
    if (!user) {
      navigate('/login');
      return;
    }

    // toggleFavorite will update storage and dispatch the event
    // The event listener will update isFavorite state
    const newFavorites = toggleFavorite(user.id, listing.id);
    // Update state immediately based on the returned value
    setIsFavorite(newFavorites.includes(listing.id));
  };

  const renderBadgeContent = () => {
    if (hostBadgeVariant === 'gold') {
      return (
        <div className="flex items-center gap-1.5">
          <img src="/assets/super-host-icon.png" alt="Super Host" className="w-4 h-4 object-contain" />
          <span>{listing.type}</span>
        </div>
      );
    }
    if (hostBadgeVariant === 'premium') {
      return (
        <div className="flex items-center gap-1.5">
          <Gem size={14} className="text-purple-300 fill-purple-400/30" />
          <span>{listing.type}</span>
        </div>
      );
    }
    return listing.type;
  };

  // First batch: show immediately when loaded, no skeleton needed
  // Scrolled batches: show skeleton until batch ready, then soft fade in
  const showSkeleton = !isFirstBatch && (!batchReady || !isImageLoaded);

  return (
    <div className="relative">
      {/* Skeleton - only for scrolled items (not first batch) */}
      {!isFirstBatch && (
        <div
          className={`transition-opacity duration-150 ${showSkeleton ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
          <div className="flex flex-col gap-3 bg-white p-3 rounded-3xl border border-gray-100">
            <div className="aspect-square rounded-2xl skeleton-shimmer" />
            <div className="space-y-2 mt-1">
              <div className="flex justify-between">
                <div className="h-5 bg-gray-200 rounded w-2/3" />
                <div className="h-4 bg-gray-200 rounded w-8" />
              </div>
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-4 bg-gray-200 rounded w-1/3 mt-1" />
            </div>
          </div>
        </div>
      )}

      {/* Actual card - first batch shows instantly, scrolled items fade in softly */}
      {(isFirstBatch ? isImageLoaded : isVisible) && (
        <Link
          to={`/listing/${listing.id}`}
          className={`${isFirstBatch ? '' : 'absolute inset-0'} group cursor-pointer flex flex-col gap-3 bg-white p-3 rounded-3xl shadow-sm hover:shadow-xl border border-gray-100 ${!isFirstBatch ? 'animate-fadeIn' : ''}`}
        >
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-200">
            {/* Skeleton Loader for Image - shows shimmer effect */}
            {!isImageLoaded && !hasError && (
              <div className="absolute inset-0 skeleton-shimmer z-10" />
            )}

            {hasError || !listing.images[currentImageIndex] ? (
              <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
                <div className="text-gray-400 flex flex-col items-center">
                  <ImageOff size={32} />
                  <span className="text-xs mt-1">No Image</span>
                </div>
              </div>
            ) : (
              <img
                src={listing.images[currentImageIndex]}
                alt={listing.title}
                loading="lazy"
                onError={() => {
                  setIsImageLoaded(true);
                  setHasError(true);
                }}
                className="h-full w-full object-cover group-hover:scale-110 transition-all duration-700"
              />
            )}

            {/* Contrast Overlay for Light Images */}
            <div className="absolute inset-x-0 top-0 h-24 bg-linear-to-b from-black/40 to-transparent z-0 pointer-events-none" />

            {/* Glassmorphism Badge */}
            {(listing.type || hostBadgeVariant !== 'white') && (
              <div className="absolute top-4 left-4 z-10 group/badge">
                <Badge
                  variant="outline"
                  className={`${badgeStyles[hostBadgeVariant]} rounded-full! px-3 py-1 flex items-center gap-1.5 text-[10px] font-bold tracking-wide uppercase drop-shadow-sm cursor-help`}
                >
                  {renderBadgeContent()}
                </Badge>

                {/* Tooltip */}
                {(hostBadgeVariant === 'gold' || hostBadgeVariant === 'premium') && (
                  <div className="absolute top-full left-0 mt-2 opacity-0 group-hover/badge:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20">
                    <div className="bg-gray-900/90 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-1 rounded-md shadow-lg border border-white/10">
                      {hostBadgeVariant === 'gold' ? 'Super Host' : 'Premium Host'}
                    </div>
                    {/* Arrow */}
                    <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900/90 rotate-45 border-t border-l border-white/10"></div>
                  </div>
                )}
              </div>
            )}

            {/* Heart Icon */}
            <button
              type="button"
              onClick={handleFavoriteClick}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              className="absolute top-4 right-4 z-10 p-1 rounded-full hover:bg-black/10 transition-colors"
            >
              <Heart
                className={`w-6 h-6 transition-all duration-200 ${isFavorite ? 'text-white fill-white' : 'text-white fill-transparent hover:scale-110'}`}
              />
            </button>

            {/* Draft Indicator Badge - Bottom Left */}
            {hasDraft && (
              <div className="absolute bottom-4 left-4 z-10">
                <Badge
                  variant="outline"
                  className="!bg-amber-500/90 !backdrop-blur-md !text-white !border-amber-400/50 rounded-full! px-2.5 py-1 flex items-center gap-1.5 text-[10px] font-bold tracking-wide uppercase shadow-lg"
                >
                  <Clock size={12} className="animate-pulse" />
                  <span>Continue</span>
                </Badge>
              </div>
            )}
          </div>

          <div className="mt-1 flex gap-2">
            {/* Vertical ID Badge (if required) */}
            {listing.requiresIdentityVerification && (
              <div className="flex flex-col items-center justify-center gap-[1px] bg-blue-50 border border-blue-100 text-blue-700 px-0 py-1 rounded-md min-w-[20px]">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-[7px] font-bold leading-none">ID</span>
              </div>
            )}

            {/* Title and Location */}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-base text-gray-900 leading-tight truncate">{listing.title}</h3>
              <div className="flex items-center gap-1 text-gray-500 mt-1">
                <MapPin size={14} className="text-red-500" />
                <span className="text-sm">{listing.location}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mt-2">
            <div className="flex items-center gap-1">
              <Star size={14} className="fill-gray-500 text-gray-500" />
              <span className="font-medium text-sm text-gray-500">
                {(listing.rating !== undefined && listing.rating !== null) ? Number(listing.rating).toFixed(1) : 'New'}
              </span>
              {listing.reviewCount ? (
                <span className="text-gray-400 text-xs">({listing.reviewCount} {listing.reviewCount === 1 ? 'Review' : 'Reviews'})</span>
              ) : null}
            </div>

            <div className="text-right">
              <span className="font-bold text-lg text-red-500">{formatCurrency(listing.price, { compact: true })}</span>
              <span className="text-gray-400 text-xs">/{
                (listing.pricingModel === PricingModel.HOURLY || listing.priceUnit === BookingType.HOURLY) ? 'Hr' :
                  listing.pricingModel === PricingModel.DAILY ? 'Day' :
                    'Night'
              }</span>
            </div>
          </div>
        </Link>
      )}
    </div>
  );
};

export default ListingCard;