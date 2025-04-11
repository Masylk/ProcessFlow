'use client';

import { createBrowserClient } from '@supabase/ssr';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { onboarding_step } from '@prisma/client';

type OnboardingResponse = {
  onboardingStep: onboarding_step;
  completed: boolean;
};

export default function AuthCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);

      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        const publicPaths = [
          '/login',
          '/signup',
          '/auth/callback',
          '/auth/confirm',
          '/reset-password-request',
          '/reset-password',
        ];

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

        const isPublicPath = publicPaths.some((path) =>
          pathname.startsWith(path)
        );

        const isSharePath = sharePaths.some((path) => pathname.includes(path));

        if ((!user || error) && !isPublicPath && !isSharePath) {
          console.log('Redirecting to login: ', pathname);
          router.push('/login');
          return;
        }

        // If user is authenticated and trying to access public route
        if (user && isPublicPath) {
          const response = await fetch('/api/auth/check-onboarding');

          if (!response.ok) {
            console.error('Error checking onboarding status');
            router.push('/dashboard');
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
            router.push(currentStep);
          } else {
            router.push('/dashboard');
          }
          return;
        }

        // If user is authenticated and accessing protected route
        if (user && !isPublicPath) {
          const response = await fetch('/api/auth/check-onboarding');

          if (!response.ok) {
            console.error('Error checking onboarding status');
            setIsLoading(false);
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

            if (!pathname.startsWith(currentStep)) {
              router.push(currentStep);
            }
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
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return <>{children}</>;
}
