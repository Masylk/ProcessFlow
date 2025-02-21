'use client';

import { cn } from "@/lib/utils/cn";
import DynamicIcon from "../../utils/DynamicIcon";
import { useState, useMemo } from "react";
import theme from "@/theme";

// =======================================================
// Constant Styles
// =======================================================
const BASE_STYLES = {
  width: "100%",
  flex: 1,
  fontSize: 16,
  lineHeight: "24px",
  outline: "none",
  border: "none",
  background: 'transparent',
};

const SELECT_STYLE = {
  border: "none",
  outline: "none",
  background: "transparent",
  fontSize: 14,
};

const DEFAULT_CONTAINER_STYLE: React.CSSProperties = {
  width: "100%",
  display: "inline-flex",
  flexDirection: "column",
  gap: 6,
};

// Leading-text variant styles
const LEADING_TEXT_OUTER = {
  width: 320,
  height: 92,
  flexDirection: "column",
  justifyContent: "flex-start",
  alignItems: "flex-start",
  gap: 6,
  display: "inline-flex",
};

const LEADING_TEXT_INNER = {
  alignSelf: "stretch",
  height: 66,
  flexDirection: "column",
  justifyContent: "flex-start",
  alignItems: "flex-start",
  gap: 6,
  display: "flex",
};

const LEADING_TEXT_LABEL_CONTAINER = {
  justifyContent: "flex-start",
  alignItems: "flex-start",
  gap: 2,
  display: "inline-flex",
};

const LEADING_TEXT_LABEL = {
  color: "#344054",
  fontSize: 14,
  fontFamily: "Inter",
  fontWeight: 500,
  lineHeight: 20,
  wordWrap: "break-word",
};

const LEADING_TEXT_ASTERISK = {
  color: "#4761C4",
  fontSize: 14,
  fontFamily: "Inter",
  fontWeight: 500,
  lineHeight: 20,
  wordWrap: "break-word",
};

const LEADING_TEXT_INPUT_CONTAINER = {
  alignSelf: "stretch",
  background: "white",
  boxShadow: "0px 1px 2px rgba(16, 24, 40, 0.05)",
  borderRadius: 6,
  border: "1px #D0D5DD solid",
  justifyContent: "flex-start",
  alignItems: "flex-start",
  display: "inline-flex",
};

const LEADING_TEXT_PREFIX_CONTAINER = {
  paddingLeft: 12,
  paddingRight: 12,
  paddingTop: 8,
  paddingBottom: 8,
  borderTopLeftRadius: 6,
  borderTopRightRadius: 6,
  justifyContent: "flex-start",
  alignItems: "center",
  display: "flex",
  background: theme.colors["Base/White"],
  border: `1px solid ${theme.colors["Gray (light mode)/300"]}`,
};

const LEADING_TEXT_PREFIX_TEXT = {
  color: "#475467",
  fontSize: 16,
  fontFamily: "Inter",
  fontWeight: 400,
  lineHeight: 24,
  wordWrap: "break-word",
};

const LEADING_TEXT_MAIN_INPUT_CONTAINER = {
  flex: "1 1 0",
  alignSelf: "stretch",
  paddingLeft: 12,
  paddingRight: 12,
  paddingTop: 8,
  paddingBottom: 8,
  background: theme.colors["Base/White"],
  borderTopLeftRadius: 6,
  borderTopRightRadius: 6,
  overflow: "hidden",
  border: `1px solid ${theme.colors["Gray (light mode)/300"]}`,
  justifyContent: "flex-start",
  alignItems: "center",
  gap: 8,
  display: "flex",
};

const LEADING_TEXT_MAIN_INPUT_TEXT = {
  flex: "1 1 0",
  color: "#667085",
  fontSize: 16,
  fontFamily: "Inter",
  fontWeight: 400,
  lineHeight: 24,
  wordWrap: "break-word",
};

