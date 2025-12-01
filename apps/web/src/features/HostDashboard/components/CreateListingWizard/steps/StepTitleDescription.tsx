import React, { useState } from 'react';
import { Listing } from '@fiilar/types';
import StepWrapper from './StepWrapper';
import { Sparkles, Loader2 } from 'lucide-react';

interface StepTitleDescriptionProps {
    newListing: Partial<Listing>;
    setNewListing: React.Dispatch<React.SetStateAction<Partial<Listing>>>;
    currentStep: number;
    totalSteps: number;
    onNext: () => void;
    onBack: () => void;
    aiPrompt?: string;
    setAiPrompt?: (prompt: string) => void;
    isAiGenerating?: boolean;
    handleAiAutoFill?: () => void;
}

const MAX_TITLE_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 1000;

const StepTitleDescription: React.FC<StepTitleDescriptionProps> = ({
    newListing,
    setNewListing,
    currentStep,
    totalSteps,
    onNext,
    onBack,
    aiPrompt = '',
    setAiPrompt,
    isAiGenerating = false,
    handleAiAutoFill,
}) => {
    const [showAiHelper, setShowAiHelper] = useState(false);
    const title = newListing.title || '';
    const description = newListing.description || '';

    const canContinue = title.trim().length >= 10 && description.trim().length >= 50;

    return (
        <StepWrapper
            title="Create your title and description"
            subtitle="Catch guests' attention with a great title"
            currentStep={currentStep}
            totalSteps={totalSteps}
            phaseName="Property Basics"
            onNext={onNext}
            onBack={onBack}
            canContinue={canContinue}
        >
            <div className="space-y-6">
                {/* AI Helper Toggle */}
                {handleAiAutoFill && setAiPrompt && (
                    <button
                        onClick={() => setShowAiHelper(!showAiHelper)}
                        className="flex items-center gap-2 text-brand-600 hover:text-brand-700 font-medium transition-colors"
                    >
                        <Sparkles size={18} />
                        <span>{showAiHelper ? 'Hide AI helper' : 'Use AI to help write'}</span>
                    </button>
                )}

                {/* AI Helper Panel */}
                {showAiHelper && handleAiAutoFill && setAiPrompt && (
                    <div className="p-4 bg-gradient-to-br from-brand-50 to-purple-50 rounded-xl border border-brand-100">
                        <p className="text-sm text-gray-700 mb-3">
                            Describe your space briefly and let AI generate a title and description for you.
                        </p>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={aiPrompt}
                                onChange={(e) => setAiPrompt(e.target.value)}
                                placeholder="e.g. Modern studio with natural light in Lekki"
                                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:border-brand-500 focus:ring-0 outline-none text-sm"
                            />
                            <button
                                onClick={handleAiAutoFill}
                                disabled={isAiGenerating || !aiPrompt.trim()}
                                className={`px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 transition-all ${
                                    isAiGenerating || !aiPrompt.trim()
                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        : 'bg-brand-600 text-white hover:bg-brand-700'
                                }`}
                            >
                                {isAiGenerating ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        <span>Generating...</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={16} />
                                        <span>Generate</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Title Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setNewListing(prev => ({ ...prev, title: e.target.value.slice(0, MAX_TITLE_LENGTH) }))}
                        placeholder="e.g. Modern Studio in Lekki Phase 1"
                        className="w-full px-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:ring-0 outline-none transition-colors"
                    />
                    <div className="flex justify-between mt-2">
                        <p className="text-xs text-gray-500">
                            {title.length < 10 ? `Add ${10 - title.length} more characters` : 'Looking good!'}
                        </p>
                        <p className={`text-xs ${title.length >= MAX_TITLE_LENGTH ? 'text-red-500' : 'text-gray-400'}`}>
                            {title.length}/{MAX_TITLE_LENGTH}
                        </p>
                    </div>
                </div>

                {/* Description Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setNewListing(prev => ({ ...prev, description: e.target.value.slice(0, MAX_DESCRIPTION_LENGTH) }))}
                        placeholder="Describe what makes your space special. What can guests expect? What's nearby?"
                        rows={6}
                        className="w-full px-4 py-4 text-base border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:ring-0 outline-none transition-colors resize-none"
                    />
                    <div className="flex justify-between mt-2">
                        <p className="text-xs text-gray-500">
                            {description.length < 50 ? `Add ${50 - description.length} more characters` : 'Great description!'}
                        </p>
                        <p className={`text-xs ${description.length >= MAX_DESCRIPTION_LENGTH ? 'text-red-500' : 'text-gray-400'}`}>
                            {description.length}/{MAX_DESCRIPTION_LENGTH}
                        </p>
                    </div>
                </div>

                {/* Tips */}
                <div className="p-4 bg-gray-50 rounded-xl">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Tips for a great listing</h4>
                    <ul className="text-sm text-gray-600 space-y-1.5">
                        <li>• Highlight unique features (views, amenities, location)</li>
                        <li>• Mention what's included (WiFi, parking, etc.)</li>
                        <li>• Describe the vibe (cozy, professional, artistic)</li>
                    </ul>
                </div>
            </div>
        </StepWrapper>
    );
};

export default StepTitleDescription;
