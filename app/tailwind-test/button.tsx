'use client';

import { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  isLoading = false,
  className,
  children,
  ...props
}) => {
  const baseStyles =
    'px-4 py-2 rounded-radius-12 font-medium transition-all';
  const variants = {
    primary:'bg-blue-600 hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800  hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };

  return (
    <button
      className={cn(
        baseStyles,
        variants[variant],
        className,
        isLoading && 'opacity-50 cursor-not-allowed'
      )}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? 'Loading...' : children}
    </button>
  );
};

export default Button;
