import React from 'react';
import { cn } from '@/lib/utils';
import { useColors } from '@/app/theme/hooks';
import { motion } from 'framer-motion';
import { BaseStepProps } from './BaseStep';
import Image from 'next/image';
import { DelayType } from '../../../types';

export default function VerticalDelay({
  block,
  isActive = false,
  className,
  isLastStep = false,
}: BaseStepProps) {
  const colors = useColors();

  const slideUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const getDelayText = () => {
    if (block.delay_type === DelayType.WAIT_FOR_EVENT) {
      return `Wait for event: ${block.delay_event}`;
    } else {
      const seconds = block.delay_seconds || 0;
      if (seconds < 60) {
        return `Wait for ${seconds} seconds`;
      } else if (seconds < 3600) {
        return `Wait for ${Math.floor(seconds / 60)} minutes`;
      } else {
        return `Wait for ${Math.floor(seconds / 3600)} hours`;
      }
    }
  };

  const getDelayIcon = () => {
    if (block.delay_type === DelayType.WAIT_FOR_EVENT) {
      return `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/calendar-clock-1.svg`;
    }
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/clock-stopwatch-1.svg`;
  };

  return (
    <div className={`relative ${className}`}>
      <motion.div
        className={cn(
          'max-w-[950px] min-w-[300px] rounded-lg overflow-hidden will-change-transform',
          'border transition-all duration-200',
          className
        )}
        variants={slideUpVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.3 }}
        style={{
          backgroundColor: colors['bg-primary'],
          borderColor: isActive
            ? colors['border-brand']
            : colors['border-secondary'],
          transform: 'translateZ(0)',
        }}
      >
        <div
          className="w-full flex flex-col p-6"
          style={{
            backgroundColor: colors['bg-primary'],
          }}
        >
          <div className="flex items-center gap-4 flex-1 min-w-0 mb-3">
            <motion.div
              className="w-12 h-12 rounded-[6px] border shadow-sm flex items-center justify-center"
              style={{
                backgroundColor: colors['bg-primary'],
                borderColor: colors['border-secondary'],
              }}
            >
              <Image src={getDelayIcon()} alt="Delay" width={24} height={24} />
            </motion.div>
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={cn(
                  'text-left text-base font-semibold',
                  isActive && 'font-medium'
                )}
                style={{
                  color: colors['text-primary'],
                }}
              >
                {block.delay_type || 'Delay'}
              </span>
            </div>
          </div>

          <div className="text-left w-full">
            <p
              className="text-sm transition-all duration-200 break-words min-h-[1.5rem]"
              style={{ color: colors['text-quaternary'] }}
            >
              {getDelayText()}
            </p>
          </div>
        </div>
      </motion.div>
      {!isLastStep && (
        <motion.div
          className="absolute left-4 bottom-0 w-[1px] h-20 -mb-20"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.3 }}
          style={{ backgroundColor: colors['border-secondary'], originY: 0 }}
        />
      )}
    </div>
  );
}
