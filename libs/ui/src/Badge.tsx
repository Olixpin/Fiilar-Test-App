import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'success' | 'warning' | 'info';
  size?: 'sm' | 'md' | 'lg';
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className = '', variant = 'default', size = 'md', ...props }, ref) => {
    const baseStyles = "inline-flex items-center rounded-full font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
    
    const variants = {
      default: "border-transparent bg-gray-900 text-white hover:bg-gray-900/80",
      secondary: "border-transparent bg-gray-100 text-gray-900 hover:bg-gray-200/80",
      outline: "text-gray-900 border border-gray-200",
      destructive: "border-transparent bg-red-500 text-white hover:bg-red-500/80",
      success: "border-transparent bg-green-100 text-green-800 hover:bg-green-200",
      warning: "border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
      info: "border-transparent bg-blue-100 text-blue-800 hover:bg-blue-200",
    };

    const sizes = {
      sm: "px-2 py-0.5 text-xs",
      md: "px-2.5 py-0.5 text-sm",
      lg: "px-3 py-1 text-base",
    };

    const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

    return (
      <div ref={ref} className={classes} {...props} />
    );
  }
);

Badge.displayName = "Badge";
