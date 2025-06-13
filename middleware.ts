import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { workspaceProtection } from './app/middlewares/workspaceProtection';
import { isVercel } from './app/api/utils/isVercel';

// Define auth routes that should redirect to dashboard when authenticated
const authRoutes = [
  '/login',
  '/signup',
  '/auth',
  '/reset-password',
  '/reset-password-request',
  '/set-new-password'
];

const shareRoutes = [
  '/shared',
  '/step-icons',
  '/apps',
  '/assets',
  '.png',
  '.svg',
  '/unauthorized',
  '/monitoring',
];

// Add onboarding routes to skip middleware redirects
const onboardingRoutes = [
  '/onboarding'
];

// Add join routes to skip middleware redirects
const joinRoutes = [
  '/join'
];

// Simple in-memory store (not for production)
const rateLimitStore = new Map<string, { count: number; lastRequest: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_AUTH_SHARE = isVercel() ? 20 : 1000; // 20 if Vercel, 1000 otherwise
const RATE_LIMIT_GENERAL = 1000;      // 1000 requests per window for other routes

function isRateLimited(ip: string, maxRequests: number): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now - entry.lastRequest > RATE_LIMIT_WINDOW) {
    rateLimitStore.set(ip, { count: 1, lastRequest: now });
    return false;
  }

  if (entry.count >= maxRequests) {
    return true;
  }

  entry.count += 1;
  entry.lastRequest = now;
  rateLimitStore.set(ip, entry);
  return false;
}

/**
 * Format a string for use in URLs by replacing spaces and special characters with hyphens
 */
function formatSlug(value: string): string {
  return value
    .replace(/\s+/g, '-')       // Replace spaces with hyphens
    .replace(/[^a-zA-Z0-9-]/g, '-') // Remove any non-alphanumeric characters
    .replace(/-+/g, '-')        // Replace multiple hyphens with a single one
    .replace(/^-|-$/g, '');     // Remove leading/trailing hyphens
}

export async function middleware(request: NextRequest) {
  // Add this at the top of your middleware function
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown';

  // Check if this is a join route with autoConfirm
  const pathname = request.nextUrl.pathname;
  const searchParams = request.nextUrl.searchParams;
  const isJoinRoute = joinRoutes.some(route => pathname.startsWith(route));
  const isAutoConfirm = searchParams.get('autoConfirm') === 'true';

  // Determine route type for rate limiting
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
  const isShareRoute = shareRoutes.some(route => pathname.includes(route));
  const isSensitiveRoute = isAuthRoute || isShareRoute;

  // Check if this is an onboarding route (to avoid redirect loops)
  const isOnboardingRoute = onboardingRoutes.some(route => pathname === route);

  // Apply rate limiting based on route type
  const maxRequests = isSensitiveRoute ? RATE_LIMIT_AUTH_SHARE : RATE_LIMIT_GENERAL;
  if (isRateLimited(ip, maxRequests)) {
    return new NextResponse('Too many requests', { status: 429 });
  }

  // Handle URLs with encoded spaces in the workspace slug
  // Match pattern like /workspace%20name/flow/edit
  if (pathname.match(/^\/[^/]*%20[^/]*/)) {
    try {
      // Split the path into segments
      const segments = pathname.split('/').filter(Boolean);
      
      if (segments.length >= 1) {
        // Clean the slug (first segment) by replacing encoded spaces with hyphens
        const originalSlug = segments[0];
        const decodedSlug = decodeURIComponent(originalSlug);
        const cleanSlug = formatSlug(decodedSlug);
        
        // Only redirect if the slug actually changed
        if (cleanSlug !== originalSlug) {
          // Reconstruct the URL with the clean slug
          const cleanUrl = new URL(request.url);
          
          // Replace only the first segment
          const restOfPath = pathname.substring(originalSlug.length + 1);
          cleanUrl.pathname = `/${cleanSlug}${restOfPath ? `/${restOfPath}` : ''}`;
          
          return NextResponse.redirect(cleanUrl);
        }
      }
    } catch (error) {
      console.error('Error cleaning URL:', error);
      // Continue with normal middleware if URL cleaning fails
    }
  }

  // Add embed headers if needed
  if (request.nextUrl.pathname.startsWith('/shared/') && request.nextUrl.pathname.endsWith('/embed')) {
    const response = NextResponse.next();
    response.headers.set('X-Frame-Options', 'ALLOWALL');
    response.headers.set('Content-Security-Policy', 'frame-ancestors *');
    return response;
  }

  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    // Skip middleware for static and API routes
    if (
      pathname.startsWith('/_next') ||
      pathname.startsWith('/api') ||
      pathname.startsWith('/static') ||
      pathname === '/' ||
      (isJoinRoute && isAutoConfirm) // Allow direct access to join route when auto-confirming
    ) {
      return NextResponse.next();
    }

    // If user is authenticated
    if (user) {
      // If trying to access onboarding route directly while already completed
      if (isOnboardingRoute) {
        const onboardingStatus = user.user_metadata?.onboarding_status || {};
        const isOnboardingComplete = onboardingStatus.completed_at;
        
        if (isOnboardingComplete) {
          // Redirect completed users to dashboard when they try to access onboarding
          return NextResponse.redirect(new URL('/', request.url));
        }
      }
      
      // If trying to access auth routes while authenticated
      if (isAuthRoute) {
        // Check onboarding status
        const onboardingStatus = user.user_metadata?.onboarding_status || {};
        const isOnboardingComplete = onboardingStatus.completed_at;
        
        if (!isOnboardingComplete) {
          // Only redirect if not already on an onboarding route
          if (!isOnboardingRoute) {
            return NextResponse.redirect(new URL('/onboarding', request.url));
          }
        }
        
        // Redirect to dashboard if trying to access auth routes while authenticated
        return NextResponse.redirect(new URL('/', request.url));
      }
      
      // Add user info to headers for all other protected routes
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', user.id);
      if (user.user_metadata?.role) {
        requestHeaders.set('x-user-role', user.user_metadata.role);
      }

      // Check if this is a workspace or workflow route
      if (request.url.includes('/edit') || request.url.includes('/read')) {
        return workspaceProtection(request, user);
      }

      return NextResponse.next({
        request: { headers: requestHeaders }
      });
    }

    // If not authenticated and trying to access protected routes
    if (!isAuthRoute && !isShareRoute && !isJoinRoute) {
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('redirect', pathname);
      // Copy all original search params
      request.nextUrl.searchParams.forEach((value, key) => {
        redirectUrl.searchParams.set(key, value);
      });
      console.log('Redirecting to login:', redirectUrl);
      return NextResponse.redirect(redirectUrl);
    }

    // Allow access to auth routes for non-authenticated users
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    // In case of error, allow the request to continue to be handled by the application
    return NextResponse.next();
  }
}

// Configure which paths the middleware will run on
export const config = {
  matcher: [
    '/((?!_next/|api/|static/|favicon.ico).*)',
    '/workspace/:path*'
  ],
};
