import React from 'react';
import { Listing } from '@fiilar/types';
import { Image } from 'lucide-react';

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
          className={`relative cursor-pointer min-w-[90vw] md:min-w-0 ${count === 1 ? 'md:col-span-4 md:row-span-2' : 'md:col-span-2 md:row-span-2'} hover:z-10 group/image snap-center`}
          onClick={() => openGallery(0)}
        >
          {/* Masked Image Container */}
          <div
            className="absolute inset-0 w-full h-full overflow-hidden rounded-xl rounded-tl-none md:rounded-none"
            style={{ WebkitMaskImage: '-webkit-linear-gradient(white, white)' }}
          >
            <img
              src={images[0]}
              loading="eager"
              className="w-full h-full object-cover transition-all duration-700 ease-out md:group-hover/gallery:blur-[2px] md:group-hover/gallery:brightness-75 md:group-hover/image:blur-none md:group-hover/image:brightness-100 group-hover/image:scale-105 group-hover/image:rotate-1"
              alt="Main view"
            />
            <div className="absolute inset-0 bg-black/0 transition-colors duration-500 ease-out" />
          </div>

          {/* Image Counter Badge - Visible on Mobile & Desktop - Outside Mask */}
          <div className="absolute bottom-32 md:bottom-4 right-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/20 flex items-center gap-1.5 z-20">
            <Image size={14} className="md:hidden" />
            1 / {count}
          </div>
        </div>

        {/* Secondary Images - Mobile (Scrollable) & Desktop (Grid) */}
        {/* Secondary Images - Mobile (Scrollable) & Desktop (Grid) */}
        {images.slice(1).map((image, index) => {
          // index 0 here corresponds to images[1] (2nd image overall)
          // We want to show all images on mobile (infinite scroll)
          // But only show up to index 3 (5th image overall) on desktop grid
          const isDesktopVisible = index < 4;
          const isLastDesktopSlot = index === 3;

          return (
            <div
              key={index}
              className={`relative cursor-pointer min-w-[90vw] md:min-w-0 snap-center hover:z-10 group/image md:col-span-1 md:row-span-1 ${!isDesktopVisible ? 'md:hidden' : 'md:block'}`}
              onClick={() => openGallery(index + 1)}
            >
              {/* Masked Image Container */}
              <div
                className={`absolute inset-0 w-full h-full overflow-hidden rounded-xl md:rounded-none ${isLastDesktopSlot ? 'rounded-tr-none' : ''}`}
                style={{ WebkitMaskImage: '-webkit-linear-gradient(white, white)' }}
              >
                <img
                  src={image}
                  loading="lazy"
                  className="w-full h-full object-cover transition-all duration-700 ease-out md:group-hover/gallery:blur-[2px] md:group-hover/gallery:brightness-75 md:group-hover/image:blur-none md:group-hover/image:brightness-100 group-hover/image:scale-105 group-hover/image:rotate-1"
                  alt={`View ${index + 2}`}
                />
                <div className="absolute inset-0 bg-black/0 transition-colors duration-500 ease-out" />
              </div>

              {/* Counter Badge - Visible on Mobile & Desktop - Outside Mask */}
              <div className="absolute bottom-32 md:bottom-4 right-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/20 flex items-center gap-1.5 z-20 md:hidden">
                <Image size={14} />
                {index + 2} / {count}
              </div>

              {/* Show All Overlay - Only on 5th image (index 3) and only on desktop */}
              {isLastDesktopSlot && count > 5 && (
                <div className="absolute inset-0 bg-black/20 hover:bg-black/30 transition-colors hidden md:flex items-center justify-center z-30 pointer-events-none">
                  <button className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-lg font-semibold text-sm shadow-lg flex items-center gap-2 hover:bg-white hover:scale-105 transition-all pointer-events-auto">
                    <Image size={16} />
                    Show all {count} photos
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {/* Desktop Placeholders (if fewer than 5 images) */}
        {count < 5 && Array.from({ length: 5 - count }).map((_, i) => (
          <div key={`placeholder-${i}`} className="hidden md:block bg-gray-50 md:col-span-1 md:row-span-1" />
        ))}
      </div>

    </div>
  );
};
