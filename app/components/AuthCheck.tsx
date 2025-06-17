'use client';

import { createBrowserClient } from '@supabase/ssr';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { onboarding_step } from '@prisma/client';
import LoadingSpinner from './LoadingSpinner';
import posthog from 'posthog-js';
import * as Sentry from '@sentry/nextjs';

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
  '/reset-password',
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

        const isPublicPath = pathname
          ? PUBLIC_PATHS.some((path) => pathname.startsWith(path))
          : false;

        const isSharePath = pathname
          ? sharePaths.some((path) => pathname.includes(path))
          : false;

        // Redirect to login if not authenticated and not on public/share path
        if ((!user || error) && !isPublicPath && !isSharePath) {
          router.push('/login');
          return;
        }

        // Identify user in PostHog if authenticated
        if (user) {
          // Set up PostHog identification
          posthog.identify(user.id);

          // Set user email as a property
          if (user.email) {
            posthog.people.set({ email: user.email });
          }

          // Capture login event for Google auth users coming from callback
          if (pathname?.includes('/auth/callback')) {
            const isGoogleAuth = user.app_metadata?.provider === 'google';
            if (isGoogleAuth) {
              posthog.capture('login', {
                email: user.email,
                provider: 'google',
              });
            }
          }

          // Also set up Sentry user identification
          Sentry.setUser({
            id: user.id,
            email: user.email || undefined,
          });

          // Check onboarding status
          const response = await fetch('/api/auth/check-onboarding');

          if (!response.ok) {
            console.error('Error checking onboarding status');
            if (isPublicPath) {
              router.push('/');
            }
            return;
          }

          const data = (await response.json()) as OnboardingResponse;

          if (data.onboardingStep && !data.completed) {
            const onboardingSteps: Record<onboarding_step, string> = {
              PERSONAL_INFO: '/onboarding',
              PROFESSIONAL_INFO: '/onboarding',
              WORKSPACE_SETUP: '/onboarding',
              COMPLETED: '/onboarding',
              INVITED_USER: '/onboarding',
            };

            const currentStep = onboardingSteps[data.onboardingStep];

            // Redirect to appropriate onboarding step if on public path or wrong step
            if (isPublicPath || (pathname && pathname !== '/onboarding')) {
              router.push(currentStep);
            }
          } else if (isPublicPath) {
            // Redirect completed users away from public paths
            router.push('/');
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

  if (
    isLoading &&
    pathname !== '/login' &&
    pathname &&
    !pathname.startsWith('/auth/')
  ) {
    return <LoadingSpinner fullScreen size="large" />;
  }

  return <>{children}</>;
}
