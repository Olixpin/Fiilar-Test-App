import React from 'react';
import { Listing, User, Booking } from '@fiilar/types';
import { Button, ConfirmDialog } from '@fiilar/ui';
import ListingBasicInfo from './CreateListingWizard/ListingBasicInfo';
import ListingPhotos from './CreateListingWizard/ListingPhotos';
import ListingAvailability from './CreateListingWizard/ListingAvailability';
import ListingVerification from './CreateListingWizard/ListingVerification';
import ListingReview from './CreateListingWizard/ListingReview';
import ListingLivePreview from './CreateListingWizard/ListingLivePreview';
import { useListingForm } from '../hooks/useListingForm';

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

const CreateListingWizard: React.FC<CreateListingWizardProps> = ({
    user, listings, activeBookings, editingListing, setView, refreshData, onCreateListing, onUpdateListing
}) => {
    const {
        newListing, setNewListing, step, setStep,
        aiPrompt, setAiPrompt, isAiGenerating, handleAiAutoFill, showAiInput, setShowAiInput,
        tempAddOn, setTempAddOn, handleAddAddOn, handleRemoveAddOn,
        tempRule, setTempRule, handleAddRule, handleRemoveRule,
        customSafety, setCustomSafety, handleAddCustomSafety, toggleSafetyItem,
        handleImageUpload, handleImageDragStart, handleImageDragOver, handleImageDragEnd, removeImage,
        handleProofUpload, availTab, setAvailTab, weeklySchedule, toggleDaySchedule, updateDayTime, applyWeeklySchedule,
        currentMonth, setCurrentMonth, getDaysInMonth, handleDateClick, toggleHourOverride,
        isSubmitting, handleCreateListing, lastSaved,
        isEditingUpload, setIsEditingUpload, getPreviousProofs, formatDate,
        selectedCalendarDate, setSelectedCalendarDate, draggedImageIndex,
        draftRestoreDialog, handleRestoreDraft, handleDiscardDraft,
        blockDateDialog, handleConfirmBlockDate, handleCancelBlockDate
    } = useListingForm(user, listings, activeBookings, editingListing, refreshData, setView, onCreateListing, onUpdateListing);

    return (
        <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-100px)]">
            {/* Left: Form Steps */}
            <div className="flex-1 overflow-y-auto pr-2 pb-20">
                <div className="mb-6">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setView('listings')}
                        className="mb-4 pl-0 hover:bg-transparent hover:text-gray-900 text-gray-500"
                        leftIcon={<span className="text-lg">←</span>}
                    >
                        Back to listings
                    </Button>
                    <h2 className="text-2xl font-bold text-gray-900">
                        {(newListing as any).id ? 'Edit Listing' : 'Create New Listing'}
                    </h2>
                    <p className="text-gray-500">Step {step} of 5</p>
                    <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div
                            className={`h-full bg-brand-600 transition-all duration-500 ease-out ${step === 1 ? 'w-1/5' :
                                step === 2 ? 'w-2/5' :
                                    step === 3 ? 'w-3/5' :
                                        step === 4 ? 'w-4/5' : 'w-full'
                                }`}
                        />
                    </div>
                </div>

                {step === 1 && (
                    <ListingBasicInfo
                        newListing={newListing}
                        setNewListing={setNewListing}
                        setStep={setStep}
                        aiPrompt={aiPrompt}
                        setAiPrompt={setAiPrompt}
                        isAiGenerating={isAiGenerating}
                        handleAiAutoFill={handleAiAutoFill}
                        showAiInput={showAiInput}
                        setShowAiInput={setShowAiInput}
                    />
                )}

                {step === 2 && (
                    <ListingPhotos
                        newListing={newListing}
                        setStep={setStep}
                        handleImageUpload={handleImageUpload}
                        handleImageDragStart={handleImageDragStart}
                        handleImageDragOver={handleImageDragOver}
                        handleImageDragEnd={handleImageDragEnd}
                        removeImage={removeImage}
                        draggedImageIndex={draggedImageIndex}
                    />
                )}

                {step === 3 && (
                    <ListingAvailability
                        newListing={newListing}
                        setNewListing={setNewListing}
                        setStep={setStep}
                        availTab={availTab}
                        setAvailTab={setAvailTab}
                        weeklySchedule={weeklySchedule}
                        toggleDaySchedule={toggleDaySchedule}
                        updateDayTime={updateDayTime}
                        applyWeeklySchedule={applyWeeklySchedule}
                        currentMonth={currentMonth}
                        setCurrentMonth={setCurrentMonth}
                        getDaysInMonth={getDaysInMonth}
                        handleDateClick={handleDateClick}
                        toggleHourOverride={toggleHourOverride}
                        activeBookings={activeBookings}
                        formatDate={formatDate}
                        selectedCalendarDate={selectedCalendarDate}
                        setSelectedCalendarDate={setSelectedCalendarDate}
                        tempRule={tempRule}
                        setTempRule={setTempRule}
                        handleAddRule={handleAddRule}
                        handleRemoveRule={handleRemoveRule}
                        tempAddOn={tempAddOn}
                        setTempAddOn={setTempAddOn}
                        handleAddAddOn={handleAddAddOn}
                        handleRemoveAddOn={handleRemoveAddOn}
                        customSafety={customSafety}
                        setCustomSafety={setCustomSafety}
                        handleAddCustomSafety={handleAddCustomSafety}
                        toggleSafetyItem={toggleSafetyItem}
                    />
                )}

                {step === 4 && (
                    <ListingVerification
                        newListing={newListing}
                        setNewListing={setNewListing}
                        setStep={setStep}
                        isEditingUpload={isEditingUpload}
                        setIsEditingUpload={setIsEditingUpload}
                        getPreviousProofs={getPreviousProofs}
                        handleProofUpload={handleProofUpload}
                    />
                )}

                {step === 5 && (
                    <ListingReview
                        newListing={newListing}
                        setNewListing={setNewListing}
                        setStep={setStep}
                        user={user}
                        listings={listings}
                        isSubmitting={isSubmitting}
                        handleCreateListing={handleCreateListing}
                    />
                )}
            </div>

            {/* Right: Live Preview - Sticky */}
            <ListingLivePreview
                newListing={newListing}
                lastSaved={lastSaved}
                step={step}
                setStep={setStep}
            />

            {/* Draft Restore Confirmation Dialog */}
            <ConfirmDialog
                isOpen={draftRestoreDialog.isOpen}
                title="Restore Draft?"
                message="You have an unsaved draft. Would you like to continue where you left off?"
                confirmText="Restore Draft"
                cancelText="Start Fresh"
                variant="info"
                onConfirm={handleRestoreDraft}
                onCancel={handleDiscardDraft}
            />

            {/* Block Date Confirmation Dialog */}
            <ConfirmDialog
                isOpen={blockDateDialog.isOpen}
                title="Block Date with Active Bookings?"
                message="Warning: You have active bookings on this date. Blocking it will require cancelling them manually. Are you sure you want to continue?"
                confirmText="Block Date"
                cancelText="Cancel"
                variant="warning"
                onConfirm={handleConfirmBlockDate}
                onCancel={handleCancelBlockDate}
            />
        </div>
    );
};

export default CreateListingWizard;