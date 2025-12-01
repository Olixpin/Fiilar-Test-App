import React from 'react';
import { ArrowRight } from 'lucide-react';

interface SwipeHintProps {
    showBack?: boolean;
    showContinue?: boolean;
}

export const SwipeHint: React.FC<SwipeHintProps> = ({ showBack = false, showContinue = true }) => {
    return (
        <div className="mt-8 p-4 bg-gradient-to-r from-brand-50 to-purple-50 rounded-xl border border-brand-100">
            <div className="flex items-center justify-center gap-2 text-brand-700 flex-wrap">
                {showBack && showContinue && (
                    <span className="text-sm font-medium">
                        <span className="md:hidden">Swipe left/right to navigate</span>
                        <span className="hidden md:inline">Drag left/right to navigate</span>
                    </span>
                )}
                {!showBack && showContinue && (
                    <span className="text-sm font-medium">
                        <span className="md:hidden">Swipe left to continue</span>
                        <span className="hidden md:inline">Drag left to continue</span>
                    </span>
                )}
                {showBack && !showContinue && (
                    <span className="text-sm font-medium">
                        <span className="md:hidden">Swipe right to go back</span>
                        <span className="hidden md:inline">Drag right to go back</span>
                    </span>
                )}
                <div className="animate-pulse">
                    <ArrowRight size={18} />
                </div>
            </div>
        </div>
    );
};
