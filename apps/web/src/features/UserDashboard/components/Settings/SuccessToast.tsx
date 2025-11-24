import React from 'react';
import { Check } from 'lucide-react';

interface SuccessToastProps {
    show: boolean;
    message?: string;
}

export const SuccessToast: React.FC<SuccessToastProps> = ({ show, message = 'Preferences saved' }) => {
    if (!show) return null;

    return (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 fade-in">
            <div className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
                <Check size={20} />
                <span className="font-medium">{message}</span>
            </div>
        </div>
    );
};