const LEADING_TEXT_HINT = {
  alignSelf: "stretch",
  color: "#475467",
  fontSize: 14,
  fontFamily: "Inter",
  fontWeight: 400,
  lineHeight: 20,
  wordWrap: "break-word",
};

// =======================================================
// Types and Helper Components
// =======================================================
interface InputFieldProps {
  size?: "small" | "medium";
  type?:
    | "default"
    | "icon-leading"
    | "leading-dropdown"
    | "trailing-dropdown"
    | "leading-text"
    | "payment-input"
    | "tags"
    | "trailing-button";
  destructive?: boolean;
  placeholder?: string;
  value?: string;
  label?: string;
  required?: boolean;
  hintText?: string;
  
  helpIcon?: boolean;
  onChange?: (value: string) => void;
  disabled?: boolean;
  errorMessage?: string;
  iconUrl?: string; // URL for the leading icon
  iconColor?: string; // Tailwind color class for the icon
  dropdownOptions?: string[];
  tooltipText?: string;
  mode?: 'light' | 'dark';
}

// Add this near the top with other component definitions
const Tooltip: React.FC<{ text: string; mode?: 'light' | 'dark' }> = ({ text, mode = 'light' }) => {
  return (
    <div style={{
      position: 'absolute',
      bottom: 'calc(100% + 8px)',
      left: '50%',
      transform: 'translateX(-50%)',
      background: mode === 'dark' ? theme.colors["Gray (dark mode)/900"] : '#101828',
      padding: '12px 16px',
      borderRadius: 6,
      width: '25ch',
      boxShadow: mode === 'dark' 
        ? '0px 4px 6px -2px rgba(0, 0, 0, 0.2)' 
        : '0px 4px 6px -2px rgba(16, 24, 40, 0.05)',
      color: mode === 'dark' ? theme.colors["Gray (dark mode)/100"] : 'white',
      fontSize: 14,
      fontFamily: 'Inter',
      lineHeight: '20px',
      zIndex: 50,
      border: mode === 'dark' ? `1px solid ${theme.colors["Gray (dark mode)/800"]}` : 'none',
    }}>
      <div style={{
        position: 'absolute',
        bottom: -4,
        left: '50%',
        transform: 'translateX(-50%) rotate(45deg)',
        width: 8,
        height: 8,
        background: mode === 'dark' ? theme.colors["Gray (dark mode)/900"] : '#101828',
        borderRight: mode === 'dark' ? `1px solid ${theme.colors["Gray (dark mode)/800"]}` : 'none',
        borderBottom: mode === 'dark' ? `1px solid ${theme.colors["Gray (dark mode)/800"]}` : 'none',
      }} />
      <div style={{ position: 'relative' }}>{text}</div>
    </div>
  );
};

// Modify the HelpIcon component
const HelpIcon: React.FC<{ destructive?: boolean; tooltipText?: string; mode?: 'light' | 'dark' }> = 
  ({ destructive, tooltipText, mode = 'light' }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div 
      style={{ 
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
      }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <g clipPath="url(#clip0_helpIcon)">
          <path
            d="M6.05992 5.99998C6.21665 5.55442 6.52602 5.17872 6.93322 4.9394C7.34042 4.70009 7.81918 4.61261 8.2847 4.69245C8.75022 4.7723 9.17246 5.01433 9.47664 5.37567C9.78081 5.737 9.94729 6.19433 9.94659 6.66665C9.94659 7.99998 7.94659 8.66665 7.94659 8.66665M7.99992 11.3333H8.00659M14.6666 7.99998C14.6666 11.6819 11.6818 14.6666 7.99992 14.6666C4.31802 14.6666 1.33325 11.6819 1.33325 7.99998C1.33325 4.31808 4.31802 1.33331 7.99992 1.33331C11.6818 1.33331 14.6666 4.31808 14.6666 7.99998Z"
            stroke={destructive ? "#FF0000" : mode === 'dark' ? "#98A2B3" : "#98A2B3"}
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
        <Tooltip 
          text={tooltipText || "Tooltips are used to describe or identify an element. In most scenarios, tooltips help the user understand meaning, function or alt-text."} 
          mode={mode}
        />
      )}
    </div>
  );
};

