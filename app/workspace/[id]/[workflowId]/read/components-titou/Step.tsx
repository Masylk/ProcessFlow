import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useColors } from '@/app/theme/hooks';
import Image from 'next/image';
import ButtonNormal from '@/app/components/ButtonNormal';

interface Option {
  id: string;
  title: string;
  description: string;
}

interface StepProps {
  number: number;
  title: string;
  description?: string;
  children?: React.ReactNode;
  isActive?: boolean;
  className?: string;
  defaultExpanded?: boolean;
  onToggle?: (isExpanded: boolean) => void;
  variant?: 'default' | 'conditional' | 'last';
  options?: Option[];
  selectedOptionId?: string;
  onOptionSelect?: (optionId: string) => void;
  icon: string;
  isLastStep?: boolean;
  onCopyLink?: () => void;
}

export default function Step({
  number,
  title,
  description,
  children,
  isActive = false,
  className,
  defaultExpanded = false,
  onToggle,
  variant = 'default',
  options = [],
  selectedOptionId,
  onOptionSelect,
  icon,
  isLastStep = false,
  onCopyLink
}: StepProps) {
  const colors = useColors();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const [shouldShowReadMore, setShouldShowReadMore] = useState(false);

  useEffect(() => {
    if (descriptionRef.current) {
      const lineHeight = parseInt(window.getComputedStyle(descriptionRef.current).lineHeight);
      const height = descriptionRef.current.offsetHeight;
      setShouldShowReadMore(height > lineHeight * 2); // Show Read more if text is more than 2 lines
    }
  }, [description]);

  const handleToggle = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    onToggle?.(newState);
  };

  const handleOptionSelect = (optionId: string) => {
    onOptionSelect?.(optionId);
  };

  if (variant === 'last') {
    const renderIcon = () => {
      if (!icon) return null;
      
      return (
        <div 
          className="w-12 h-12 rounded-[10px] border shadow-sm flex items-center justify-center"
          style={{ 
            backgroundColor: colors['bg-primary'],
            borderColor: colors['border-secondary']
          }}
        >
          {typeof icon === 'string' ? (
            <img
              src={icon}
              alt="Success"
              className="w-6 h-6"
            />
          ) : (
            icon
          )}
        </div>
      );
    };

    return (
      <div className="relative">
        <div 
          className={cn(
            'w-[550px] rounded-lg overflow-hidden',
            'border transition-all duration-200 p-6',
            className
          )}
          style={{
            backgroundColor: colors['bg-primary'],
            borderColor: colors['border-secondary']
          }}
        >
          <div className="flex flex-col items-start text-left">
            {renderIcon()}
            <h3 
              className="text-md font-semibold mb-3 mt-6"
              style={{ color: colors['text-primary'] }}
            >
              Congratulations! Your process has been completed.
            </h3>
            <p 
              className="text-base mb-6"
              style={{ color: colors['text-secondary'] }}
            >
              Share it with your team members!
            </p>
            <ButtonNormal
              variant="primary"
              size="small"
              onClick={onCopyLink}
              leadingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/link-02-white.svg`}
            >
              Copy link
            </ButtonNormal>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div 
        className={cn(
          'w-[550px] rounded-lg overflow-hidden',
          'border transition-all duration-200',
          className
        )}
        style={{
          backgroundColor: colors['bg-primary'],
          borderColor: isActive ? colors['border-brand'] : colors['border-secondary']
        }}
      >
        <button
          onClick={handleToggle}
          className={cn(
            'w-full flex items-center justify-between p-6',
            'transition-colors duration-200 ease-in-out cursor-pointer'
          )}
          style={{
            backgroundColor: colors['bg-primary']
          }}
        >
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-8 h-8">
              <Image
                src={icon}
                alt={title}
                width={32}
                height={32}
              />
            </div>
            <div className="flex flex-col items-start gap-2 flex-1">
              <div className="flex items-center gap-2">
                <span 
                  className="text-sm font-medium"
                  style={{ color: colors['text-secondary'] }}
                >
                  {number}.
                </span>
                <span 
                  className={cn(
                    'text-left text-base',
                    isActive && 'font-medium'
                  )}
                  style={{
                    color: colors['text-primary']
                  }}
                >
                  {title}
                </span>
              </div>
              {description && (
                <div className="text-left w-full">
                  <p
                    ref={descriptionRef}
                    className={cn(
                      "text-sm transition-all duration-200 max-w-[400px]",
                      !isDescriptionExpanded && "line-clamp-2"
                    )}
                    style={{ color: colors['text-quaternary'] }}
                  >
                    {description}
                  </p>
                  {shouldShowReadMore && (
                    <ButtonNormal
                      variant="tertiary-color"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsDescriptionExpanded(!isDescriptionExpanded);
                      }}
                      className="mt-1"
                    >
                      {isDescriptionExpanded ? 'Show less' : 'Read more'}
                    </ButtonNormal>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex-shrink-0">
            <Image
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/chevron-down.svg`}
              alt="Toggle content"
              width={24}
              height={24}
              className={cn(
                'transition-transform duration-200',
                isExpanded && 'transform rotate-180'
              )}
              style={{
                filter: 'none'
              }}
            />
          </div>
        </button>
        
        {isExpanded && variant === 'conditional' && options.length > 0 && (
          <div className="px-4 pb-4">
            <p className="text-lg font-medium mb-4" style={{ color: colors['text-primary'] }}>
              Select an option
            </p>
            <div className="space-y-2">
              {options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleOptionSelect(option.id)}
                  className={cn(
                    'w-full p-4 rounded-lg border transition-all duration-200',
                    'flex items-start gap-3 text-left',
                    selectedOptionId === option.id && 'border-brand'
                  )}
                  style={{
                    backgroundColor: colors['bg-primary'],
                    borderColor: selectedOptionId === option.id ? colors['border-brand'] : colors['border-secondary'],
                 
                  }}
                >
                  <div 
                    className="w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center"
                    style={{
                      borderColor: selectedOptionId === option.id ? colors['border-brand'] : colors['border-secondary'],
                      backgroundColor: selectedOptionId === option.id ? colors['bg-brand-solid'] : 'transparent'
                    }}
                  >
                    {selectedOptionId === option.id && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium" style={{ color: colors['text-primary'] }}>
                      {option.title}
                    </p>
                    <p className="text-sm" style={{ color: colors['text-secondary'] }}>
                      {option.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {isExpanded && variant === 'default' && (
          <div 
            className="border-t p-4"
            style={{
              borderColor: colors['border-secondary']
            }}
          >
            {children}
          </div>
        )}
      </div>
      {!isLastStep && (
        <div 
          className="absolute left-4 bottom-0 w-[1px] h-16 -mb-16"
          style={{ backgroundColor: colors['border-secondary'] }}
        />
      )}
    </div>
  );
} 