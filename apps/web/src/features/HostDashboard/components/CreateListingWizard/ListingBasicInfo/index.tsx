import React, { useState } from 'react';
import { Listing, Booking } from '@fiilar/types';
import { Button } from '@fiilar/ui';
import { ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
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

    const toggleSection = (section: number) => {
        setExpandedSections(prev =>
            prev.includes(section)
                ? prev.filter(s => s !== section)
                : [...prev, section]
        );
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-500">
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
            <div className="glass-card rounded-2xl border border-white/40 shadow-sm overflow-hidden transition-all duration-300">
                <button
                    onClick={() => toggleSection(1)}
                    className="w-full p-6 flex items-center justify-between hover:bg-white/40 transition-colors text-left"
                >
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-sm font-bold shadow-sm">1</span>
                        Basic Details
                    </h3>
                    {expandedSections.includes(1) ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
                </button>

                <div className={`transition - all duration - 300 ease -in -out ${expandedSections.includes(1) ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'} `}>
                    <div className="p-6 pt-0 border-t border-white/20">
                        <BasicInfoForm
                            newListing={newListing}
                            setNewListing={setNewListing}
                            activeBookings={activeBookings}
                        />
                    </div>
                </div>
            </div>

            {/* Amenities Section */}
            <div className="glass-card rounded-2xl border border-white/40 shadow-sm overflow-hidden transition-all duration-300">
                <button
                    onClick={() => toggleSection(2)}
                    className="w-full p-6 flex items-center justify-between hover:bg-white/40 transition-colors text-left"
                >
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold shadow-sm">2</span>
                        Amenities
                    </h3>
                    {expandedSections.includes(2) ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
                </button>

                <div className={`transition - all duration - 300 ease -in -out ${expandedSections.includes(2) ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'} `}>
                    <div className="p-6 pt-0 border-t border-white/20">
                        <AmenitiesSelector
                            newListing={newListing}
                            setNewListing={setNewListing}
                        />
                    </div>
                </div>
            </div>

            {/* Tags Section */}
            <div className="glass-card rounded-2xl border border-white/40 shadow-sm overflow-hidden transition-all duration-300">
                <button
                    onClick={() => toggleSection(3)}
                    className="w-full p-6 flex items-center justify-between hover:bg-white/40 transition-colors text-left"
                >
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-bold shadow-sm">3</span>
                        Tags & Highlights
                    </h3>
                    {expandedSections.includes(3) ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
                </button>

                <div className={`transition - all duration - 300 ease -in -out ${expandedSections.includes(3) ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'} `}>
                    <div className="p-6 pt-0 border-t border-white/20">
                        <TagsInput
                            newListing={newListing}
                            setNewListing={setNewListing}
                        />
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-end items-center pt-6 border-t border-white/20">
                <Button
                    onClick={() => setStep(2)}
                    disabled={!canContinue}
                    variant="primary"
                    size="lg"
                    className="w-full sm:w-auto shadow-lg shadow-brand-500/20 hover:shadow-brand-500/40 transition-all hover:scale-[1.02]"
                    rightIcon={<ArrowRight size={18} />}
                >
                    Continue to Photos
                </Button>
            </div>
        </div>
    );
};

export default ListingBasicInfo;
