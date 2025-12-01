import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface WizardFooterProps {
    onBack?: () => void;
    onNext?: () => void;
    onSkip?: () => void;
    canContinue?: boolean;
    canSkip?: boolean;
    isSubmitting?: boolean;
    nextLabel?: string;
    showBack?: boolean;
    currentStep: number;
    totalSteps: number;
}

const WizardFooter: React.FC<WizardFooterProps> = ({
    onBack,
    onNext,
    onSkip,
    canContinue = true,
    canSkip = false,
    isSubmitting = false,
    nextLabel = 'Continue',
    showBack = true,
    currentStep,
    totalSteps,
}) => {
    return (
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 py-3 z-10">
            <div className="max-w-md mx-auto flex items-center justify-between">
                {/* Back Button */}
                <div className="flex-1">
                    {showBack && onBack && (
                        <button
                            onClick={onBack}
                            className="flex items-center gap-1 text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
                        >
                            <ChevronLeft size={18} />
                            <span className="hidden sm:inline">Back</span>
                        </button>
                    )}
                </div>

                {/* Progress Indicator - Simple dots */}
                <div className="flex items-center gap-1">
                    {Array.from({ length: totalSteps }).map((_, i) => (
                        <div
                            key={i}
                            className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${i <= currentStep ? 'bg-gray-900' : 'bg-gray-300'
                                }`}
                        />
                    ))}
                </div>

                {/* Next/Skip Buttons */}
                <div className="flex-1 flex justify-end gap-3">
                    {canSkip && onSkip && (
                        <button
                            onClick={onSkip}
                            className="text-gray-500 hover:text-gray-700 font-medium transition-colors px-4 py-2"
                        >
                            Skip
                        </button>
                    )}
                    {onNext && (
                        <button
                            onClick={onNext}
                            disabled={!canContinue || isSubmitting}
                            className={`flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                canContinue && !isSubmitting
                                    ? 'bg-gray-900 text-white hover:bg-gray-800'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <span>{nextLabel}</span>
                                    <ChevronRight size={18} />
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WizardFooter;
