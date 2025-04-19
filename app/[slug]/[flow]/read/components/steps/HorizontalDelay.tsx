import React from 'react';
import { cn } from '@/lib/utils';
import { useColors } from '@/app/theme/hooks';
import { BaseStepProps } from './BaseStep';
import Image from 'next/image';
import { DelayType } from '../../../types';

interface HorizontalDelayProps extends BaseStepProps {}

export default function HorizontalDelay({ block }: HorizontalDelayProps) {
  const colors = useColors();

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
      </div>
    </div>
  );
}
