'use client';

import { cn } from "@/lib/utils/cn";
import DynamicIcon from "../../utils/DynamicIcon";
import { useState, useMemo } from "react";

// =======================================================
// Constant Styles
// =======================================================
const BASE_INPUT_STYLE = {
  width: "100%",
  flex: 1,
  fontSize: 16,
  lineHeight: "24px",
  outline: "none",
  border: "none",
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
  borderRadius: 8,
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
  borderTopLeftRadius: 8,
  borderTopRightRadius: 8,
  justifyContent: "flex-start",
  alignItems: "center",
  display: "flex",
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
  background: "white",
  borderTopLeftRadius: 8,
  borderTopRightRadius: 8,
  overflow: "hidden",
  border: "1px #D0D5DD solid",
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
}

// Add this near the top with other component definitions
const Tooltip: React.FC<{ text: string }> = ({ text }) => {
  return (
    <div style={{
      position: 'absolute',
      bottom: 'calc(100% + 8px)',
      left: '50%',
      transform: 'translateX(-50%)',
      background: '#101828',
      padding: '12px 16px',
      borderRadius: 8,
      width: '25ch',
      boxShadow: '0px 4px 6px -2px rgba(16, 24, 40, 0.05)',
      color: 'white',
      fontSize: 14,
      fontFamily: 'Inter',
      lineHeight: '20px',
      zIndex: 50,
    }}>
      <div style={{
        position: 'absolute',
        bottom: -4,
        left: '50%',
        transform: 'translateX(-50%) rotate(45deg)',
        width: 8,
        height: 8,
        background: '#101828',
      }} />
      <div style={{ position: 'relative' }}>{text}</div>
    </div>
  );
};

