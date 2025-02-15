'use client';

import { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';
import DynamicIcon from '../../utils/DynamicIcon';

interface ButtonDestructiveProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'link';
  isLoading?: boolean;
  size?: 'small' | 'medium' | 'large';
  mode?: 'light' | 'dark';
  leadingIcon?: string; // URL for leading icon
  trailingIcon?: string; // URL for trailing icon
  iconOnly?: boolean; // For buttons with only an icon
  iconColor?: string; // Tailwind color class for icon color
}

const ButtonDestructive: React.FC<ButtonDestructiveProps> = ({
  variant = 'primary',
  isLoading = false,
  size = 'medium',
  mode = 'light',
  className,
  children,
  leadingIcon,
  trailingIcon,
  iconColor = 'currentColor',
  iconOnly = false,
  ...props
}) => {
  const baseStyles = 'font-semibold transition-all rounded-lg flex items-center justify-center gap-2';

  // Override styles for links (no padding, no background, and underline)
  const linkStyles = 'font-normal transition-all self-stretch';

  // Define size styles
  const sizeStyles = {
    small: iconOnly ? 'p-2' : 'px-3 py-2 text-sm gap-1 font-semibold rounded-lg',
    medium: iconOnly ? 'p-2.5' : 'px-3.5 py-2.5 text-base gap-1 font-semibold rounded-lg',
    large: iconOnly ? 'p-3' : 'px-4 py-2.5 text-lg gap-2 font-semibold rounded-lg',
  };

  // Define variant styles with light and dark mode for destructive button
  const variants = {
    primary: {
      light: 'text-white bg-lightMode-button-primary-error-bg hover:bg-lightMode-button-primary-error-bg_hover border border-lightMode-shadow-skeumorphic-inner shadow-[inset_0_-2px_0_rgba(0,0,0,0.1),inset_0_0_0_1px_rgba(0,0,0,0.2)] focus:outline-none focus-visible:ring focus-visible:ring-offset-2 focus-visible:ring-offset-lightMode-bg-primary focus-visible:ring-lightMode-button-primary-error-bg',
      dark: 'text-white bg-lightMode-button-primary-error-bg hover:bg-lightMode-button-primary-error-bg_hover border border-lightMode-shadow-skeumorphic-inner shadow-[inset_0_-2px_0_rgba(0,0,0,0.1),inset_0_0_0_1px_rgba(0,0,0,0.2)] focus:outline-none focus-visible:ring focus-visible:ring-offset-2 focus-visible:ring-offset-darkMode-bg-primary focus-visible:ring-darkMode-button-primary-error-bg',
    },
    secondary: {
      light: 'text-lightMode-button-secondary-error-fg hover:text-lightMode-button-secondary-error-fg_hover  bg-white hover:bg-lightMode-button-secondary-error-bg_hover border border-lightMode-button-secondary-error-border hover:border-lightMode-button-secondary-error-border_hover shadow-[inset_0_-1px_0_rgba(0,0,0,0.1),inset_0_0_0_1px_rgba(136,156,228,0.2)] focus:outline-none focus-visible:ring focus-visible:ring-offset-2 focus-visible:ring-offset-lightMode-bg-primary focus-visible:ring-lightMode-button-primary-error-bg',
      dark: 'text-darkMode-button-secondary-error-fg hover:text-darkMode-button-secondary-error-fg_hover  bg-darkMode-button-secondary-error-bg hover:bg-darkMode-button-secondary-error-bg_hover border border-darkMode-button-secondary-error-border hover:border-darkMode-button-secondary-error-border_hover shadow-[inset_0_-1px_0_rgba(0,0,0,0.1),inset_0_0_0_1px_rgba(136,156,228,0.2)] focus:outline-none focus-visible:ring focus-visible:ring-offset-2 focus-visible:ring-offset-darkMode-bg-primary focus-visible:ring-darkMode-button-primary-error-bg',
    },
    tertiary: {
      light: 'text-lightMode-button-tertiary-error-fg hover:text-lightMode-button-tertiary-error-fg_hover bg-transparent  hover:bg-lightMode-button-tertiary-error-bg_hover focus:outline-none focus-visible:ring focus-visible:ring-offset-2 focus-visible:ring-offset-lightMode-bg-primary focus-visible:ring-lightMode-button-primary-error-bg',
      dark: 'text-darkMode-button-tertiary-error-fg hover:text-darkMode-button-tertiary-error-fg_hover bg-transparent  hover:bg-darkMode-button-tertiary-error-bg_hover focus:outline-none focus-visible:ring focus-visible:ring-offset-2 focus-visible:ring-offset-darkMode-bg-primary focus-visible:ring-darkMode-button-primary-error-bg',
    },
    link: {
      light: 'text-lightMode-button-tertiary-error-fg hover:text-lightMode-button-tertiary-error-fg_hover focus:outline-none focus-visible:ring focus-visible:ring-offset-2 focus-visible:ring-offset-lightMode-bg-primary focus-visible:ring-lightMode-button-primary-error-bg',
      dark: 'text-darkMode-button-tertiary-error-fg hover:text-darkMode-button-tertiary-error-fg_hover focus:outline-none focus-visible:ring focus-visible:ring-offset-2 focus-visible:ring-offset-darkMode-bg-primary focus-visible:ring-darkMode-button-primary-error-bg',
    },
  };

  // Get the styles for the selected variant and mode
  const variantStyles = variants[variant]?.[mode];

  return (
    <button
    onMouseDown={(e) => e.preventDefault()} // Prevent focus on mouse down
      className={cn(
        baseStyles,
        variant === 'link' ? linkStyles : sizeStyles[size],
        variantStyles,
        className,
        isLoading && 'opacity-50 cursor-not-allowed'
      )}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        'Loading...'
      ) : (
        <>
          {leadingIcon && !iconOnly && (
            <DynamicIcon url={leadingIcon} color={iconColor} size={20} />
          )}
          {!iconOnly && <span>{children}</span>}
          {trailingIcon && !iconOnly && (
            <DynamicIcon url={trailingIcon} color={iconColor} size={20} />
          )}
          {iconOnly && leadingIcon && (
            <DynamicIcon url={leadingIcon} color={iconColor} size={20} />
          )}
        </>
      )}
    </button>
  );
};

export default ButtonDestructive;
