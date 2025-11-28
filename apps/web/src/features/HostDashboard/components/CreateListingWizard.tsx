import React from 'react';
import { Listing, User, Booking, ListingStatus } from '@fiilar/types';
import { Button, ConfirmDialog } from '@fiilar/ui';
import { Eye, X } from 'lucide-react';
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
    const [showMobilePreview, setShowMobilePreview] = React.useState(false);
    const {
        newListing, setNewListing, step, setStep,
        aiPrompt, setAiPrompt, isAiGenerating, handleAiAutoFill, showAiInput, setShowAiInput,
        tempAddOn, setTempAddOn, handleAddAddOn, handleRemoveAddOn,
        tempRule, setTempRule, handleAddRule,
        customSafety, setCustomSafety, handleAddCustomSafety, toggleSafetyItem,
        handleImageUpload, handleImageDragStart, handleImageDragOver, handleImageDragEnd, removeImage,
        handleProofUpload, weeklySchedule, toggleDaySchedule, updateDayTime, applyWeeklySchedule,
        currentMonth, setCurrentMonth, getDaysInMonth, handleDateClick, toggleHourOverride,
        isSubmitting, handleCreateListing, lastSaved,
        formatDate,
        selectedCalendarDate, setSelectedCalendarDate, draggedImageIndex,
        draftRestoreDialog, handleRestoreDraft, handleDiscardDraft,
        blockDateDialog, handleConfirmBlockDate, handleCancelBlockDate,
        handleSaveAndExit
    } = useListingForm(user, listings, activeBookings, editingListing, refreshData, setView, onCreateListing, onUpdateListing);

    return (
        <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-100px)] w-full px-4 lg:px-8">
            {/* Left: Form Steps */}
            <div className="flex-1 overflow-y-auto pr-2 pb-32 scrollbar-hide">
                <div className="mb-8">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setView('listings')}
                                    className="pl-0 hover:bg-white/50 text-gray-500 hover:text-gray-900 transition-all duration-300"
                                    leftIcon={<span className="text-lg">←</span>}
                                >
                                    Back
                                </Button>
                                <div className="h-4 w-px bg-gray-300"></div>
                                <span className="text-sm font-medium text-gray-500">
                                    {lastSaved
                                        ? (editingListing?.status === ListingStatus.LIVE ? 'Changes saved' : 'Draft saved')
                                        : 'Unsaved changes'}
                                </span>
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                                {(newListing as any).id ? 'Edit Listing' : 'Create New Listing'}
                            </h2>
                            <p className="text-gray-500 mt-1">Step {step} of 5</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={handleSaveAndExit}
                                className="hidden sm:flex"
                                isLoading={isSubmitting}
                            >
                                Save & Exit
                            </Button>
                            <button
                                onClick={() => setView('listings')}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-900"
                                title="Close Wizard"
                            >
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Animated Progress Bar */}
                    <div className="w-full bg-gray-100 h-2 rounded-full mt-2 overflow-hidden shadow-inner">
                        <div
                            className="h-full bg-gradient-to-r from-brand-500 to-purple-600 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(231,76,60,0.4)] relative"
                            style={{ width: `${(step / 5) * 100}%` }}
                        >
                            <div className="absolute inset-0 bg-white/30 w-full h-full animate-[shimmer_2s_infinite]" style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)' }}></div>
                        </div>
                    </div>
                </div>

                <div className="glass-panel p-6 md:p-8 rounded-3xl border border-white/40 shadow-xl shadow-brand-900/5 backdrop-blur-xl relative overflow-hidden">
                    {/* Decorative background elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

                    <div className="relative z-10">
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
                                activeBookings={activeBookings}
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
                                setStep={setStep}
                                handleProofUpload={handleProofUpload}
                                user={user}
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
                </div>
            </div>

            {/* Right: Live Preview - Desktop Sticky */}
            <div className="hidden lg:block w-[400px] xl:w-[450px] shrink-0">
                <div className="sticky top-6">
                    <ListingLivePreview
                        newListing={newListing}
                        lastSaved={lastSaved}
                        step={step}
                        setStep={setStep}
                    />
                </div>
            </div>

            {/* Mobile Preview Toggle & Modal */}
            <div className="lg:hidden">
                {/* Floating Preview Button */}
                <button
                    onClick={() => setShowMobilePreview(true)}
                    className="fixed bottom-24 right-6 z-40 bg-brand-600 text-white p-4 rounded-full shadow-lg shadow-brand-500/30 hover:bg-brand-700 transition-all active:scale-95 animate-in zoom-in duration-300"
                    aria-label="Show Preview"
                >
                    <Eye size={24} />
                </button>

                {/* Mobile Preview Modal */}
                {showMobilePreview && (
                    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
                        {/* Backdrop */}
                        <div
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setShowMobilePreview(false)}
                        ></div>

                        {/* Modal Content */}
                        <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300 max-h-[85vh] overflow-y-auto">
                            <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                                <h3 className="font-bold text-lg text-gray-900">Listing Preview</h3>
                                <button
                                    onClick={() => setShowMobilePreview(false)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                    aria-label="Close preview"
                                >
                                    <X size={20} className="text-gray-500" />
                                </button>
                            </div>
                            <div className="p-6">
                                <ListingLivePreview
                                    newListing={newListing}
                                    lastSaved={lastSaved}
                                    step={step}
                                    setStep={(s) => {
                                        setStep(s);
                                        setShowMobilePreview(false);
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Draft Restore Confirmation Dialog */}
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