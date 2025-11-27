import React from 'react';
import { Listing } from '@fiilar/types';
import { Button } from '@fiilar/ui';
import { ArrowRight } from 'lucide-react';
import AIAutoFill from './AIAutoFill';
import BasicInfoForm from './BasicInfoForm';
import AmenitiesSelector from './AmenitiesSelector';
import TagsInput from './TagsInput';

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
    setShowAiInput
}) => {
    const canContinue = !!(newListing.title && newListing.location && newListing.price && newListing.price >= 1 && newListing.pricingModel);

    return (
        <div className="space-y-8 max-w-3xl mx-auto animate-in slide-in-from-right duration-300">
            {/* AI Auto-Fill Section */}
            <AIAutoFill
                aiPrompt={aiPrompt}
                setAiPrompt={setAiPrompt}
                isAiGenerating={isAiGenerating}
                handleAiAutoFill={handleAiAutoFill}
                showAiInput={showAiInput}
                setShowAiInput={setShowAiInput}
            />

            {/* Basic Information Form */}
            <BasicInfoForm
                newListing={newListing}
                setNewListing={setNewListing}
            />

            {/* Amenities Section */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-6">
                <AmenitiesSelector
                    newListing={newListing}
                    setNewListing={setNewListing}
                />
            </div>

            {/* Tags Section */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-6">
                <TagsInput
                    newListing={newListing}
                    setNewListing={setNewListing}
                />
            </div>

            {/* Navigation */}
            <div className="flex justify-end items-center pt-4">
                <Button
                    onClick={() => setStep(2)}
                    disabled={!canContinue}
                    variant="primary"
                    size="lg"
                    className="w-full sm:w-auto"
                    rightIcon={<ArrowRight size={18} />}
                >
                    Continue to Photos
                </Button>
            </div>
        </div>
    );
};

export default ListingBasicInfo;
