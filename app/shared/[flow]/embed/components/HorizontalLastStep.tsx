import React from 'react';
import { useColors } from '@/app/theme/hooks';
import ButtonNormal from '@/app/components/ButtonNormal';
import { BaseStepProps } from '@/app/workspace/[id]/[workflowId]/read/components/steps/BaseStep';
import { cn } from '@/lib/utils';

interface HorizontalLastStepProps {
  onCopyLink: () => void;
  onRestart: () => void;
  onPreviousStep: () => void;
}

export default function HorizontalLastStep({
  onCopyLink,
  onRestart,
  onPreviousStep,
}: HorizontalLastStepProps) {
  const colors = useColors();

  return (
    <div className="h-full flex flex-col items-center justify-center gap-4">
      <img
        src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/logo/logo-pf-in-app.png`}
        alt="ProcessFlow Logo"
        className="w-40 mb-4 object-contain"
      />
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
      <div className="flex flex-col gap-3">
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
    </div>
  );
}
