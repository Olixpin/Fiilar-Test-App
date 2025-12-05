import React from 'react';
import { Info, CheckCircle, AlertTriangle, XCircle, Lightbulb } from 'lucide-react';

export type InfoBoxVariant = 'info' | 'success' | 'warning' | 'error' | 'example';

interface InfoBoxProps {
    children: React.ReactNode;
    variant?: InfoBoxVariant;
    className?: string;
    icon?: React.ReactNode;
    showIcon?: boolean;
}

const variantStyles: Record<InfoBoxVariant, { bg: string; border: string; text: string; iconColor: string }> = {
    info: {
        bg: 'bg-blue-50',
        border: 'border-blue-100',
        text: 'text-blue-800',
        iconColor: 'text-blue-600',
    },
    success: {
        bg: 'bg-green-50',
        border: 'border-green-100',
        text: 'text-green-800',
        iconColor: 'text-green-600',
    },
    warning: {
        bg: 'bg-amber-50',
        border: 'border-amber-100',
        text: 'text-amber-800',
        iconColor: 'text-amber-600',
    },
    error: {
        bg: 'bg-red-50',
        border: 'border-red-100',
        text: 'text-red-800',
        iconColor: 'text-red-600',
    },
    example: {
        bg: 'bg-purple-100',
        border: 'border-gray-200',
        text: 'text-purple-700',
        iconColor: 'text-purple-700',
    },
};

const defaultIcons: Record<InfoBoxVariant, React.ReactNode> = {
    info: <Info size={20} />,
    success: <CheckCircle size={20} />,
    warning: <AlertTriangle size={20} />,
    error: <XCircle size={20} />,
    example: <Lightbulb size={20} />,
};

const InfoBox: React.FC<InfoBoxProps> = ({
    children,
    variant = 'info',
    className = '',
    icon,
    showIcon = true,
}) => {
    const styles = variantStyles[variant];
    const displayIcon = icon ?? defaultIcons[variant];

    return (
        <div
            className={`flex items-start gap-3 p-4 rounded-xl border ${styles.bg} ${styles.border} ${className}`}
        >
            {showIcon && (
                <span className={`shrink-0 mt-0.5 ${styles.iconColor}`}>
                    {displayIcon}
                </span>
            )}
            <div className={`text-sm ${styles.text}`}>
                {children}
            </div>
        </div>
    );
};

export default InfoBox;
