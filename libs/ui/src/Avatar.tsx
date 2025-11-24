import React, { useState } from 'react';

export interface AvatarProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Avatar = React.forwardRef<HTMLImageElement, AvatarProps>(
  ({ className = '', src, alt, fallback, size = 'md', ...props }, ref) => {
    const [error, setError] = useState(false);

    const sizeClasses = {
      sm: "h-8 w-8",
      md: "h-10 w-10",
      lg: "h-12 w-12",
      xl: "h-16 w-16",
    };

    const containerClasses = `relative flex shrink-0 overflow-hidden rounded-full ${sizeClasses[size]} ${className}`;
    const imageClasses = "aspect-square h-full w-full object-cover";
    const fallbackClasses = "flex h-full w-full items-center justify-center rounded-full bg-gray-100 text-gray-500 font-medium uppercase";

    if (error || !src) {
      return (
        <div className={containerClasses}>
          <div className={fallbackClasses}>
            {fallback || alt?.charAt(0) || '?'}
          </div>
        </div>
      );
    }

    return (
      <div className={containerClasses}>
        <img
          ref={ref}
          src={src}
          alt={alt}
          className={imageClasses}
          onError={() => setError(true)}
          {...props}
        />
      </div>
    );
  }
);

Avatar.displayName = "Avatar";
