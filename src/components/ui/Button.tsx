import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = 'primary', size = 'md', loading = false, leftIcon, rightIcon, className = '', disabled, ...props }, ref) => {
    const baseClasses =
      'inline-flex items-center justify-center font-medium rounded-lg transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer';

    const variantClasses = {
      primary:
        'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white focus:ring-blue-500 transform hover:scale-[1.02] active:scale-[0.98]',
      secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 focus:ring-gray-500 transform hover:scale-[1.02] active:scale-[0.98]',
      outline: 'border border-gray-300 hover:bg-gray-50 text-gray-700 focus:ring-blue-500 transform hover:scale-[1.02] active:scale-[0.98]',
      ghost: 'hover:bg-gray-100 text-gray-700 focus:ring-gray-500 transform hover:scale-[1.02] active:scale-[0.98]',
    };

    const sizeClasses = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-3 text-sm',
      lg: 'px-6 py-4 text-base',
    };

    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        className={`
          ${baseClasses}
          ${variantClasses[variant]}
          ${sizeClasses[size]} 
          ${className}
        `}
        disabled={isDisabled}
        {...props}
      >
        {loading && (
          <div className='mr-2'>
            <i className='fa-solid fa-circle-notch fa-spin' />
          </div>
        )}

        {!loading && leftIcon && <div className='mr-2'>{leftIcon}</div>}

        <span>{children}</span>

        {!loading && rightIcon && <div className='ml-2'>{rightIcon}</div>}
      </button>
    );
  }
);

Button.displayName = 'Button';
