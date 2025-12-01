import React, { useState } from 'react';
import { Listing, Booking } from '@fiilar/types';
import { Button } from '@fiilar/ui';
import { ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import AIAutoFill from './AIAutoFill';
import BasicInfoForm from './BasicInfoForm';
import AmenitiesSelector from './AmenitiesSelector';
import TagsInput from './TagsInput';
import { useSwipeNavigation } from '../useSwipeNavigation';
import { SwipeIndicator } from '../SwipeIndicator';
import { SwipeHint } from '../SwipeHint';

interface ListingBasicInfoProps {
    newListing: Partial<Listing>;
    setNewListing: React.Dispatch<React.SetStateAction<Partial<Listing>>>;
    setStep: (step: number) => void;
    aiPrompt: string;
    setAiPrompt: (prompt: string) => void;
    isAiGenerating: boolean;
    handleAiAutoFill: () => void;
    showAiInput: boolean;
    setShowAiInput: (show: boolean) => void;
    activeBookings: Booking[];
}

const ListingBasicInfo: React.FC<ListingBasicInfoProps> = ({
    newListing,
    setNewListing,
    setStep,
    aiPrompt,
    setAiPrompt,
    isAiGenerating,
    handleAiAutoFill,
    showAiInput,
    setShowAiInput,
    activeBookings
}) => {
    const canContinue = !!(newListing.title && newListing.location && newListing.price && newListing.price >= 1 && newListing.pricingModel);
    const [expandedSections, setExpandedSections] = useState<number[]>([1, 2, 3]);

    // Swipe navigation
    const { swipeOffset, isDragging, handlers } = useSwipeNavigation({
        onSwipeLeft: canContinue ? () => setStep(2) : undefined,
    });

    const toggleSection = (section: number) => {
        setExpandedSections(prev =>
            prev.includes(section)
                ? prev.filter(s => s !== section)
                : [...prev, section]
        );
    };

    return (
        <div
            className={`space-y-6 animate-in slide-in-from-right duration-500 relative ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
            {...handlers}
        >
            <SwipeIndicator swipeOffset={swipeOffset} direction="left" label="Continue" />
            {/* AI Auto-Fill Section */}
            <div className={`transition-all duration-500 ease-in-out ${showAiInput ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 h-0 overflow-hidden'}`}>
                <AIAutoFill
                    aiPrompt={aiPrompt}
                    setAiPrompt={setAiPrompt}
                    isAiGenerating={isAiGenerating}
                    handleAiAutoFill={handleAiAutoFill}
                    showAiInput={showAiInput}
                    setShowAiInput={setShowAiInput}
                />
            </div>

            {/* Basic Information Form */}
            <div className="space-y-4">
                <button
                    onClick={() => toggleSection(1)}
                    className="w-full flex items-center justify-between text-left group"
                >
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-sm font-bold shadow-sm group-hover:bg-brand-200 transition-colors">1</span>
                        Basic Details
                    </h3>
                    <div className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${expandedSections.includes(1) ? 'bg-gray-50' : ''}`}>
                        {expandedSections.includes(1) ? <ChevronUp className="text-gray-500" size={20} /> : <ChevronDown className="text-gray-500" size={20} />}
                    </div>
                </button>

                <div className={`transition-all duration-300 ease-in-out ${expandedSections.includes(1) ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                    <BasicInfoForm
                        newListing={newListing}
                        setNewListing={setNewListing}
                        activeBookings={activeBookings}
                    />
                </div>
            </div>

            <div className="h-px bg-gray-200/50 w-full" />

            {/* Amenities Section */}
            <div className="space-y-4">
                <button
                    onClick={() => toggleSection(2)}
                    className="w-full flex items-center justify-between text-left group"
                >
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold shadow-sm group-hover:bg-blue-200 transition-colors">2</span>
                        Amenities
                    </h3>
                    <div className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${expandedSections.includes(2) ? 'bg-gray-50' : ''}`}>
                        {expandedSections.includes(2) ? <ChevronUp className="text-gray-500" size={20} /> : <ChevronDown className="text-gray-500" size={20} />}
                    </div>
                </button>

                <div className={`transition-all duration-300 ease-in-out ${expandedSections.includes(2) ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                    <AmenitiesSelector
                        newListing={newListing}
                        setNewListing={setNewListing}
                    />
                </div>
            </div>

            <div className="h-px bg-gray-200/50 w-full" />

            {/* Tags Section */}
            <div className="space-y-4">
                <button
                    onClick={() => toggleSection(3)}
                    className="w-full flex items-center justify-between text-left group"
                >
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-bold shadow-sm group-hover:bg-purple-200 transition-colors">3</span>
                        Tags & Highlights
                    </h3>
                    <div className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${expandedSections.includes(3) ? 'bg-gray-50' : ''}`}>
                        {expandedSections.includes(3) ? <ChevronUp className="text-gray-500" size={20} /> : <ChevronDown className="text-gray-500" size={20} />}
                    </div>
                </button>

                <div className={`transition-all duration-300 ease-in-out ${expandedSections.includes(3) ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                    <TagsInput
                        newListing={newListing}
                        setNewListing={setNewListing}
                    />
                </div>
            </div>

            {/* Navigation - Mobile: Swipe/Drag, Desktop: Buttons */}

            {/* Mobile Hint */}
            <div className="md:hidden">
                <SwipeHint showContinue={true} showBack={false} />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex justify-end items-center pt-6 border-t border-gray-200">
                <Button
                    onClick={() => setStep(2)}
                    disabled={!canContinue}
                    variant="primary"
                    size="lg"
                    className="shadow-lg shadow-brand-500/20 hover:shadow-brand-500/30 transition-all px-8"
                    rightIcon={<ArrowRight size={18} />}
                >
                    Continue to Photos
                </Button>
            </div>
        </div>
    );
};

export default ListingBasicInfo;