// Add this after the HelpIcon component
const ErrorIcon: React.FC<{ tooltipText?: string; mode?: 'light' | 'dark' }> = 
  ({ tooltipText, mode = 'light' }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div 
      style={{ 
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
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
        <Tooltip 
          text={tooltipText || "This field contains an error"} 
          mode={mode}
        />
      )}
    </div>
  );
};

// Define variant styles with light and dark mode
const getVariantStyles = (isFocused: boolean, destructive: boolean, mode: 'light' | 'dark') => ({
  default: {
    light: {
      background: theme.colors["Base/White"],
      border: `1px solid ${
        destructive 
          ? theme.colors['Error/300']
          : isFocused 
            ? theme.colors['Brand/600']
            : theme.colors['Gray (light mode)/300']
      }`,
      boxShadow: isFocused
        ? destructive
          ? '0px 0px 0px 4px rgba(253, 139, 139, 0.12)'
          : '0px 0px 0px 4px rgba(127, 86, 217, 0.12)'
        : '0px 1px 2px rgba(16, 24, 40, 0.05)',
      color: theme.colors['Gray (light mode)/600'],
    },
    dark: {
      background: theme.colors["Gray (dark mode)/950"],
      border: `1px solid ${
        destructive 
          ? theme.colors['Error/300']
          : isFocused 
            ? theme.colors['Brand/600']
            : theme.colors['Gray (dark mode)/700']
      }`,
      boxShadow: isFocused
        ? destructive
          ? '0px 0px 0px 4px rgba(253, 139, 139, 0.12)'
          : '0px 0px 0px 4px rgba(127, 86, 217, 0.12)'
        : 'none',
      color: theme.colors["Gray (dark mode)/50"],
    }
  },
  label: {
    light: {
      color: theme.colors["Gray (light mode)/700"],
    },
    dark: {
      color: theme.colors["Gray (dark mode)/300"],
    }
  },
  hint: {
    light: {
      color: theme.colors["Gray (light mode)/600"],
    },
    dark: {
      color: theme.colors["Gray (dark mode)/400"],
    }
  },
  error: {
    light: {
      color: theme.colors["Error/600"],
    },
    dark: {
      color: '#F97066',
    }
  },
  prefix: {
    light: {
      background: theme.colors["Base/White"],
      color: theme.colors["Gray (light mode)/900"],
      borderColor: theme.colors["Gray (light mode)/300"],
    },
    dark: {
      background: theme.colors["Gray (dark mode)/950"],
      color: theme.colors["Gray (dark mode)/50"],
      borderColor: theme.colors["Gray (dark mode)/700"],
    }
  },
  placeholder: {
    light: {
      color: theme.colors["Gray (light mode)/500"],
    },
    dark: {
      color: theme.colors["Gray (dark mode)/400"],
    }
  },
  asterisk: {
    light: {
      color: theme.colors["Brand/600"],
    },
    dark: {
      color: theme.colors["Brand/400"],
    }
  },
  dropdown: {
    light: {
      chevronColor: theme.colors["Gray (light mode)/500"],
      textColor: theme.colors["Gray (light mode)/900"],
      background: theme.colors["Base/White"],
    },
    dark: {
      chevronColor: theme.colors["Gray (dark mode)/400"],
      textColor: theme.colors["Gray (dark mode)/50"],
      background: theme.colors["Gray (dark mode)/950"],
    }
  }
});

