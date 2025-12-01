import React from 'react';
import { ArrowRight } from 'lucide-react';

interface SwipeIndicatorProps {
    swipeOffset: number;
    direction: 'left' | 'right';
    label: string;
}

export const SwipeIndicator: React.FC<SwipeIndicatorProps> = ({ swipeOffset, direction, label }) => {
    if (swipeOffset === 0) return null;

    const isVisible = direction === 'left' ? swipeOffset > 0 : swipeOffset < 0;
    if (!isVisible) return null;

    const opacity = Math.min(Math.abs(swipeOffset) / 50, 1);

    return (
        <div className={`fixed ${direction === 'left' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 z-50 pointer-events-none`}>
            <div
                className="bg-brand-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 transition-opacity"
                style={{ opacity }}
            >
                {direction === 'right' && <ArrowRight size={16} className="rotate-180" />}
                <span className="text-sm font-medium">{label}</span>
                {direction === 'left' && <ArrowRight size={16} />}
            </div>
        </div>
    );
};
