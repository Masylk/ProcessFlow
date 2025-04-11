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
        source: '/:path*', // Match all other paths
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY', // Prevent embedding
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'none'", // Prevent embedding via CSP
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
