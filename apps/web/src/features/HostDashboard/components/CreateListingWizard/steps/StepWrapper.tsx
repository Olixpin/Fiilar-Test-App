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
        <div className="pb-36 sm:pb-6 flex flex-col pt-8 overflow-x-hidden">
            {/* Form Content - px-4 matches header close button padding */}
            <div className="flex-1 w-full px-4 sm:px-6 lg:px-12">
                {/* No max-width on mobile, centered on desktop */}
                <div className="w-full sm:max-w-2xl sm:mx-auto">
                    {/* Phase Badge */}
                    <div className="mb-4">
                        <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider">
                            {phaseName}
                        </span>
                    </div>

                    {/* Title & Subtitle */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-semibold text-gray-900 mb-3 leading-tight">
                            {title}
                        </h1>
                        <p className="text-base text-gray-500 leading-relaxed">
                            {subtitle}
                        </p>
                    </div>

                    {/* Step Content - Full Width with breathing room */}
                    <div className="w-full space-y-5">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StepWrapper;
