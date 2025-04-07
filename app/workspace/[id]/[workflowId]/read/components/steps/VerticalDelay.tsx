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

  const getDelayTitle = () => {
    return block.delay_type === DelayType.WAIT_FOR_EVENT ? 'Event-Based Delay' : 'Fixed Duration';
  };

  const getDelayIcon = () => {
    if (block.delay_type === DelayType.WAIT_FOR_EVENT) {
      return `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/calendar-clock-1.svg`;
    }
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/clock-stopwatch-1.svg`;
  };

  const getDelayText = () => {
    if (block.delay_type === DelayType.WAIT_FOR_EVENT) {
      return block.delay_event;
    } else {
      const seconds = block.delay_seconds || 0;
      const days = Math.floor(seconds / 86400);
      const hours = Math.floor((seconds % 86400) / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);

      const parts = [];
      if (days > 0) parts.push(`${days} ${days === 1 ? 'day' : 'days'}`);
      if (hours > 0) parts.push(`${hours} ${hours === 1 ? 'hour' : 'hours'}`);
      if (minutes > 0) parts.push(`${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`);

      return parts.length > 0 ? parts.join(' and ') : '';
    }
  };

  if (block.delay_type === DelayType.FIXED_DURATION) {
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
            className="w-full flex flex-col p-6 gap-4"
            style={{
              backgroundColor: colors['bg-primary'],
            }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-[6px] border shadow-sm flex items-center justify-center"
                style={{
                  backgroundColor: colors['bg-primary'],
                  borderColor: colors['border-secondary'],
                }}
              >
                <Image
                  src={getDelayIcon()}
                  alt="Delay"
                  width={24}
                  height={24}
                />
              </div>
              <span
                className={cn(
                  'text-base font-semibold',
                  isActive && 'font-semibold'
                )}
                style={{
                  color: colors['text-primary'],
                }}
              >
                {getDelayTitle()}
              </span>
            </div>

            <div
              className="flex items-center gap-2 p-3 rounded-lg bg-opacity-5"
              style={{ backgroundColor: colors['bg-secondary'] }}
            >
              <Image
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/pause-circle.svg`}
                alt="Info"
                width={20}
                height={20}
              />
              <span className="text-sm" style={{ color: colors['text-secondary'] }}>
                Flow paused for {getDelayText()}
              </span>
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
          className="w-full flex flex-col p-6 gap-4"
          style={{
            backgroundColor: colors['bg-primary'],
          }}
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-[6px] border shadow-sm flex items-center justify-center"
                style={{
                  backgroundColor: colors['bg-primary'],
                  borderColor: colors['border-secondary'],
                }}
              >
                <Image
                  src={getDelayIcon()}
                  alt="Delay"
                  width={24}
                  height={24}
                />
              </div>
              <span
                className={cn(
                  'text-base font-semibold',
                  isActive && 'font-semibold'
                )}
                style={{
                  color: colors['text-primary'],
                }}
              >
                {getDelayTitle()}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm" style={{ color: colors['text-secondary'] }}>
                Waiting for:
              </span>
              <span className="text-sm" style={{ color: colors['text-primary'] }}>
                {block.delay_event}
              </span>
            </div>

            {block.delay_seconds && (
              <div className="flex items-center gap-2">
                <Image
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/hourglass-01.svg`}
                  alt="Clock"
                  width={16}
                  height={16}
                />
                <span className="text-sm" style={{ color: colors['text-secondary'] }}>
                  Expires after {getDelayText()}
                </span>
              </div>
            )}
          </div>

          <div
            className="flex items-center gap-2 p-3 rounded-lg bg-opacity-5"
            style={{ backgroundColor: colors['bg-secondary'] }}
          >
            <Image
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/pause-circle.svg`}
              alt="Info"
              width={20}
              height={20}
            />
            <span className="text-sm" style={{ color: colors['text-secondary'] }}>
              {block.delay_seconds ? "Flow paused until event occurs or time expires" : "Flow paused until event occurs"}
            </span>
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
