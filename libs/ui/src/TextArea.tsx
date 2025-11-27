import { forwardRef, TextareaHTMLAttributes, useState } from 'react';

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    helperText?: string;
    variant?: 'glass' | 'minimal' | 'gradient';
    fullWidth?: boolean;
    resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
    (
        {
            label,
            error,
            helperText,
            variant = 'glass',
            fullWidth = true,
            resize = 'vertical',
            className = '',
            disabled,
            rows = 4,
            value,
            placeholder,
            ...props
        },
        ref
    ) => {
        const [isFocused, setIsFocused] = useState(false);
        const hasValue = value !== undefined && value !== '';

        const variantClasses = {
            glass: `
        bg-white/60 backdrop-blur-sm
        border border-gray-200/50
        shadow-sm
        hover:bg-white/80 hover:shadow-md
        focus-within:bg-white focus-within:border-gray-300 focus-within:shadow-lg
      `,
            minimal: `
        bg-transparent
        border-b-2 border-gray-200
        rounded-none
        hover:border-gray-400
        focus-within:border-brand-500
      `,
            gradient: `
        bg-gradient-to-br from-gray-50 to-white
        border border-gray-200
        shadow-sm
        hover:shadow-md
        focus-within:shadow-lg focus-within:border-gray-400
      `,
        };

        const resizeClasses = {
            none: 'resize-none',
            vertical: 'resize-y',
            horizontal: 'resize-x',
            both: 'resize',
        };

        return (
            <div className={`${fullWidth ? 'w-full' : ''} group`}>
                {/* Container with border and styling */}
                <div 
                    className={`
                        ${fullWidth ? 'w-full' : ''}
                        ${variantClasses[variant]}
                        ${variant !== 'minimal' ? 'rounded-xl' : ''}
                        ${error ? 'border-red-400 focus-within:border-red-500 bg-red-50/30' : ''}
                        ${disabled ? 'bg-gray-50 cursor-not-allowed opacity-50' : ''}
                        transition-all duration-300 ease-out
                        overflow-hidden
                    `.trim().replace(/\s+/g, ' ')}
                >
                    {/* Fixed Label Header */}
                    {label && (
                        <div className="px-4 pt-3 pb-1 bg-inherit">
                            <label
                                className={`
                                    text-xs font-medium transition-colors duration-300
                                    ${isFocused
                                        ? 'text-brand-500'
                                        : error
                                            ? 'text-red-500'
                                            : 'text-gray-500'
                                    }
                                `}
                            >
                                {label}
                            </label>
                        </div>
                    )}
                    
                    {/* Textarea */}
                    <textarea
                        ref={ref}
                        disabled={disabled}
                        rows={rows}
                        value={value}
                        placeholder={placeholder}
                        className={`
                            w-full
                            px-4 ${label ? 'pt-0 pb-3' : 'py-3.5'}
                            ${resizeClasses[resize]}
                            outline-none
                            bg-transparent
                            text-base text-gray-900
                            placeholder:text-gray-400
                            ${disabled ? 'cursor-not-allowed' : ''}
                            ${className}
                        `.trim().replace(/\s+/g, ' ')}
                        onFocus={(e) => {
                            setIsFocused(true);
                            props.onFocus?.(e);
                        }}
                        onBlur={(e) => {
                            setIsFocused(false);
                            props.onBlur?.(e);
                        }}
                        {...props}
                    />
                </div>

                {(error || helperText) && (
                    <p className={`mt-2 text-xs animate-in slide-in-from-top-1 duration-200 ${error ? 'text-red-500 font-medium' : 'text-gray-500'
                        }`}>
                        {error || helperText}
                    </p>
                )}
            </div>
        );
    }
);

TextArea.displayName = 'TextArea';

export default TextArea;
