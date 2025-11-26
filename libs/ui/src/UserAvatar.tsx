import React from 'react';

interface UserAvatarProps {
    src?: string;
    firstName?: string;
    lastName?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-24 h-24 text-2xl',
};

// Generate consistent color based on string hash
const getColorFromString = (str: string): string => {
    const colors = [
        'bg-blue-500',
        'bg-purple-500',
        'bg-pink-500',
        'bg-red-500',
        'bg-orange-500',
        'bg-yellow-500',
        'bg-green-500',
        'bg-teal-500',
        'bg-cyan-500',
        'bg-indigo-500',
    ];

    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
};

// Get initials from name
const getInitials = (firstName?: string, lastName?: string): string => {
    const first = firstName?.charAt(0).toUpperCase() || '';
    const last = lastName?.charAt(0).toUpperCase() || '';
    return first + last || '?';
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
    src,
    firstName,
    lastName,
    size = 'md',
    className = '',
}) => {
    const sizeClass = sizeClasses[size];

    // If image source is provided, show image
    if (src) {
        return (
            <div className={`${sizeClass} rounded-full overflow-hidden ${className}`}>
                <img
                    src={src}
                    alt={`${firstName || ''} ${lastName || ''}`.trim() || 'User'}
                    className="w-full h-full object-cover"
                />
            </div>
        );
    }

    // Otherwise, show initials with colored background
    const initials = getInitials(firstName, lastName);
    const colorClass = getColorFromString(`${firstName}${lastName}`);

    return (
        <div
            className={`${sizeClass} ${colorClass} rounded-full flex items-center justify-center text-white font-semibold ${className}`}
        >
            {initials}
        </div>
    );
};
