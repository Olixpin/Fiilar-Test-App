import React, { useEffect, useState } from 'react';
import { Check, AlertCircle, X, Info } from 'lucide-react';

export interface ToastProps {
    show: boolean;
    message: string;
    type?: 'success' | 'error' | 'info';
    onClose: () => void;
    duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
    show,
    message,
    type = 'success',
    onClose,
    duration = 3000
}) => {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        if (show && duration > 0) {
            const timer = setTimeout(() => {
                handleClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [show, duration]);

    const handleClose = () => {
        setIsExiting(true);
        // Wait for animation to finish (200ms matches CSS)
        setTimeout(() => {
            onClose();
            setIsExiting(false);
        }, 200);
    };

    if (!show) return null;

    const variants = {
        success: {
            iconColor: 'text-green-600',
            bgColor: 'bg-green-50',
            borderColor: 'border-green-100',
            icon: Check
        },
        error: {
            iconColor: 'text-red-600',
            bgColor: 'bg-red-50',
            borderColor: 'border-red-100',
            icon: AlertCircle
        },
        info: {
            iconColor: 'text-blue-600',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-100',
            icon: Info
        }
    };

    const variant = variants[type];
    const Icon = variant.icon;

    return (
        <div
            className={`
                bg-white border border-gray-100 px-4 py-3 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] 
                flex items-center gap-3 min-w-[320px] max-w-md
                ${isExiting ? 'toast-exit' : 'toast-enter'}
            `}
        >
            <div className={`p-2 rounded-full ${variant.bgColor} shrink-0`}>
                <Icon size={18} className={variant.iconColor} />
            </div>
            <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 leading-snug">{message}</p>
            </div>
            <button
                onClick={handleClose}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors shrink-0"
            >
                <X size={16} />
            </button>
        </div>
    );
};
