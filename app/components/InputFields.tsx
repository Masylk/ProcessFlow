'use client';

import React, { useState } from 'react';
import { useTheme } from '@/app/theme/hooks';
import { InputTokens } from '@/app/theme/types';
import { cn } from '@/lib/utils';
import DynamicIcon from '../../utils/DynamicIcon';

// =======================================================
// Constant Styles
// =======================================================
const BASE_STYLES = {
  width: '100%',
  flex: 1,
  fontSize: 16,
  lineHeight: '24px',
  outline: 'none',
  border: 'none',
  background: 'transparent',
  padding: 0,
  margin: 0,
  boxSizing: 'border-box' as 'border-box',
  fontFamily: 'Inter, sans-serif',
  minWidth: 0, // Prevent input from overflowing its container
};

const SELECT_STYLE = {
  border: 'none',
  outline: 'none',
  background: 'transparent',
  fontSize: 14,
};

const DEFAULT_CONTAINER_STYLE: React.CSSProperties = {
  width: '100%',
  display: 'inline-flex',
  flexDirection: 'column',
  gap: 6,
};

// Leading-text variant styles
const LEADING_TEXT_OUTER = {
  width: 320,
  height: 92,
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  gap: 6,
  display: 'inline-flex',
};

const LEADING_TEXT_INNER = {
  alignSelf: 'stretch',
  height: 66,
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  gap: 6,
  display: 'flex',
};

const LEADING_TEXT_LABEL_CONTAINER = {
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  gap: 2,
  display: 'inline-flex',
};

const LEADING_TEXT_LABEL = {
  color: '#344054',
  fontSize: 14,
  fontFamily: 'Inter',
  fontWeight: 500,
  lineHeight: 20,
  wordWrap: 'break-word',
};

const LEADING_TEXT_ASTERISK = {
  color: '#4761C4',
  fontSize: 14,
  fontFamily: 'Inter',
  fontWeight: 500,
  lineHeight: 20,
  wordWrap: 'break-word',
};

const LEADING_TEXT_INPUT_CONTAINER = {
  alignSelf: 'stretch',
  background: 'white',
  boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.05)',
  borderRadius: 6,
  border: '1px #D0D5DD solid',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  display: 'inline-flex',
};

const LEADING_TEXT_PREFIX_CONTAINER = {
  paddingLeft: 12,
  paddingRight: 12,
  paddingTop: 8,
  paddingBottom: 8,
  borderTopLeftRadius: 6,
  borderTopRightRadius: 6,
  justifyContent: 'flex-start',
  alignItems: 'center',
  display: 'flex',
  background: 'white',
  border: `1px solid #D0D5DD`,
};

const LEADING_TEXT_PREFIX_TEXT = {
  color: '#475467',
  fontSize: 16,
  fontFamily: 'Inter',
  fontWeight: 400,
  lineHeight: 24,
  wordWrap: 'break-word',
};

const LEADING_TEXT_MAIN_INPUT_CONTAINER = {
  flex: '1 1 0',
  alignSelf: 'stretch',
  paddingLeft: 12,
  paddingRight: 12,
  paddingTop: 8,
  paddingBottom: 8,
  background: 'white',
  borderTopLeftRadius: 6,
  borderTopRightRadius: 6,
  overflow: 'hidden',
  border: `1px solid #D0D5DD`,
  justifyContent: 'flex-start',
  alignItems: 'center',
  gap: 8,
  display: 'flex',
};

const LEADING_TEXT_MAIN_INPUT_TEXT = {
  flex: '1 1 0',
  color: '#667085',
  fontSize: 16,
  fontFamily: 'Inter',
  fontWeight: 400,
  lineHeight: 24,
  wordWrap: 'break-word',
};

const LEADING_TEXT_HINT = {
  alignSelf: 'stretch',
  color: '#475467',
  fontSize: 14,
  fontFamily: 'Inter',
  fontWeight: 400,
  lineHeight: 20,
  wordWrap: 'break-word',
};

// =======================================================
// Types and Helper Components
// =======================================================
interface InputFieldProps {
  size?: 'small' | 'medium';
  type?:
    | 'default'
    | 'password'
    | 'icon-leading'
    | 'leading-dropdown'
    | 'trailing-dropdown'
    | 'leading-text'
    | 'payment-input'
    | 'tags'
    | 'trailing-button';
  destructive?: boolean;
  placeholder?: string;
  value?: string;
  label?: string;
  required?: boolean;
  hintText?: string;

