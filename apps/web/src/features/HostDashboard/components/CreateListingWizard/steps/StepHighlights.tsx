import React, { useState } from 'react';
import { Listing } from '@fiilar/types';
import StepWrapper from './StepWrapper';
import { Plus, X, Tag } from 'lucide-react';

interface StepHighlightsProps {
    newListing: Partial<Listing>;
    setNewListing: React.Dispatch<React.SetStateAction<Partial<Listing>>>;
    currentStep: number;
    totalSteps: number;
    onNext: () => void;
    onBack: () => void;
    onSkip?: () => void;
}

const SUGGESTED_TAGS = [
    'City View', 'Ocean View', 'Garden', 'Rooftop',
    'Quiet Area', 'Central Location', 'Near Beach', 'Near Airport',
    'Pet Friendly', 'Family Friendly', 'Business Ready', 'Romantic',
    'Modern', 'Cozy', 'Luxury', 'Minimalist',
    'Natural Light', 'High Ceilings', 'Fully Furnished', 'Recently Renovated',
];

const StepHighlights: React.FC<StepHighlightsProps> = ({
    newListing,
    setNewListing,
    currentStep,
    totalSteps,
    onNext,
    onBack,
    onSkip,
}) => {
    const [customTag, setCustomTag] = useState('');
    const tags = newListing.tags || [];

    const toggleTag = (tag: string) => {
        const isSelected = tags.includes(tag);
        const updated = isSelected
            ? tags.filter(t => t !== tag)
            : [...tags, tag];
        setNewListing(prev => ({ ...prev, tags: updated }));
    };

    const addCustomTag = () => {
        const tag = customTag.trim();
        if (!tag) return;
        if (tags.some(t => t.toLowerCase() === tag.toLowerCase())) return;

        setNewListing(prev => ({
            ...prev,
            tags: [...(prev.tags || []), tag]
        }));
        setCustomTag('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addCustomTag();
        }
    };

    return (
        <StepWrapper
            title="Add highlights and tags"
            subtitle="Help guests discover your space with relevant tags"
            currentStep={currentStep}
            totalSteps={totalSteps}
            phaseName="Stand Out"
            onNext={onNext}
            onBack={onBack}
            onSkip={onSkip}
            canSkip={true}
            canContinue={true}
        >
            <div className="space-y-6">
                {/* Selected Tags */}
                {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                            <span
                                key={tag}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white rounded-full text-sm font-medium shadow-md transition-all animate-in fade-in zoom-in duration-200"
                            >
                                {tag}
                                <button
                                    onClick={() => toggleTag(tag)}
                                    className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                                    title={`Remove ${tag}`}
                                    aria-label={`Remove ${tag}`}
                                >
                                    <X size={14} />
                                </button>
                            </span>
                        ))}
                    </div>
                )}

                {/* Custom Tag Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Add custom tags
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={customTag}
                            onChange={(e) => setCustomTag(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="e.g. Near Market, Swimming Pool"
                            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:border-gray-900 focus:ring-4 focus:ring-gray-900/10 outline-none transition-all shadow-sm"
                        />
                        <button
                            onClick={addCustomTag}
                            disabled={!customTag.trim()}
                            className={`px-4 py-3 rounded-xl font-medium transition-all shadow-sm ${customTag.trim()
                                    ? 'bg-gray-900 text-white hover:bg-gray-800 hover:shadow-md hover:-translate-y-0.5'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }`}
                            title="Add custom tag"
                            aria-label="Add custom tag"
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                </div>

                {/* Suggested Tags */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Suggested tags
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {SUGGESTED_TAGS.filter(t => !tags.includes(t)).map((tag) => (
                            <button
                                key={tag}
                                onClick={() => toggleTag(tag)}
                                className="px-4 py-2 bg-white border border-gray-200 hover:border-gray-400 hover:shadow-md hover:-translate-y-0.5 text-gray-700 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1.5"
                            >
                                <Plus size={14} className="text-gray-400" />
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Info Note */}
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                    <Tag size={20} className="text-gray-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-600">
                        Tags help guests find your space when searching. Add tags that accurately describe your space's features, location, and vibe.
                    </p>
                </div>
            </div>
        </StepWrapper>
    );
};

export default StepHighlights;
