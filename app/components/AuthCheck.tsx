'use client';

import { createBrowserClient } from '@supabase/ssr';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { onboarding_step } from '@prisma/client';
import LoadingSpinner from './LoadingSpinner';

type OnboardingResponse = {
  onboardingStep: onboarding_step;
  completed: boolean;
};

const PUBLIC_PATHS = [
  '/login',
  '/signup',
  '/auth/callback',
  '/auth/confirm',
  '/reset-password-request',
  '/reset-password'
] as const;

export default function AuthCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const isPublicPath = PUBLIC_PATHS.some((path: string) =>
    pathname.startsWith(path)
  );

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Batch all checks together
        const [authResponse, onboardingResponse] = await Promise.all([
          supabase.auth.getUser(),
          fetch('/api/auth/check-onboarding')
        ]);

        const { data: { user }, error: authError } = authResponse;

        // Handle no user case
        if (!user || authError) {
          if (!isPublicPath) {
            router.push('/login');
          }
          setIsLoading(false);
          return;
        }

        // Handle onboarding check
        if (onboardingResponse.ok) {
          const data = (await onboardingResponse.json()) as OnboardingResponse;

          if (data.onboardingStep && !data.completed) {
            const onboardingSteps: Record<onboarding_step, string> = {
              'PERSONAL_INFO': '/onboarding/personal-info',
              'PROFESSIONAL_INFO': '/onboarding/professional-info',
              'WORKSPACE_SETUP': '/onboarding/workspace-setup',
              'COMPLETED': '/onboarding/completed',
              'INVITED_USER': '/onboarding/invited-user'
            };

            const currentStep = onboardingSteps[data.onboardingStep];

            if (isPublicPath || !pathname.startsWith(currentStep)) {
              router.push(currentStep);
            }
          } else if (isPublicPath) {
            router.push('/dashboard');
          }
        }
      } catch (error) {
        console.error('Error in auth check:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [pathname, router]);

  if (isLoading && pathname !== '/login' && !pathname.startsWith('/auth/')) {
    return <LoadingSpinner fullScreen size="large" />;
  }

  return <>{children}</>;
}
