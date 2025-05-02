import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    APP_ENV: process.env.NODE_ENV === 'production' ? 'production' : 'staging',
    // Explicitly include Stripe environment variables
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_STRIPE_EARLY_ADOPTER_MONTHLY_PRICE_ID:
      process.env.NEXT_PUBLIC_STRIPE_EARLY_ADOPTER_MONTHLY_PRICE_ID,
    NEXT_PUBLIC_STRIPE_EARLY_ADOPTER_ANNUAL_PRICE_ID:
      process.env.NEXT_PUBLIC_STRIPE_EARLY_ADOPTER_ANNUAL_PRICE_ID,
  },
  // Add visual indicator for staging environment
  publicRuntimeConfig: {
    isStaging: process.env.NODE_ENV !== 'production',
  },
  compiler: {
    styledComponents: true,
  },
  webpack: (config, { isServer }) => {
    // Ignore the swagger-jsdoc warning
    config.ignoreWarnings = [{ module: /swagger-jsdoc/ }];
    return config;
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY', // Prevent embedding
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self';",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' cdn.jsdelivr.net unpkg.com https://js.stripe.com https://media-editor.cloudinary.com https://js.hs-scripts.com http://js.hs-scripts.com https://eu-assets.i.posthog.com https://js.usemessages.com https://js.hs-analytics.net https://js.hs-banner.com https://js.hscollectedforms.net;",
              "style-src 'self' 'unsafe-inline' data: fonts.googleapis.com;", // Tailwind JIT & Google Fonts & data: for TUI
              "img-src 'self' data: blob: https:;", // allow images from any HTTPS source
              "font-src 'self' fonts.gstatic.com;",
              "connect-src 'self' https://*.supabase.co https://js.stripe.com https://api.stripe.com https://eu.i.posthog.com https://eu-assets.i.posthog.com https://api.hubspot.com https://forms.hscollectedforms.net;",
              "frame-src 'self' https://js.stripe.com https://app.hubspot.com;", // allow Stripe & HubSpot iframes
              "object-src 'none';",
              "base-uri 'self';",
              "frame-ancestors 'none';", // CSP way to prevent embedding
            ].join(' '),
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff', // Prevent MIME type sniffing
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin', // Privacy-safe referrer
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload', // HSTS
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()', // Disable unused browser features
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
        ],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  // Sentry organization and project
  org: 'pf-5j',
  project: 'processflow',

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Automatically annotate React components to show their full name in breadcrumbs and session replay
  reactComponentAnnotation: {
    enabled: true,
  },

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-side errors will fail.
  tunnelRoute: '/monitoring',

  // Hides source maps from generated client bundles
  hideSourceMaps: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,
});
