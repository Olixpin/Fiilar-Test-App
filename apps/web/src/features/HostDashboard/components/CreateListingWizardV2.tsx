import React from 'react';
import { Listing, User, Booking } from '@fiilar/types';
import { ConfirmDialog } from '@fiilar/ui';
import { ArrowLeft, X, Home, Camera, DollarSign, Shield, Rocket, Check, Cloud } from 'lucide-react';
import { useListingForm } from '../hooks/useListingForm';
import LivePreview from './CreateListingWizard/common/LivePreview';
import {
    StepSpaceType,
    StepLocation,
    StepCapacity,
    StepTitleDescription,
    StepPhotos,
    StepAmenities,
    StepHighlights,
    StepPricingModel,
    StepSetPrice,
    StepSchedule,
    StepBookingSettings,
    StepBookingRules,
    StepAddOns,
    StepHouseRules,
    StepSafety,
    StepVerification,
    StepReview,
} from './CreateListingWizard/steps';

interface CreateListingWizardProps {
    user: User;
    listings: Listing[];
    activeBookings: Booking[];
    editingListing: Listing | null;
    setView: (view: any) => void;
    refreshData: () => void;
    onCreateListing?: (l: Listing) => void;
    onUpdateListing?: (l: Listing) => void;
}

// Phase definitions for navigation
const PHASES = [
    { id: 1, name: 'Basics', icon: Home, steps: [1, 2, 3, 4] },
    { id: 2, name: 'Stand Out', icon: Camera, steps: [5, 6, 7] },
    { id: 3, name: 'Pricing', icon: DollarSign, steps: [8, 9, 10, 11, 12, 13] },
    { id: 4, name: 'Policies', icon: Shield, steps: [14, 15] },
    { id: 5, name: 'Publish', icon: Rocket, steps: [16, 17] },
];

const TOTAL_STEPS = 17;

