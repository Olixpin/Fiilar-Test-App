import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';

interface ImmersiveGalleryProps {
    images: string[];
    initialIndex?: number;
    isOpen: boolean;
    onClose: () => void;
}

const ImmersiveGallery: React.FC<ImmersiveGalleryProps> = ({
    images,
    initialIndex = 0,
    isOpen,
    onClose,
}) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [isZoomed, setIsZoomed] = useState(false);
    const [dragStart, setDragStart] = useState<{ x: number; time: number } | null>(null);
    const [dragOffset, setDragOffset] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [velocity, setVelocity] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const animationRef = useRef<number | null>(null);
    const prevImageRef = useRef<HTMLDivElement>(null);
    const currImageRef = useRef<HTMLDivElement>(null);
    const nextImageRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        if (prevImageRef.current) {
            prevImageRef.current.style.transform = `translateX(calc(-100% + ${dragOffset}px))`;
            prevImageRef.current.style.opacity = Math.abs(dragOffset) > 50 ? '0.5' : '0';
        }
        if (currImageRef.current) {
            currImageRef.current.style.transform = `translateX(${dragOffset}px)`;
        }
        if (nextImageRef.current) {
            nextImageRef.current.style.transform = `translateX(calc(100% + ${dragOffset}px))`;
            nextImageRef.current.style.opacity = Math.abs(dragOffset) > 50 ? '0.5' : '0';
        }
    }, [dragOffset]);

    useEffect(() => {
        setCurrentIndex(initialIndex);
    }, [initialIndex, isOpen]);

    // Prevent body scroll when gallery is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Keyboard navigation
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
                setIsZoomed(false);
            }
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
            if (e.key === 'z' || e.key === 'Z') toggleZoom();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, currentIndex, isZoomed]);

    // Momentum animation
    useEffect(() => {
        if (!isDragging && Math.abs(velocity) > 0.1) {
            animationRef.current = requestAnimationFrame(() => {
                const newOffset = dragOffset + velocity;
                setDragOffset(newOffset);
                setVelocity(velocity * 0.95); // Friction

                // Check if we should switch images
                if (Math.abs(newOffset) > window.innerWidth * 0.3) {
                    if (newOffset > 0) {
                        prevImage();
                    } else {
                        nextImage();
                    }
                    setVelocity(0);
                    setDragOffset(0);
                }
            });
        }

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [velocity, dragOffset, isDragging]);

    const nextImage = () => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setCurrentIndex((prev) => (prev + 1) % images.length);
        setIsZoomed(false);
        setDragOffset(0);
        setVelocity(0);
        setTimeout(() => setIsTransitioning(false), 400);
    };

    const prevImage = () => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
        setIsZoomed(false);
        setDragOffset(0);
        setVelocity(0);
        setTimeout(() => setIsTransitioning(false), 400);
    };

    const toggleZoom = () => {
        setIsZoomed(!isZoomed);
    };

    // Enhanced drag handlers with velocity tracking
    const handleDragStart = (clientX: number) => {
        setDragStart({ x: clientX, time: Date.now() });
        setIsDragging(true);
        setVelocity(0);
    };

    const handleDragMove = (clientX: number) => {
        if (dragStart === null || isZoomed) return;
        const offset = clientX - dragStart.x;
        setDragOffset(offset);
    };

    const handleDragEnd = (clientX: number) => {
        if (dragStart === null) return;

        const timeDelta = Date.now() - dragStart.time;
        const distance = clientX - dragStart.x;
        const calculatedVelocity = distance / timeDelta * 10; // Pixels per frame

        // Immediate switch if dragged far enough
        if (Math.abs(dragOffset) > window.innerWidth * 0.25) {
            if (dragOffset > 0) {
                prevImage();
            } else {
                nextImage();
            }
            setDragOffset(0);
            setVelocity(0);
        } else {
            // Apply momentum
            setVelocity(calculatedVelocity);
        }

        setDragStart(null);
        setIsDragging(false);
    };

    // Mouse events
    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        handleDragStart(e.clientX);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        handleDragMove(e.clientX);
    };

    const handleMouseUp = (e: React.MouseEvent) => {
        handleDragEnd(e.clientX);
    };

    // Touch events
    const handleTouchStart = (e: React.TouchEvent) => {
        handleDragStart(e.touches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        handleDragMove(e.touches[0].clientX);
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (e.changedTouches.length > 0) {
            handleDragEnd(e.changedTouches[0].clientX);
        }
    };

    if (!isOpen) return null;

    const getPrevIndex = () => (currentIndex - 1 + images.length) % images.length;
    const getNextIndex = () => (currentIndex + 1) % images.length;

    return (
        <div
            className="fixed inset-0 z-10000 bg-black flex items-center justify-center"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-4 sm:p-6 bg-linear-to-b from-black/90 via-black/50 to-transparent pointer-events-none">
                <div className="text-white text-sm sm:text-base font-medium backdrop-blur-sm bg-white/5 px-3 py-1.5 rounded-full">
                    {currentIndex + 1} / {images.length}
                </div>
                <div className="flex items-center gap-2 pointer-events-auto">
                    <button
                        onClick={toggleZoom}
                        className="p-2 sm:p-2.5 text-white hover:bg-white/10 rounded-full transition-all duration-200 hover:scale-110 active:scale-95 backdrop-blur-sm bg-white/5"
                        title={isZoomed ? 'Zoom Out (Z)' : 'Zoom In (Z)'}
                    >
                        {isZoomed ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                    </button>
                    <button
                        onClick={onClose}
                        className="p-2 sm:p-2.5 text-white hover:bg-white/10 rounded-full transition-all duration-200 hover:scale-110 active:scale-95 backdrop-blur-sm bg-white/5"
                        title="Close (ESC)"
                    >
                        <X size={24} />
                    </button>
                </div>
            </div>

            {/* Main Image Container with Continuous Scroll */}
            <div
                ref={containerRef}
                className={`relative w-full h-full flex items-center justify-center overflow-hidden select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {/* Previous Image (left) */}
                <div
                    ref={prevImageRef}
                    className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 pointer-events-none"
                >
                    <img
                        src={images[getPrevIndex()]}
                        alt={`Previous`}
                        className="max-w-full max-h-full object-contain select-none"
                        draggable={false}
                    />
                </div>

                {/* Current Image (center) */}
                <div
                    ref={currImageRef}
                    className={`absolute inset-0 flex items-center justify-center ${isDragging ? 'transition-none' : 'transition-transform duration-500 ease-in-out'}`}
                >
                    <img
                        src={images[currentIndex]}
                        alt={`Image ${currentIndex + 1}`}
                        className={`max-w-full max-h-full object-contain select-none transition-transform duration-500 ${isZoomed ? 'scale-150 cursor-move' : 'scale-100'
                            }`}
                        draggable={false}
                        onClick={() => {
                            if (!isDragging && Math.abs(dragOffset) < 10) {
                                toggleZoom();
                            }
                        }}
                    />
                </div>

                {/* Next Image (right) */}
                <div
                    ref={nextImageRef}
                    className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 pointer-events-none"
                >
                    <img
                        src={images[getNextIndex()]}
                        alt={`Next`}
                        className="max-w-full max-h-full object-contain select-none"
                        draggable={false}
                    />
                </div>
            </div>

            {/* Navigation Arrows */}
            {!isZoomed && (
                <>
                    <button
                        onClick={prevImage}
                        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all duration-200 hover:scale-110 active:scale-95 z-40 border border-white/10"
                        title="Previous (←)"
                    >
                        <ChevronLeft size={28} className="sm:w-8 sm:h-8" />
                    </button>
                    <button
                        onClick={nextImage}
                        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all duration-200 hover:scale-110 active:scale-95 z-40 border border-white/10"
                        title="Next (→)"
                    >
                        <ChevronRight size={28} className="sm:w-8 sm:h-8" />
                    </button>
                </>
            )}

            {/* Thumbnail Strip */}
            <div className="absolute bottom-0 left-0 right-0 z-50 p-3 sm:p-4 bg-linear-to-t from-black/90 via-black/50 to-transparent">
                <div className="flex gap-2 overflow-x-auto no-scrollbar justify-center pb-safe">
                    {images.map((image, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                setCurrentIndex(index);
                                setIsZoomed(false);
                                setDragOffset(0);
                                setVelocity(0);
                            }}
                            className={`shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-all duration-300 ${index === currentIndex
                                    ? 'border-white shadow-lg shadow-white/20 scale-110 ring-2 ring-white/30'
                                    : 'border-white/20 opacity-50 hover:opacity-100 hover:scale-105 hover:border-white/40'
                                }`}
                            title={`View image ${index + 1}`}
                        >
                            <img
                                src={image}
                                alt={`Thumbnail ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            </div>

            {/* Drag Hint */}
            {!isDragging && dragOffset === 0 && currentIndex === 0 && !isZoomed && (
                <div className="absolute bottom-28 sm:bottom-32 left-1/2 -translate-x-1/2 text-white/50 text-xs sm:text-sm font-medium animate-pulse pointer-events-none backdrop-blur-sm bg-black/20 px-4 py-2 rounded-full">
                    ← Drag to explore →
                </div>
            )}
        </div>
    );
};

export default ImmersiveGallery;
