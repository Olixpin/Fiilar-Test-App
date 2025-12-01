import React from 'react';
import { Button, useLocale } from '@fiilar/ui';
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
    const { locale } = useLocale();

    if (!showAiInput) {
        return (
            <button
                onClick={() => setShowAiInput(true)}
                className="w-full group bg-white lg:bg-linear-to-br lg:from-brand-50 lg:to-purple-50 lg:hover:from-brand-100 lg:hover:to-purple-100 p-4 sm:p-5 rounded-2xl border border-gray-200 lg:border-2 lg:border-dashed lg:border-brand-200 lg:hover:border-brand-400 transition-all duration-300 shadow-sm lg:shadow-none"
            >
                <div className="flex items-center justify-center gap-3">
                    <div className="p-2.5 bg-gray-50 lg:bg-white rounded-xl shadow-sm text-brand-600 group-hover:scale-110 transition-transform">
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
        <div className="lg:bg-white lg:p-6 lg:rounded-2xl lg:border lg:border-gray-100 lg:shadow-sm animate-in slide-in-from-top duration-300">
            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                <div className="p-3 bg-brand-50 rounded-xl shadow-sm text-brand-600 border border-brand-100 hidden sm:block">
                    <Sparkles size={24} />
                </div>
                <div className="flex-1 w-full">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <span className="sm:hidden text-brand-600"><Sparkles size={18} /></span>
                            AI Auto-Fill
                        </h3>
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
                    <p className="text-sm text-gray-500 mb-4">Describe your place and let AI fill in the details for you.</p>
                    <textarea
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder={`e.g. A modern 2-bedroom apartment in Lekki Phase 1 with a pool, gym, and 24/7 power. Great for families, ${locale.currencySymbol}150,000 per night.`}
                        className="w-full p-4 rounded-xl border border-gray-200 focus:border-gray-400 focus:ring-4 focus:ring-gray-50 outline-none min-h-[120px] bg-gray-50 focus:bg-white transition-all resize-none mb-3 text-gray-900 placeholder:text-gray-400 text-base"
                    />
                    <div className="flex justify-end">
                        <Button
                            onClick={handleAiAutoFill}
                            disabled={!aiPrompt.trim() || isAiGenerating}
                            isLoading={isAiGenerating}
                            className="w-full sm:w-auto bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-700 hover:to-purple-700 text-white shadow-md border-0"
                            size="md"
                        >
                            <Sparkles size={18} className="mr-2" />
                            Auto-Fill Details
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIAutoFill;
