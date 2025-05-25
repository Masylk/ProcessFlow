import React, { useState, useEffect, useRef } from 'react';
import { useColors } from '@/app/theme/hooks';
import { DelayType } from '../../../types';
import FixedDelayModal from './FixedDelayModal';
import EventDelayModal from './EventDelayModal';
import Modal from '@/app/components/Modal';
import ButtonNormal from '@/app/components/ButtonNormal';

interface DelayTypeModalProps {
  onClose: () => void;
  onSelect: (
    delayType: DelayType,
    data: { seconds?: number; eventName?: string }
  ) => void;
  initialData?: {
    delayType?: DelayType;
    eventName?: string;
    seconds?: number;
  };
  isVisible?: boolean;
}

// Define a type for the active modal
type ActiveModal = 'delayType' | 'fixedDelay' | 'eventDelay';

const DelayTypeModal: React.FC<DelayTypeModalProps> = ({
  onClose,
  onSelect,
  initialData,
  isVisible = true,
}) => {
  const colors = useColors();
  const [selectedType, setSelectedType] = useState<DelayType | null>(
    initialData?.delayType || null
  );
  const [activeModal, setActiveModal] = useState<ActiveModal>('delayType');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState<'top' | 'bottom'>(
    'bottom'
  );
  const [isLoaded, setIsLoaded] = useState(false);

  // Set isLoaded to true after a longer delay to ensure theme is properly applied
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setIsLoaded(true);
      }, 50); // Reduced from 150ms to 50ms for less lag
      return () => clearTimeout(timer);
    }
    return () => {};
  }, [isVisible]);

  // Pre-compute button styles to ensure they're ready before display
  const buttonSecondaryStyle = {
    backgroundColor: colors['bg-secondary'],
    borderColor: colors['border-primary'],
    color: colors['text-primary'],
  };

  const handleFixedDelaySubmit = (seconds: number) => {
    onSelect(DelayType.FIXED_DURATION, { seconds });
  };

  const handleEventDelaySubmit = (
    eventName: string,
    expirationTime?: number
  ) => {
    onSelect(DelayType.WAIT_FOR_EVENT, { seconds: expirationTime, eventName });
  };

  // Calculate dropdown position based on available space
  useEffect(() => {
    if (isDropdownOpen && inputRef.current) {
      const inputRect = inputRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - inputRect.bottom;
      const spaceAbove = inputRect.top;
      const requiredSpace = 200; // max-height of dropdown

      if (spaceBelow < requiredSpace && spaceAbove > spaceBelow) {
        setDropdownPosition('top');
      } else {
        setDropdownPosition('bottom');
      }
    }
  }, [isDropdownOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Element)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Add escape key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleTypeSelect = (type: DelayType) => {
    setSelectedType(type);
    setIsDropdownOpen(false);
  };

  const getDelayTypeDisplayText = (type: DelayType | null) => {
    switch (type) {
      case DelayType.FIXED_DURATION:
        return 'Fixed Duration';
      case DelayType.WAIT_FOR_EVENT:
        return 'Wait for Event';
      default:
        return 'Select a delay type';
    }
  };

  // Create dynamic CSS for the dropdown options
  const getOptionStyles = () => {
    return {
      option: {
        display: 'flex',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 8px',
        margin: '1px 6px',
        borderRadius: '6px',
        cursor: 'pointer',
        transition: 'background-color 0.15s ease',
      },
      selected: {
        backgroundColor: `${colors['accent-primary']}15`,
      },
      optionHover: {
        '&:hover': {
          backgroundColor: colors['bg-tertiary'],
        },
      },
    };
  };

  // Create a style tag with our dynamic CSS
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .delay-type-option {
        cursor: pointer;
        transition: background-color 0.15s ease;
      }
      .delay-type-option:hover > div {
        background-color: ${colors['bg-tertiary']} !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, [colors]);

  // Handle continue button click to navigate to the next modal
  const handleContinue = () => {
    if (selectedType === DelayType.FIXED_DURATION) {
      setActiveModal('fixedDelay');
    } else if (selectedType === DelayType.WAIT_FOR_EVENT) {
      setActiveModal('eventDelay');
    }
  };

  // If the modal isn't visible, we still render but don't show it
  if (!isVisible) {
    return null;
  }

  // Render the appropriate modal based on activeModal state
  if (activeModal === 'fixedDelay') {
    return (
      <FixedDelayModal
        onClose={() => setActiveModal('delayType')}
        onSubmit={handleFixedDelaySubmit}
        initialSeconds={initialData?.seconds}
      />
    );
  }

  if (activeModal === 'eventDelay') {
    return (
      <EventDelayModal
        onClose={() => setActiveModal('delayType')}
        onSubmit={handleEventDelaySubmit}
        initialEventName={initialData?.eventName}
        initialSeconds={initialData?.seconds}
      />
    );
  }

  return (
    <div
      className={`fixed inset-0 z-[99999] flex items-center justify-center transition-opacity duration-300 ease-in-out ${isLoaded ? 'opacity-0' : 'opacity-0'}`}
      style={{ background: 'rgba(0,0,0,0.35)' }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex items-center justify-center w-full h-full"
      >
        <Modal
          title="Set delay"
          subtitle="Pause the Flow"
          onClose={onClose}
          width="w-[400px]"
          icon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/clock-stopwatch-1.svg`}
          actions={
            <div className="flex gap-3 w-full">
              <ButtonNormal
                onClick={onClose}
                variant="secondary"
                size="small"
                className="flex-1"
              >
                Cancel
              </ButtonNormal>
              <ButtonNormal
                onClick={handleContinue}
                disabled={!selectedType}
                variant="primary"
                size="small"
                className="flex-1"
              >
                Continue
              </ButtonNormal>
            </div>
          }
        >
          <div className="flex flex-col gap-4">
            <div>
              <label
                className="block mb-1.5 text-sm font-medium"
                style={{ color: colors['text-primary'] }}
              >
                Type of delay*
              </label>
              <div className="relative" ref={dropdownRef}>
                <div
                  ref={inputRef}
                  className="cursor-pointer"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <div
                    className="w-full px-3 py-2 rounded-lg border flex items-center justify-between"
                    style={{
                      borderColor: colors['border-primary'],
                      backgroundColor: colors['bg-secondary'],
                      color: selectedType
                        ? colors['text-primary']
                        : colors['text-tertiary'],
                    }}
                  >
                    <span
                      className="text-sm font-normal text-left"
                      style={{ color: colors['text-primary'] }}
                    >
                      {getDelayTypeDisplayText(selectedType)}
                    </span>
                    <div
                      className="flex items-center gap-2 transition-transform duration-200"
                      style={{
                        transform: isDropdownOpen
                          ? 'rotate(180deg)'
                          : 'rotate(0deg)',
                      }}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke={colors['text-tertiary']}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Dropdown menu */}
                {isDropdownOpen && (
                  <div
                    className="fixed rounded-lg shadow-lg max-h-[200px] overflow-y-auto transition-all duration-200 ease-in-out border py-1"
                    style={{
                      backgroundColor: colors['bg-secondary'],
                      borderColor: colors['border-secondary'],
                      animation: 'fadeIn 0.2s ease-out',
                      zIndex: 99999,
                      width: dropdownRef.current?.offsetWidth || 'auto',
                      left:
                        dropdownRef.current?.getBoundingClientRect().left || 0,
                      top:
                        dropdownPosition === 'top'
                          ? (dropdownRef.current?.getBoundingClientRect().top ||
                              0) -
                            10 -
                            (dropdownRef.current?.offsetHeight || 0)
                          : (dropdownRef.current?.getBoundingClientRect()
                              .bottom || 0) + 10,
                    }}
                  >
                    {/* Fixed Duration Option */}
                    <div
                      className="delay-type-option px-[6px] py-[1px]"
                      onClick={() => handleTypeSelect(DelayType.FIXED_DURATION)}
                    >
                      <div
                        className="flex items-center justify-between w-full rounded-[6px] py-[10px] px-[10px] pl-[8px]"
                        style={{
                          backgroundColor:
                            selectedType === DelayType.FIXED_DURATION
                              ? `${colors['accent-primary']}15`
                              : 'transparent',
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 flex-shrink-0">
                            <img
                              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/clock-stopwatch-1.svg`}
                              alt="Fixed Duration"
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div
                            className="text-sm font-normal text-left"
                            style={{ color: colors['text-primary'] }}
                          >
                            Fixed Duration
                          </div>
                        </div>
                        {selectedType === DelayType.FIXED_DURATION && (
                          <div
                            className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                            style={{
                              backgroundColor: `${colors['accent-primary']}20`,
                            }}
                          >
                            <img
                              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/check-icon2.svg`}
                              alt="Selected"
                              className="w-4 h-4 object-contain"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Wait for Event Option */}
                    <div
                      className="delay-type-option px-[6px] py-[1px]"
                      onClick={() => handleTypeSelect(DelayType.WAIT_FOR_EVENT)}
                    >
                      <div
                        className="flex items-center justify-between w-full rounded-[6px] py-[10px] px-[10px] pl-[8px]"
                        style={{
                          backgroundColor:
                            selectedType === DelayType.WAIT_FOR_EVENT
                              ? `${colors['accent-primary']}15`
                              : 'transparent',
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 flex-shrink-0">
                            <img
                              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/calendar-clock-1.svg`}
                              alt="Wait for Event"
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div
                            className="text-sm font-normal text-left"
                            style={{ color: colors['text-primary'] }}
                          >
                            Wait for Event
                          </div>
                        </div>
                        {selectedType === DelayType.WAIT_FOR_EVENT && (
                          <div
                            className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                            style={{
                              backgroundColor: `${colors['accent-primary']}20`,
                            }}
                          >
                            <img
                              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/check-icon2.svg`}
                              alt="Selected"
                              className="w-4 h-4 object-contain"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default DelayTypeModal;
