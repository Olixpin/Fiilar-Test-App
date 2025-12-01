import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SelectionCardProps {
    title: string;
    description?: string;
    icon?: LucideIcon;
    isSelected: boolean;
    onClick: () => void;
    disabled?: boolean;
    badge?: string;
    footer?: React.ReactNode;
    className?: string;
}

const SelectionCard: React.FC<SelectionCardProps> = ({
    title,
    description,
    icon: Icon,
    isSelected,
    onClick,
    disabled = false,
    badge,
    footer,
    className = '',
}) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`group relative p-4 sm:p-5 rounded-xl sm:rounded-2xl text-left transition-all duration-300 ease-out border w-full ${isSelected
                    ? 'border-brand-500 bg-brand-50 shadow-md ring-1 ring-brand-500/10'
                    : disabled
                        ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-lg hover:-translate-y-1'
                } ${className}`}
        >
            <div className="flex items-start gap-3 sm:gap-4">
                {Icon && (
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 shadow-sm ${isSelected
                            ? 'bg-brand-600 text-white scale-110 shadow-brand-600/20'
                            : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200 group-hover:text-gray-700'
                        }`}>
                        <Icon size={20} className="sm:hidden" strokeWidth={1.5} />
                        <Icon size={24} className="hidden sm:block" strokeWidth={1.5} />
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 sm:gap-4 mb-0.5 sm:mb-1">
                        <h3 className={`font-semibold text-base sm:text-lg transition-colors ${isSelected ? 'text-brand-800' : 'text-gray-700 group-hover:text-gray-900'
                            }`}>
                            {title}
                        </h3>
                        {badge && (
                            <span className="text-xs sm:text-sm font-medium text-brand-600 bg-brand-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md">
                                {badge}
                            </span>
                        )}
                    </div>
                    {description && (
                        <p className="text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2 leading-relaxed">
                            {description}
                        </p>
                    )}
                    {footer}
                </div>
            </div>

            {/* Selection Indicator */}
            <div className={`absolute top-4 right-4 sm:top-5 sm:right-5 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border-2 transition-all duration-300 ${isSelected
                    ? 'border-brand-600 bg-brand-600 scale-100'
                    : 'border-gray-300 bg-transparent scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100'
                }`}>
                {isSelected && (
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white rounded-full" />
                    </div>
                )}
            </div>
        </button>
    );
};

export default SelectionCard;
