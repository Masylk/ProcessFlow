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

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        const sharePaths = [
          '/shared',
          '/step-icons',
          '/apps',
          '/assets',
          '.png',
          '.svg',
          '/unauthorized',
          '/monitoring',
        ];

        const isPublicPath = PUBLIC_PATHS.some((path) =>
          pathname.startsWith(path)
        );

        const isSharePath = sharePaths.some((path) => pathname.includes(path));

        // Redirect to login if not authenticated and not on public/share path
        if ((!user || error) && !isPublicPath && !isSharePath) {
          console.log('Redirecting to login: ', pathname);
          router.push('/login');
          return;
        }

        // Check onboarding status if user is authenticated
        if (user) {
          const response = await fetch('/api/auth/check-onboarding');

          if (!response.ok) {
            console.error('Error checking onboarding status');
            if (isPublicPath) {
              router.push('/dashboard');
            }
            return;
          }

          const data = (await response.json()) as OnboardingResponse;

          if (data.onboardingStep && !data.completed) {
            const onboardingSteps: Record<onboarding_step, string> = {
              PERSONAL_INFO: '/onboarding/personal-info',
              PROFESSIONAL_INFO: '/onboarding/professional-info',
              WORKSPACE_SETUP: '/onboarding/workspace-setup',
              COMPLETED: '/onboarding/completed',
              INVITED_USER: '/onboarding/invited-user',
            };

            const currentStep = onboardingSteps[data.onboardingStep];

            // Redirect to appropriate onboarding step if on public path or wrong step
            if (isPublicPath || !pathname.startsWith(currentStep)) {
              router.push(currentStep);
            }
          } else if (isPublicPath) {
            // Redirect completed users away from public paths
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
  }, [pathname, router, supabase.auth]);

  if (isLoading && pathname !== '/login' && !pathname.startsWith('/auth/')) {
    return <LoadingSpinner fullScreen size="large" />;
  }

  return <>{children}</>;
}
