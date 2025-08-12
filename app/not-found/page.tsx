'use client';

import { useTheme } from '@/app/theme/hooks';
import ButtonNormal from '@/app/components/ButtonNormal';
import Link from 'next/link';
import { useSupabaseSession } from '@/hooks/useSupabaseSession';

export default function NotFound() {
  const { getCssVariable } = useTheme();
  const { user } = useSupabaseSession();

  return (
    <div 
      className="flex flex-col items-center justify-center min-h-screen"
      style={{ 
        backgroundColor: getCssVariable('button-secondary-bg'),
        color: getCssVariable('button-secondary-fg')
      }}
    >
      <h1 className="text-4xl font-bold">404 - Not Found</h1>
      <p className="mt-4" style={{ color: getCssVariable('button-tertiary-fg') }}>
        The page you're looking for doesn't exist.
      </p>
      <div className="mt-8">
        <Link href={user ? '/' : '/login'}>
          <ButtonNormal variant="primary">
            {user ? 'Return to Dashboard' : 'Go to Login'}
          </ButtonNormal>
        </Link>
      </div>
    </div>
  );
} 