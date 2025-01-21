import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
//   const supabase = createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     { cookies: req.cookies }
//   );

//   const {
//     data: { session },
//   } = await supabase.auth.getSession();

//   console.log(session);
//   // If the session exists, do not redirect and allow the request to proceed
//   if (session) {
//     // If already logged in and trying to access /auth, redirect to the home page
//     if (req.url.includes('/auth')) {
//       const url = new URL('/', req.url); // Redirect to home page
//       return NextResponse.redirect(url);
//     }

//     // If the user is logged in, proceed to the next middleware or page
//     return NextResponse.next();
//   }

//   // If no session and not on the /auth page, redirect to the /auth page
//   if (!session && !req.url.includes('/auth')) {
//     const url = new URL('/auth', req.url);
//     return NextResponse.redirect(url);
//   }

  return NextResponse.next();
}

export const config = {
  matcher: '/((?!_next|favicon.ico).*)', // Apply to all routes except Next.js internals
};
