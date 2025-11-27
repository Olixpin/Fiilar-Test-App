import { forwardRef, InputHTMLAttributes, useState, ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string | boolean;
  helperText?: string;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  variant?: 'glass' | 'minimal' | 'gradient' | 'glass-dark';
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
      leftIcon,
      rightIcon,
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
      'glass-dark': `
        bg-white/10 backdrop-blur-md
        border border-white/20
        text-white placeholder-white/50
        shadow-sm
        hover:bg-white/20 hover:border-white/30
        focus:bg-white/20 focus:border-white focus:shadow-lg focus:ring-1 focus:ring-white/20
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

    // Determine if we have icons on left or right
    const hasLeftIcon = leftIcon || (Icon && iconPosition === 'left');
    const hasRightIcon = rightIcon || (Icon && iconPosition === 'right');

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
      ${hasLeftIcon ? 'pl-12' : ''}
      ${hasRightIcon ? 'pr-12' : ''}
      ${label ? 'pt-6 pb-2' : ''}
      ${variant === 'glass-dark' ? 'glass-autofill' : ''}
      ${className}
    `.trim().replace(/\s+/g, ' ');

    return (
      <div className={`${fullWidth ? 'w-full' : ''} group`}>
        <div className="relative">
          {/* Left Icon Rendering */}
          {hasLeftIcon && (
            <div
              className={`absolute top-1/2 -translate-y-1/2 left-4 transition-colors duration-300 ${isFocused
                ? (variant === 'glass-dark' ? 'text-white' : 'text-brand-500')
                : error
                  ? 'text-red-400'
                  : (variant === 'glass-dark' ? 'text-white/70' : 'text-gray-400')
                }`}
            >
              {leftIcon ? leftIcon : Icon && <Icon size={inputSize === 'sm' ? 18 : inputSize === 'lg' ? 22 : 20} />}
            </div>
          )}

          {/* Right Icon Rendering */}
          {hasRightIcon && (
            <div
              className={`absolute top-1/2 -translate-y-1/2 right-4 transition-colors duration-300 ${isFocused
                ? (variant === 'glass-dark' ? 'text-white' : 'text-brand-500')
                : error
                  ? 'text-red-400'
                  : (variant === 'glass-dark' ? 'text-white/70' : 'text-gray-400')
                }`}
            >
              {rightIcon ? rightIcon : Icon && <Icon size={inputSize === 'sm' ? 18 : inputSize === 'lg' ? 22 : 20} />}
            </div>
          )}

          <input
            ref={ref}
            disabled={disabled}
            value={value}
            placeholder={isFocused || !label ? placeholder : undefined}
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
                  ? (variant === 'glass-dark' ? 'text-white' : 'text-brand-500')
                  : error
                    ? 'text-red-500'
                    : (variant === 'glass-dark' ? 'text-white/70' : 'text-gray-500')
                }
                ${hasLeftIcon ? 'left-12' : ''}
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
          <p className={`mt-2 text-xs animate-in slide-in-from-top-1 duration-200 ${error ? 'text-red-500 font-medium' : 'text-gray-500'
            }`}>
            {typeof error === 'string' ? error : helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
