'use client';

import { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';
import DynamicIcon from '../../utils/DynamicIcon';
import { useTheme } from '@/app/theme/hooks';
import { ButtonTokens } from '@/app/theme/types';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'secondary-color' | 'tertiary' | 'tertiary-color' | 'link' | 'link-color';
  isLoading?: boolean;
  loadingText?: string;
  size?: 'small' | 'medium' | 'large';
  leadingIcon?: string;
  trailingIcon?: string;
  iconOnly?: boolean;
  iconColor?: string;
}

const ButtonNormal: React.FC<ButtonProps> = ({
  variant = 'primary',
  isLoading = false,
  loadingText = 'Loading...',
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
  
  const baseStyles = 'font-semibold transition-colors duration-200 rounded-lg flex items-center justify-center gap-2';
  const disabledStyles = 'opacity-50 saturate-50 cursor-not-allowed hover:bg-transparent hover:text-inherit hover:border-inherit';
  const linkStyles = 'font-normal transition-all self-stretch';

  const sizeStyles = {
    small: iconOnly ? 'p-2' : 'px-3 py-2 text-sm gap-1 font-normal rounded-md',
    medium: iconOnly ? 'p-2.5' : 'px-3.5 py-2.5 text-base gap-1 font-medium rounded-md',
    large: iconOnly ? 'p-3' : 'px-4 py-2.5 text-lg gap-2 font-semibold rounded-md',
  };

  const getButtonToken = (variant: string, type: 'bg' | 'fg' | 'border', state: 'normal' | 'hover' = 'normal'): keyof ButtonTokens => {
    const suffix = state === 'hover' ? '-hover' : '';
    return `button-${variant}-${type}${suffix}` as keyof ButtonTokens;
  };

  const getVariantStyles = () => {
    const variantMap = {
      'primary': 'primary',
      'secondary': 'secondary',
      'secondary-color': 'secondary-color',
      'tertiary': 'tertiary',
      'tertiary-color': 'tertiary-color',
      'link': 'tertiary',
      'link-color': 'tertiary-color'
    } as const;

    const mappedVariant = variantMap[variant];
    const buttonId = `btn-${variant}`;

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
        borderWidth: variant !== 'tertiary' && variant !== 'tertiary-color' ? '1px' : '0',
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

  return (
    <>
      <style>{hoverStyle}</style>
      <button
        id={id}
        onMouseDown={(e) => e.preventDefault()}
        className={cn(
          baseStyles,
          variant.startsWith('link') ? linkStyles : sizeStyles[size],
          className,
          (isLoading || props.disabled) && disabledStyles
        )}
        style={style}
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
    </>
  );
};

export default ButtonNormal;
