'use client';

import { cn } from "@/lib/utils/cn";
import { useState, useMemo, useRef, useEffect } from "react";
import theme from "@/theme";

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
  mode?: 'light' | 'dark';
  rows?: number;
  destructive?: boolean;
}

// =======================================================
// Helper Components
// =======================================================
const Tooltip: React.FC<{ text: string; mode?: 'light' | 'dark' }> = ({ text, mode = 'light' }) => {
  return (
    <div style={{
      background: mode === 'dark' 
        ? theme.colors["Gray (dark mode)/950"]
        : theme.colors["Gray (light mode)/900"],
      padding: '12px 16px',
      borderRadius: 8,
      width: '25ch',
      boxShadow: mode === 'dark' 
        ? '0px 4px 6px -2px rgba(0, 0, 0, 0.2)' 
        : '0px 4px 6px -2px rgba(16, 24, 40, 0.05)',
      color: mode === 'dark' 
        ? theme.colors["Gray (dark mode)/50"]
        : theme.colors["Base/White"],
      fontSize: 14,
      fontFamily: 'Inter',
      lineHeight: '20px',
      position: 'relative',
      border: mode === 'dark' 
        ? `1px solid ${theme.colors["Gray (dark mode)/700"]}` 
        : 'none',
    }}>
      <div style={{
        position: 'absolute',
        bottom: -4,
        right: 8,
        width: 8,
        height: 8,
        background: mode === 'dark' 
          ? theme.colors["Gray (dark mode)/950"]
          : theme.colors["Gray (light mode)/900"],
        transform: 'rotate(45deg)',
        borderRight: mode === 'dark' 
          ? `1px solid ${theme.colors["Gray (dark mode)/700"]}` 
          : 'none',
        borderBottom: mode === 'dark' 
          ? `1px solid ${theme.colors["Gray (dark mode)/700"]}` 
          : 'none',
      }} />
      {text}
    </div>
  );
};

const HelpIcon: React.FC<{ tooltipText?: string; mode?: 'light' | 'dark' }> = 
  ({ tooltipText, mode = 'light' }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div 
      style={{ 
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        height: '100%',
      }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <g clipPath="url(#clip0_helpIcon)">
          <path
            d="M6.05992 5.99998C6.21665 5.55442 6.52602 5.17872 6.93322 4.9394C7.34042 4.70009 7.81918 4.61261 8.2847 4.69245C8.75022 4.7723 9.17246 5.01433 9.47664 5.37567C9.78081 5.737 9.94729 6.19433 9.94659 6.66665C9.94659 7.99998 7.94659 8.66665 7.94659 8.66665M7.99992 11.3333H8.00659M14.6666 7.99998C14.6666 11.6819 11.6818 14.6666 7.99992 14.6666C4.31802 14.6666 1.33325 11.6819 1.33325 7.99998C1.33325 4.31808 4.31802 1.33331 7.99992 1.33331C11.6818 1.33331 14.6666 4.31808 14.6666 7.99998Z"
            stroke={mode === 'dark' 
              ? theme.colors["Gray (dark mode)/400"] 
              : theme.colors["Gray (light mode)/400"]}
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
      {showTooltip && (
        <div style={{ 
          position: 'absolute',
          bottom: 'calc(100% + 8px)',
          right: 0,
          zIndex: 1000,
        }}>
          <Tooltip 
            text={tooltipText || "Tooltips are used to describe or identify an element. In most scenarios, tooltips help the user understand meaning, function or alt-text."} 
            mode={mode}
          />
        </div>
      )}
    </div>
  );
};

