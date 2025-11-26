import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { Button } from './Button';

export interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
    onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'info',
    onConfirm,
    onCancel,
}) => {
    // Handle keyboard shortcuts
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onCancel();
            } else if (e.key === 'Enter') {
                onConfirm();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onConfirm, onCancel]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const variantStyles = {
        danger: {
            iconBg: 'bg-red-100',
            iconColor: 'text-red-600',
            icon: AlertTriangle,
            confirmButton: 'bg-red-600 hover:bg-red-700 text-white',
        },
        warning: {
            iconBg: 'bg-yellow-100',
            iconColor: 'text-yellow-600',
            icon: AlertCircle,
            confirmButton: 'bg-yellow-600 hover:bg-yellow-700 text-white',
        },
        info: {
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
            icon: Info,
            confirmButton: 'bg-brand-600 hover:bg-brand-700 text-white',
        },
    };

    const style = variantStyles[variant];
    const Icon = style.icon;

    const modalContent = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onCancel}
            />

            {/* Dialog */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
                {/* Close button */}
                <button
                    onClick={onCancel}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Close"
                >
                    <X size={20} />
                </button>

                {/* Icon */}
                <div className={`w-12 h-12 ${style.iconBg} rounded-full flex items-center justify-center mb-4`}>
                    <Icon size={24} className={style.iconColor} />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-2 pr-8">
                    {title}
                </h3>

                {/* Message */}
                <p className="text-gray-600 mb-6 leading-relaxed">
                    {message}
                </p>

                {/* Actions */}
                <div className="flex gap-3">
                    <Button
                        onClick={onCancel}
                        variant="outline"
                        className="flex-1"
                    >
                        {cancelText}
                    </Button>
                    <Button
                        onClick={onConfirm}
                        className={`flex-1 ${style.confirmButton}`}
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </div>
    );

    // Render in portal
    const portalRoot = document.getElementById('modal-root') || document.body;
    return createPortal(modalContent, portalRoot);
};
