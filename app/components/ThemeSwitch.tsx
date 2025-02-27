'use client';

import { useTheme } from '@/app/theme/hooks';
import ButtonNormal from './ButtonNormal';

export default function ThemeSwitch() {
  const { currentTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(currentTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <ButtonNormal
      onClick={toggleTheme}
      variant="tertiary"
      size="medium"
      iconOnly
      leadingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/${currentTheme === 'light' ? 'sun' : 'moon'}.svg`}
    />
  );
} 