const CreateListingWizardV2: React.FC<CreateListingWizardProps> = ({
    user, listings, activeBookings, editingListing, setView, refreshData, onCreateListing, onUpdateListing
}) => {
    const {
        newListing, setNewListing, step, setStep,
        aiPrompt, setAiPrompt, isAiGenerating, handleAiAutoFill,
        tempAddOn, setTempAddOn, handleRemoveAddOn,
        customSafety, setCustomSafety, handleAddCustomSafety, toggleSafetyItem,
        handleImageUpload, handleImageDragStart, handleImageDragOver, handleImageDragEnd, removeImage,
        handleProofUpload, weeklySchedule, toggleDaySchedule, updateDayTime, applyWeeklySchedule,
        isSubmitting, handleCreateListing,
        draggedImageIndex, lastSaved,
        draftRestoreDialog, handleRestoreDraft, handleDiscardDraft,
    } = useListingForm(user, listings, activeBookings, editingListing, refreshData, setView, onCreateListing, onUpdateListing);

    // Auto-save visibility state - show briefly after save, then fade
    const [showSaveStatus, setShowSaveStatus] = React.useState(false);
    const mainContentRef = React.useRef<HTMLElement | null>(null);
    
    React.useEffect(() => {
        if (lastSaved) {
            setShowSaveStatus(true);
            const timer = setTimeout(() => setShowSaveStatus(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [lastSaved]);

    // Scroll to top when step changes
    React.useLayoutEffect(() => {
        const scrollToTop = () => {
            const container = mainContentRef.current;
            if (container) {
                container.scrollTop = 0;
                container.scrollTo({ top: 0, behavior: 'auto' });
            }

            window.scrollTo({ top: 0, behavior: 'auto' });
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
        };

        // Run on next animation frame to ensure content has rendered
        const frame = requestAnimationFrame(scrollToTop);
        return () => cancelAnimationFrame(frame);
    }, [step]);

    // Navigation handlers
    const goToStep = (targetStep: number) => {
        if (targetStep >= 1 && targetStep <= TOTAL_STEPS) {
            const container = mainContentRef.current;
            if (container) {
                container.scrollTop = 0;
                container.scrollTo({ top: 0, behavior: 'auto' });
            }
            window.scrollTo({ top: 0, behavior: 'auto' });
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;

            setStep(targetStep);
        }
    };

    // Check if current step can continue (validation)
    const canContinue = React.useMemo(() => {
        switch (step) {
            case 1: // Space Type
                return !!newListing.type;
            case 2: // Location
                return !!newListing.location && newListing.location.trim().length >= 3 
                    && !!newListing.address && newListing.address.trim().length >= 10;
            case 3: // Capacity
                return (newListing.capacity ?? 0) >= 1;
            case 4: // Title & Description
                return !!newListing.title && newListing.title.trim().length >= 5 
                    && !!newListing.description && newListing.description.trim().length >= 20;
            case 5: // Photos
                return (newListing.images?.length ?? 0) >= 5;
            case 6: // Amenities
                return (newListing.amenities?.length ?? 0) >= 1;
            case 7: // Highlights (optional)
                return true;
            case 8: // Pricing Model
                return !!newListing.pricingModel;
            case 9: // Set Price
                return (newListing.price ?? 0) > 0;
            case 10: // Schedule
                return true; // Schedule has defaults
            case 11: // Booking Settings
                return true; // Has defaults
            case 12: // Booking Rules
                return true; // Has defaults
            case 13: // Add-ons (optional)
                return true;
            case 14: // House Rules
                return true; // Optional
            case 15: // Safety
                return true; // Optional
            case 16: // Verification
                return !!newListing.proofOfAddress && newListing.proofOfAddress.length > 0;
            case 17: // Review
                return true;
            default:
                return true;
        }
    }, [step, newListing]);

    const goNext = () => {
        if (canContinue) {
            goToStep(step + 1);
        }
    };
    const goBack = () => goToStep(step - 1);

    // Render the current step
    const renderStep = () => {
        const commonProps = {
            newListing,
            setNewListing,
            currentStep: step - 1, // 0-indexed for progress
            totalSteps: TOTAL_STEPS,
        };

        switch (step) {
            case 1:
                return (
                    <StepSpaceType
                        {...commonProps}
                        onNext={goNext}
                    />
                );
            case 2:
                return (
                    <StepLocation
                        {...commonProps}
                        onNext={goNext}
                        onBack={goBack}
                    />
                );
            case 3:
                return (
                    <StepCapacity
                        {...commonProps}
                        onNext={goNext}
                        onBack={goBack}
                    />
                );
            case 4:
                return (
                    <StepTitleDescription
                        {...commonProps}
                        onNext={goNext}
                        onBack={goBack}
                        aiPrompt={aiPrompt}
                        setAiPrompt={setAiPrompt}
                        isAiGenerating={isAiGenerating}
                        handleAiAutoFill={handleAiAutoFill}
                    />
                );
            case 5:
                return (
                    <StepPhotos
                        {...commonProps}
                        onNext={goNext}
                        onBack={goBack}
                        handleImageUpload={handleImageUpload}
                        handleImageDragStart={handleImageDragStart}
                        handleImageDragOver={handleImageDragOver}
                        handleImageDragEnd={handleImageDragEnd}
                        removeImage={removeImage}
                        draggedImageIndex={draggedImageIndex}
                    />
                );
            case 6:
                return (
                    <StepAmenities
                        {...commonProps}
                        onNext={goNext}
                        onBack={goBack}
                    />
                );
            case 7:
                return (
                    <StepHighlights
                        {...commonProps}
                        onNext={goNext}
                        onBack={goBack}
                        onSkip={goNext}
                    />
                );
            case 8:
                return (
                    <StepPricingModel
                        {...commonProps}
                        onNext={goNext}
                        onBack={goBack}
                        hasActiveBookings={
                            // Only lock pricing model when EDITING an existing listing that has active bookings
                            editingListing 
                                ? activeBookings.some(b => b.listingId === editingListing.id)
                                : false
                        }
                    />
                );
            case 9:
                return (
                    <StepSetPrice
                        {...commonProps}
                        onNext={goNext}
                        onBack={goBack}
                    />
                );
            case 10:
                return (
                    <StepSchedule
                        {...commonProps}
                        onNext={goNext}
                        onBack={goBack}
                        weeklySchedule={weeklySchedule}
                        toggleDaySchedule={toggleDaySchedule}
                        updateDayTime={updateDayTime}
                        applyWeeklySchedule={applyWeeklySchedule}
                    />
                );
            case 11:
                return (
                    <StepBookingSettings
                        {...commonProps}
                        onNext={goNext}
                        onBack={goBack}
                    />
                );
            case 12:
                return (
                    <StepBookingRules
                        {...commonProps}
                        onNext={goNext}
                        onBack={goBack}
                    />
                );
            case 13:
                return (
                    <StepAddOns
                        {...commonProps}
                        onNext={goNext}
                        onBack={goBack}
                        onSkip={goNext}
                        tempAddOn={tempAddOn}
                        setTempAddOn={setTempAddOn}
                        handleRemoveAddOn={handleRemoveAddOn}
                    />
                );
            case 14:
                return (
                    <StepHouseRules
                        {...commonProps}
                        onNext={goNext}
                        onBack={goBack}
                    />
                );
            case 15:
                return (
                    <StepSafety
                        {...commonProps}
                        onNext={goNext}
                        onBack={goBack}
                        customSafety={customSafety}
                        setCustomSafety={setCustomSafety}
                        handleAddCustomSafety={handleAddCustomSafety}
                        toggleSafetyItem={toggleSafetyItem}
                    />
                );
            case 16:
                return (
                    <StepVerification
                        {...commonProps}
                        onNext={goNext}
                        onBack={goBack}
                        handleProofUpload={handleProofUpload}
                        user={user}
                        listings={listings}
                    />
                );
            case 17:
                return (
                    <StepReview
                        newListing={newListing}
                        currentStep={step - 1}
                        totalSteps={TOTAL_STEPS}
                        onBack={goBack}
                        user={user}
                        isSubmitting={isSubmitting}
                        handleCreateListing={handleCreateListing}
                        setStep={setStep}
                    />
                );
            default:
                return null;
        }
    };
    // Get current phase based on step
    const getCurrentPhase = () => {
        return PHASES.find(p => p.steps.includes(step)) || PHASES[0];
    };
    const currentPhase = getCurrentPhase();

    return (
        <div className="min-h-screen bg-white flex flex-col overflow-x-hidden">
            {/* Top Header with Phase Navigation */}
            <header className="h-14 border-b border-gray-100 px-4 sm:px-6 flex items-center justify-between bg-white">
                {/* Left: Close Button */}
                <button
                    onClick={() => setView('listings')}
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
                    aria-label="Close"
                >
                    <X size={22} />
                </button>

                {/* Center: Phase Navigation - Hidden on mobile */}
                <div className="hidden sm:flex items-center gap-0.5 sm:gap-1 overflow-x-auto overscroll-x-contain no-scrollbar">
                    {PHASES.map((phase, index) => {
                        const PhaseIcon = phase.icon;
                        const isActive = phase.id === currentPhase.id;
                        const isCompleted = phase.id < currentPhase.id;

                        return (
                            <React.Fragment key={phase.id}>
                                <button
                                    onClick={() => goToStep(phase.steps[0])}
                                    className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${isActive
                                        ? 'bg-brand-600 text-white shadow-sm'
                                        : isCompleted
                                            ? 'bg-brand-50 text-brand-700 hover:bg-brand-100'
                                            : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                >
                                    <PhaseIcon size={12} className="sm:hidden" />
                                    <PhaseIcon size={14} className="hidden sm:block" />
                                    <span className="hidden sm:inline">{phase.name}</span>
                                </button>
                                {index < PHASES.length - 1 && (
                                    <div className={`w-3 sm:w-6 h-px ${isCompleted ? 'bg-brand-300' : 'bg-gray-200'}`} />
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>

                {/* Right: Exit - Hidden on mobile */}
                <button
                    onClick={() => setView('listings')}
                    className="hidden sm:block px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-brand-600 border border-gray-200 rounded-full hover:border-brand-200 hover:bg-brand-50 transition-colors"
                >
                    Exit
                </button>
                {/* Spacer for mobile to balance the header */}
                <div className="w-10 sm:hidden" />
            </header>

            {/* Main Split Layout */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Side - Form */}
                <div className="flex-1 flex flex-col lg:w-1/2 overflow-hidden">
                    <main ref={mainContentRef} className="flex-1 overflow-y-auto pb-32 sm:pb-24">
                        <div key={step}>
                            {renderStep()}
                        </div>
                    </main>
                </div>

                {/* Right Side - Live Preview (Hidden on mobile) */}
                <div className="hidden lg:block w-1/2 bg-gray-100 border-l border-gray-200 overflow-hidden">
                    <div className="h-full overflow-y-auto p-6">
                        <LivePreview listing={newListing} currentStep={step} />
                    </div>
                </div>
            </div>

            {/* Bottom Footer - Full Width, px-4 matches header close button padding */}
            <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4 sm:px-6 sm:py-4 z-10 pb-safe">
                <div className="max-w-7xl mx-auto">
                    {/* Mobile: Full width button layout */}
                    <div className="flex sm:hidden flex-col gap-3">
                        {/* Progress indicator */}
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="whitespace-nowrap">Step {step} of {TOTAL_STEPS}</span>
                            <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-brand-600 transition-all duration-500 rounded-full"
                                    style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* Buttons row */}
                        <div className="flex gap-3">
                            {step > 1 && (
                                <button
                                    onClick={goBack}
                                    className="flex-1 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Back
                                </button>
                            )}
                            {step === TOTAL_STEPS ? (
                                <button
                                    onClick={handleCreateListing}
                                    disabled={isSubmitting}
                                    className={`${step > 1 ? 'flex-1' : 'w-full'} py-3 bg-brand-600 rounded-xl text-sm font-semibold text-white hover:bg-brand-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Publishing...
                                        </>
                                    ) : (
                                        <>
                                            <Check size={18} />
                                            Publish Listing
                                        </>
                                    )}
                                </button>
                            ) : (
                                <button
                                    onClick={goNext}
                                    disabled={!canContinue}
                                    className={`${step > 1 ? 'flex-1' : 'w-full'} py-3 bg-brand-600 rounded-xl text-sm font-semibold text-white hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    Next
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Desktop: Original layout */}
                    <div className="hidden sm:flex items-center justify-between">
                        {/* Left: Go Back + Auto-save Status */}
                        <div className="flex items-center gap-4">
                            {step > 1 && (
                                <button
                                    onClick={goBack}
                                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
                                >
                                    <ArrowLeft size={16} />
                                    Go Back
                                </button>
                            )}

                            {/* Auto-save indicator */}
                            <div className={`flex items-center gap-1.5 text-xs transition-all duration-300 ${showSaveStatus ? 'opacity-100' : 'opacity-0'}`}>
                                <Cloud size={14} className="text-green-500" />
                                <span className="text-gray-500">Saved</span>
                            </div>
                        </div>

                        {/* Center: Progress Bar */}
                        <div className="flex-1 max-w-md mx-8">
                            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-brand-500 to-brand-600 transition-all duration-500 ease-out rounded-full"
                                    style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* Right: Next/Publish Button */}
                        {step === TOTAL_STEPS ? (
                            <button
                                onClick={handleCreateListing}
                                disabled={isSubmitting}
                                className="px-6 py-2.5 bg-brand-600 rounded-lg text-sm font-medium text-white hover:bg-brand-700 transition-colors shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Publishing...
                                    </>
                                ) : (
                                    <>
                                        <Check size={16} />
                                        Publish
                                    </>
                                )}
                            </button>
                        ) : (
                            <button
                                onClick={goNext}
                                disabled={!canContinue}
                                className="px-6 py-2.5 bg-brand-600 rounded-lg text-sm font-medium text-white hover:bg-brand-700 transition-colors shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        )}
                    </div>
                </div>
            </footer>

            {/* Draft Restore Dialog */}
            <ConfirmDialog
                isOpen={draftRestoreDialog.isOpen}
                title="Continue where you left off?"
                message={`You have an unsaved draft${draftRestoreDialog.draftData?.title ? ` for "${draftRestoreDialog.draftData.title}"` : ''}${draftRestoreDialog.draftData?.savedAt ? ` (saved ${new Date(draftRestoreDialog.draftData.savedAt).toLocaleString()})` : ''}. Would you like to restore it?`}
                confirmText="Restore Draft"
                cancelText="Start Fresh"
                variant="info"
                onConfirm={handleRestoreDraft}
                onCancel={handleDiscardDraft}
            />
        </div>
    );
};

export default CreateListingWizardV2;
