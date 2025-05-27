'use client';

import { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';
import DynamicIcon from '../../utils/DynamicIcon';
import { useTheme } from '@/app/theme/hooks';
import { ButtonTokens } from '@/app/theme/types';
import React from 'react';

interface ButtonDestructiveProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'link';
  isLoading?: boolean;
  size?: 'small' | 'medium' | 'large';
  leadingIcon?: string;
  trailingIcon?: string;
  iconOnly?: boolean;
  iconColor?: string;
}

const ButtonDestructive: React.FC<ButtonDestructiveProps> = ({
  variant = 'primary',
  isLoading = false,
  size = 'medium',
  className,
  children,
  leadingIcon,
  trailingIcon,
  iconColor = 'currentColor',
  iconOnly = false,
  ...props
}) => {
  const { getCssVariable } = useTheme();
  
  const baseStyles = variant === 'link' 
      ? 'flex items-center'
      : 'font-semibold rounded-lg flex items-center justify-center';
  const disabledStyles = 'opacity-50 saturate-50 cursor-not-allowed hover:bg-transparent hover:text-inherit hover:border-inherit';
  const linkStyles = 'font-normal transition-all self-stretch';

  const sizeStyles = {
    small: iconOnly ? 'p-2 w-8 h-8 flex items-center justify-center' : variant === 'link' ? 'text-sm font-normal gap-1' : 'px-3 py-2 text-sm gap-1 font-normal rounded-md',
    medium: iconOnly ? 'p-2.5 w-10 h-10 flex items-center justify-center' : variant === 'link' ? 'text-base font-medium gap-1' : 'px-3.5 py-2.5 text-base gap-1 font-medium rounded-md',
    large: iconOnly ? 'p-3 w-12 h-12 flex items-center justify-center' : variant === 'link' ? 'text-lg font-semibold gap-2' : 'px-4 py-2.5 text-lg gap-2 font-semibold rounded-md',
  };

  const getButtonToken = (variant: string, type: 'bg' | 'fg' | 'border', state: 'normal' | 'hover' = 'normal'): keyof ButtonTokens => {
    const suffix = state === 'hover' ? '-hover' : '';
    return `button-destructive-${variant}-${type}${suffix}` as keyof ButtonTokens;
  };

  const getVariantStyles = () => {
    const variantMap = {
      'primary': 'primary',
      'secondary': 'secondary',
      'tertiary': 'tertiary',
      'link': 'tertiary'
    } as const;

    const mappedVariant = variantMap[variant];
    const buttonId = `btn-destructive-${variant}`;

    // Special handling for link variants
    if (variant === 'link') {
      return {
        id: buttonId,
        style: {
          backgroundColor: 'transparent',
          color: getCssVariable(getButtonToken('tertiary', 'fg')),
          borderWidth: '0',
          padding: '0',
        },
        hoverStyle: `
          #${buttonId}:not(:disabled):hover {
            color: ${getCssVariable(getButtonToken('tertiary', 'fg', 'hover'))} !important;
            background-color: transparent !important;
          }
        `
      };
    }

    const normalBg = getCssVariable(getButtonToken(mappedVariant, 'bg'));
    const normalColor = getCssVariable(getButtonToken(mappedVariant, 'fg'));
    const normalBorder = getCssVariable(getButtonToken(mappedVariant, 'border'));
    const hoverBg = getCssVariable(getButtonToken(mappedVariant, 'bg', 'hover'));
    const hoverColor = getCssVariable(getButtonToken(mappedVariant, 'fg', 'hover'));
    const hoverBorder = getCssVariable(getButtonToken(mappedVariant, 'border', 'hover'));

    return {
      id: buttonId,
      style: {
        backgroundColor: normalBg,
        color: normalColor,
        borderColor: normalBorder,
        borderWidth: mappedVariant !== 'tertiary' ? '1px' : '0',
      },
      hoverStyle: `
        #${buttonId}:not(:disabled):hover {
          background-color: ${hoverBg} !important;
          color: ${hoverColor} !important;
          border-color: ${hoverBorder} !important;
        }
      `
    };
  };

  const { id, style, hoverStyle } = getVariantStyles();

  // Map button variants to icon variants
  const getIconVariant = () => {
    // Since we're using currentColor, we can use 'default' for most cases
    // This allows the icon to inherit the button's text color properly
    const variantMap: Record<string, 'default' | 'primary' | 'secondary' | 'tertiary' | 'tertiary-color' | 'success' | 'warning' | 'error' | 'info'> = {
      'primary': 'default',
      'secondary': 'default', 
      'tertiary': 'default',
      'link': 'default',
    };
    return variantMap[variant] || 'default';
  };
  
  const iconVariant = getIconVariant();

  // Add hover state tracking
  const [isHovered, setIsHovered] = React.useState(false);

  // Determine icon color based on variant
  const getIconDisplayColor = () => {
    // If a custom iconColor is provided and it's not 'currentColor', use it
    if (iconColor !== 'currentColor') {
      return iconColor;
    }
    // For all variants, use 'currentColor' to inherit the button's text color
    return 'currentColor';
  };

  // Add transition override to button style
  const buttonStyle = {
    ...style,
    transition: 'none !important',
  };

  return (
    <>
      <style>{hoverStyle}</style>
      <button
        id={id}
        onMouseDown={(e) => e.preventDefault()}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          baseStyles,
          variant === 'link' ? linkStyles : sizeStyles[size],
          className,
          (isLoading || props.disabled) && disabledStyles,
          'transform transition-all duration-200 ease-in-out hover:scale-[0.98] active:scale-[0.96]'
        )}
        style={buttonStyle}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4"
              style={{ color: getCssVariable('button-loading-spinner') }}
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
            {!iconOnly && <span>Loading...</span>}
          </div>
        ) : (
          <>
            {leadingIcon && !iconOnly && (
              <DynamicIcon 
                url={leadingIcon} 
                color={getIconDisplayColor()} 
                variant={iconVariant}
                size={20}
                isHovered={isHovered}
              />
            )}
            {!iconOnly && <span>{children}</span>}
            {trailingIcon && !iconOnly && (
              <DynamicIcon 
                url={trailingIcon} 
                color={getIconDisplayColor()} 
                variant={iconVariant}
                size={20}
                isHovered={isHovered}
              />
            )}
            {iconOnly && leadingIcon && (
              <DynamicIcon 
                url={leadingIcon} 
                color={getIconDisplayColor()} 
                variant={iconVariant}
                size={size === 'small' ? 16 : size === 'medium' ? 20 : 24}
                isHovered={isHovered}
                className="flex-shrink-0"
              />
            )}
          </>
        )}
      </button>
    </>
  );
};

export default ButtonDestructive;
