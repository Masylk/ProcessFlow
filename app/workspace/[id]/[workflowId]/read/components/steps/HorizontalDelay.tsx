import React from 'react';
import { cn } from '@/lib/utils';
import { useColors } from '@/app/theme/hooks';
import { BaseStepProps } from './BaseStep';
import Image from 'next/image';
import { DelayType } from '../../../types';

export default function HorizontalDelay({ block }: BaseStepProps) {
  const colors = useColors();

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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-[6px] border shadow-sm flex items-center justify-center"
          style={{
            backgroundColor: colors['bg-primary'],
            borderColor: colors['border-secondary'],
          }}
        >
          <Image
            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/clock.svg`}
            alt="Delay"
            width={24}
            height={24}
          />
        </div>
        <div className="flex flex-col gap-1">
          <span
            className="text-base font-semibold"
            style={{ color: colors['text-primary'] }}
          >
            {block.delay_type || 'Delay'}
          </span>
          <span
            className="text-sm"
            style={{ color: colors['text-quaternary'] }}
          >
            {getDelayText()}
          </span>
        </div>
      </div>
    </div>
  );
}