  helpIcon?: boolean;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  errorMessage?: string;
  setError?: (message: string) => void;
  iconUrl?: string; // URL for the leading icon
  iconColor?: string; // Tailwind color class for the icon
  dropdownOptions?: string[];
  tooltipText?: string;
  mode?: 'light' | 'dark';
  dataTestId?: string;
}

const Tooltip: React.FC<{ text: string }> = ({ text }) => {
  const { getCssVariable } = useTheme();

  return (
    <div
      className="absolute z-10 invisible group-hover:visible bg-white dark:bg-gray-800 text-sm text-gray-500 px-2 py-1 rounded-md shadow-sm max-w-xs"
      style={{
        backgroundColor: getCssVariable('input-bg'),
        color: getCssVariable('input-hint'),
        borderColor: getCssVariable('input-border'),
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
  const { getCssVariable } = useTheme();

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
          d="M8.00004 14.6666C11.6819 14.6666 14.6667 11.6819 14.6667 7.99998C14.6667 4.31808 11.6819 1.33331 8.00004 1.33331C4.31814 1.33331 1.33337 4.31808 1.33337 7.99998C1.33337 11.6819 4.31814 14.6666 8.00004 14.6666Z"
          stroke={
            destructive
              ? getCssVariable('input-destructive-icon')
              : getCssVariable('input-icon')
          }
          strokeWidth="1.33333"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8 10.6667V8"
          stroke={
            destructive
              ? getCssVariable('input-destructive-icon')
              : getCssVariable('input-icon')
          }
          strokeWidth="1.33333"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8 5.33331H8.00667"
          stroke={
            destructive
              ? getCssVariable('input-destructive-icon')
              : getCssVariable('input-icon')
          }
          strokeWidth="1.33333"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {tooltipText && <Tooltip text={tooltipText} />}
    </div>
  );
};

const ErrorIcon: React.FC<{ tooltipText?: string }> = ({ tooltipText }) => {
  const { getCssVariable } = useTheme();

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
          d="M8.00004 14.6666C11.6819 14.6666 14.6667 11.6819 14.6667 7.99998C14.6667 4.31808 11.6819 1.33331 8.00004 1.33331C4.31814 1.33331 1.33337 4.31808 1.33337 7.99998C1.33337 11.6819 4.31814 14.6666 8.00004 14.6666Z"
          stroke={getCssVariable('input-destructive-icon')}
          strokeWidth="1.33333"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8 5.33331V7.99998"
          stroke={getCssVariable('input-destructive-icon')}
          strokeWidth="1.33333"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8 10.6667H8.00667"
          stroke={getCssVariable('input-destructive-icon')}
          strokeWidth="1.33333"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {tooltipText && <Tooltip text={tooltipText} />}
    </div>
  );
};

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
// Main Component
// =======================================================
const InputField: React.FC<InputFieldProps> = ({
  size = 'medium',
  type = 'default',
  destructive = false,
  placeholder = '',
  value = '',
  label = '',
  required = false,
  hintText = '',
  helpIcon = false,
  onChange,
  onBlur,
  onKeyDown,
  disabled = false,
  errorMessage = '',
  setError,
  iconUrl = '',
  iconColor = 'currentColor',
  dropdownOptions,
  tooltipText = 'Tooltips are used to describe or identify an element. In most scenarios, tooltips help the user understand meaning, function or alt-text.',
  mode = 'light',
  dataTestId = 'input-field',
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { getCssVariable } = useTheme();

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Clear any existing error when user starts typing
    if (setError && errorMessage) {
      setError('');
    }
    if (onChange) {
      onChange(e.target.value);
    }
  };

  const baseStyles = {
    backgroundColor: getCssVariable(
      getInputToken('normal', 'bg', destructive, disabled)
    ),
    color: getCssVariable(getInputToken('normal', 'fg', destructive, disabled)),
    borderColor: getCssVariable(
      getInputToken('normal', 'border', destructive, disabled)
    ),
  };

  const hoverStyles = {
    backgroundColor: getCssVariable(
      getInputToken('hover', 'bg', destructive, disabled)
    ),
    color: getCssVariable(getInputToken('hover', 'fg', destructive, disabled)),
    borderColor: getCssVariable(
      getInputToken('hover', 'border', destructive, disabled)
    ),
  };

  const focusStyles = {
    backgroundColor: getCssVariable(
      getInputToken('focus', 'bg', destructive, disabled)
    ),
    color: getCssVariable(getInputToken('focus', 'fg', destructive, disabled)),
    borderColor: getCssVariable(
      getInputToken('focus', 'border', destructive, disabled)
    ),
  };

  const labelStyles = {
    color: destructive
      ? getCssVariable('input-destructive-label')
      : disabled
        ? getCssVariable('input-disabled-label')
        : getCssVariable('input-label'),
  };

  const hintStyles = {
    color: destructive
      ? getCssVariable('input-destructive-hint')
      : getCssVariable('input-hint'),
  };

  const iconStyles = {
    color: destructive
      ? getCssVariable('input-destructive-icon')
      : disabled
        ? getCssVariable('input-disabled-fg')
        : getCssVariable('input-icon'),
  };

  const prefixStyles = {
    color: getCssVariable('input-prefix'),
  };

  const inputStyle = {
    ...BASE_STYLES,
    '::placeholder': {
      color: getCssVariable(
        disabled ? 'input-disabled-placeholder' : 'input-placeholder'
      ),
    },
  };

  const inputContainerStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    padding: '8px 12px',
    background: getCssVariable(
      getInputToken('normal', 'bg', destructive, disabled)
    ),
    borderLeft: `1px solid ${getCssVariable(getInputToken('normal', 'border', destructive, disabled))}`,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    zIndex: 1,
  };

  const renderInputContent = () => {
    switch (type) {
      case 'icon-leading':
      case 'default':
        return (
          <>
            {iconUrl && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <DynamicIcon url={iconUrl} color={iconStyles.color} size={16} />
              </div>
            )}
            <input
              data-testid={dataTestId}
              type="text"
              placeholder={placeholder}
              value={value}
              onChange={handleChange}
              onBlur={(e) => {
                handleBlur();
                onBlur?.();
              }}
              onKeyDown={(e) => onKeyDown?.(e)}
              disabled={disabled}
              onFocus={handleFocus}
              style={{
                ...inputStyle,
                width: '100%',
                flex: 1,
                fontSize: 16,
                lineHeight: '24px',
                outline: 'none',
                border: 'none',
                background: 'transparent',
                color: getCssVariable(
                  getInputToken('normal', 'fg', destructive, disabled)
                ),
              }}
            />
            {destructive && <ErrorIcon tooltipText={errorMessage} />}
            {helpIcon && !destructive && (
              <HelpIcon destructive={destructive} tooltipText={tooltipText} />
            )}
          </>
        );

      case 'leading-dropdown':
      case 'leading-text':
        return (
          <div style={DEFAULT_CONTAINER_STYLE}>
            <div
              style={{
                display: 'flex',
                width: '100%',
                height: 40,
                borderRadius: 6,
                overflow: 'visible',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px 12px',
                  background: getCssVariable(
                    getInputToken('normal', 'bg', destructive, disabled)
                  ),
                  border: `1px solid ${getCssVariable(getInputToken('normal', 'border', destructive, disabled))}`,
                  borderRight: 'none',
                  borderTopLeftRadius: 6,
                  borderBottomLeftRadius: 6,
                  position: 'relative',
                  minWidth: 80,
                  zIndex: 0,
                }}
              >
                {type === 'leading-dropdown' ? (
                  <>
                    <select
                      style={{
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        fontSize: 16,
                        color: getCssVariable(
                          getInputToken('normal', 'fg', destructive, disabled)
                        ),
                        cursor: 'pointer',
                        appearance: 'none',
                        fontFamily: 'Inter',
                        lineHeight: '24px',
                        paddingRight: 20,
                      }}
                      disabled={disabled}
                    >
                      {dropdownOptions?.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      )) || <option value="US">US</option>}
                    </select>
                    <div
                      style={{
                        position: 'absolute',
                        right: 12,
                        pointerEvents: 'none',
                      }}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                      >
                        <path
                          d="M5 7.5L10 12.5L15 7.5"
                          stroke={getCssVariable(
                            getInputToken('normal', 'fg', destructive, disabled)
                          )}
                          strokeWidth="1.66667"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </>
                ) : (
                  <div
                    style={{
                      color: getCssVariable(
                        getInputToken('normal', 'fg', destructive, disabled)
                      ),
                      fontSize: 16,
                      fontFamily: 'Inter',
                      lineHeight: '24px',
                    }}
                  >
                    app.process-flow.io/
                  </div>
                )}
              </div>
              <div
                style={{
                  ...focusStyles,
                  border: `1px solid ${
                    destructive
                      ? getCssVariable('input-destructive-border')
                      : isFocused
                        ? getCssVariable(
                            getInputToken(
                              'focus',
                              'border',
                              destructive,
                              disabled
                            )
                          )
                        : getCssVariable(
                            getInputToken(
                              'normal',
                              'border',
                              destructive,
                              disabled
                            )
                          )
                  }`,
                  borderTopLeftRadius: 0,
                  borderBottomLeftRadius: 0,
                  zIndex: 1,
                  flex: 1,
                }}
              >
                <input
                  data-testid={dataTestId}
                  type="text"
                  placeholder={
                    type === 'leading-text' ? 'www.example.com' : placeholder
                  }
                  value={value}
                  onChange={handleChange}
                  onBlur={(e) => {
                    handleBlur();
                    onBlur?.();
                  }}
                  onKeyDown={(e) => onKeyDown?.(e)}
                  disabled={disabled}
                  onFocus={handleFocus}
                  style={{
                    ...inputStyle,
                    width: '100%',
                    flex: 1,
                    fontSize: 16,
                    lineHeight: '24px',
                    outline: 'none',
                    border: 'none',
                    background: 'transparent',
                  }}
                />
                {destructive && <ErrorIcon tooltipText={errorMessage} />}
                {helpIcon && !destructive && (
                  <HelpIcon
                    destructive={destructive}
                    tooltipText={tooltipText}
                  />
                )}
              </div>
            </div>
          </div>
        );

      case 'trailing-dropdown':
        return (
          <div
            style={{
              display: 'flex',
              width: '100%',
              alignItems: 'center',
            }}
          >
            <input
              data-testid={dataTestId}
              type="text"
              placeholder={placeholder}
              value={value}
              onChange={handleChange}
              onBlur={(e) => {
                handleBlur();
                onBlur?.();
              }}
              onKeyDown={(e) => onKeyDown?.(e)}
              disabled={disabled}
              onFocus={handleFocus}
              style={{
                ...inputStyle,
                flex: 1,
                fontSize: 16,
                lineHeight: '24px',
                outline: 'none',
                border: 'none',
                background: 'transparent',
                color: getCssVariable(
                  getInputToken('normal', 'fg', destructive, disabled)
                ),
              }}
            />
            {destructive && <ErrorIcon tooltipText={errorMessage} />}
            {helpIcon && !destructive && (
              <HelpIcon destructive={destructive} tooltipText={tooltipText} />
            )}

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginLeft: 8,
              }}
            >
              <span
                style={{
                  color: getCssVariable(
                    getInputToken('normal', 'fg', destructive, disabled)
                  ),
                  fontSize: 16,
                  fontFamily: 'Inter',
                  fontWeight: 600,
                  lineHeight: '24px',
                  marginRight: 8,
                }}
              >
                {dropdownOptions && dropdownOptions.length > 0
                  ? dropdownOptions[0]
                  : 'can view'}
              </span>
              <div>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 7.5L10 12.5L15 7.5"
                    stroke={getCssVariable(
                      getInputToken('normal', 'fg', destructive, disabled)
                    )}
                    strokeWidth="1.6667"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        );

      case 'tags':
        return (
          <div
            style={{
              ...focusStyles,
              minHeight: size === 'small' ? 32 : 40,
              padding: '4px 8px',
              overflow: 'hidden',
              width: '100%',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                overflow: 'auto',
                overflowX: 'auto',
                overflowY: 'hidden',
                flex: '1 1 0',
                minWidth: 0,
              }}
            >
              {value
                .split(',')
                .filter((tag) => tag.trim() !== '')
                .map((tag, index) => (
                  <div
                    key={index}
                    style={{
                      background: getCssVariable(
                        getInputToken('normal', 'bg', destructive, disabled)
                      ),
                      borderRadius: 6,
                      padding: '2px 6px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      flexShrink: 0,
                      height: 24,
                      border: `1px solid ${getCssVariable(
                        getInputToken('normal', 'border', destructive, disabled)
                      )}`,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                      }}
                    >
                      <img
                        src="https://grzxiilmiwwwepaymqnu.supabase.co/storage/v1/object/public/public-assets/assets/shared_components/avatar-01.png"
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                        }}
                        alt=""
                      />
                      <span
                        style={{
                          color: getCssVariable(
                            getInputToken('normal', 'fg', destructive, disabled)
                          ),
                          fontSize: 14,
                          fontFamily: 'Inter',
                          fontWeight: '500',
                        }}
                      >
                        {tag}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent event from bubbling up
                        const tags = value
                          .split(',')
                          .filter((t) => t.trim() !== '');
                        tags.splice(index, 1);
                        onChange?.(tags.join(','));
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                      >
                        <path
                          d="M9 3L3 9M3 3L9 9"
                          stroke={getCssVariable(
                            getInputToken('normal', 'fg', destructive, disabled)
                          )}
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              <input
                data-testid={dataTestId}
                type="text"
                placeholder={value ? '' : placeholder}
                onKeyDown={(e) => {
                  onKeyDown?.(e);
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    const tagValue = e.currentTarget.value.trim();
                    if (tagValue) {
                      const newValue = value
                        ? `${value},${tagValue}`
                        : tagValue;
                      onChange?.(newValue);
                    }
                    e.currentTarget.value = '';
                  } else if (
                    e.key === 'Backspace' &&
                    e.currentTarget.value === ''
                  ) {
                    // Delete the last tag when pressing Backspace on empty input
                    e.preventDefault();
                    const tags = value
                      .split(',')
                      .filter((t) => t.trim() !== '');
                    if (tags.length > 0) {
                      tags.pop();
                      onChange?.(tags.join(','));
                    }
                  }
                }}
                disabled={disabled}
                onFocus={handleFocus}
                onBlur={(e) => {
                  handleBlur();
                  onBlur?.();
                }}
                style={{
                  ...inputStyle,
                  width: '100%',
                  flex: 1,
                  fontSize: 16,
                  lineHeight: '24px',
                  outline: 'none',
                  border: 'none',
                  background: 'transparent',
                  color: getCssVariable(
                    getInputToken('normal', 'fg', destructive, disabled)
                  ),
                  minWidth: '20px', // Ensure there's always space to type
                }}
              />
            </div>
          </div>
        );

      case 'trailing-button':
        return (
          <div style={DEFAULT_CONTAINER_STYLE}>
            <div
              style={{
                display: 'flex',
                width: '100%',
                height: 40,
                borderRadius: 6,
                overflow: 'visible',
                position: 'relative',
              }}
            >
              <div
                style={{
                  ...focusStyles,
                  borderRight: 'none',
                  borderTopRightRadius: 0,
                  borderBottomRightRadius: 0,
                  flex: 1,
                  position: 'relative',
                  zIndex: 2,
                }}
              >
                <input
                  data-testid={dataTestId}
                  type="text"
                  placeholder={placeholder}
                  value={value}
                  onChange={handleChange}
                  onBlur={(e) => {
                    handleBlur();
                    onBlur?.();
                  }}
                  onKeyDown={(e) => onKeyDown?.(e)}
                  disabled={disabled}
                  onFocus={handleFocus}
                  style={{
                    ...inputStyle,
                    width: '100%',
                    flex: 1,
                    fontSize: 16,
                    lineHeight: '24px',
                    outline: 'none',
                    border: 'none',
                    background: 'transparent',
                  }}
                />
                {destructive && <ErrorIcon tooltipText={errorMessage} />}
                {helpIcon && !destructive && (
                  <HelpIcon
                    destructive={destructive}
                    tooltipText={tooltipText}
                  />
                )}
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px 14px',
                  background: getCssVariable(
                    getInputToken('normal', 'bg', destructive, disabled)
                  ),
                  borderTop: `1px solid ${getCssVariable(getInputToken('normal', 'border', destructive, disabled))}`,
                  borderBottom: `1px solid ${getCssVariable(getInputToken('normal', 'border', destructive, disabled))}`,
                  borderRight: `1px solid ${getCssVariable(getInputToken('normal', 'border', destructive, disabled))}`,
                  borderTopRightRadius: 6,
                  borderBottomRightRadius: 6,
                  position: 'relative',
                  minWidth: 'fit-content',
                  cursor: value ? 'pointer' : 'not-allowed',
                  userSelect: 'none',
                  color: getCssVariable(
                    getInputToken('normal', 'fg', destructive, disabled)
                  ),
                  fontSize: 14,
                  fontFamily: 'Inter',
                  fontWeight: 500,
                  zIndex: 1,
                  opacity: value ? 1 : 0.5,
                }}
                onClick={() => {
                  if (value) {
                    navigator.clipboard.writeText(value);
                  }
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  {value && (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M13.3333 4L6 11.3333L2.66667 8"
                        stroke={getCssVariable(
                          getInputToken('normal', 'fg', destructive, disabled)
                        )}
                        strokeWidth="1.33333"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                  {value ? 'Copied!' : 'Copy'}
                </div>
              </div>
            </div>
          </div>
        );

      case 'password':
        return (
          <>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <DynamicIcon
                url={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/lock-01.svg`}
                color={iconStyles.color}
                size={16}
              />
            </div>
            <input
              data-testid={dataTestId}
              type={showPassword ? 'text' : 'password'}
              placeholder={placeholder}
              value={value}
              onChange={handleChange}
              onBlur={(e) => {
                handleBlur();
                onBlur?.();
              }}
              onKeyDown={(e) => onKeyDown?.(e)}
              disabled={disabled}
              onFocus={handleFocus}
              style={{
                ...inputStyle,
                width: '100%',
                flex: 1,
                fontSize: 16,
                lineHeight: '24px',
                outline: 'none',
                border: 'none',
                background: 'transparent',
                color: getCssVariable(
                  getInputToken('normal', 'fg', destructive, disabled)
                ),
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <DynamicIcon
                url={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/${showPassword ? 'eye-off' : 'eye'}.svg`}
                color={iconStyles.color}
                size={16}
              />
            </button>
            {destructive && <ErrorIcon tooltipText={errorMessage} />}
            {helpIcon && !destructive && (
              <HelpIcon destructive={destructive} tooltipText={tooltipText} />
            )}
          </>
        );

      default:
        return (
          <>
            {iconUrl && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <DynamicIcon url={iconUrl} color={iconStyles.color} size={20} />
              </div>
            )}
            <input
              data-testid={dataTestId}
              type="text"
              placeholder={placeholder}
              value={value}
              onChange={handleChange}
              onBlur={(e) => {
                handleBlur();
                onBlur?.();
              }}
              onKeyDown={(e) => onKeyDown?.(e)}
              disabled={disabled}
              onFocus={handleFocus}
              style={{
                ...inputStyle,
                width: '100%',
                flex: 1,
                fontSize: 16,
                lineHeight: '24px',
                outline: 'none',
                border: 'none',
                background: 'transparent',
                color: getCssVariable(
                  getInputToken('normal', 'fg', destructive, disabled)
                ),
              }}
            />
            {destructive && <ErrorIcon tooltipText={errorMessage} />}
            {helpIcon && !destructive && (
              <HelpIcon destructive={destructive} tooltipText={tooltipText} />
            )}
          </>
        );
    }
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <div style={{ display: 'inline-flex', flexDirection: 'row', gap: 2 }}>
          <div className={cn('font-medium text-sm')} style={labelStyles}>
            {label}
          </div>
          {required && (
            <div
              className={cn('text-sm font-medium')}
              style={{
                color: getCssVariable(
                  getInputToken('normal', 'fg', destructive, disabled)
                ),
              }}
            >
              *
            </div>
          )}
        </div>
      )}
      <div
        style={
          {
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 12px',
            width: '100%',
            background: getCssVariable(
              getInputToken('normal', 'bg', destructive, disabled)
            ),
            borderRadius: 6,
            border: `1px solid ${
              destructive
                ? getCssVariable('input-destructive-border')
                : isFocused
                  ? getCssVariable(
                      getInputToken('focus', 'border', destructive, disabled)
                    )
                  : getCssVariable(
                      getInputToken('normal', 'border', destructive, disabled)
                    )
            }`,
            boxShadow: isFocused
              ? destructive
                ? '0px 0px 0px 4px rgba(253, 139, 139, 0.12)'
                : '0px 0px 0px 4px rgba(78,107,215,0.12)'
              : '0px 1px 2px rgba(16, 24, 40, 0.05)',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          } as React.CSSProperties
        }
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            width: '100%',
            position: 'relative',
          }}
        >
          {renderInputContent()}
        </div>
      </div>
      {hintText && (
        <div
          className={cn(
            'text-sm leading-5',
            destructive ? 'text-red-500' : 'text-gray-600'
          )}
          style={hintStyles}
        >
          {hintText}
        </div>
      )}
      {errorMessage && (
        <div
          style={{
            color: getCssVariable('input-destructive-fg'),
            fontSize: 14,
            fontFamily: 'Inter',
            fontWeight: 400,
            lineHeight: '20px',
            marginTop: 6,
          }}
        >
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export default InputField;
