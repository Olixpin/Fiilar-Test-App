import React from 'react';

interface StepWrapperProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
    currentStep: number;
    totalSteps: number;
    phaseName: string;
    onBack?: () => void;
    onNext?: () => void;
    onSkip?: () => void;
    canContinue?: boolean;
    canSkip?: boolean;
    isSubmitting?: boolean;
    nextLabel?: string;
    showBack?: boolean;
}

const StepWrapper: React.FC<StepWrapperProps> = ({
    children,
    title,
    subtitle,
    phaseName,
}) => {
    return (
        <div className="min-h-[calc(100vh-180px)] flex flex-col px-4 py-4 sm:px-6 sm:py-6 lg:px-12">
            {/* Form Content - Full Width */}
            <div className="flex-1 w-full">
                {/* Phase Badge */}
                <div className="mb-2 sm:mb-3">
                    <span className="text-[10px] font-semibold text-brand-600 uppercase tracking-wider">
                        {phaseName}
                    </span>
                </div>

                {/* Title & Subtitle */}
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-1 sm:mb-2">
                        {title}
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-500">
                        {subtitle}
                    </p>
                </div>

                {/* Step Content - Full Width */}
                <div className="w-full">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default StepWrapper;
