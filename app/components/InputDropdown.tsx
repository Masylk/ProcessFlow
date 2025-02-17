'use client';

import { useState, useRef, useEffect } from 'react';
import theme from '@/theme';

interface InputDropdownProps {
  label?: string;
  required?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  options: Array<{ name: string, handle: string, avatarUrl?: string }>;
  mode?: 'light' | 'dark';
  disabled?: boolean;
  hintText?: string;
  helpIcon?: boolean;
  tooltipText?: string;
  iconUrl?: string;
  iconColor?: string;
  type?: 'default' | 'tags';
  selectedTags?: Array<{ 
    name: string, 
    handle: string, 
    avatarUrl?: string 
  }>;
  onTagRemove?: (tag: { 
    name: string, 
    handle: string, 
    avatarUrl?: string 
  }) => void;
}

const InputDropdown: React.FC<InputDropdownProps> = ({
  label = "",
  required = false,
  value = "",
  onChange,
  options = [],
  mode = 'light',
  disabled = false,
  hintText = "",
  helpIcon = false,
  tooltipText = "Tooltips are used to describe or identify an element. In most scenarios, tooltips help the user understand meaning, function or alt-text.",
  iconUrl = "",
  iconColor = "",
  type = 'default',
  selectedTags = [],
  onTagRemove,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const selectedOption = options.find(opt => opt.name === value);

  const containerStyle = {
    display: "flex",
    flexDirection: "column" as const,
    gap: 6,
    width: "100%",
  };

  const labelStyle = {
    color: mode === 'light' 
      ? theme.colors["Gray (light mode)/700"]
      : theme.colors["Gray (dark mode)/300"],
    fontSize: 14,
    fontWeight: 500,
    lineHeight: "20px",
    fontFamily: 'Inter',
  };

  const dropdownStyle = {
    position: 'relative' as const,
    width: '100%',
  };

  const triggerStyle = {
    width: '100%',
    padding: '10px 14px',
    background: mode === 'light'
      ? theme.colors["Base/White"]
      : theme.colors["Gray (dark mode)/950"],
    border: `1px solid ${
      isFocused
        ? theme.colors["Brand/600"]
        : mode === 'light'
          ? theme.colors["Gray (light mode)/300"]
          : theme.colors["Gray (dark mode)/700"]
    }`,
    borderRadius: 8,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: disabled ? 'not-allowed' : 'pointer',
    boxShadow: isFocused
      ? '0px 0px 0px 4px rgba(127, 86, 217, 0.12)'
      : mode === 'light'
        ? '0px 1px 2px rgba(16, 24, 40, 0.05)'
        : 'none',
  };

  const menuStyle = {
    position: 'absolute' as const,
    top: 'calc(100% + 4px)',
    left: 0,
    width: '100%',
    background: mode === 'light'
      ? theme.colors["Base/White"]
      : theme.colors["Gray (dark mode)/950"],
    border: `1px solid ${
      mode === 'light'
        ? theme.colors["Gray (light mode)/200"]
        : theme.colors["Gray (dark mode)/700"]
    }`,
    borderRadius: 8,
    boxShadow: mode === 'light'
      ? '0px 4px 6px -2px rgba(16, 24, 40, 0.05)'
      : '0px 4px 6px -2px rgba(0, 0, 0, 0.2)',
    zIndex: 10,
    maxHeight: '300px',
    overflowY: 'auto' as const,
    padding: '4px 6px',
  };

  const renderTags = () => {
    return (
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '6px',
        padding: '2px 4px',
      }}>
        {selectedTags.map((tag) => (
          <div
            key={tag.handle}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '2px 8px',
              background: mode === 'light' 
                ? theme.colors["Gray (light mode)/100"]
                : theme.colors["Gray (dark mode)/700"],
              borderRadius: '16px',
              height: '24px',
            }}
          >
            {tag.avatarUrl && (
              <img 
                src={tag.avatarUrl}
                alt=""
                width={16}
                height={16}
                style={{
                  borderRadius: '50%'
                }}
              />
            )}
            <span style={{
              fontSize: '14px',
              color: mode === 'light'
                ? theme.colors["Gray (light mode)/700"]
                : theme.colors["Gray (dark mode)/300"],
            }}>
              {tag.name}
            </span>
            <button
              onClick={() => onTagRemove?.(tag)}
              style={{ 
                cursor: 'pointer',
                padding: '0',
                background: 'none',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path 
                  d="M9 3L3 9M3 3L9 9" 
                  stroke={mode === 'light'
                    ? theme.colors["Gray (light mode)/500"]
                    : theme.colors["Gray (dark mode)/400"]
                  }
                  strokeWidth="1.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={containerStyle}>
      {label && (
        <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
          <span style={labelStyle}>
            {label}
          </span>
          {required && (
            <span style={{
              color: mode === 'light'
                ? theme.colors["Brand/600"]
                : theme.colors["Brand/400"],
              fontSize: 14,
              fontWeight: 500,
              lineHeight: "20px",
            }}>
              *
            </span>
          )}
          {helpIcon && (
            <div 
              style={{ position: 'relative' }}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ cursor: 'pointer' }}
              >
                <path
                  d="M6.86001 6.73333C7.00106 6.38921 7.25146 6.10189 7.56913 5.91402C7.8868 5.72615 8.25825 5.64676 8.62698 5.68814C8.99571 5.72953 9.33874 5.88964 9.60245 6.14478C9.86616 6.39992 10.0358 6.73602 10.0867 7.10333C10.0867 8.83333 7.48668 9.7 7.48668 9.7M8.00001 12.3333H8.00668M14.6667 8C14.6667 11.6819 11.6819 14.6667 8.00001 14.6667C4.31811 14.6667 1.33334 11.6819 1.33334 8C1.33334 4.3181 4.31811 1.33333 8.00001 1.33333C11.6819 1.33333 14.6667 4.3181 14.6667 8Z"
                  stroke={mode === 'light' 
                    ? theme.colors["Gray (light mode)/500"]
                    : theme.colors["Gray (dark mode)/400"]
                  }
                  strokeWidth="1.33333"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {showTooltip && (
                <div style={{
                  position: 'absolute',
                  left: '24px',
                  top: '-6px',
                  background: mode === 'light'
                    ? theme.colors["Gray (light mode)/900"]
                    : theme.colors["Gray (dark mode)/50"],
                  color: theme.colors["Base/White"],
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  width: '320px',
                  zIndex: 20,
                  boxShadow: '0px 4px 6px -2px rgba(16, 24, 40, 0.05)',
                }}>
                  {tooltipText}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div style={dropdownStyle} ref={dropdownRef}>
        <button
          style={{
            ...triggerStyle,
            minHeight: type === 'tags' ? '44px' : 'auto',
            alignItems: type === 'tags' ? 'flex-start' : 'center',
          }}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
        >
          {type === 'tags' ? (
            <div style={{ width: '100%' }}>
              {selectedTags.length > 0 ? renderTags() : (
                <span style={{
                  color: mode === 'light'
                    ? theme.colors["Gray (light mode)/500"]
                    : theme.colors["Gray (dark mode)/400"],
                  fontSize: 16,
                  fontFamily: 'Inter',
                  display: 'flex',
                  alignItems: 'center',
                  height: '24px',
                  padding: '2px 4px',
                }}>
                  Select team members...
                </span>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {iconUrl && (
                <img 
                  src={iconUrl}
                  alt=""
                  width={20}
                  height={20}
                  style={{
                    filter: iconColor ? `color(${iconColor})` : 'none'
                  }}
                />
              )}
              <span style={{
                color: mode === 'light'
                  ? theme.colors["Gray (light mode)/900"]
                  : theme.colors["Gray (dark mode)/50"],
                fontSize: 16,
                fontFamily: 'Inter',
              }}>
                {selectedOption?.name || "Select team member"}
              </span>
            </div>
          )}
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
              stroke={mode === 'light' 
                ? theme.colors["Gray (light mode)/500"]
                : theme.colors["Gray (dark mode)/400"]
              }
              strokeWidth="1.66667" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {isOpen && (
          <div style={menuStyle}>
            {options.map((option) => {
              const isSelected = type === 'tags' 
                ? selectedTags?.some(tag => tag.handle === option.handle)
                : option.name === value;
              return (
                <div
                  key={option.handle}
                  className={`
                    transition-colors 
                    cursor-pointer
                    rounded-md
                    my-1
                    ${isSelected 
                      ? mode === 'light'
                        ? 'bg-gray-100'
                        : 'bg-gray-800'
                      : mode === 'light'
                        ? 'hover:bg-gray-50'
                        : 'hover:bg-gray-900'
                    }
                  `}
                  style={{
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    color: mode === 'light'
                      ? theme.colors["Gray (light mode)/900"]
                      : theme.colors["Gray (dark mode)/50"],
                    fontSize: 14,
                    fontFamily: 'Inter',
                    lineHeight: '20px',
                  }}
                  onClick={() => {
                    onChange?.(option.name);
                    setIsOpen(false);
                  }}
                >
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {type === 'tags' ? (
                      option.avatarUrl && (
                        <img 
                          src={option.avatarUrl}
                          alt=""
                          width={20}
                          height={20}
                          style={{
                            borderRadius: '50%'
                          }}
                        />
                      )
                    ) : (
                      iconUrl && (
                        <img 
                          src={iconUrl}
                          alt=""
                          width={20}
                          height={20}
                          style={{
                            filter: iconColor ? `color(${iconColor})` : 'none'
                          }}
                        />
                      )
                    )}
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span>{option.name}</span>
                      <span style={{
                        color: mode === 'light'
                          ? theme.colors["Gray (light mode)/500"]
                          : theme.colors["Gray (dark mode)/400"],
                        fontSize: 14,
                      }}>
                        {option.handle}
                      </span>
                    </div>
                  </div>
                  {isSelected && (
                    <img 
                      src="https://grzxiilmiwwwepaymqnu.supabase.co/storage/v1/object/public/public-assets/assets/shared_components/blue-check.svg"
                      alt="Selected"
                      width={20}
                      height={20}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {hintText && (
        <div style={{
          color: mode === 'light'
            ? theme.colors["Gray (light mode)/600"]
            : theme.colors["Gray (dark mode)/300"],
          fontSize: '14px',
          marginTop: '6px',
        }}>
          {hintText}
        </div>
      )}
    </div>
  );
};

export default InputDropdown;
