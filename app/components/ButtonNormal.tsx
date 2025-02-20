'use client';

import { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';
import DynamicIcon from '../../utils/DynamicIcon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondaryGray' | 'secondaryColor' | 'tertiaryGray' | 'tertiaryColor' | 'linkGray' | 'linkColor';
  isLoading?: boolean;
  size?: 'small' | 'medium' | 'large';
  mode?: 'light' | 'dark';
  leadingIcon?: string; // URL for leading icon
  trailingIcon?: string; // URL for trailing icon
  iconOnly?: boolean; // For buttons with only an icon
  iconColor?: string; // Tailwind color class for icon color
}

const ButtonNormal: React.FC<ButtonProps> = ({
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
    small: iconOnly ? 'p-2' : 'px-3 py-2 text-sm gap-1 font-normal rounded-lg',
    medium: iconOnly ? 'p-2.5' : 'px-3.5 py-2.5 text-base gap-1 font-semibold rounded-lg',
    large: iconOnly ? 'p-3' : 'px-4 py-2.5 text-lg gap-2 font-semibold rounded-lg',
  };

  // Define variant styles with light and dark mode
  const variants = {
    primary: {
      light: 'text-white bg-lightMode-button-primary-bg hover:bg-[#4761C4] border border-lightMode-button-primary-bg shadow-[0px 1px 2px rgba(0, 0, 0, 0.09)] focus:outline-none focus-visible:ring focus-visible:ring-offset-2 focus-visible:ring-offset-lightMode-bg-primary focus-visible:ring-lightMode-button-primary-bg',
      dark: 'text-white bg-lightMode-button-primary-bg hover:bg-[#5D7AE2] border border-lightMode-button-primary-bg shadow-[0px 1px 2px rgba(0, 0, 0, 0.09)] focus:outline-none focus-visible:ring focus-visible:ring-offset-2 focus-visible:ring-offset-darkMode-bg-primary focus-visible:ring-darkMode-button-primary-bg',
    },
    secondaryGray: {
      light: 'text-lightMode-button-secondary-fg hover:text-lightMode-text-secondary_hover bg-white rounded-lg  border border-[#d0d5dd] hover:bg-gray-100 focus:outline-none focus-visible:ring focus-visible:ring-offset-2 focus-visible:ring-offset-lightMode-bg-primary focus-visible:ring-lightMode-button-primary-bg',
      dark: 'text-darkMode-button-secondary-fg hover:text-darkMode-text-secondary_hover bg-darkMode-button-secondary-bg hover:bg-darkMode-button-secondary-bg_hover border border-darkMode-button-secondary-border focus:outline-none focus-visible:ring focus-visible:ring-offset-2 focus-visible:ring-offset-darkMode-bg-primary focus-visible:ring-darkMode-button-primary-bg',
    },
    secondaryColor: {
      light: 'text-lightMode-button-secondary-color-fg hover:text-lightMode-button-secondary-color-fg_hover bg-white hover:bg-lightMode-button-secondary-color-bg_hover border border-lightMode-button-secondary-color-border hover:border-lightMode-button-secondary-color-border_hover focus:outline-none focus-visible:ring focus-visible:ring-offset-2 focus-visible:ring-offset-lightMode-bg-primary focus-visible:ring-lightMode-button-primary-bg',
      dark: 'text-darkMode-button-secondary-color-fg hover:text-darkMode-button-secondary-color-fg_hover bg-darkMode-button-secondary-color-bg hover:bg-darkMode-button-secondary-color-bg_hover border border-darkMode-button-secondary-color-border hover:border-darkMode-button-secondary-color-border_hover focus:outline-none focus-visible:ring focus-visible:ring-offset-2 focus-visible:ring-offset-darkMode-bg-primary focus-visible:ring-darkMode-button-primary-bg',
    },
    tertiaryGray: {
      light: 'text-lightMode-button-tertiary-fg hover:text-lightMode-button-tertiary-fg_hover hover:bg-lightMode-button-tertiary-bg_hover focus:outline-none focus-visible:ring focus-visible:ring-offset-2 focus-visible:ring-offset-lightMode-bg-primary focus-visible:ring-lightMode-button-primary-bg',
      dark: 'text-darkMode-button-tertiary-fg hover:text-darkMode-button-tertiary-fg_hover hover:bg-darkMode-button-tertiary-bg_hover focus:outline-none focus-visible:ring focus-visible:ring-offset-2 focus-visible:ring-offset-darkMode-bg-primary focus-visible:ring-darkMode-button-primary-bg',
    },
    tertiaryColor: {
      light: 'text-lightMode-button-tertiary-color-fg hover:text-lightMode-button-tertiary-color-fg_hover hover:bg-lightMode-button-tertiary-color-bg_hover focus:outline-none focus-visible:ring focus-visible:ring-offset-2 focus-visible:ring-offset-lightMode-bg-primary focus-visible:ring-lightMode-button-primary-bg',
      dark: 'text-darkMode-button-tertiary-color-fg hover:text-darkMode-button-tertiary-color-fg_hover hover:bg-darkMode-button-tertiary-color-bg_hover focus:outline-none focus-visible:ring focus-visible:ring-offset-2 focus-visible:ring-offset-darkMode-bg-primary focus-visible:ring-darkMode-button-primary-bg',
    },
    linkGray: {
      light: 'text-lightMode-button-tertiary-fg hover:text-lightMode-button-tertiary-fg_hover focus:outline-none focus-visible:ring focus-visible:ring-offset-2 focus-visible:ring-offset-lightMode-bg-primary focus-visible:ring-lightMode-button-primary-bg',
      dark: 'text-darkMode-button-tertiary-fg hover:text-darkMode-button-tertiary-fg_hover focus:outline-none focus-visible:ring focus-visible:ring-offset-2 focus-visible:ring-offset-darkMode-bg-primary focus-visible:ring-darkMode-button-primary-bg',
    },
    linkColor: {
      light: 'text-lightMode-button-tertiary-color-fg hover:text-lightMode-button-tertiary-color-fg_hover focus:outline-none focus-visible:ring focus-visible:ring-offset-2 focus-visible:ring-offset-lightMode-bg-primary focus-visible:ring-lightMode-button-primary-bg',
      dark: 'text-darkMode-button-tertiary-color-fg hover:text-darkMode-button-tertiary-color-fg_hover focus:outline-none focus-visible:ring focus-visible:ring-offset-2 focus-visible:ring-offset-darkMode-bg-primary focus-visible:ring-darkMode-button-primary-bg',
    },
  };

  // Get the styles for the selected variant and mode
  const variantStyles = variants[variant]?.[mode];

  return (
    <button
    onMouseDown={(e) => e.preventDefault()} // Prevent focus on mouse down
      className={cn(
        baseStyles,
        variant === 'linkGray' || variant === 'linkColor' ? linkStyles : sizeStyles[size],
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

export default ButtonNormal;
