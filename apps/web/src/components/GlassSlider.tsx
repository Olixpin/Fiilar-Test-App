import React, { useState, useRef, useEffect } from 'react';

interface GlassSliderProps {
    value: number; // Changed from initialValue to value for controlled component
    min?: number;
    max?: number;
    onChange?: (value: number) => void;
    className?: string;
    compact?: boolean;
}

const GlassSlider: React.FC<GlassSliderProps> = ({
    value,
    min = 0,
    max = 100,
    onChange,
    className = '',
    compact = false
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const sliderRef = useRef<HTMLDivElement>(null);
    const thumbRef = useRef<HTMLDivElement>(null);

    const updateValue = React.useCallback((clientX: number) => {
        if (!sliderRef.current) return;

        const rect = sliderRef.current.getBoundingClientRect();
        const offsetX = clientX - rect.left;
        const percent = Math.max(0, Math.min(100, (offsetX / rect.width) * 100));
        const newValue = min + (percent / 100) * (max - min);

        onChange?.(newValue);
    }, [min, max, onChange]);

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        updateValue(e.clientX);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        setIsDragging(true);
        updateValue(e.touches[0].clientX);
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) updateValue(e.clientX);
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (isDragging) updateValue(e.touches[0].clientX);
        };

        const handleEnd = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleEnd);
            document.addEventListener('touchmove', handleTouchMove);
            document.addEventListener('touchend', handleEnd);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleEnd);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleEnd);
        };
    }, [isDragging, updateValue]);

    useEffect(() => {
        const percent = ((value - min) / (max - min)) * 100;

        if (sliderRef.current) {
            sliderRef.current.style.setProperty('--slider-percent', `${percent}%`);
        }
    }, [value, min, max]);

    return (
        <div className={`relative ${className}`}>
            {/* SVG Filter for liquid lens effect */}
            <svg className="absolute w-0 h-0">
                <defs>
                    <filter id="mini-liquid-lens">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="0.6" />
                    </filter>
                </defs>
            </svg>

            {/* Slider Track */}
            <div
                ref={sliderRef}
                className="relative w-full h-2.5 bg-gray-300 rounded-full cursor-pointer"
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
            >
                {/* Progress Bar */}
                <div
                    className="absolute h-full bg-linear-to-r from-[#49a3fc] to-[#3681ee] rounded-full z-1 glass-slider-progress"
                />

                {/* Glass Thumb */}
                <div
                    ref={thumbRef}
                    className={`
                        absolute top-1/2 -translate-y-1/2 -translate-x-1/2
                        ${compact ? 'w-[45px] h-8' : 'w-[65px] h-[42px]'} rounded-full cursor-pointer z-2
                        bg-white shadow-[0_1px_8px_0_rgba(0,30,63,0.1),0_0_2px_0_rgba(0,9,20,0.1)]
                        overflow-hidden
                        transition-all duration-150 ease-out
                        glass-slider-thumb
                        ${isDragging ? 'scale-y-[0.98] scale-x-[1.1] bg-transparent shadow-none' : ''}
                    `}
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleTouchStart}
                >
                    {/* Backdrop Filter Layer */}
                    <div
                        className={`
                            absolute inset-0 z-0
                            backdrop-blur-[0.6px]
                            transition-opacity duration-150
                            glass-slider-backdrop
                            ${isDragging ? 'opacity-100' : 'opacity-0'}
                        `}
                    />

                    {/* Overlay Layer */}
                    <div
                        className={`
                            absolute inset-0 z-1
                            bg-white/10
                            transition-opacity duration-150
                            ${isDragging ? 'opacity-100' : 'opacity-0'}
                        `}
                    />

                    {/* Specular Highlights */}
                    <div
                        className={`
                            absolute inset-0 z-2 rounded-full
                            transition-opacity duration-150
                            glass-slider-highlight
                            ${isDragging ? 'opacity-100' : 'opacity-0'}
                        `}
                    />
                </div>
            </div>
        </div>
    );
};

export default GlassSlider;
