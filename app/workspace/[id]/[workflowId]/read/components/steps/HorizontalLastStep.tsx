import React from 'react';
import { useColors } from '@/app/theme/hooks';
import ButtonNormal from '@/app/components/ButtonNormal';
import { BaseStepProps } from './BaseStep';
import { cn } from '@/lib/utils';

interface HorizontalLastStepProps {
  onCopyLink: () => void;
  onRestart: () => void;
}

export default function HorizontalLastStep({
  onCopyLink,
  onRestart,
}: HorizontalLastStepProps) {
  const colors = useColors();

  return (
    <div className="flex flex-col items-center justify-center gap-4 h-full">
      <div
        className="flex-shrink-0 w-12 h-12 rounded-md flex items-center justify-center border"
        style={{
          backgroundColor: colors['bg-secondary'],
          borderColor: colors['border-secondary'],
        }}
      >
        <img
          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/check-circle.svg`}
          alt="Success"
          className="w-6 h-6"
        />
      </div>
      <h3
        className="text-xl font-medium"
        style={{ color: colors['text-primary'] }}
      >
        Congratulations! You've completed the process.
      </h3>
      <p
        className="text-base mb-4 text-center"
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
      <ButtonNormal
        variant="tertiary"
        size="small"
        onClick={onRestart}
        leadingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/refresh-cw-01.svg`}
      >
        Restart process
      </ButtonNormal>
    </div>
  );
}
