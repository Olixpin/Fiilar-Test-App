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
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [startX, setStartX] = React.useState(0);
  const [scrollLeft, setScrollLeft] = React.useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1; // 1:1 movement for natural feel
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const images = listing.images || [];
  const count = images.length;

  return (
    <div className="relative h-full overflow-hidden group animate-in fade-in zoom-in-95 duration-1000">

      {/* Hero Grid/Scroll Layout */}
      <div
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        style={{ scrollBehavior: isDragging ? 'auto' : 'smooth' }}
        className={`flex md:grid md:grid-cols-4 md:grid-rows-2 gap-2 h-full group/gallery overflow-x-auto md:overflow-hidden snap-x snap-mandatory no-scrollbar -mx-4 px-4 md:mx-0 md:px-0 ${isDragging ? 'cursor-grabbing snap-none' : 'cursor-grab md:cursor-default'}`}
      >

        {/* Main Image (Always present) */}
        <div
          className={`relative overflow-hidden cursor-pointer min-w-[90vw] md:min-w-0 ${count === 1 ? 'md:col-span-4 md:row-span-2' : 'md:col-span-2 md:row-span-2'} hover:z-10 group/image snap-center rounded-xl md:rounded-none`}
          onClick={() => openGallery(0)}
        >
          <img
            src={images[0]}
            loading="eager"
            className="w-full h-full object-cover transition-all duration-700 ease-out group-hover/gallery:blur-[2px] group-hover/gallery:brightness-75 group-hover/image:blur-none group-hover/image:brightness-100 group-hover/image:scale-105 group-hover/image:rotate-1"
            alt="Main view"
          />
          <div className="absolute inset-0 bg-black/0 transition-colors duration-500 ease-out" />

          {/* Image Counter Badge - Desktop */}
          <div className="hidden md:block absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/20">
            1 / {count}
          </div>
        </div>

        {/* Secondary Images - Mobile (Scrollable) & Desktop (Grid) */}
        {count > 1 && (
          <>
            {/* Image 2 */}
            <div className="relative overflow-hidden cursor-pointer min-w-[90vw] md:min-w-0 snap-center rounded-xl md:rounded-none hover:z-10 group/image md:block md:col-span-2 md:row-span-1" onClick={() => openGallery(1)}>
              <img
                src={images[1]}
                loading="lazy"
                className="w-full h-full object-cover transition-all duration-700 ease-out group-hover/gallery:blur-[2px] group-hover/gallery:brightness-75 group-hover/image:blur-none group-hover/image:brightness-100 group-hover/image:scale-105 group-hover/image:rotate-1"
                alt="View 2"
              />
              <div className="absolute inset-0 bg-black/0 transition-colors duration-500 ease-out" />
            </div>

            {/* Image 3 (Only if count > 2) */}
            {count > 2 ? (
              <div className="relative overflow-hidden cursor-pointer min-w-[90vw] md:min-w-0 snap-center rounded-xl md:rounded-none hover:z-10 group/image md:block md:col-span-1 md:row-span-1" onClick={() => openGallery(2)}>
                <img
                  src={images[2]}
                  loading="lazy"
                  className="w-full h-full object-cover transition-all duration-700 ease-out group-hover/gallery:blur-[2px] group-hover/gallery:brightness-75 group-hover/image:blur-none group-hover/image:brightness-100 group-hover/image:scale-105 group-hover/image:rotate-1"
                  alt="View 3"
                />
                <div className="absolute inset-0 bg-black/0 transition-colors duration-500 ease-out" />
              </div>
            ) : (
              <div className="hidden md:block bg-gray-50 md:col-span-1 md:row-span-1" /> // Placeholder for desktop grid
            )}

            {/* Image 4 (Only if count > 3) */}
            {count > 3 ? (
              <div className="relative overflow-hidden cursor-pointer min-w-[90vw] md:min-w-0 snap-center rounded-xl md:rounded-none hover:z-10 group/image md:block md:col-span-1 md:row-span-1" onClick={() => openGallery(3)}>
                <img
                  src={images[3]}
                  loading="lazy"
                  className="w-full h-full object-cover transition-all duration-700 ease-out group-hover/gallery:blur-[2px] group-hover/gallery:brightness-75 group-hover/image:blur-none group-hover/image:brightness-100 group-hover/image:scale-105 group-hover/image:rotate-1"
                  alt="View 4"
                />
                <div className="absolute inset-0 bg-black/0 transition-colors duration-500 ease-out" />
              </div>
            ) : (
              count > 2 && <div className="hidden md:block bg-gray-50 md:col-span-1 md:row-span-1" /> // Placeholder for desktop grid
            )}

            {/* Image 5 (Only if count > 4) - Contains "Show All" button */}
            {count > 4 ? (
              <div className="relative overflow-hidden cursor-pointer min-w-[90vw] md:min-w-0 snap-center rounded-xl md:rounded-none hover:z-10 group/image md:block md:col-span-1 md:row-span-1" onClick={() => openGallery(4)}>
                <img
                  src={images[4]}
                  loading="lazy"
                  className="w-full h-full object-cover transition-all duration-700 ease-out group-hover/gallery:blur-[2px] group-hover/gallery:brightness-75 group-hover/image:blur-none group-hover/image:brightness-100 group-hover/image:scale-105 group-hover/image:rotate-1"
                  alt="View 5"
                />
                <div className="absolute inset-0 bg-black/0 transition-colors duration-500 ease-out" />

                {/* Show All Overlay */}
                <div className="absolute inset-0 bg-black/20 hover:bg-black/30 transition-colors flex items-center justify-center">
                  <button className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-lg font-semibold text-sm shadow-lg flex items-center gap-2 hover:bg-white hover:scale-105 transition-all">
                    <Images size={16} />
                    Show all {count} photos
                  </button>
                </div>
              </div>
            ) : (
              count > 3 && <div className="hidden md:block bg-gray-50 md:col-span-1 md:row-span-1" /> // Placeholder for desktop grid
            )}
          </>
        )}
      </div>

      {/* Mobile "Show All" Button (Floating) */}
      <div className="absolute bottom-4 right-4 md:hidden">
        <button
          onClick={() => openGallery(0)}
          className="bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg border border-white/20 flex items-center gap-1.5 hover:bg-black/80 transition-all"
        >
          <Images size={14} /> 1 / {count}
        </button>
      </div>
    </div>
  );
};
