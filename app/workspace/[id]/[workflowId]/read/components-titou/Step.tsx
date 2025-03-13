import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useColors } from '@/app/theme/hooks';
import Image from 'next/image';
import ButtonNormal from '@/app/components/ButtonNormal';
import { AnimatePresence, motion } from 'framer-motion';

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
  stepRef?: React.RefObject<HTMLDivElement>;
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
  onCopyLink,
  stepRef
}: StepProps) {
  const colors = useColors();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const descriptionRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    setIsExpanded(defaultExpanded);
  }, [defaultExpanded]);

  const handleToggle = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    onToggle?.(newState);

    // Enhanced scroll centering with top offset consideration
    if (stepRef?.current) {
      // If expanding, wait for the content to be visible before scrolling
      if (newState) {
        // Small delay to allow content to expand
        setTimeout(() => {
          const viewportHeight = window.innerHeight;
          const element = stepRef.current;
          
          if (!element) return;
          
          // Get the full height of the element including expanded content
          const elementRect = element.getBoundingClientRect();
          const elementHeight = elementRect.height;
          
          // Add offset from top (adjust this value based on your header height)
          const topOffset = 100; // Adjust this value based on your header height
          
          // Calculate the target scroll position that will center the element
          const targetScroll = Math.max(
            0,
            window.scrollY + elementRect.top - (viewportHeight - elementHeight) / 2 - topOffset
          );
          
          // Smooth scroll to the calculated position
          window.scrollTo({
            top: targetScroll,
            behavior: 'smooth'
          });
        }, 100); // Increased delay to ensure content has expanded
      } else {
        // If collapsing, scroll immediately
        const viewportHeight = window.innerHeight;
        const elementRect = stepRef.current.getBoundingClientRect();
        const elementHeight = elementRect.height;
        const topOffset = 100; // Same offset for consistency
        
        const targetScroll = Math.max(
          0,
          window.scrollY + elementRect.top - (viewportHeight - elementHeight) / 2 - topOffset
        );
        
        window.scrollTo({
          top: targetScroll,
          behavior: 'smooth'
        });
      }
    }
  };

  const handleOptionSelect = (optionId: string) => {
    onOptionSelect?.(optionId);
  };

  const slideUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const expandVariants = {
    collapsed: { opacity: 0, height: 0 },
    expanded: { opacity: 1, height: 'auto' }
  };

  if (variant === 'last') {
    const renderIcon = () => {
      if (!icon) return null;
      
      return (
        <motion.div 
          className="w-12 h-12 rounded-[10px] border shadow-sm flex items-center justify-center will-change-transform"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          style={{ 
            backgroundColor: colors['bg-primary'],
            borderColor: colors['border-secondary'],
            transform: 'translateZ(0)'  // Hardware acceleration
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
        </motion.div>
      );
    };

    return (
      <div className="relative">
        <motion.div 
          className={cn(
            'w-[550px] rounded-lg overflow-hidden will-change-transform',
            'border transition-all duration-200 p-6',
            className
          )}
          variants={slideUpVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.3 }}
          style={{
            backgroundColor: colors['bg-primary'],
            borderColor: colors['border-secondary'],
            transform: 'translateZ(0)'  // Hardware acceleration
          }}
        >
          <div className="flex flex-col items-start text-left">
            {renderIcon()}
            <motion.h3 
              className="text-md font-semibold mb-3 mt-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              style={{ color: colors['text-primary'] }}
            >
              Congratulations! Your process has been completed.
            </motion.h3>
            <motion.p 
              className="text-base mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              style={{ color: colors['text-secondary'] }}
            >
              Share it with your team members!
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <ButtonNormal
                variant="primary"
                size="small"
                onClick={onCopyLink}
                leadingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/link-02-white.svg`}
              >
                Copy link
              </ButtonNormal>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative" ref={stepRef}>
      <motion.div 
        className={cn(
          'w-[550px] rounded-lg overflow-hidden will-change-transform',
          'border transition-all duration-200',
          className
        )}
        variants={slideUpVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.3 }}
        style={{
          backgroundColor: colors['bg-primary'],
          borderColor: isActive ? colors['border-brand'] : colors['border-secondary'],
          transform: 'translateZ(0)'  // Hardware acceleration
        }}
      >
        <button
          onClick={handleToggle}
          className={cn(
            'w-full flex items-start justify-between p-6',
            'transition-colors duration-200 ease-in-out cursor-pointer'
          )}
          style={{
            backgroundColor: colors['bg-primary']
          }}
        >
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <motion.div 
              className="flex-shrink-0 w-8 h-8 mt-1"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Image
                src={icon}
                alt={title}
                width={32}
                height={32}
              />
            </motion.div>
            <div className="flex flex-col items-start gap-2 min-w-0">
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
                      "text-sm transition-all duration-200 break-words",
                      !isExpanded && "line-clamp-2"
                    )}
                    style={{ color: colors['text-quaternary'] }}
                  >
                    {description}
                  </p>
                </div>
              )}
            </div>
          </div>
          <motion.div 
            className="flex-shrink-0 ml-4"
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <Image
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/chevron-down.svg`}
              alt="Toggle content"
              width={24}
              height={24}
              className="transition-transform duration-200"
              style={{
                filter: 'none'
              }}
            />
          </motion.div>
        </button>
        
        <AnimatePresence>
          {isExpanded && variant === 'conditional' && options.length > 0 && (
            <motion.div 
              className="px-4 pb-4 overflow-hidden will-change-transform"
              variants={expandVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              transition={{ 
                duration: 0.3,
                height: {
                  duration: 0.3
                },
                opacity: {
                  duration: 0.2
                }
              }}
              style={{ transform: 'translateZ(0)' }}  // Hardware acceleration
            >
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.1 }}
              >
                <p className="text-lg font-medium mb-4" style={{ color: colors['text-primary'] }}>
                  Select an option
                </p>
                <div className="space-y-2">
                  {options.map((option, index) => (
                    <motion.button
                      key={option.id}
                      onClick={() => handleOptionSelect(option.id)}
                      className={cn(
                        'w-full p-4 rounded-lg border transition-colors duration-200 will-change-transform',
                        'flex items-start gap-3 text-left',
                        selectedOptionId === option.id && 'border-brand'
                      )}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: 0.1 + index * 0.05 }}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      style={{
                        backgroundColor: colors['bg-primary'],
                        borderColor: selectedOptionId === option.id ? colors['border-brand'] : colors['border-secondary'],
                        transform: 'translateZ(0)'  // Hardware acceleration
                      }}
                    >
                      <div 
                        className="w-5 h-5 rounded-full border-2 flex-shrink-0 mt-1.5 flex items-center justify-center"
                        style={{
                          borderColor: selectedOptionId === option.id ? colors['border-brand'] : colors['border-secondary'],
                          backgroundColor: selectedOptionId === option.id ? colors['bg-brand-solid'] : 'transparent'
                        }}
                      >
                        <AnimatePresence>
                          {selectedOptionId === option.id && (
                            <motion.div 
                              className="w-2 h-2 bg-white rounded-full"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                              transition={{ duration: 0.2 }}
                            />
                          )}
                        </AnimatePresence>
                      </div>
                      <div className="flex flex-col gap-1">
                        <p className="font-medium" style={{ color: colors['text-primary'] }}>
                          {option.title}
                        </p>
                        <p className="text-sm" style={{ color: colors['text-secondary'] }}>
                          {option.description}
                        </p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        
          {isExpanded && variant === 'default' && (
            <motion.div 
              className="border-t p-4 will-change-transform"
              variants={expandVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              transition={{ duration: 0.3 }}
              style={{
                borderColor: colors['border-secondary'],
                transform: 'translateZ(0)'  // Hardware acceleration
              }}
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      {!isLastStep && (
        <motion.div 
          className="absolute left-4 bottom-0 w-[1px] h-16 -mb-16"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.3 }}
          style={{ backgroundColor: colors['border-secondary'], originY: 0 }}
        />
      )}
    </div>
  );
} 