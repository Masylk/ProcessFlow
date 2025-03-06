import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabaseServerClient';

export async function middleware(request: NextRequest) {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  
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
    pathname === '/'
  ) {
    return NextResponse.next();
  }

  // Handle slug-based routes only if user is authenticated
  if (user) {
    // Extract the potential workspace slug
    const segments = pathname.split('/').filter(Boolean);
    
    // If it's the /dashboard route, leave it alone
    if (segments.length === 1 && segments[0] === 'dashboard') {
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
    
    // For a path that looks like a workspace slug
    if (segments.length === 1) {
      // This is likely a workspace slug - rewrite to dashboard page but preserve the URL
      const url = request.nextUrl.clone();
      // Use rewrite (not redirect) to preserve the URL while loading the dashboard
      url.pathname = '/dashboard';
      
      // Add user info to headers
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', user.id);
      if (user.user_metadata?.role) {
        requestHeaders.set('x-user-role', user.user_metadata.role);
      }
      
      return NextResponse.rewrite(url);
    }
    
    // Add user info to headers for all other protected routes
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', user.id);
    if (user.user_metadata?.role) {
      requestHeaders.set('x-user-role', user.user_metadata.role);
    }
    return NextResponse.next({
      request: { headers: requestHeaders }
    });
  }

  // If not authenticated, redirect to login
  return NextResponse.redirect(new URL('/login', request.url));
}

// Configure which paths the middleware will run on
export const config = {
  matcher: [
    // Skip specific paths we know we don't want to process
    '/((?!_next/|api/|static/|favicon.ico|auth/|reset-password|set-new-password).*)',
  ],
};
