import { forwardRef, SelectHTMLAttributes, useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'glass' | 'minimal' | 'gradient';
  fullWidth?: boolean;
  options?: Array<{ value: string | number; label: string }>;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      variant = 'glass',
      fullWidth = true,
      className = '',
      disabled,
      options,
      children,
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

    const baseClasses = `
      ${fullWidth ? 'w-full' : ''}
      px-4 py-3.5
      pr-11
      ${variantClasses[variant]}
      ${variant !== 'minimal' ? 'rounded-xl' : ''}
      outline-none
      transition-all
      duration-300
      ease-out
      text-base
      appearance-none
      ${error ? 'border-red-400 focus:border-red-500 bg-red-50/30' : ''}
      ${disabled ? 'bg-gray-50 cursor-not-allowed opacity-50' : ''}
      ${label ? 'pt-6 pb-2' : ''}
      ${className}
    `.trim().replace(/\s+/g, ' ');

    return (
      <div className={`${fullWidth ? 'w-full' : ''} group`}>
        <div className="relative">
          <select
            ref={ref}
            disabled={disabled}
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
          >
            {options
              ? options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))
              : children}
          </select>
          
          <div className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-all duration-300 ${
            isFocused ? 'text-brand-500 rotate-180' : error ? 'text-red-400' : 'text-gray-400'
          }`}>
            <ChevronDown size={20} />
          </div>

          {label && (
            <label
              className={`
                absolute left-4 transition-all duration-300 pointer-events-none
                ${isFocused || hasValue
                  ? 'top-2 text-xs font-medium'
                  : 'top-1/2 -translate-y-1/2 text-base'
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

Select.displayName = 'Select';

export default Select;
