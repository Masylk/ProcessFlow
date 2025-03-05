import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabaseServerClient';

export async function middleware(request: NextRequest) {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  const isAuthRoute = ['/login', '/signup', '/reset-password'].includes(request.nextUrl.pathname);

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
    '/login',
    '/signup',
    '/reset-password',
    '/dashboard/:path*',
    '/api/protected/:path*',
    '/onboarding/:path*',
    '/settings/:path*',
    '/workspace/:path*',
  ]
}
