import React from 'react';
import { useColors } from '@/app/theme/hooks';
import ButtonNormal from '@/app/components/ButtonNormal';
import { BaseStepProps } from '@/app/workspace/[id]/[workflowId]/read/components/steps/BaseStep';
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
    <div className="h-full flex flex-col items-center justify-center gap-6">
      <div
        className="flex-shrink-0 w-[5vw] h-[5vw] min-w-[48px] min-h-[48px] max-w-[72px] max-h-[72px] rounded-md flex items-center justify-center border"
        style={{
          backgroundColor: colors['bg-secondary'],
          borderColor: colors['border-secondary'],
        }}
      >
        <img
          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/check-circle.svg`}
          alt="Success"
          className="w-[2.5vw] h-[2.5vw] min-w-[24px] min-h-[24px] max-w-[36px] max-h-[36px]"
        />
      </div>
      <h3
        className="text-[2.5vw] min-text-[28px] max-text-[36px] font-medium text-center"
        style={{ color: colors['text-primary'] }}
      >
        Congratulations! You've completed the process.
      </h3>
      <p
        className="text-[1.8vw] min-text-[20px] max-text-[24px] text-center"
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
