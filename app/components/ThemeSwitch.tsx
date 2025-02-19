'use client';

import { useTheme } from '@/app/context/ThemeContext';
import ButtonNormal from './ButtonNormal';

export default function ThemeSwitch() {
  const { mode, toggleMode } = useTheme();

  return (
    <ButtonNormal
      onClick={toggleMode}
      variant="secondaryGray"
      size="medium"
      mode={mode}
      iconOnly
      leadingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/${
        mode === 'light' ? 'sun.svg' : 'moon.svg'
      }`}
    />
  );
} 