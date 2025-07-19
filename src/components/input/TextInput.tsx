import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

interface TextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
  inputClassName?: string;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, containerClassName = '', inputClassName = '', id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={containerClassName}>
        {label && (
          <label htmlFor={inputId} className='block text-sm font-medium text-gray-700 mb-1'>
            {label}
          </label>
        )}

        <div className='relative'>
          {leftIcon && (
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <div className='h-5 w-5 text-gray-400'>{leftIcon}</div>
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={`
              w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition
              ${leftIcon ? 'pl-10' : ''}
              ${rightIcon ? 'pr-10' : ''}
              ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}
              ${inputClassName}
            `}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            {...props}
          />

          {rightIcon && (
            <div className='absolute inset-y-0 right-0 pr-3 flex items-center'>
              <div className='h-5 w-5 text-gray-400'>{rightIcon}</div>
            </div>
          )}
        </div>

        {error && (
          <div id={`${inputId}-error`} className='text-red-500 text-sm mt-1' role='alert'>
            {error}
          </div>
        )}

        {helperText && !error && (
          <div id={`${inputId}-helper`} className='text-gray-500 text-sm mt-1'>
            {helperText}
          </div>
        )}
      </div>
    );
  }
);

TextInput.displayName = 'TextInput';
