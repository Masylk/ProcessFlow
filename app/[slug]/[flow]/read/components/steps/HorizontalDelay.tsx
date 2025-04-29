import React from 'react';
import { cn } from '@/lib/utils';
import { useColors } from '@/app/theme/hooks';
import { BaseStepProps } from './BaseStep';
import Image from 'next/image';
import { DelayType } from '../../../types';
import { motion, AnimatePresence } from 'framer-motion';

interface HorizontalDelayProps extends BaseStepProps {
  selectedOptionIds?: [number, number][];
  onOptionSelect?: (
    optionId: number,
    blockId: number,
    isMerge?: boolean
  ) => void;
}

export default function HorizontalDelay({
  block,
  selectedOptionIds,
  onOptionSelect,
}: HorizontalDelayProps) {
  const colors = useColors();

  const handleOptionSelect = (
    optionId: number,
    blockId: number,
    isMerge?: boolean
  ) => {
    onOptionSelect?.(optionId, blockId, isMerge);
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
      if (minutes > 0)
        parts.push(`${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`);

      return parts.length > 0 ? parts.join(' and ') : '';
    }
  };

  const getDelayIcon = () => {
    if (block.delay_type === DelayType.WAIT_FOR_EVENT) {
      return `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/calendar-clock-1.svg`;
    }
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/clock-stopwatch-1.svg`;
  };

  const getDelayTitle = () => {
    return block.delay_type === DelayType.WAIT_FOR_EVENT
      ? 'Event-Based Delay'
      : 'Fixed Duration';
  };

  const expirationText = () => {
    if (!block.delay_seconds) return '';
    const days = Math.floor(block.delay_seconds / 86400);
    const hours = Math.floor((block.delay_seconds % 86400) / 3600);
    const minutes = Math.floor((block.delay_seconds % 3600) / 60);

    const parts = [];
    if (days > 0) parts.push(`${days} ${days === 1 ? 'day' : 'days'}`);
    if (hours > 0) parts.push(`${hours} ${hours === 1 ? 'hour' : 'hours'}`);
    if (minutes > 0)
      parts.push(`${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`);

    return parts.length > 0 ? `${parts.join(' and ')}` : '';
  };

  if (block.delay_type === DelayType.FIXED_DURATION) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                'rounded-[6px] border shadow-sm flex items-center justify-center',
                'w-12 h-12'
              )}
              style={{
                backgroundColor: colors['bg-primary'],
                borderColor: colors['border-secondary'],
              }}
            >
              <Image src={getDelayIcon()} alt="Delay" width={24} height={24} />
            </div>
            <span
              className={cn('font-semibold', 'text-base')}
              style={{ color: colors['text-primary'] }}
            >
              {getDelayTitle()}
            </span>
          </div>

          <div
            className={cn(
              'flex items-center gap-2 p-3 rounded-lg bg-opacity-5'
            )}
            style={{ backgroundColor: colors['bg-secondary'] }}
          >
            <Image
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/pause-circle.svg`}
              alt="Info"
              width={20}
              height={20}
            />
            <span
              className={cn('text-sm whitespace-pre-line')}
              style={{ color: colors['text-secondary'] }}
            >
              Flow paused for {getDelayText()}
            </span>
          </div>

          {block.child_paths && block.child_paths.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.1 }}
              className="mt-4"
            >
              <p
                className="text-sm font-medium mb-4"
                style={{ color: colors['text-primary'] }}
              >
                Select an option
              </p>
              <div className="space-y-2">
                {block.child_paths.map((option, index) => (
                  <motion.button
                    key={option.path.id}
                    onClick={() =>
                      handleOptionSelect(option.path.id, block.id, false)
                    }
                    className={cn(
                      'w-full p-4 rounded-lg border transition-colors duration-200 will-change-transform',
                      'flex items-start gap-3 text-left',
                      selectedOptionIds?.some(
                        ([pathId, blockId]) =>
                          pathId === option.path.id && blockId === block.id
                      ) && 'border-brand'
                    )}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.2,
                      delay: 0.1 + index * 0.05,
                    }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    style={{
                      backgroundColor: colors['bg-primary'],
                      borderColor: selectedOptionIds?.some(
                        ([pathId, blockId]) =>
                          pathId === option.path.id && blockId === block.id
                      )
                        ? colors['border-brand']
                        : colors['border-secondary'],
                      transform: 'translateZ(0)',
                    }}
                  >
                    <div
                      className="w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center"
                      style={{
                        borderColor: selectedOptionIds?.some(
                          ([pathId, blockId]) =>
                            pathId === option.path.id && blockId === block.id
                        )
                          ? colors['border-brand']
                          : colors['border-secondary'],
                        backgroundColor: selectedOptionIds?.some(
                          ([pathId, blockId]) =>
                            pathId === option.path.id && blockId === block.id
                        )
                          ? colors['bg-brand-solid']
                          : 'transparent',
                      }}
                    >
                      <AnimatePresence>
                        {selectedOptionIds?.some(
                          ([pathId, blockId]) =>
                            pathId === option.path.id && blockId === block.id
                        ) && (
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
                      <p
                        className="font-normal text-sm"
                        style={{ color: colors['text-primary'] }}
                      >
                        {option.path.name}
                      </p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                'rounded-[6px] border shadow-sm flex items-center justify-center',
                'w-12 h-12'
              )}
              style={{
                backgroundColor: colors['bg-primary'],
                borderColor: colors['border-secondary'],
              }}
            >
              <Image src={getDelayIcon()} alt="Delay" width={24} height={24} />
            </div>
            <span
              className={cn('font-semibold', 'text-base')}
              style={{ color: colors['text-primary'] }}
            >
              {getDelayTitle()}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span
                className={cn('text-sm')}
                style={{ color: colors['text-secondary'] }}
              >
                Waiting for:
              </span>
              <span
                className={cn('text-sm whitespace-pre-line')}
                style={{ color: colors['text-primary'] }}
              >
                {getDelayText()}
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
                <span
                  className={cn('text-sm')}
                  style={{ color: colors['text-secondary'] }}
                >
                  Expires after {expirationText()}
                </span>
              </div>
            )}
          </div>
        </div>

        <div
          className={cn('flex items-center gap-2 p-3 rounded-lg bg-opacity-5')}
          style={{ backgroundColor: colors['bg-secondary'] }}
        >
          <Image
            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/pause-circle.svg`}
            alt="Info"
            width={20}
            height={20}
          />
          <span
            className={cn('text-sm')}
            style={{ color: colors['text-secondary'] }}
          >
            {block.delay_seconds
              ? 'Flow paused until event occurs or time expires'
              : 'Flow paused until event occurs'}
          </span>
        </div>

        {block.child_paths && block.child_paths.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="mt-4"
          >
            <p
              className="text-sm font-medium mb-4"
              style={{ color: colors['text-primary'] }}
            >
              Select an option
            </p>
            <div className="space-y-2">
              {block.child_paths.map((option, index) => (
                <motion.button
                  key={option.path.id}
                  onClick={() =>
                    handleOptionSelect(option.path.id, block.id, false)
                  }
                  className={cn(
                    'w-full p-4 rounded-lg border transition-colors duration-200 will-change-transform',
                    'flex items-start gap-3 text-left',
                    selectedOptionIds?.some(
                      ([pathId, blockId]) =>
                        pathId === option.path.id && blockId === block.id
                    ) && 'border-brand'
                  )}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.2,
                    delay: 0.1 + index * 0.05,
                  }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  style={{
                    backgroundColor: colors['bg-primary'],
                    borderColor: selectedOptionIds?.some(
                      ([pathId, blockId]) =>
                        pathId === option.path.id && blockId === block.id
                    )
                      ? colors['border-brand']
                      : colors['border-secondary'],
                    transform: 'translateZ(0)',
                  }}
                >
                  <div
                    className="w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center"
                    style={{
                      borderColor: selectedOptionIds?.some(
                        ([pathId, blockId]) =>
                          pathId === option.path.id && blockId === block.id
                      )
                        ? colors['border-brand']
                        : colors['border-secondary'],
                      backgroundColor: selectedOptionIds?.some(
                        ([pathId, blockId]) =>
                          pathId === option.path.id && blockId === block.id
                      )
                        ? colors['bg-brand-solid']
                        : 'transparent',
                    }}
                  >
                    <AnimatePresence>
                      {selectedOptionIds?.some(
                        ([pathId, blockId]) =>
                          pathId === option.path.id && blockId === block.id
                      ) && (
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
                    <p
                      className="font-normal text-sm"
                      style={{ color: colors['text-primary'] }}
                    >
                      {option.path.name}
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