// Modify the HelpIcon component
const HelpIcon: React.FC<{ destructive?: boolean; tooltipText?: string }> = ({ destructive, tooltipText }) => {
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
            stroke={destructive ? "#FF0000" : "#98A2B3"}
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
        <Tooltip text={tooltipText || "Tooltips are used to describe or identify an element. In most scenarios, tooltips help the user understand meaning, function or alt-text."} />
      )}
    </div>
  );
};

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
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  // Memoize focus styles to avoid re-creation on every render
  const focusStyles = useMemo(
    () => ({
      paddingLeft: 12,
      paddingRight: 12,
      paddingTop: 8,
      paddingBottom: 8,
      background: "white",
      borderRadius: 8,
      border: `1px solid ${
        destructive ? "#FF0000" : isFocused ? "#4e6bd7" : "#D0D5DD"
      }`,
      boxShadow: destructive
        ? "0px 1px 2px rgba(255, 0, 0, 0.2)"
        : isFocused
        ? "0 0 0 2px #c8d1f3"
        : "0px 1px 2px rgba(16, 24, 40, 0.05)",
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      transition: "border-color 0.2s, box-shadow 0.2s",
    }),
    [isFocused, destructive]
  );

  const handleCopy = () => {
    if (value) {
      navigator.clipboard.writeText(value);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000); // Reset after 2 seconds
    }
  };

  const renderInputContent = () => {
    switch (type) {
      case "icon-leading":
      case "default":
        return (
          <div style={focusStyles}>
            {iconUrl && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
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
              style={BASE_INPUT_STYLE}
            />
            {helpIcon && <HelpIcon destructive={destructive} tooltipText={tooltipText} />}
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
              borderRadius: 8,
              overflow: 'visible',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 12px',
                background: '#F9FAFB',
                borderTop: '1px solid #D0D5DD',
                borderBottom: '1px solid #D0D5DD',
                borderLeft: '1px solid #D0D5DD',
                borderRight: '0px solid #D0D5DD',
                borderTopLeftRadius: 8,
                borderBottomLeftRadius: 8,
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
                        color: '#475467',
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
                    color: '#475467',
                    fontSize: 16,
                    fontFamily: 'Inter',
                    lineHeight: '24px',
                  }}>
                    http://
                  </div>
                )}
              </div>
              <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                padding: '8px 12px',
                background: 'white',
                ...focusStyles,
                borderLeft: '1px solid #D0D5DD',
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
                zIndex: 1,
              }}>
                <input
                  type="text"
                  placeholder={type === "leading-text" ? "www.example.com" : placeholder}
                  value={value}
                  onChange={(e) => onChange?.(e.target.value)}
                  disabled={disabled}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  style={{
                    ...BASE_INPUT_STYLE,
                    color: '#667085',
                  }}
                />
                {helpIcon && <HelpIcon destructive={destructive} tooltipText={tooltipText} />}
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
              borderRadius: 8,
              overflow: 'visible',
            }}>
              <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                padding: '8px 12px',
                background: 'white',
                ...focusStyles,
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0,
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
                  style={{
                    ...BASE_INPUT_STYLE,
                    color: '#667085',
                  }}
                />
                {helpIcon && <HelpIcon destructive={destructive} tooltipText={tooltipText} />}
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 12px',
                background: '#F9FAFB',
                borderTop: '1px solid #D0D5DD',
                borderBottom: '1px solid #D0D5DD',
                borderRight: '1px solid #D0D5DD',
                borderLeft: '0px solid #D0D5DD',
                borderTopRightRadius: 8,
                borderBottomRightRadius: 8,
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
                    color: '#475467',
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
                    <path d="M5 7.5L10 12.5L15 7.5" stroke="#667085" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
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
            display: "flex",
            alignItems: "center",
            gap: 4,
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
                      background: "#F2F4F7",
                      borderRadius: 6,
                      padding: "2px 6px",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      flexShrink: 0,
                      height: 24,
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
                        color: "#344054",
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
                        <path d="M9 3L3 9M3 3L9 9" stroke="#98A2B3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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
                  ...BASE_INPUT_STYLE,
                  width: "auto",
                  minWidth: value ? "60px" : "100%",
                  flexGrow: 1,
                  fontSize: size === "small" ? 14 : 16,
                  padding: "4px 0",
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
              borderRadius: 8,
              overflow: 'visible',
            }}>
              <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                padding: '8px 12px',
                background: 'white',
                ...focusStyles,
                borderRight: 'none',
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0,
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
                  style={{
                    ...BASE_INPUT_STYLE,
                    color: '#667085',
                  }}
                />
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
                    <path d="M6.06 6C6.21673 5.55444 6.5261 5.17875 6.93329 4.93943C7.34048 4.70011 7.81924 4.61263 8.28476 4.69247C8.75028 4.77231 9.17252 5.01434 9.4767 5.37568C9.78087 5.73702 9.94735 6.19435 9.94665 6.66667C9.94665 8 7.94665 8.66667 7.94665 8.66667M8 11.3333H8.00667M14.6667 8C14.6667 11.6819 11.6819 14.6667 8 14.6667C4.31811 14.6667 1.33334 11.6819 1.33334 8C1.33334 4.31811 4.31811 1.33334 8 1.33334C11.6819 1.33334 14.6667 4.31811 14.6667 8Z" stroke="#98A2B3" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {showTooltip && (
                    <Tooltip text={tooltipText || "Tooltips are used to describe or identify an element. In most scenarios, tooltips help the user understand meaning, function or alt-text."} />
                  )}
                </div>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 14px',
                background: 'white',
                borderTop: '1px solid #D0D5DD',
                borderBottom: '1px solid #D0D5DD',
                borderRight: '1px solid #D0D5DD',
                borderLeft: '0px solid #D0D5DD',
                borderTopRightRadius: 8,
                borderBottomRightRadius: 8,
                position: 'relative',
                minWidth: 'fit-content',
                cursor: value ? 'pointer' : 'not-allowed',
                userSelect: 'none',
                color: '#344054',
                fontSize: 14,
                fontFamily: 'Inter',
                fontWeight: 500,
                zIndex: 0,
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
                      <path d="M13.3333 4L6 11.3333L2.66667 8" stroke="#344054" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M13.3333 6H7.33333C6.59695 6 6 6.59695 6 7.33333V13.3333C6 14.0697 6.59695 14.6667 7.33333 14.6667H13.3333C14.0697 14.6667 14.6667 14.0697 14.6667 13.3333V7.33333C14.6667 6.59695 14.0697 6 13.3333 6Z" stroke="#344054" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M3.33333 10H2.66667C2.31305 10 1.97391 9.85953 1.72386 9.60948C1.47381 9.35943 1.33334 9.02029 1.33334 8.66667V2.66667C1.33334 2.31305 1.47381 1.97391 1.72386 1.72386C1.97391 1.47381 2.31305 1.33334 2.66667 1.33334H8.66667C9.02029 1.33334 9.35943 1.47381 9.60948 1.72386C9.85953 1.97391 10 2.31305 10 2.66667V3.33334" stroke="#344054" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
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
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
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
              style={BASE_INPUT_STYLE}
            />
            {helpIcon && <HelpIcon destructive={destructive} tooltipText={tooltipText} />}
          </div>
        );
    }
  };

  return (
    <div style={DEFAULT_CONTAINER_STYLE}>
      {label && (
        <div style={{ display: "inline-flex", flexDirection: "row", gap: 2 }}>
          <div className={cn("font-medium text-sm")}>{label}</div>
          {required && (
            <div className={cn("text-sm font-medium", "text-blue-600")}>*</div>
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
      {destructive && errorMessage && (
        <div className="text-sm text-red-500 mt-1">{errorMessage}</div>
      )}
    </div>
  );
};

export default InputField;