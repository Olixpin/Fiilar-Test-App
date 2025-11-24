import React from 'react';
import { Listing } from '@fiilar/types';
import { Grid, ChevronLeft, Heart, Share } from 'lucide-react';

interface ListingImagesProps {
  listing: Listing;
  onBack: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  openGallery: (index: number) => void;
}

export const ListingImages: React.FC<ListingImagesProps> = ({
  listing,
  onBack,
  isFavorite,
  onToggleFavorite,
  openGallery
}) => {
  return (
    <div className="relative h-[300px] sm:h-[400px] lg:h-[500px] rounded-2xl overflow-hidden mb-8 group">
      {/* Top Actions */}
      <div className="absolute top-4 left-4 z-10">
        <button onClick={onBack} aria-label="Go back" className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition shadow-sm">
          <ChevronLeft size={20} />
        </button>
      </div>
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button aria-label="Share listing" className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition shadow-sm">
          <Share size={20} />
        </button>
        <button onClick={onToggleFavorite} aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"} className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition shadow-sm">
          <Heart size={20} className={isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"} />
        </button>
      </div>

      {(() => {
        // 1 Image
        if (listing.images.length === 1) {
          return (
            <div className="w-full h-full relative overflow-hidden">
              <img src={listing.images[0]} className="w-full h-full object-cover transition duration-500 group-hover:scale-105" alt="Main" />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition"></div>
            </div>
          );
        }

        // 2 Images
        if (listing.images.length === 2) {
          return (
            <div className="grid grid-cols-2 gap-2 h-full">
              {listing.images.map((img, i) => (
                <div key={i} className="relative overflow-hidden h-full">
                  <img src={img} className="w-full h-full object-cover transition duration-500 group-hover:scale-105" alt={`View ${i + 1}`} />
                </div>
              ))}
            </div>
          );
        }

        // 3 Images
        if (listing.images.length === 3) {
          return (
            <div className="grid grid-cols-3 gap-2 h-full">
              <div className="col-span-2 relative overflow-hidden">
                <img src={listing.images[0]} className="w-full h-full object-cover transition duration-500 group-hover:scale-105" alt="Main" />
              </div>
              <div className="flex flex-col gap-2 h-full">
                <div className="relative overflow-hidden h-1/2">
                  <img src={listing.images[1]} className="w-full h-full object-cover transition duration-500 group-hover:scale-105" alt="Detail 1" />
                </div>
                <div className="relative overflow-hidden h-1/2">
                  <img src={listing.images[2]} className="w-full h-full object-cover transition duration-500 group-hover:scale-105" alt="Detail 2" />
                </div>
              </div>
            </div>
          );
        }

        // 4 Images
        if (listing.images.length === 4) {
          return (
            <div className="grid grid-cols-2 gap-2 h-full">
              <div className="relative overflow-hidden">
                <img src={listing.images[0]} className="w-full h-full object-cover transition duration-500 group-hover:scale-105" alt="Main" />
              </div>
              <div className="grid grid-rows-2 gap-2 h-full">
                <div className="relative overflow-hidden">
                  <img src={listing.images[1]} className="w-full h-full object-cover transition duration-500 group-hover:scale-105" alt="Detail 1" />
                </div>
                <div className="grid grid-cols-2 gap-2 h-full">
                  <div className="relative overflow-hidden">
                    <img src={listing.images[2]} className="w-full h-full object-cover transition duration-500 group-hover:scale-105" alt="Detail 2" />
                  </div>
                  <div className="relative overflow-hidden">
                    <img src={listing.images[3]} className="w-full h-full object-cover transition duration-500 group-hover:scale-105" alt="Detail 3" />
                  </div>
                </div>
              </div>
            </div>
          );
        }

        // 5+ Images: Bento Grid (1 Large, 4 Small)
        return (
          <div className="grid grid-cols-4 grid-rows-2 gap-2 h-full">
            {/* Hero Image */}
            <div className="col-span-2 row-span-2 relative overflow-hidden">
              <img src={listing.images[0]} className="w-full h-full object-cover transition duration-500 group-hover:scale-105" alt="Main" />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition"></div>
            </div>
            {/* Side Images */}
            <div className="col-span-1 row-span-1 relative overflow-hidden">
              <img src={listing.images[1]} className="w-full h-full object-cover transition duration-500 group-hover:scale-105" alt="Detail 1" />
            </div>
            <div className="col-span-1 row-span-1 relative overflow-hidden">
              <img src={listing.images[2]} className="w-full h-full object-cover transition duration-500 group-hover:scale-105" alt="Detail 2" />
            </div>
            <div className="col-span-1 row-span-1 relative overflow-hidden">
              <img src={listing.images[3]} className="w-full h-full object-cover transition duration-500 group-hover:scale-105" alt="Detail 3" />
            </div>
            <div className="col-span-1 row-span-1 relative overflow-hidden">
              <img src={listing.images[4]} className="w-full h-full object-cover transition duration-500 group-hover:scale-105" alt="Detail 4" />
            </div>
          </div>
        );
      })()}

      {/* Show All Photos Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          openGallery(0);
        }}
        className="absolute bottom-4 right-4 bg-white text-gray-900 px-4 py-2 rounded-lg shadow-md font-semibold text-sm flex items-center gap-2 hover:scale-105 transition"
      >
        <Grid size={16} /> Show all photos
      </button>
    </div>
  );
};
