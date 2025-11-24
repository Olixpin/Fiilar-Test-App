import React from 'react';
import { Search, Heart, Calendar, MessageSquare, Package } from 'lucide-react';

interface EmptyStateProps {
    icon?: 'search' | 'heart' | 'calendar' | 'message' | 'package';
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
    icon = 'search',
    title,
    description,
    actionLabel,
    onAction,
}) => {
    const icons = {
        search: Search,
        heart: Heart,
        calendar: Calendar,
        message: MessageSquare,
        package: Package,
    };

    const Icon = icons[icon];

    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <Icon className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600 mb-6 max-w-md">{description}</p>
            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className="bg-brand-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-700 transition-all duration-200 hover:scale-105 active:scale-95"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
};

export default EmptyState;
