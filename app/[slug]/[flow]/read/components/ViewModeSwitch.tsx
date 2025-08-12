'use client';

import { useColors } from '@/app/theme/hooks';
import ButtonNormal from '@/app/components/ButtonNormal';

interface ViewModeSwitchProps {
  mode: 'vertical' | 'carousel';
  onModeChange: (mode: 'vertical' | 'carousel') => void;
}

export default function ViewModeSwitch({ mode, onModeChange }: ViewModeSwitchProps) {
  const colors = useColors();

  return (
    <div 
      className="inline-flex"
    >
      <ButtonNormal
        variant={mode === 'vertical' ? 'primary' : 'secondary'}
        size="small"
        iconOnly
        onClick={() => onModeChange('vertical')}
        className="!rounded-r-none"
        leadingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/rows-01.svg`}
      />
      <ButtonNormal
        variant={mode === 'carousel' ? 'primary' : 'secondary'}
        size="small"
        iconOnly
        onClick={() => onModeChange('carousel')}
        className="!rounded-l-none !border-l-0"
        leadingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/perspective-02.svg`}
      />
    </div>
  );
} 