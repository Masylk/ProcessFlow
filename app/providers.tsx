'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import PostHogPageView from './PostHogPageView';

const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Check if the current path is in a checkout flow
  const isCheckoutPath = pathname?.includes('/checkout');
  
  useEffect(() => {
    // Only initialize PostHog if not in checkout flow
    if (!isCheckoutPath && posthogKey && posthogHost) {
      posthog.init(posthogKey, {
        api_host: posthogHost,
        capture_pageview: false,
      });
    } else if (isCheckoutPath) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('PostHog disabled for checkout flow to prevent conflicts');
      }
    } else {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(
          'PostHog is not initialized due to missing environment variables.'
        );
      }
    }
  }, [isCheckoutPath]);

  // If in checkout flow, just render children without PostHog
  if (isCheckoutPath) {
    return <>{children}</>;
  }

  // Normal flow with PostHog
  return (
    <PHProvider client={posthog}>
      <PostHogPageView />
      {children}
    </PHProvider>
  );
}
