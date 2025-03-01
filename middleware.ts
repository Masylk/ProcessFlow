import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabaseServerClient';

export async function middleware(request: NextRequest) {
  const supabase = createClient();
  
  // Get session using Supabase
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error || !session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Pass minimal required info
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', session.user.id);
  // If you have role information in your session, you can add it too
  if (session.user.user_metadata?.role) {
    requestHeaders.set('x-user-role', session.user.user_metadata.role);
  }

  return NextResponse.next({
    request: { headers: requestHeaders }
  });
}

// Configure which paths the middleware will run on
export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*']
}
