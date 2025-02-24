'use client';

import { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';
import DynamicIcon from '../../utils/DynamicIcon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondaryGray' | 'secondaryColor' | 'tertiaryGray' | 'tertiaryColor' | 'linkGray' | 'linkColor';
  isLoading?: boolean;
  loadingText?: string;
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
  loadingText = 'Loading...',
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

  // Add disabled styles
  const disabledStyles = 'opacity-50 saturate-50 cursor-not-allowed';

   // Override styles for links (no padding, no background, and underline)
   const linkStyles = 'font-normal transition-all self-stretch';

  // Define size styles
  const sizeStyles = {
    small: iconOnly ? 'p-2' : 'px-3 py-2 text-sm gap-1 font-normal rounded-md',
    medium: iconOnly ? 'p-2.5' : 'px-3.5 py-2.5 text-base gap-1 font-medium rounded-md',
    large: iconOnly ? 'p-3' : 'px-4 py-2.5 text-lg gap-2 font-semibold rounded-md',
  };

  // Define variant styles with light and dark mode
  const variants = {
    primary: {
      light: `text-white bg-lightMode-button-primary-bg border border-lightMode-button-primary-bg shadow-[0px 1px 2px rgba(0, 0, 0, 0.09)] focus:outline-none focus-visible:ring focus-visible:ring-offset-2 focus-visible:ring-offset-lightMode-bg-primary focus-visible:ring-lightMode-button-primary-bg ${!props.disabled && 'hover:bg-[#4761C4]'}`,
      dark: `text-white bg-lightMode-button-primary-bg border border-lightMode-button-primary-bg shadow-[0px 1px 2px rgba(0, 0, 0, 0.09)] focus:outline-none focus-visible:ring focus-visible:ring-offset-2 focus-visible:ring-offset-darkMode-bg-primary focus-visible:ring-darkMode-button-primary-bg ${!props.disabled && 'hover:bg-[#5D7AE2]'}`,
    },
    secondaryGray: {
      light: `text-lightMode-button-secondary-fg bg-white border border-[#d0d5dd] focus:outline-none focus-visible:ring focus-visible:ring-offset-2 focus-visible:ring-offset-lightMode-bg-primary focus-visible:ring-lightMode-button-primary-bg ${!props.disabled && 'hover:text-lightMode-text-secondary_hover hover:bg-gray-100'}`,
      dark: `text-darkMode-button-secondary-fg bg-darkMode-button-secondary-bg border border-darkMode-button-secondary-border focus:outline-none focus-visible:ring focus-visible:ring-offset-2 focus-visible:ring-offset-darkMode-bg-primary focus-visible:ring-darkMode-button-primary-bg ${!props.disabled && 'hover:text-darkMode-text-secondary_hover hover:bg-darkMode-button-secondary-bg_hover'}`,
    },
    secondaryColor: {
      light: `text-lightMode-button-secondary-color-fg bg-white border border-lightMode-button-secondary-color-border focus:outline-none focus-visible:ring focus-visible:ring-offset-2 focus-visible:ring-offset-lightMode-bg-primary focus-visible:ring-lightMode-button-primary-bg ${!props.disabled && 'hover:text-lightMode-button-secondary-color-fg_hover hover:bg-lightMode-button-secondary-color-bg_hover hover:border-lightMode-button-secondary-color-border_hover'}`,
      dark: `text-darkMode-button-secondary-color-fg bg-darkMode-button-secondary-color-bg border border-darkMode-button-secondary-color-border focus:outline-none focus-visible:ring focus-visible:ring-offset-2 focus-visible:ring-offset-darkMode-bg-primary focus-visible:ring-darkMode-button-primary-bg ${!props.disabled && 'hover:text-darkMode-button-secondary-color-fg_hover hover:bg-darkMode-button-secondary-color-bg_hover hover:border-darkMode-button-secondary-color-border_hover'}`,
    },
    tertiaryGray: {
      light: `text-lightMode-button-tertiary-fg focus:outline-none focus-visible:ring focus-visible:ring-offset-2 focus-visible:ring-offset-lightMode-bg-primary focus-visible:ring-lightMode-button-primary-bg ${!props.disabled && 'hover:text-lightMode-button-tertiary-fg_hover hover:bg-lightMode-button-tertiary-bg_hover'}`,
      dark: `text-darkMode-button-tertiary-fg focus:outline-none focus-visible:ring focus-visible:ring-offset-2 focus-visible:ring-offset-darkMode-bg-primary focus-visible:ring-darkMode-button-primary-bg ${!props.disabled && 'hover:text-darkMode-button-tertiary-fg_hover hover:bg-darkMode-button-tertiary-bg_hover'}`,
    },
    tertiaryColor: {
      light: `text-lightMode-button-tertiary-color-fg focus:outline-none focus-visible:ring focus-visible:ring-offset-2 focus-visible:ring-offset-lightMode-bg-primary focus-visible:ring-lightMode-button-primary-bg ${!props.disabled && 'hover:text-lightMode-button-tertiary-color-fg_hover hover:bg-lightMode-button-tertiary-color-bg_hover'}`,
      dark: `text-darkMode-button-tertiary-color-fg focus:outline-none focus-visible:ring focus-visible:ring-offset-2 focus-visible:ring-offset-darkMode-bg-primary focus-visible:ring-darkMode-button-primary-bg ${!props.disabled && 'hover:text-darkMode-button-tertiary-color-fg_hover hover:bg-darkMode-button-tertiary-color-bg_hover'}`,
    },
    linkGray: {
      light: `text-lightMode-button-tertiary-fg focus:outline-none focus-visible:ring focus-visible:ring-offset-2 focus-visible:ring-offset-lightMode-bg-primary focus-visible:ring-lightMode-button-primary-bg ${!props.disabled && 'hover:text-lightMode-button-tertiary-fg_hover'}`,
      dark: `text-darkMode-button-tertiary-fg focus:outline-none focus-visible:ring focus-visible:ring-offset-2 focus-visible:ring-offset-darkMode-bg-primary focus-visible:ring-darkMode-button-primary-bg ${!props.disabled && 'hover:text-darkMode-button-tertiary-fg_hover'}`,
    },
    linkColor: {
      light: `text-lightMode-button-tertiary-color-fg focus:outline-none focus-visible:ring focus-visible:ring-offset-2 focus-visible:ring-offset-lightMode-bg-primary focus-visible:ring-lightMode-button-primary-bg ${!props.disabled && 'hover:text-lightMode-button-tertiary-color-fg_hover'}`,
      dark: `text-darkMode-button-tertiary-color-fg focus:outline-none focus-visible:ring focus-visible:ring-offset-2 focus-visible:ring-offset-darkMode-bg-primary focus-visible:ring-darkMode-button-primary-bg ${!props.disabled && 'hover:text-darkMode-button-tertiary-color-fg_hover'}`,
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
        (isLoading || props.disabled) && disabledStyles // Apply disabled styles for both loading and disabled states
      )}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <svg
            className={`animate-spin h-4 w-4 ${
              variant === 'primary' ? 'text-white' : 
              variant.includes('Gray') ? 'text-[#344054]' :
              variant.includes('Color') ? 'text-lightMode-button-primary-bg' :
              'text-lightMode-button-primary-bg'
            }`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {!iconOnly && <span>{loadingText}</span>}
        </div>
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
