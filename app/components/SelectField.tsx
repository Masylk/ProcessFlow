'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useColors, useTheme } from '@/app/theme/hooks';
import { useTheme as useThemeHook } from '@/app/theme/hooks';
import { InputTokens } from '@/app/theme/types';
import { cn } from '@/lib/utils';

interface SelectFieldProps {
  label?: string;
  required?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  errorMessage?: string;
  className?: string;
  options?: string[];
  allowCustomInput?: boolean;
}

const getInputToken = (state: 'normal' | 'hover' | 'focus', type: 'bg' | 'fg' | 'border', destructive: boolean = false, disabled: boolean = false): keyof InputTokens => {
  if (disabled) {
    return `input-disabled-${type}` as keyof InputTokens;
  }
  
  const prefix = destructive ? 'input-destructive-' : 'input-';
  const suffix = state === 'normal' ? '' : `-${state}`;
  return `${prefix}${type}${suffix}` as keyof InputTokens;
};

/**
 * A select field component that allows both selection from predefined options
 * and custom input, integrating with the existing theme system
 */
const SelectField: React.FC<SelectFieldProps> = ({
  label,
  required = false,
  value = '',
  onChange,
  placeholder = 'Select or type...',
  disabled = false,
  errorMessage = '',
  className = '',
  options = [],
  allowCustomInput = true,
}) => {
  const colors = useColors();
  const { getCssVariable } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const destructive = !!errorMessage;

  // Filter options based on input value
  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(inputValue.toLowerCase())
  );

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFocus = () => {
    setIsFocused(true);
    if (options.length > 0) {
      setIsOpen(true);
    }
  };

  const handleBlur = () => {
    // Don't close immediately to allow option selection
    setTimeout(() => {
      setIsFocused(false);
    }, 150);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    if (onChange && allowCustomInput) {
      onChange(newValue);
    }
    if (options.length > 0) {
      setIsOpen(true);
    }
  };

  const handleOptionSelect = (option: string) => {
    setInputValue(option);
    if (onChange) {
      onChange(option);
    }
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' && filteredOptions.length > 0) {
      e.preventDefault();
      setIsOpen(true);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'Enter' && filteredOptions.length === 1) {
      e.preventDefault();
      handleOptionSelect(filteredOptions[0]);
    }
  };

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 6,
    width: '100%',
    position: 'relative' as const,
  };

  const labelStyle = {
    color: errorMessage
      ? getCssVariable('input-destructive-label')
      : disabled
      ? getCssVariable('input-disabled-label')
      : getCssVariable('input-label'),
    fontSize: 14,
    fontWeight: 600,
    lineHeight: '20px',
    fontFamily: 'Inter',
  };

  const inputContainerStyle = {
    position: 'relative' as const,
    width: '100%',
  };

  const inputStyle = {
    width: '100%',
    padding: '8px 40px 8px 12px',
    fontSize: 16,
    lineHeight: '24px',
    fontFamily: 'Inter',
    borderRadius: 6,
    border: `1px solid ${
      destructive 
        ? getCssVariable('input-destructive-border')
        : isFocused 
          ? getCssVariable(getInputToken('focus', 'border', destructive, disabled))
          : getCssVariable(getInputToken('normal', 'border', destructive, disabled))
    }`,
    backgroundColor: disabled
      ? getCssVariable('input-disabled-bg')
      : getCssVariable(getInputToken('normal', 'bg', destructive, disabled)),
    color: disabled
      ? getCssVariable('input-disabled-fg')
      : getCssVariable(getInputToken('normal', 'fg', destructive, disabled)),
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxShadow: isFocused
      ? destructive
        ? '0px 0px 0px 4px rgba(253, 139, 139, 0.12)'
        : '0px 0px 0px 4px rgba(78, 107, 215, 0.12)'
      : '0px 1px 2px rgba(16, 24, 40, 0.05)',
  };

  const dropdownStyle = {
    position: 'absolute' as const,
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: colors['bg-primary'],
    border: `1px solid ${colors['border-primary']}`,
    borderRadius: 6,
    marginTop: 2,
    maxHeight: 200,
    overflowY: 'auto' as const,
    zIndex: 1000,
    boxShadow: '0px 4px 6px -2px rgba(16, 24, 40, 0.03), 0px 12px 16px -4px rgba(16, 24, 40, 0.08)',
  };

  const optionStyle = {
    padding: '8px 12px',
    cursor: 'pointer',
    fontSize: 14,
    fontFamily: 'Inter',
    color: colors['text-primary'],
    transition: 'background-color 0.2s',
  };

  const errorStyle = {
    color: getCssVariable('input-destructive-fg'),
    fontSize: 14,
    marginTop: 6,
  };

  return (
    <div ref={containerRef} style={containerStyle} className={className}>
      {label && (
        <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <span style={labelStyle}>
            {label}
          </span>
          {required && (
            <span style={{ color: colors['text-accent'], fontSize: 14, fontWeight: 600 }}>
              *
            </span>
          )}
        </div>
      )}
      
      <div style={inputContainerStyle}>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          style={inputStyle}
          className={cn(
            "w-full transition-all duration-200",
            disabled && "cursor-not-allowed"
          )}
        />
        
        {/* Dropdown arrow */}
        {options.length > 0 && (
          <div
            style={{
              position: 'absolute',
              right: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              color: colors['text-tertiary'],
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              style={{
                transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
              }}
            >
              <path
                d="M5 7.5L10 12.5L15 7.5"
                stroke="currentColor"
                strokeWidth="1.66667"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Dropdown options */}
      {isOpen && filteredOptions.length > 0 && (
        <div style={dropdownStyle}>
          {filteredOptions.map((option, index) => (
            <div
              key={index}
              style={optionStyle}
              onMouseDown={(e) => {
                e.preventDefault();
                handleOptionSelect(option);
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors['bg-hover'];
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {option}
            </div>
          ))}
        </div>
      )}

      {errorMessage && (
        <div style={errorStyle}>
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export default SelectField; 