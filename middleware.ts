import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabaseServerClient';

export async function middleware(request: NextRequest) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  // Public paths that don't require authentication
  const publicPaths = ['/login', '/signup', '/auth/callback', '/api/auth/onboarding'];
  const isPublicPath = publicPaths.some(path => request.nextUrl.pathname.startsWith(path));

  if (!session && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (session && request.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