// =======================================================
// Main Component
// =======================================================
const InputField: React.FC<InputFieldProps> = ({
  size = "medium",
  type = "default",
  destructive = false,
  placeholder = "",
  value = "",
  label = "",
  required = false,
  hintText = "",
  helpIcon = false,
  onChange,
  disabled = false,
  errorMessage = "",
  iconUrl = "",
  iconColor = "currentColor",
  dropdownOptions,
  tooltipText = "Tooltips are used to describe or identify an element. In most scenarios, tooltips help the user understand meaning, function or alt-text.",
  mode = 'light',
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  const styles = getVariantStyles(isFocused, destructive, mode);

  const inputStyle = useMemo(() => ({
    ...BASE_STYLES,
    '::placeholder': {
      color: mode === 'light' 
        ? 'text-lightMode-text-quaternary'
        : 'text-darkMode-text-quaternary',
    },
    color: mode === 'light'
      ? theme.colors["Gray (light mode)/900"]
      : theme.colors["Gray (dark mode)/50"],
  }), [mode]);

  // Update the input container styles to remove duplicates
  const inputContainerStyle = useMemo(
    () => ({
      flex: 1,
      display: "flex",
      alignItems: "center",
      padding: '8px 12px',
      background: mode === 'light' 
        ? theme.colors["Base/White"]
        : theme.colors["Gray (dark mode)/950"],
      borderLeft: '1px solid #D0D5DD',
      borderTopLeftRadius: 0,
      borderBottomLeftRadius: 0,
      zIndex: 1,
    }),
    [mode]
  );

  // Consolidate focus styles to avoid duplicates
  const focusStyles = useMemo(
    () => ({
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: '8px 12px',
      background: mode === 'light' 
        ? theme.colors["Base/White"] 
        : theme.colors["Gray (dark mode)/950"],
      borderRadius: 6,
      border: `1px solid ${
        destructive 
          ? theme.colors['Error/300']
          : isFocused 
            ? theme.colors['Brand/600']
            : mode === 'light' 
              ? theme.colors['Gray (light mode)/300']
              : theme.colors['Gray (dark mode)/700']
      }`,
      boxShadow: isFocused
        ? destructive
          ? '0px 0px 0px 4px rgba(253, 139, 139, 0.12)'
          : "0px 0px 0px 4px rgba(78,107,215,0.12)"
        : mode === 'light' 
          ? '0px 1px 2px rgba(16, 24, 40, 0.05)'
          : 'none',
      transition: "border-color 0.2s, box-shadow 0.2s",
    }),
    [isFocused, destructive, mode]
  );

  const handleCopy = () => {
    if (value) {
      navigator.clipboard.writeText(value);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000); // Reset after 2 seconds
    }
  };

  // Update label styles
  const labelStyle = {
    ...LEADING_TEXT_LABEL,
    ...styles.label[mode],
  };

  // Update hint text styles
  const hintStyle = {
    ...LEADING_TEXT_HINT,
    ...styles.hint[mode],
  };

  // Update error message styles
  const errorStyle = {
    color: mode === 'light' 
      ? theme.colors["Error/600"]
      : '#F97066',  // Using the same error color as the border in dark mode
    fontSize: 14,
    fontFamily: 'Inter',
    fontWeight: 400,
    lineHeight: '20px',
    marginTop: 6,
  };

  // Update prefix container styles for dropdown/leading-text variants
  const prefixContainerStyle = {
    ...LEADING_TEXT_PREFIX_CONTAINER,
    ...styles.prefix[mode],
  };

  const renderInputContent = () => {
    switch (type) {
      case "icon-leading":
      case "default":
        return (
          <div style={focusStyles}>
            {iconUrl && (
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <DynamicIcon url={iconUrl} color={iconColor} size={16} />
              </div>
            )}
            <input
              type="text"
              placeholder={placeholder}
              value={value}
              onChange={(e) => onChange?.(e.target.value)}
              disabled={disabled}
              onFocus={handleFocus}
              onBlur={handleBlur}
              style={inputStyle}
            />
            {destructive && <ErrorIcon tooltipText={errorMessage} mode={mode} />}
            {helpIcon && !destructive && <HelpIcon destructive={destructive} tooltipText={tooltipText} mode={mode} />}
          </div>
        );

      case "leading-dropdown":
      case "leading-text":
        return (
          <div style={DEFAULT_CONTAINER_STYLE}>
            <div style={{
              display: 'flex',
              width: '100%',
              height: 40,
              borderRadius: 6,
              overflow: 'visible',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 12px',
                background: mode === 'dark' ? '#0C111D' : '#F9FAFB',
                borderTop: `1px solid ${mode === 'dark' ? '#333741' : '#D0D5DD'}`,
                borderBottom: `1px solid ${mode === 'dark' ? '#333741' : '#D0D5DD'}`,
                borderLeft: `1px solid ${mode === 'dark' ? '#333741' : '#D0D5DD'}`,
                borderRight: '0px solid transparent',
                borderTopLeftRadius: 6,
                borderBottomLeftRadius: 6,
                position: 'relative',
                minWidth: 80,
                zIndex: 0,
              }}>
                {type === "leading-dropdown" ? (
                  <>
                    <select
                      style={{
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        fontSize: 16,
                        color: mode === 'dark' ? '#CECFD2' : '#344054',
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
                    <div style={{ 
                      position: 'absolute',
                      right: 12,
                      pointerEvents: 'none'
                    }}>
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M5 7.5L10 12.5L15 7.5" stroke="#667085" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </>
                ) : (
                  <div style={{
                    color: mode === 'dark' ? '#94969C' : '#475467',
                    fontSize: 16,
                    fontFamily: 'Inter',
                    lineHeight: '24px',
                  }}>
                    http://
                  </div>
                )}
              </div>
              <div style={{
                ...focusStyles,
                borderLeft: '1px solid #D0D5DD',
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
                zIndex: 1,
                flex: 1,
              }}>
                <input
                  type="text"
                  placeholder={type === "leading-text" ? "www.example.com" : placeholder}
                  value={value}
                  onChange={(e) => onChange?.(e.target.value)}
                  disabled={disabled}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  style={inputStyle}
                />
                {destructive && <ErrorIcon tooltipText={errorMessage} mode={mode} />}
                {helpIcon && !destructive && <HelpIcon destructive={destructive} tooltipText={tooltipText} mode={mode} />}
              </div>
            </div>
          </div>
        );

      case "trailing-dropdown":
        return (
          <div style={DEFAULT_CONTAINER_STYLE}>
            <div style={{
              display: 'flex',
              width: '100%',
              height: 40,
              borderRadius: 6,
              overflow: 'visible',
            }}>
              <div style={{
                ...focusStyles,
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0,
                flex: 1,
                zIndex: 1,
              }}>
                <input
                  type="text"
                  placeholder={placeholder}
                  value={value}
                  onChange={(e) => onChange?.(e.target.value)}
                  disabled={disabled}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  style={inputStyle}
                />
                {destructive && <ErrorIcon tooltipText={errorMessage} mode={mode} />}
                {helpIcon && !destructive && <HelpIcon destructive={destructive} tooltipText={tooltipText} mode={mode} />}
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 12px',
                background: mode === 'dark' ? '#0C111D' : '#F9FAFB',
                borderTop: `1px solid ${mode === 'dark' ? '#333741' : '#D0D5DD'}`,
                borderBottom: `1px solid ${mode === 'dark' ? '#333741' : '#D0D5DD'}`,
                borderRight: `1px solid ${mode === 'dark' ? '#333741' : '#D0D5DD'}`,
                borderLeft: '0px solid transparent',
                borderTopRightRadius: 6,
                borderBottomRightRadius: 6,
                position: 'relative',
                minWidth: 80,
                zIndex: 0,
              }}>
                <select
                  style={{
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    fontSize: 16,
                    color: mode === 'dark' ? '#CECFD2' : '#344054',
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
                  )) || <option value="Option 1">Option 1</option>}
                </select>
                <div style={{ 
                  position: 'absolute',
                  right: 12,
                  pointerEvents: 'none'
                }}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path 
                      d="M5 7.5L10 12.5L15 7.5" 
                      stroke={mode === 'dark' ? '#94969C' : '#667085'} 
                      strokeWidth="1.66667" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        );

      case "tags":
        return (
          <div style={{ 
            ...focusStyles, 
            minHeight: size === "small" ? 32 : 40,
            padding: "4px 8px",
            overflow: "hidden",
            width: "100%",
          }}>
            <div 
              style={{ 
                display: "flex", 
                alignItems: "center",
                gap: 4,
                overflow: "auto",
                overflowX: "auto",
                overflowY: "hidden",
                flex: "1 1 0",
                minWidth: 0,
              }}
            >
              {value
                .split(",")
                .filter((tag) => tag.trim() !== "")
                .map((tag, index) => (
                  <div
                    key={index}
                    style={{
                      background: mode === 'dark' 
                        ? theme.colors["Gray (dark mode)/800"]
                        : theme.colors["Gray (light mode)/100"],
                      borderRadius: 6,
                      padding: "2px 6px",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      flexShrink: 0,
                      height: 24,
                      border: `1px solid ${
                        mode === 'dark'
                          ? theme.colors["Gray (dark mode)/700"]
                          : theme.colors["Gray (light mode)/200"]
                      }`,
                    }}
                  >
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2
                    }}>
                      <img
                        src="https://grzxiilmiwwwepaymqnu.supabase.co/storage/v1/object/public/public-assets/assets/shared_components/avatar-01.png"
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: "50%",
                        }}
                        alt=""
                      />
                      <span style={{
                        color: mode === 'dark'
                          ? theme.colors["Gray (dark mode)/50"]
                          : theme.colors["Gray (light mode)/700"],
                        fontSize: 14,
                        fontFamily: "Inter",
                        fontWeight: "500",
                      }}>
                        {tag}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        const tags = value.split(",").filter((t) => t.trim() !== "");
                        tags.splice(index, 1);
                        onChange?.(tags.join(","));
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path 
                          d="M9 3L3 9M3 3L9 9" 
                          stroke={mode === 'dark' 
                            ? theme.colors["Gray (dark mode)/400"]
                            : theme.colors["Gray (light mode)/400"]
                          } 
                          strokeWidth="1.5" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              <input
                type="text"
                placeholder={value ? "" : placeholder}
                disabled={disabled}
                onFocus={handleFocus}
                onBlur={handleBlur}
                style={{
                  ...inputStyle,
                  color: mode === 'dark'
                    ? theme.colors["Gray (dark mode)/50"]
                    : theme.colors["Gray (light mode)/900"],
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    const tagValue = e.currentTarget.value.trim();
                    if (tagValue) {
                      const newValue = value ? `${value},${tagValue}` : tagValue;
                      onChange?.(newValue);
                    }
                    e.currentTarget.value = "";
                  } else if (e.key === "Backspace" && e.currentTarget.value === "") {
                    // Delete the last tag when pressing Backspace on empty input
                    e.preventDefault();
                    const tags = value.split(",").filter((t) => t.trim() !== "");
                    if (tags.length > 0) {
                      tags.pop();
                      onChange?.(tags.join(","));
                    }
                  }
                }}
              />
            </div>
          </div>
        );

      case "trailing-button":
        return (
          <div style={DEFAULT_CONTAINER_STYLE}>
            <div style={{
              display: 'flex',
              width: '100%',
              height: 40,
              borderRadius: 6,
              overflow: 'visible',
              position: 'relative',
            }}>
              <div style={{
                ...focusStyles,
                borderRight: 'none',
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0,
                flex: 1,
                position: 'relative',
                zIndex: 2,
              }}>
                <input
                  type="text"
                  placeholder={placeholder}
                  value={value}
                  onChange={(e) => onChange?.(e.target.value)}
                  disabled={disabled}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  style={inputStyle}
                />
                {destructive && <ErrorIcon tooltipText={errorMessage} mode={mode} />}
                {helpIcon && !destructive && <HelpIcon destructive={destructive} tooltipText={tooltipText} mode={mode} />}
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 14px',
                background: mode === 'dark' ? '#0C111D' : 'white',
                borderTop: `1px solid ${mode === 'dark' ? '#333741' : '#D0D5DD'}`,
                borderBottom: `1px solid ${mode === 'dark' ? '#333741' : '#D0D5DD'}`,
                borderRight: `1px solid ${mode === 'dark' ? '#333741' : '#D0D5DD'}`,
                borderTopRightRadius: 6,
                borderBottomRightRadius: 6,
                position: 'relative',
                minWidth: 'fit-content',
                cursor: value ? 'pointer' : 'not-allowed',
                userSelect: 'none',
                color: mode === 'dark' ? '#E4E4E7' : '#344054',
                fontSize: 14,
                fontFamily: 'Inter',
                fontWeight: 500,
                zIndex: 1,
                opacity: value ? 1 : 0.5,
              }}
              onClick={handleCopy}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}>
                  {hasCopied ? (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M13.3333 4L6 11.3333L2.66667 8" stroke={mode === 'dark' ? '#E4E4E7' : '#344054'} strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M13.3333 6H7.33333C6.59695 6 6 6.59695 6 7.33333V13.3333C6 14.0697 6.59695 14.6667 7.33333 14.6667H13.3333C14.0697 14.6667 14.6667 14.0697 14.6667 13.3333V7.33333C14.6667 6.59695 14.0697 6 13.3333 6Z" stroke={mode === 'dark' ? '#E4E4E7' : '#344054'} strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M3.33333 10H2.66667C2.31305 10 1.97391 9.85953 1.72386 9.60948C1.47381 9.35943 1.33334 9.02029 1.33334 8.66667V2.66667C1.33334 2.31305 1.47381 1.97391 1.72386 1.72386C1.97391 1.47381 2.31305 1.33334 2.66667 1.33334H8.66667C9.02029 1.33334 9.35943 1.47381 9.60948 1.72386C9.85953 1.97391 10 2.31305 10 2.66667V3.33334" stroke={mode === 'dark' ? '#E4E4E7' : '#344054'} strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                  {hasCopied ? 'Copied!' : 'Copy'}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div style={focusStyles}>
            {iconUrl && (
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <DynamicIcon url={iconUrl} color={iconColor} size={20} />
              </div>
            )}
            <input
              type="text"
              placeholder={placeholder}
              value={value}
              onChange={(e) => onChange?.(e.target.value)}
              disabled={disabled}
              onFocus={handleFocus}
              onBlur={handleBlur}
              style={inputStyle}
            />
            {destructive && <ErrorIcon tooltipText={errorMessage} mode={mode} />}
            {helpIcon && !destructive && <HelpIcon destructive={destructive} tooltipText={tooltipText} mode={mode} />}
          </div>
        );
    }
  };

  return (
    <div style={DEFAULT_CONTAINER_STYLE}>
      {label && (
        <div style={{ display: "inline-flex", flexDirection: "row", gap: 2 }}>
          <div 
            className={cn("font-medium text-sm")}
            style={styles.label[mode]}
          >
            {label}
          </div>
          {required && (
            <div 
              className={cn("text-sm font-medium")}
              style={styles.asterisk[mode]}
            >
              *
            </div>
          )}
        </div>
      )}
      {renderInputContent()}
      {hintText && (
        <div
          className={cn(
            "text-sm leading-5",
            destructive ? "text-red-500" : "text-gray-600"
          )}
        >
          {hintText}
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

export default InputField;