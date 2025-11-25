import React from 'react';
import { Button } from '@fiilar/ui';
import { Sparkles, ArrowRight, X } from 'lucide-react';

interface AIAutoFillProps {
    aiPrompt: string;
    setAiPrompt: (prompt: string) => void;
    isAiGenerating: boolean;
    handleAiAutoFill: () => void;
    showAiInput: boolean;
    setShowAiInput: (show: boolean) => void;
}

const AIAutoFill: React.FC<AIAutoFillProps> = ({
    aiPrompt,
    setAiPrompt,
    isAiGenerating,
    handleAiAutoFill,
    showAiInput,
    setShowAiInput
}) => {
    if (!showAiInput) {
        return (
            <button
                onClick={() => setShowAiInput(true)}
                className="w-full group bg-linear-to-br from-brand-50 to-purple-50 hover:from-brand-100 hover:to-purple-100 p-5 rounded-2xl border-2 border-dashed border-brand-200 hover:border-brand-400 transition-all duration-300"
            >
                <div className="flex items-center justify-center gap-3">
                    <div className="p-2.5 bg-white rounded-xl shadow-sm text-brand-600 group-hover:scale-110 transition-transform">
                        <Sparkles size={20} />
                    </div>
                    <div className="text-left">
                        <h3 className="font-bold text-gray-900 text-sm">Try AI Auto-Fill</h3>
                        <p className="text-xs text-gray-600">Describe your space and let AI complete the form</p>
                    </div>
                    <ArrowRight className="ml-auto text-brand-600 group-hover:translate-x-1 transition-transform" size={18} />
                </div>
            </button>
        );
    }

    return (
        <div className="bg-linear-to-br from-brand-50 to-purple-50 p-6 rounded-2xl border border-brand-200 shadow-sm animate-in slide-in-from-top duration-300">
            <div className="flex items-start gap-4">
                <div className="p-3 bg-white rounded-xl shadow-sm text-brand-600">
                    <Sparkles size={24} />
                </div>
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-gray-900">AI Auto-Fill</h3>
                        <Button
                            onClick={() => setShowAiInput(false)}
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-gray-600 p-1 h-auto min-w-0"
                            title="Close AI Auto-Fill"
                        >
                            <X size={18} />
                        </Button>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Describe your place and let AI fill in the details for you.</p>
                    <div className="relative">
                        <textarea
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            placeholder="e.g. A modern 2-bedroom apartment in Lekki Phase 1 with a pool, gym, and 24/7 power. Great for families, $150 per night."
                            className="w-full p-4 pr-12 rounded-xl border-2 border-brand-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none min-h-[100px] bg-white shadow-sm transition-all"
                        />
                        <div className="absolute bottom-3 right-3">
                            <Button
                                onClick={handleAiAutoFill}
                                disabled={!aiPrompt.trim() || isAiGenerating}
                                isLoading={isAiGenerating}
                                variant="primary"
                                size="sm"
                            >
                                {!isAiGenerating && <ArrowRight size={18} />}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIAutoFill;
