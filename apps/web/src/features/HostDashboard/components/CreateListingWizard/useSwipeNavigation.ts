import { useState } from 'react';

interface SwipeNavigationOptions {
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    minSwipeDistance?: number;
}

export const useSwipeNavigation = ({
    onSwipeLeft,
    onSwipeRight,
    minSwipeDistance = 50
}: SwipeNavigationOptions) => {
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);
    const [swipeOffset, setSwipeOffset] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    // Touch handlers
    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
        if (touchStart) {
            const distance = touchStart - e.targetTouches[0].clientX;
            setSwipeOffset(Math.abs(distance) > 100 ? (distance > 0 ? 100 : -100) : distance);
        }
    };

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe && onSwipeLeft) {
            onSwipeLeft();
        } else if (isRightSwipe && onSwipeRight) {
            onSwipeRight();
        }

        // Reset
        setTouchStart(null);
        setTouchEnd(null);
        setSwipeOffset(0);
    };

    // Mouse handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setTouchEnd(null);
        setTouchStart(e.clientX);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        setTouchEnd(e.clientX);
        if (touchStart) {
            const distance = touchStart - e.clientX;
            setSwipeOffset(Math.abs(distance) > 100 ? (distance > 0 ? 100 : -100) : distance);
        }
    };

    const handleMouseUp = () => {
        if (!isDragging) return;
        setIsDragging(false);

        if (!touchStart || !touchEnd) return;

        const distance = touchStart - touchEnd;
        const isLeftDrag = distance > minSwipeDistance;
        const isRightDrag = distance < -minSwipeDistance;

        if (isLeftDrag && onSwipeLeft) {
            onSwipeLeft();
        } else if (isRightDrag && onSwipeRight) {
            onSwipeRight();
        }

        // Reset
        setTouchStart(null);
        setTouchEnd(null);
        setSwipeOffset(0);
    };

    const handleMouseLeave = () => {
        if (isDragging) {
            setIsDragging(false);
            setTouchStart(null);
            setTouchEnd(null);
            setSwipeOffset(0);
        }
    };

    return {
        swipeOffset,
        isDragging,
        handlers: {
            onTouchStart: handleTouchStart,
            onTouchMove: handleTouchMove,
            onTouchEnd: handleTouchEnd,
            onMouseDown: handleMouseDown,
            onMouseMove: handleMouseMove,
            onMouseUp: handleMouseUp,
            onMouseLeave: handleMouseLeave,
        }
    };
};
