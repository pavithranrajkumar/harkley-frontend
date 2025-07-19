interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Logo = ({ size = 'md', className = '' }: LogoProps) => {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const iconSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const paddingSizes = {
    sm: 'p-2',
    md: 'p-2.5',
    lg: 'p-3',
  };

  const isWhiteVariant = className.includes('text-white');

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`bg-gradient-to-r from-blue-600 to-purple-600 ${paddingSizes[size]} rounded-xl`}>
        <i className={`fa-solid fa-microphone-lines text-white ${iconSizes[size]}`} />
      </div>
      <h1
        className={`ml-3 font-bold ${isWhiteVariant ? 'text-white' : 'bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600'} ${
          sizeClasses[size]
        }`}
      >
        Harkley AI
      </h1>
    </div>
  );
};
