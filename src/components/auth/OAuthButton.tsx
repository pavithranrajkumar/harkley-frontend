import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import { GoogleIcon } from '../../assets/icons/GoogleIcon';

interface OAuthButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  provider: 'google' | 'github' | 'microsoft';
  loading?: boolean;
  className?: string;
}

const providerConfig = {
  google: {
    name: 'Google',
    icon: <GoogleIcon />,
  },
  github: {
    name: 'GitHub',
    icon: <i className='fab fa-github h-5 w-5' />,
  },
  microsoft: {
    name: 'Microsoft',
    icon: <i className='fab fa-microsoft h-5 w-5' />,
  },
};

export const OAuthButton = forwardRef<HTMLButtonElement, OAuthButtonProps>(
  ({ provider, loading = false, className = '', disabled, children, ...props }, ref) => {
    const config = providerConfig[provider];
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        className={`
          w-full flex items-center justify-center border border-gray-300 rounded-lg py-3 px-4 space-x-2 
          hover:bg-gray-50 disabled:opacity-75 disabled:cursor-not-allowed transition duration-300
          transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer
          ${className}
        `}
        disabled={isDisabled}
        {...props}
      >
        {loading ? <i className='fa-solid fa-circle-notch fa-spin h-5 w-5' /> : config.icon}

        <span className='text-gray-700 font-medium'>{loading ? `Connecting to ${config.name}...` : children || `Continue with ${config.name}`}</span>
      </button>
    );
  }
);

OAuthButton.displayName = 'OAuthButton';
