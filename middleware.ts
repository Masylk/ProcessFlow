import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabaseServerClient';
import { workspaceProtection } from './app/middlewares/workspaceProtection';

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
  '/read/share',
  '/step-icons',
  '/apps',
  '/assets',
  '.png',
  '.svg',
  '/unauthorized'
];

export async function middleware(request: NextRequest) {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  
  // Check if current route is an auth route
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
  
  const isShareRoute = shareRoutes.some(route => pathname.includes(route));
  // IMPORTANT: Skip middleware for auth-related routes completely
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/onboarding') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/reset-password') ||
    pathname.startsWith('/reset-password-request') ||
    pathname.startsWith('/set-new-password') ||
    pathname.includes('/read/share') ||
    pathname === '/' 
  ) {
    return NextResponse.next();
  }

  // Handle slug-based routes only if user is authenticated
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
      
      // Redirect to dashboard if trying to access auth routes while authenticated
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    // Add user info to headers for all other protected routes
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', user.id);
    if (user.user_metadata?.role) {
      requestHeaders.set('x-user-role', user.user_metadata.role);
    }

    // Check if this is a workspace or workflow route
    if (request.url.includes('/workspace/') || request.url.includes('/workflow/')) {
      return workspaceProtection(request, user);
    }

    return NextResponse.next({
      request: { headers: requestHeaders }
    });
  }

  // If not authenticated and trying to access protected routes
  if (!isAuthRoute && !isShareRoute) {
    console.log('Redirecting to login for:', pathname);
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Allow access to auth routes for non-authenticated users
  return NextResponse.next();
}

// Configure which paths the middleware will run on
export const config = {
  matcher: [
    // Skip specific paths we know we don't want to process
    '/((?!_next/|api/|static/|favicon.ico|auth/|reset-password|set-new-password).*)',
    '/workspace/:path*'
  ],
};
