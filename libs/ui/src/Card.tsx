import React from 'react';

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className = '', ...props }, ref) => (
  <div
    ref={ref}
    className={`bg-white rounded-2xl border border-gray-200 shadow-sm ${className}`}
    {...props}
  />
));
Card.displayName = "Card";

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className = '', ...props }, ref) => (
  <div
    ref={ref}
    className={`p-6 border-b border-gray-100 ${className}`}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(({ className = '', ...props }, ref) => (
  <h3
    ref={ref}
    className={`text-lg font-semibold text-gray-900 ${className}`}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ className = '', ...props }, ref) => (
  <p
    ref={ref}
    className={`text-sm text-gray-500 mt-1 ${className}`}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className = '', ...props }, ref) => (
  <div
    ref={ref}
    className={`p-6 ${className}`}
    {...props}
  />
));
CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className = '', ...props }, ref) => (
  <div
    ref={ref}
    className={`p-6 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl ${className}`}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";
