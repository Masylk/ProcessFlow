import { type NextRequest } from 'next/server';
import { updateSession } from './utils/supabase/middleware';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: ['/', '/workspace/:path*', '/reset-password'], // Protects the root route and all /workspace subpaths
};
