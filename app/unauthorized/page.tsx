'use client';

import { useTheme } from '@/app/theme/hooks';
import ButtonNormal from '@/app/components/ButtonNormal';
import Link from 'next/link';
import { useSupabaseSession } from '@/hooks/useSupabaseSession';

export default function UnauthorizedPage() {
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
      <h1 className="text-4xl font-bold text-[color:var(--text-error-primary)]">
        Unauthorized Access
      </h1>
      <p className="mt-4" style={{ color: getCssVariable('button-tertiary-fg') }}>
        You don't have permission to access this resource.
      </p>
      <div className="mt-8">
        <Link href={user ? '/' : '/login'}>
          <ButtonNormal 
            variant={user ? "primary" : "primary"}
          >
            {user ? 'Return to Dashboard' : 'Go to Login'}
          </ButtonNormal>
        </Link>
      </div>
    </div>
  );
}
