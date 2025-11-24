import React from 'react';
import { Listing, User, Booking } from '@fiilar/types';
import { Button } from '@fiilar/ui';
import ListingBasicInfo from './CreateListingWizard/ListingBasicInfo';
import ListingPhotos from './CreateListingWizard/ListingPhotos';
import ListingAvailability from './CreateListingWizard/ListingAvailability';
import ListingVerification from './CreateListingWizard/ListingVerification';
import ListingReview from './CreateListingWizard/ListingReview';
import ListingLivePreview from './CreateListingWizard/ListingLivePreview';

interface CreateListingWizardProps {
    user: User;
    listings: Listing[];
    newListing: Partial<Listing>;
    setNewListing: React.Dispatch<React.SetStateAction<Partial<Listing>>>;
    step: number;
    setStep: (step: number) => void;
    aiPrompt: string;
    setAiPrompt: (prompt: string) => void;
    isAiGenerating: boolean;
    handleAiAutoFill: () => void;
    showAiInput: boolean;
    setShowAiInput: (show: boolean) => void;
    tempAddOn: { name: string; price: string; description: string; image?: string };
    setTempAddOn: React.Dispatch<React.SetStateAction<{ name: string; price: string; description: string; image?: string }>>;
    handleAddAddOn: () => void;
    handleRemoveAddOn: (id: string) => void;
    tempRule: string;
    setTempRule: (rule: string) => void;
    handleAddRule: () => void;
    handleRemoveRule: (index: number) => void;
    customSafety: string;
    setCustomSafety: (safety: string) => void;
    handleAddCustomSafety: () => void;
    toggleSafetyItem: (item: string) => void;
    handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleImageDragStart: (index: number) => void;
    handleImageDragOver: (e: React.DragEvent, index: number) => void;
    handleImageDragEnd: () => void;
    removeImage: (index: number) => void;
    handleProofUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    availTab: 'schedule' | 'calendar' | 'rules';
    setAvailTab: (tab: 'schedule' | 'calendar' | 'rules') => void;
    weeklySchedule: Record<number, { enabled: boolean; start: number; end: number }>;
    toggleDaySchedule: (dayIndex: number) => void;
    updateDayTime: (dayIndex: number, field: 'start' | 'end', value: number) => void;
    applyWeeklySchedule: () => void;
    currentMonth: Date;
    setCurrentMonth: React.Dispatch<React.SetStateAction<Date>>;
    getDaysInMonth: (date: Date) => (Date | null)[];
    handleDateClick: (dateStr: string) => void;
    toggleHourOverride: (dateStr: string, hour: number) => void;
    activeBookings: Booking[];
    isSubmitting: boolean;
    handleCreateListing: () => void;
    setView: (view: any) => void;
    lastSaved: Date | null;
    isEditingUpload: boolean;
    setIsEditingUpload: (isEditing: boolean) => void;
    getPreviousProofs: () => { url: string; location: string; title: string }[];
    formatDate: (date: Date) => string;
    selectedCalendarDate: string | null;
    setSelectedCalendarDate: (date: string | null) => void;
    draggedImageIndex: number | null;
}

const CreateListingWizard: React.FC<CreateListingWizardProps> = ({
    user, listings, newListing, setNewListing, step, setStep,
    aiPrompt, setAiPrompt, isAiGenerating, handleAiAutoFill, showAiInput, setShowAiInput,
    tempAddOn, setTempAddOn, handleAddAddOn, handleRemoveAddOn,
    tempRule, setTempRule, handleAddRule, handleRemoveRule,
    customSafety, setCustomSafety, handleAddCustomSafety, toggleSafetyItem,
    handleImageUpload, handleImageDragStart, handleImageDragOver, handleImageDragEnd, removeImage,
    handleProofUpload, availTab, setAvailTab, weeklySchedule, toggleDaySchedule, updateDayTime, applyWeeklySchedule,
    currentMonth, setCurrentMonth, getDaysInMonth, handleDateClick, toggleHourOverride,
    activeBookings, isSubmitting, handleCreateListing, setView, lastSaved,
    isEditingUpload, setIsEditingUpload, getPreviousProofs, formatDate,
    selectedCalendarDate, setSelectedCalendarDate, draggedImageIndex
}) => {

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
        </div>
    );
};

export default CreateListingWizard;