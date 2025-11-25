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
        focus:bg-white focus:border-gray-300 focus:shadow-lg
      `,
      minimal: `
        bg-transparent
        border-b-2 border-gray-200
        rounded-none
        hover:border-gray-400
        focus:border-brand-500
      `,
      gradient: `
        bg-gradient-to-br from-gray-50 to-white
        border border-gray-200
        shadow-sm
        hover:shadow-md
        focus:shadow-lg focus:border-gray-400
      `,
    };

    const resizeClasses = {
      none: 'resize-none',
      vertical: 'resize-y',
      horizontal: 'resize-x',
      both: 'resize',
    };

    const baseClasses = `
      ${fullWidth ? 'w-full' : ''}
      px-4 py-3.5
      ${variantClasses[variant]}
      ${resizeClasses[resize]}
      ${variant !== 'minimal' ? 'rounded-xl' : ''}
      outline-none
      transition-all
      duration-300
      ease-out
      text-base
      ${error ? 'border-red-400 focus:border-red-500 bg-red-50/30' : ''}
      ${disabled ? 'bg-gray-50 cursor-not-allowed opacity-50' : ''}
      ${label ? 'pt-6' : ''}
      ${className}
    `.trim().replace(/\s+/g, ' ');

    return (
      <div className={`${fullWidth ? 'w-full' : ''} group`}>
        <div className="relative">
          <textarea
            ref={ref}
            disabled={disabled}
            rows={rows}
            value={value}
            className={baseClasses}
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

          {label && (
            <label
              className={`
                absolute left-4 transition-all duration-300 pointer-events-none
                ${isFocused || hasValue
                  ? 'top-2 text-xs font-medium'
                  : 'top-3.5 text-base'
                }
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
          )}

          {isFocused && !error && variant === 'glass' && (
            <div className="absolute inset-0 rounded-xl bg-linear-to-r from-brand-500/5 to-transparent pointer-events-none animate-in fade-in duration-300" />
          )}
        </div>

        {(error || helperText) && (
          <p className={`mt-2 text-xs animate-in slide-in-from-top-1 duration-200 ${
            error ? 'text-red-500 font-medium' : 'text-gray-500'
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
