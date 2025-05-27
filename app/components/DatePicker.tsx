'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useColors, useTheme } from '@/app/theme/hooks';
import { InputTokens } from '@/app/theme/types';
import { cn } from '@/lib/utils';
import ButtonNormal from './ButtonNormal';

interface DatePickerProps {
  label?: string;
  required?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  errorMessage?: string;
  className?: string;
}

const getInputToken = (state: 'normal' | 'hover' | 'focus', type: 'bg' | 'fg' | 'border', destructive: boolean = false, disabled: boolean = false): keyof InputTokens => {
  if (disabled) {
    return `input-disabled-${type}` as keyof InputTokens;
  }
  
  const prefix = destructive ? 'input-destructive-' : 'input-';
  const suffix = state === 'normal' ? '' : `-${state}`;
  return `${prefix}${type}${suffix}` as keyof InputTokens;
};

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

/**
 * A custom date picker component that matches the Figma design
 */
const DatePicker: React.FC<DatePickerProps> = ({
  label,
  required = false,
  value = '',
  onChange,
  placeholder = 'Pick a date',
  disabled = false,
  errorMessage = '',
  className = '',
}) => {
  const colors = useColors();
  const { getCssVariable } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value ? new Date(value) : null
  );
  const [inputValue, setInputValue] = useState('');
  const [originalValue, setOriginalValue] = useState<string>('');
  const [tempSelectedDate, setTempSelectedDate] = useState<Date | null>(null);
  const [hasAppliedChanges, setHasAppliedChanges] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const destructive = !!errorMessage;

  useEffect(() => {
    if (value) {
      const date = new Date(value);
      setSelectedDate(date);
      setInputValue(formatDate(date));
    }
  }, [value]);

  useEffect(() => {
    setInputValue(formatDate(selectedDate));
  }, [selectedDate]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsFocused(false);
        
        // Only revert if user hasn't applied changes
        if (!hasAppliedChanges && originalValue !== undefined) {
          setInputValue(originalValue);
          if (originalValue) {
            const originalDate = new Date(originalValue);
            setSelectedDate(originalDate);
            setCurrentDate(originalDate);
          } else {
            setSelectedDate(null);
          }
        }
        
        // Reset the applied flag for next time
        setHasAppliedChanges(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [originalValue, hasAppliedChanges]);

  const handleInputClick = () => {
    if (!disabled) {
      // Store original value when opening
      setOriginalValue(formatDate(selectedDate));
      setTempSelectedDate(selectedDate);
      setHasAppliedChanges(false);
      setIsOpen(!isOpen);
      setIsFocused(true);
    }
  };

  const handleInputFocus = () => {
    setIsFocused(true);
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      if (!isOpen) {
        setIsFocused(false);
      }
    }, 150);
  };

  const handleCalendarInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Try to parse the input value in real-time for calendar preview
    if (newValue.trim()) {
      const parsedDate = parseInputDate(newValue);
      if (parsedDate) {
        setTempSelectedDate(parsedDate);
        setCurrentDate(parsedDate);
      }
    }
  };

  const selectDate = (date: Date) => {
    setTempSelectedDate(date);
  };

  const selectToday = () => {
    const today = new Date();
    setTempSelectedDate(today);
    setCurrentDate(today);
  };

  const applyDate = () => {
    if (tempSelectedDate) {
      setSelectedDate(tempSelectedDate);
      setInputValue(formatDate(tempSelectedDate));
      const year = tempSelectedDate.getFullYear();
      const month = String(tempSelectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(tempSelectedDate.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      if (onChange) {
        onChange(dateString);
      }
    }
    setHasAppliedChanges(true);
    setIsOpen(false);
    setIsFocused(false);
  };

  const cancelSelection = () => {
    // Revert to original values
    if (originalValue) {
      const originalDate = new Date(originalValue);
      setSelectedDate(originalDate);
      setCurrentDate(originalDate);
      setTempSelectedDate(originalDate);
      setInputValue(originalValue);
    } else {
      setSelectedDate(null);
      setTempSelectedDate(null);
      setInputValue('');
    }
    setHasAppliedChanges(false);
    setIsOpen(false);
    setIsFocused(false);
  };

  const parseInputDate = (input: string): Date | null => {
    // Try to parse various date formats
    const trimmed = input.trim();
    
    // Try MM/DD/YYYY format
    const mmddyyyy = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (mmddyyyy) {
      const [, month, day, year] = mmddyyyy;
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (date.getFullYear() == parseInt(year) && 
          date.getMonth() == parseInt(month) - 1 && 
          date.getDate() == parseInt(day)) {
        return date;
      }
    }
    
    // Try MMM DD, YYYY format (like "Jan 12, 2024")
    const shortMonth = trimmed.match(/^([A-Za-z]{3})\s+(\d{1,2}),?\s+(\d{4})$/);
    if (shortMonth) {
      const [, monthStr, day, year] = shortMonth;
      const monthIndex = MONTHS.findIndex(m => m.toLowerCase().startsWith(monthStr.toLowerCase()));
      if (monthIndex !== -1) {
        const date = new Date(parseInt(year), monthIndex, parseInt(day));
        if (date.getFullYear() == parseInt(year) && 
            date.getMonth() == monthIndex && 
            date.getDate() == parseInt(day)) {
          return date;
        }
      }
    }
    
    // Try YYYY-MM-DD format
    const iso = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (iso) {
      const [, year, month, day] = iso;
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (date.getFullYear() == parseInt(year) && 
          date.getMonth() == parseInt(month) - 1 && 
          date.getDate() == parseInt(day)) {
        return date;
      }
    }
    
    // Try just year (will set to January 1st)
    const yearOnly = trimmed.match(/^(\d{4})$/);
    if (yearOnly) {
      const year = parseInt(yearOnly[1]);
      if (year >= 1900 && year <= 2100) {
        return new Date(year, 0, 1);
      }
    }
    
    return null;
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = (firstDay.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0

    const days = [];
    
    // Previous month's trailing days
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate();
    
    for (let i = startDay - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const prevDate = new Date(prevYear, prevMonth, day);
      days.push({
        date: prevDate,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false
      });
    }

    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const today = new Date();
      const isToday = date.toDateString() === today.toDateString();
      const isSelected = tempSelectedDate && date.toDateString() === tempSelectedDate.toDateString();
      
      days.push({
        date,
        isCurrentMonth: true,
        isToday,
        isSelected
      });
    }

    // Next month's leading days to fill the grid
    const remainingCells = 42 - days.length; // 6 weeks × 7 days
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    
    for (let day = 1; day <= remainingCells; day++) {
      const nextDate = new Date(nextYear, nextMonth, day);
      days.push({
        date: nextDate,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false
      });
    }

    return days;
  };

  const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    fontSize: 16,
    lineHeight: '24px',
    fontFamily: 'Inter',
    borderRadius: 8,
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
    cursor: disabled ? 'not-allowed' : 'pointer',
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {label && (
        <div className="flex gap-0.5 items-center mb-1.5">
          <span
            style={{
              color: errorMessage
                ? getCssVariable('input-destructive-label')
                : disabled
                ? getCssVariable('input-disabled-label')
                : getCssVariable('input-label'),
              fontSize: 14,
              fontWeight: 600,
              lineHeight: '20px',
              fontFamily: 'Inter',
            }}
          >
            {label}
          </span>
          {required && (
            <span style={{ color: colors['text-accent'], fontSize: 14, fontWeight: 600 }}>
              *
            </span>
          )}
        </div>
      )}
      
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onClick={handleInputClick}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          disabled={disabled}
          placeholder={placeholder}
          readOnly
          style={inputStyle}
          className="w-full transition-all duration-200"
        />
      </div>

      {/* Custom Calendar Dropdown */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: colors['bg-primary'],
            border: `1px solid ${colors['border-secondary']}`,
            borderRadius: 12,
            marginTop: 4,
            zIndex: 1000,
            boxShadow: '0px 8px 8px -4px rgba(16, 24, 40, 0.03), 0px 20px 24px -4px rgba(16, 24, 40, 0.08)',
            width: 280,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Calendar Header */}
          <div className="p-4 pb-3">
            <div className="flex justify-between items-center mb-3">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-1.5 rounded-lg transition-colors"
                style={{ 
                  backgroundColor: 'transparent',
                  color: colors['text-secondary']
                }}
              >
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M12.5 15L7.5 10L12.5 5"
                    stroke="currentColor"
                    strokeWidth="1.66667"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              
              <span
                style={{
                  color: colors['text-primary'],
                  fontSize: 16,
                  fontWeight: 600,
                  fontFamily: 'Inter',
                }}
              >
                {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
              </span>
              
              <button
                onClick={() => navigateMonth('next')}
                className="p-1.5 rounded-lg transition-colors"
                style={{ 
                  backgroundColor: 'transparent',
                  color: colors['text-secondary']
                }}
              >
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M7.5 15L12.5 10L7.5 5"
                    stroke="currentColor"
                    strokeWidth="1.66667"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            {/* Input field and Today button */}
            <div className="flex gap-2 mb-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={formatDate(tempSelectedDate)}
                  onChange={handleCalendarInputChange}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    fontSize: 14,
                    lineHeight: '20px',
                    fontFamily: 'Inter',
                    borderRadius: 6,
                    border: `1px solid ${colors['border-primary']}`,
                    backgroundColor: colors['bg-primary'],
                    color: colors['text-primary'],
                    outline: 'none',
                    boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.05)',
                  }}
                  placeholder="Jan 12, 2024"
                />
              </div>
              <button
                onClick={selectToday}
                style={{
                  padding: '6px 8px',
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: 'Inter',
                  borderRadius: 6,
                  border: `1px solid ${colors['border-primary']}`,
                  backgroundColor: colors['bg-primary'],
                  color: colors['text-primary'],
                  cursor: 'pointer',
                  boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.05)',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                }}
                className="hover:bg-gray-50"
              >
                Today
              </button>
            </div>

            {/* Calendar Grid */}
            <div>
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-0 mb-1">
                {DAYS.map(day => (
                  <div
                    key={day}
                    className="h-8 flex items-center justify-center"
                    style={{
                      color: colors['text-secondary'],
                      fontSize: 12,
                      fontWeight: 500,
                      fontFamily: 'Inter',
                    }}
                  >
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-0">
                {getDaysInMonth().map((dayInfo, index) => {
                  const { date, isCurrentMonth, isToday, isSelected } = dayInfo;
                  
                  return (
                    <button
                      key={index}
                      onClick={() => isCurrentMonth && selectDate(date)}
                      disabled={!isCurrentMonth}
                      className="h-8 w-8 flex items-center justify-center rounded-full transition-all duration-200 relative"
                      style={{
                        color: !isCurrentMonth 
                          ? colors['text-disabled']
                          : isSelected
                          ? '#FFFFFF'
                          : isToday && !isSelected
                          ? colors['text-primary']
                          : colors['text-primary'],
                        backgroundColor: isSelected 
                          ? '#4E6BD7'
                          : isToday && !isSelected
                          ? colors['bg-secondary']
                          : 'transparent',
                        fontSize: 14,
                        fontWeight: isSelected ? 600 : 400,
                        fontFamily: 'Inter',
                        cursor: isCurrentMonth ? 'pointer' : 'default',
                      }}
                    >
                      {date.getDate()}
                      {isToday && !isSelected && (
                        <div
                          className="absolute bottom-1 w-1 h-1 rounded-full"
                          style={{ backgroundColor: colors['text-accent'] }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer with Cancel/Apply buttons */}
          <div
            className="flex gap-2 p-3 border-t"
            style={{ borderColor: colors['border-secondary'] }}
          >
            <ButtonNormal
              variant="secondary"
              size="small"
              onClick={cancelSelection}
              className="flex-1"
            >
              Cancel
            </ButtonNormal>
            <ButtonNormal
              variant="primary"
              size="small"
              onClick={applyDate}
              className="flex-1"
            >
              Apply
            </ButtonNormal>
          </div>
        </div>
      )}

      {errorMessage && (
        <div
          style={{
            color: getCssVariable('input-destructive-fg'),
            fontSize: 14,
            marginTop: 6,
          }}
        >
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export default DatePicker; 