import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabaseServerClient';

export async function middleware(request: NextRequest) {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  
  // Skip middleware for api routes, static files, auth pages, etc.
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/onboarding') ||
    pathname === '/'
  ) {
    return NextResponse.next();
  }

  // Extract the potential workspace slug
  const segments = pathname.split('/').filter(Boolean);
  
  // If it's the /dashboard route and no other segments, leave it alone
  if (segments.length === 1 && segments[0] === 'dashboard') {
    return NextResponse.next();
  }
  
  // For a path that looks like a workspace slug
  if (segments.length === 1) {
    // This is likely a workspace slug - rewrite to dashboard page but preserve the URL
    const url = request.nextUrl.clone();
    // Use rewrite (not redirect) to preserve the URL while loading the dashboard
    url.pathname = '/dashboard';
    return NextResponse.rewrite(url);
  }

  const isAuthRoute = ['/login', '/signup', '/reset-password'].includes(pathname);

  // If user is authenticated
  if (user) {
    // If trying to access auth routes while authenticated
    if (isAuthRoute) {
      // Check onboarding status
      const onboardingStatus = user.user_metadata?.onboarding_status || {};
      const isOnboardingComplete = onboardingStatus.completed_at;
      const currentStep = onboardingStatus.current_step || 'personal-info';

      if (!isOnboardingComplete) {
        return NextResponse.redirect(new URL(`/onboarding/${currentStep}`, request.url));
      }
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Add user info to headers for protected routes
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', user.id);
    if (user.user_metadata?.role) {
      requestHeaders.set('x-user-role', user.user_metadata.role);
    }
    return NextResponse.next({
      request: { headers: requestHeaders }
    });
  }

  // If not authenticated and trying to access protected routes
  if (!isAuthRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Allow access to auth routes for non-authenticated users
  return NextResponse.next();
}

// Configure which paths the middleware will run on
export const config = {
  matcher: [
    // Skip all internal paths (_next, api)
    '/((?!_next/|api/|static/|favicon.ico).*)',
  ],
};
