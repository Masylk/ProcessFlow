'use client';

import { cn } from '@/lib/utils/cn';
import { useState, useMemo } from 'react';
import { useColors } from '@/app/theme/hooks';
import { InputTokens } from '@/app/theme/types';

// =======================================================
// Helper Functions
// =======================================================
const getInputToken = (
  state: 'normal' | 'hover' | 'focus',
  type: 'bg' | 'fg' | 'border',
  destructive: boolean = false,
  disabled: boolean = false
): keyof InputTokens => {
  if (disabled) {
    return `input-disabled-${type}` as keyof InputTokens;
  }

  const prefix = destructive ? 'input-destructive-' : 'input-';
  const suffix = state === 'normal' ? '' : `-${state}`;
  return `${prefix}${type}${suffix}` as keyof InputTokens;
};

// =======================================================
// Types
// =======================================================
interface TextAreaInputProps {
  label?: string;
  required?: boolean;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  hintText?: string;
  helpIcon?: boolean;
  disabled?: boolean;
  errorMessage?: string;
  tooltipText?: string;
  rows?: number;
  destructive?: boolean;
}

// =======================================================
// Helper Components
// =======================================================
const Tooltip: React.FC<{ text: string }> = ({ text }) => {
  const colors = useColors();

  return (
    <div
      className="absolute z-10 invisible group-hover:visible bg-white dark:bg-gray-800 text-sm text-gray-500 px-2 py-1 rounded-md shadow-sm max-w-xs"
      style={{
        backgroundColor: colors['bg-primary'],
        color: colors['text-secondary'],
        borderColor: colors['border-secondary'],
        borderWidth: '1px',
      }}
    >
      {text}
    </div>
  );
};

const HelpIcon: React.FC<{ destructive?: boolean; tooltipText?: string }> = ({
  destructive,
  tooltipText,
}) => {
  const colors = useColors();

  return (
    <div className="group relative inline-block ml-1">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <g clipPath="url(#clip0_helpIcon)">
          <path
            d="M6.05992 5.99998C6.21665 5.55442 6.52602 5.17872 6.93322 4.9394C7.34042 4.70009 7.81918 4.61261 8.2847 4.69245C8.75022 4.7723 9.17246 5.01433 9.47664 5.37567C9.78081 5.737 9.94729 6.19433 9.94659 6.66665C9.94659 7.99998 7.94659 8.66665 7.94659 8.66665M7.99992 11.3333H8.00659M14.6666 7.99998C14.6666 11.6819 11.6818 14.6666 7.99992 14.6666C4.31802 14.6666 1.33325 11.6819 1.33325 7.99998C1.33325 4.31808 4.31802 1.33331 7.99992 1.33331C11.6818 1.33331 14.6666 4.31808 14.6666 7.99998Z"
            stroke={
              destructive
                ? colors['text-destructive']
                : colors['text-secondary']
            }
            strokeWidth="1.33333"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
        <defs>
          <clipPath id="clip0_helpIcon">
            <rect width="16" height="16" fill="white" />
          </clipPath>
        </defs>
      </svg>
      {tooltipText && <Tooltip text={tooltipText} />}
    </div>
  );
};

const ErrorIcon: React.FC<{ tooltipText?: string }> = ({ tooltipText }) => {
  const colors = useColors();

  return (
    <div className="group relative inline-block ml-1">
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M8 5.33333V8M8 10.6667H8.00667M14.6667 8C14.6667 11.6819 11.6819 14.6667 8 14.6667C4.31811 14.6667 1.33334 11.6819 1.33334 8C1.33334 4.31811 4.31811 1.33334 8 1.33334C11.6819 1.33334 14.6667 4.31811 14.6667 8Z"
          stroke={colors['text-destructive']}
          strokeWidth="1.33333"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {tooltipText && <Tooltip text={tooltipText} />}
    </div>
  );
};

// =======================================================
// Main Component
// =======================================================
const TextAreaInput: React.FC<TextAreaInputProps> = ({
  label = '',
  required = false,
  placeholder = '',
  value = '',
  onChange,
  hintText = '',
  helpIcon = false,
  disabled = false,
  errorMessage = '',
  tooltipText = '',
  rows = 4,
  destructive = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const colors = useColors();

  const baseStyles = {
    backgroundColor:
      colors[getInputToken('normal', 'bg', destructive, disabled)],
    color: colors[getInputToken('normal', 'fg', destructive, disabled)],
    borderColor:
      colors[getInputToken('normal', 'border', destructive, disabled)],
  };

  const hoverStyles = {
    backgroundColor:
      colors[getInputToken('hover', 'bg', destructive, disabled)],
    color: colors[getInputToken('hover', 'fg', destructive, disabled)],
    borderColor:
      colors[getInputToken('hover', 'border', destructive, disabled)],
  };

  const focusStyles = {
    backgroundColor:
      colors[getInputToken('focus', 'bg', destructive, disabled)],
    color: colors[getInputToken('focus', 'fg', destructive, disabled)],
    borderColor:
      colors[getInputToken('focus', 'border', destructive, disabled)],
  };

  const labelStyles = {
    color: destructive
      ? colors['input-destructive-label']
      : disabled
        ? colors['input-disabled-label']
        : colors['input-label'],
  };

  const hintStyles = {
    color: destructive
      ? colors['input-destructive-hint']
      : colors['input-hint'],
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <div className="flex gap-2 items-center">
          <span style={labelStyles} className="text-sm font-semibold">
            {label}
          </span>
          {required && (
            <span
              style={{
                color: destructive
                  ? colors['text-destructive']
                  : colors['text-primary'],
              }}
              className="text-sm font-semibold"
            >
              *
            </span>
          )}
        </div>
      )}

      <div
        style={{
          ...baseStyles,
          borderColor: isFocused
            ? colors[getInputToken('focus', 'border', destructive, disabled)]
            : colors[getInputToken('normal', 'border', destructive, disabled)],
          boxShadow: isFocused
            ? destructive
              ? '0px 0px 0px 4px rgba(253, 139, 139, 0.12)'
              : '0px 0px 0px 4px rgba(78,107,215,0.12)'
            : '0px 1px 2px rgba(16, 24, 40, 0.05)',
          zIndex: 0,
        }}
        className="relative flex items-start gap-2 p-3 rounded-lg border transition-all duration-200 hover:bg-[var(--hover-bg)]"
      >
        <textarea
          className="w-full border-none outline-none bg-transparent resize-vertical text-base leading-6 font-inter"
          style={{
            minHeight: `${rows * 24}px`,
            color: colors[getInputToken('normal', 'fg', destructive, disabled)],
            paddingRight: helpIcon || destructive ? '32px' : '14px',
          }}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
        />
        <div className="absolute top-3 right-3">
          {destructive ? (
            <ErrorIcon tooltipText={errorMessage} />
          ) : (
            helpIcon && (
              <HelpIcon tooltipText={tooltipText} destructive={destructive} />
            )
          )}
        </div>
      </div>

      {(hintText || errorMessage) && (
        <div style={hintStyles} className="text-sm">
          {errorMessage || hintText}
        </div>
      )}
    </div>
  );
};

export default TextAreaInput;
