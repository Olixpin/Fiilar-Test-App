import React, { useState, useEffect, useRef, useCallback } from 'react';
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
    const [isDragging, setIsDragging] = useState(false); // Only for cursor style

    // Refs for physics - No re-renders during drag!
    const dragOffsetRef = useRef(0);
    const dragStartRef = useRef<{ x: number; time: number } | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    // DOM Refs
    const containerRef = useRef<HTMLDivElement>(null);
    const prevImageRef = useRef<HTMLDivElement>(null);
    const currImageRef = useRef<HTMLDivElement>(null);
    const nextImageRef = useRef<HTMLDivElement>(null);

    // Helper to update DOM directly
    const updateDOM = useCallback((offset: number) => {
        const GAP = 40; // Space between slides

        if (prevImageRef.current) {
            prevImageRef.current.style.transform = `translateX(calc(-100% - ${GAP}px + ${offset}px))`;
        }
        if (currImageRef.current) {
            currImageRef.current.style.transform = `translateX(${offset}px)`;
        }
        if (nextImageRef.current) {
            nextImageRef.current.style.transform = `translateX(calc(100% + ${GAP}px + ${offset}px))`;
        }
    }, []);

    // Reset on index change
    useEffect(() => {
        dragOffsetRef.current = 0;
        updateDOM(0);
    }, [currentIndex, updateDOM]);

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

    // Physics Animation Loop
    const animateTo = useCallback((target: number, onComplete?: () => void) => {
        const start = dragOffsetRef.current;
        const distance = target - start;
        const startTime = Date.now();
        const duration = 300; // ms

        const loop = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Cubic ease out
            const ease = 1 - Math.pow(1 - progress, 3);

            dragOffsetRef.current = start + (distance * ease);
            updateDOM(dragOffsetRef.current);

            if (progress < 1) {
                animationFrameRef.current = requestAnimationFrame(loop);
            } else {
                if (onComplete) onComplete();
            }
        };
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        loop();
    }, [updateDOM]);

    const nextImage = useCallback(() => {
        const width = containerRef.current?.offsetWidth || window.innerWidth;
        const GAP = 40;
        animateTo(-(width + GAP), () => {
            setCurrentIndex((prev) => (prev + 1) % images.length);
            setIsZoomed(false);
        });
    }, [images.length, animateTo]);

    const prevImage = useCallback(() => {
        const width = containerRef.current?.offsetWidth || window.innerWidth;
        const GAP = 40;
        animateTo(width + GAP, () => {
            setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
            setIsZoomed(false);
        });
    }, [images.length, animateTo]);

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
            if (e.key === 'z' || e.key === 'Z') setIsZoomed(prev => !prev);
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, nextImage, prevImage, onClose]);

    // Snap Logic
    const snapToNearest = useCallback((velocity = 0) => {
        const width = containerRef.current?.offsetWidth || window.innerWidth;
        const offset = dragOffsetRef.current;
        const threshold = width * 0.2; // 20% threshold
        const GAP = 40;

        // Determine direction based on offset and velocity
        if (offset < -threshold || (offset < 0 && velocity < -10)) {
            // Go Next
            animateTo(-(width + GAP), () => {
                nextImage();
            });
        } else if (offset > threshold || (offset > 0 && velocity > 10)) {
            // Go Prev
            animateTo(width + GAP, () => {
                prevImage();
            });
        } else {
            // Snap Back
            animateTo(0);
        }
    }, [animateTo, nextImage, prevImage]);

    // Trackpad / Wheel Support
    useEffect(() => {
        const container = containerRef.current;
        if (!container || !isOpen) return;

        let wheelTimeout: NodeJS.Timeout;

        const handleWheel = (e: WheelEvent) => {
            if (isZoomed) return;
            e.preventDefault();

            // Accumulate offset (scrolling right/down moves content left)
            // Use deltaX for horizontal, fallback to deltaY if shiftKey is pressed or for single-axis mice
            const delta = e.deltaX !== 0 ? e.deltaX : e.deltaY;

            dragOffsetRef.current -= delta;
            updateDOM(dragOffsetRef.current);

            // Debounce snap
            clearTimeout(wheelTimeout);
            wheelTimeout = setTimeout(() => {
                snapToNearest(0);
            }, 60); // Short pause triggers snap
        };

        container.addEventListener('wheel', handleWheel, { passive: false });
        return () => {
            container.removeEventListener('wheel', handleWheel);
            clearTimeout(wheelTimeout);
        };
    }, [isOpen, isZoomed, updateDOM, snapToNearest]);

    // Drag Handlers
    const handleDragStart = (clientX: number) => {
        if (isZoomed) return;
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);

        dragStartRef.current = { x: clientX, time: Date.now() };
        setIsDragging(true);
    };

    const handleDragMove = (clientX: number) => {
        if (!dragStartRef.current || isZoomed) return;

        const delta = clientX - dragStartRef.current.x;
        dragOffsetRef.current = delta;
        updateDOM(delta);
    };

    const handleDragEnd = (clientX: number) => {
        if (!dragStartRef.current) return;

        setIsDragging(false);
        const startX = dragStartRef.current.x;
        const timeDelta = Date.now() - dragStartRef.current.time;
        dragStartRef.current = null;

        const distance = clientX - startX;
        const velocity = distance / timeDelta * 10; // Pixels per frame

        snapToNearest(velocity);
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
            className="fixed inset-0 z-10000 bg-black flex items-center justify-center touch-none"
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
                        onClick={() => setIsZoomed(!isZoomed)}
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

            {/* Main Image Container */}
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
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    style={{ transform: 'translateX(calc(-100% - 40px))' }}
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
                    className="absolute inset-0 flex items-center justify-center"
                >
                    <img
                        src={images[currentIndex]}
                        alt={`Image ${currentIndex + 1}`}
                        className={`max-w-full max-h-full object-contain select-none transition-transform duration-500 ${isZoomed ? 'scale-150 cursor-move' : 'scale-100'}`}
                        draggable={false}
                        onClick={() => {
                            if (!isDragging && Math.abs(dragOffsetRef.current) < 5) {
                                setIsZoomed(!isZoomed);
                            }
                        }}
                    />
                </div>

                {/* Next Image (right) */}
                <div
                    ref={nextImageRef}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    style={{ transform: 'translateX(calc(100% + 40px))' }}
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
                                dragOffsetRef.current = 0;
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
            {!isDragging && currentIndex === 0 && !isZoomed && (
                <div className="absolute bottom-28 sm:bottom-32 left-1/2 -translate-x-1/2 text-white/50 text-xs sm:text-sm font-medium animate-pulse pointer-events-none backdrop-blur-sm bg-black/20 px-4 py-2 rounded-full">
                    ← Drag to explore →
                </div>
            )}
        </div>
    );
};

export default ImmersiveGallery;
