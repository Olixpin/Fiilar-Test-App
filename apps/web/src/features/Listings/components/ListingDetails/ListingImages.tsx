import React from 'react';
import { Listing } from '@fiilar/types';
import { Images } from 'lucide-react';

interface ListingImagesProps {
  listing: Listing;
  openGallery: (index: number) => void;
  // Kept for compatibility if parent passes them, but marked optional or removed if parent updated
  onBack?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export const ListingImages: React.FC<ListingImagesProps> = ({
  listing,
  openGallery
}) => {
  const images = listing.images || [];
  const count = images.length;

  return (
    <div className="relative h-full overflow-hidden group animate-in fade-in zoom-in-95 duration-1000">

      {/* Hero Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-2 h-full group/gallery">

        {/* Main Image (Always present) */}
        <div
          className={`relative overflow-hidden cursor-pointer ${count === 1 ? 'md:col-span-4 md:row-span-2' : 'md:col-span-2 md:row-span-2'} hover:z-10 group/image`}
          onClick={() => openGallery(0)}
        >
          <img
            src={images[0]}
            className="w-full h-full object-cover transition-all duration-700 ease-out group-hover/gallery:blur-[2px] group-hover/gallery:brightness-75 group-hover/image:blur-none group-hover/image:brightness-100 group-hover/image:scale-105 group-hover/image:rotate-1"
            alt="Main view"
          />
          <div className="absolute inset-0 bg-black/0 transition-colors duration-500 ease-out" />
        </div>

        {/* Secondary Images */}
        {count > 1 && (
          <div className="hidden md:grid md:col-span-2 md:row-span-2 md:grid-cols-2 md:grid-rows-2 gap-2 h-full group/secondary">
            {/* Image 2 */}
            <div className="relative overflow-hidden cursor-pointer hover:z-10 group/image" onClick={() => openGallery(1)}>
              <img src={images[1]} className="w-full h-full object-cover transition-all duration-700 ease-out group-hover/gallery:blur-[2px] group-hover/gallery:brightness-75 group-hover/image:blur-none group-hover/image:brightness-100 group-hover/image:scale-105 group-hover/image:rotate-1" alt="View 2" />
              <div className="absolute inset-0 bg-black/0 transition-colors duration-500 ease-out" />
            </div>

            {/* Image 3 (Only if count > 2) */}
            {count > 2 ? (
              <div className="relative overflow-hidden cursor-pointer hover:z-10 group/image" onClick={() => openGallery(2)}>
                <img src={images[2]} className="w-full h-full object-cover transition-all duration-700 ease-out group-hover/gallery:blur-[2px] group-hover/gallery:brightness-75 group-hover/image:blur-none group-hover/image:brightness-100 group-hover/image:scale-105 group-hover/image:rotate-1" alt="View 3" />
                <div className="absolute inset-0 bg-black/0 transition-colors duration-500 ease-out" />
              </div>
            ) : (
              <div className="bg-gray-50" /> // Placeholder
            )}

            {/* Image 4 (Only if count > 3) */}
            {count > 3 ? (
              <div className="relative overflow-hidden cursor-pointer hover:z-10 group/image" onClick={() => openGallery(3)}>
                <img src={images[3]} className="w-full h-full object-cover transition-all duration-700 ease-out group-hover/gallery:blur-[2px] group-hover/gallery:brightness-75 group-hover/image:blur-none group-hover/image:brightness-100 group-hover/image:scale-105 group-hover/image:rotate-1" alt="View 4" />
                <div className="absolute inset-0 bg-black/0 transition-colors duration-500 ease-out" />
              </div>
            ) : (
              count > 2 && <div className="bg-gray-50" /> // Placeholder
            )}

            {/* Image 5 (Only if count > 4) - Contains "Show All" button */}
            {count > 4 ? (
              <div className="relative overflow-hidden cursor-pointer hover:z-10 group/image" onClick={() => openGallery(4)}>
                <img src={images[4]} className="w-full h-full object-cover transition-all duration-700 ease-out group-hover/gallery:blur-[2px] group-hover/gallery:brightness-75 group-hover/image:blur-none group-hover/image:brightness-100 group-hover/image:scale-105 group-hover/image:rotate-1" alt="View 5" />
                <div className="absolute inset-0 bg-black/0 transition-colors duration-500 ease-out" />

                {/* Show All Overlay */}
                <div className="absolute inset-0 bg-black/20 hover:bg-black/30 transition-colors flex items-center justify-center">
                  <button className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-lg font-semibold text-sm shadow-lg flex items-center gap-2 hover:bg-white hover:scale-105 transition-all">
                    <Images size={16} />
                    Show all photos
                  </button>
                </div>
              </div>
            ) : (
              count > 3 && <div className="bg-gray-50" />
            )}
          </div>
        )}
      </div>

      {/* Mobile "Show All" Button (Floating) */}
      <div className="absolute bottom-4 right-4 md:hidden">
        <button
          onClick={() => openGallery(0)}
          className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm border border-gray-200 flex items-center gap-1.5"
        >
          <Images size={14} /> 1/{count}
        </button>
      </div>
    </div>
  );
};
