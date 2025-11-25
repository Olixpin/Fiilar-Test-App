import { forwardRef, InputHTMLAttributes, useState } from 'react';
import { LucideIcon } from 'lucide-react';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  variant?: 'glass' | 'minimal' | 'gradient';
  inputSize?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      icon: Icon,
      iconPosition = 'left',
      variant = 'glass',
      inputSize = 'md',
      fullWidth = true,
      className = '',
      disabled,
      value,
      placeholder,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = value !== undefined && value !== '';

    const sizeClasses = {
      sm: 'px-4 py-2.5 text-sm',
      md: 'px-4 py-3.5 text-base',
      lg: 'px-5 py-4 text-lg',
    };

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
      ${sizeClasses[inputSize]}
      ${variantClasses[variant]}
      ${variant !== 'minimal' ? 'rounded-xl' : ''}
      outline-none
      transition-all
      duration-300
      ease-out
      ${error ? 'border-red-400 focus:border-red-500 bg-red-50/30' : ''}
      ${disabled ? 'bg-gray-50 cursor-not-allowed opacity-50' : ''}
      ${Icon && iconPosition === 'left' ? 'pl-12' : ''}
      ${Icon && iconPosition === 'right' ? 'pr-12' : ''}
      ${label ? 'pt-6 pb-2' : ''}
      ${className}
    `.trim().replace(/\s+/g, ' ');

    return (
      <div className={`${fullWidth ? 'w-full' : ''} group`}>
        <div className="relative">
          {Icon && (
            <div
              className={`absolute top-1/2 -translate-y-1/2 ${
                iconPosition === 'left' ? 'left-4' : 'right-4'
              } transition-colors duration-300 ${
                isFocused ? 'text-brand-500' : error ? 'text-red-400' : 'text-gray-400'
              }`}
            >
              <Icon size={inputSize === 'sm' ? 18 : inputSize === 'lg' ? 22 : 20} />
            </div>
          )}
          
          <input
            ref={ref}
            disabled={disabled}
            value={value}
            placeholder={isFocused ? placeholder : undefined}
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
                  : 'top-1/2 -translate-y-1/2 text-base'
                }
                ${isFocused
                  ? 'text-brand-500'
                  : error
                  ? 'text-red-500'
                  : 'text-gray-500'
                }
                ${Icon && iconPosition === 'left' ? 'left-12' : ''}
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

Input.displayName = 'Input';

export default Input;