// =======================================================
// Main Component
// =======================================================
const TextAreaInput: React.FC<TextAreaInputProps> = ({
  label = "",
  required = false,
  placeholder = "",
  value = "",
  onChange,
  hintText = "",
  helpIcon = false,
  disabled = false,
  errorMessage = "",
  tooltipText = "",
  mode = 'light',
  rows = 4,
  destructive = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const containerStyle = useMemo(() => ({
    width: "100%",
    display: "inline-flex",
    flexDirection: "column" as const,
    gap: 6,
  }), []);

  const textareaStyle = useMemo(() => ({
    width: "100%",
    border: "none",
    outline: "none",
    background: 'transparent',
    resize: "vertical" as const,
    minHeight: `${rows * 24}px`,
    fontSize: 16,
    lineHeight: "24px",
    fontFamily: 'Inter',
    color: mode === 'light'
      ? theme.colors["Gray (light mode)/900"]
      : theme.colors["Gray (dark mode)/50"],
    '::placeholder': {
      color: mode === 'light'
        ? theme.colors["Gray (light mode)/500"]
        : theme.colors["Gray (dark mode)/400"]
    },
    paddingRight: '8px'
  }), [rows, mode]);

  const textareaContainerStyle = useMemo(() => ({
    position: 'relative' as const,
    display: "flex",
    alignItems: "flex-start",
    gap: 8,
    padding: '10px 14px',
    background: mode === 'dark' 
      ? theme.colors["Gray (dark mode)/950"]
      : theme.colors["Base/White"],
    borderRadius: 8,
    border: `1px solid ${
      destructive 
        ? theme.colors["Error/300"]
        : isFocused 
          ? theme.colors["Brand/600"]
          : mode === 'light'
            ? theme.colors["Gray (light mode)/300"]
            : theme.colors["Gray (dark mode)/700"]
    }`,
    boxShadow: isFocused
      ? destructive
        ? '0px 0px 0px 4px rgba(253, 139, 139, 0.12)'
        : '0px 0px 0px 4px rgba(127, 86, 217, 0.12)'
      : mode === 'light'
        ? '0px 1px 2px rgba(16, 24, 40, 0.05)'
        : 'none',
    transition: "all 0.2s ease-in-out",
  }), [isFocused, mode, destructive]);

  const labelStyle = useMemo(() => ({
    color: mode === 'light'
      ? theme.colors["Gray (light mode)/700"]
      : theme.colors["Gray (dark mode)/300"],
    fontSize: 14,
    fontWeight: 500,
    lineHeight: "20px",
    fontFamily: 'Inter',
  }), [mode]);

  const hintTextStyle = useMemo(() => ({
    fontSize: 14,
    lineHeight: "20px",
    color: destructive
      ? mode === 'light'
        ? theme.colors["Error/600"]
        : theme.colors["Error/400"]
      : mode === 'light'
        ? theme.colors["Gray (light mode)/600"]
        : theme.colors["Gray (dark mode)/400"],
    fontFamily: 'Inter',
  }), [mode, destructive]);

  return (
    <div style={containerStyle}>
      {label && (
        <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
          <span style={labelStyle}>
            {label}
          </span>
          {required && (
            <span style={{
              color: destructive
                ? theme.colors["Error/500"]
                : mode === 'light'
                  ? theme.colors["Brand/600"]
                  : theme.colors["Brand/400"],
              fontSize: 14,
              fontWeight: 500,
              lineHeight: "20px",
            }}>
              *
            </span>
          )}
        </div>
      )}

      <div style={textareaContainerStyle}>
        <textarea
          className="w-full border-none outline-none bg-transparent resize-vertical min-h-[96px] text-base leading-6 font-inter"
          style={{
            color: mode === 'light'
              ? theme.colors["Gray (light mode)/900"]
              : theme.colors["Gray (dark mode)/50"],
            paddingRight: (helpIcon || destructive) ? '32px' : '14px',
          }}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
        />
        <div style={{ position: 'absolute', top: '10px', right: '14px' }}>
          {destructive 
            ? <ErrorIcon tooltipText={errorMessage} mode={mode} />
            : helpIcon && <HelpIcon tooltipText={tooltipText} mode={mode} />
          }
        </div>
      </div>

      {(hintText || errorMessage) && (
        <div style={hintTextStyle}>
          {errorMessage || hintText}
        </div>
      )}
    </div>
  );
};

const ErrorIcon: React.FC<{ tooltipText?: string; mode?: 'light' | 'dark' }> = 
  ({ tooltipText, mode = 'light' }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div 
      style={{ 
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        height: '100%',
      }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 5.33333V8M8 10.6667H8.00667M14.6667 8C14.6667 11.6819 11.6819 14.6667 8 14.6667C4.31811 14.6667 1.33334 11.6819 1.33334 8C1.33334 4.31811 4.31811 1.33334 8 1.33334C11.6819 1.33334 14.6667 4.31811 14.6667 8Z" 
          stroke="#F04438" 
          strokeWidth="1.33333" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
      {showTooltip && (
        <div style={{ 
          position: 'absolute',
          bottom: 'calc(100% + 8px)',
          right: 0,
          zIndex: 1000,
        }}>
          <Tooltip 
            text={tooltipText || "This field contains an error"} 
            mode={mode}
          />
        </div>
      )}
    </div>
  );
};

export default TextAreaInput;
