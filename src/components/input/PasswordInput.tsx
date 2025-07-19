import { useState } from 'react';
import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { TextInput } from './TextInput';

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'className'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  containerClassName?: string;
  inputClassName?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, helperText, leftIcon, containerClassName = '', inputClassName = '', ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
      setShowPassword((prev) => !prev);
    };

    const eyeIcon = showPassword ? <EyeOff size={16} /> : <Eye size={16} />;

    return (
      <TextInput
        ref={ref}
        type={showPassword ? 'text' : 'password'}
        label={label}
        error={error}
        helperText={helperText}
        leftIcon={leftIcon}
        containerClassName={containerClassName}
        inputClassName={inputClassName}
        rightIcon={
          <button
            type='button'
            onClick={togglePasswordVisibility}
            className='text-gray-400 hover:text-gray-600 transition-colors cursor-pointer'
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {eyeIcon}
          </button>
        }
        {...props}
      />
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
