import { createClient } from '@/lib/supabaseServerClient';
import { NextResponse, type NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

export async function authMiddleware(request: NextRequest) {
  const supabase = createClient();
  
  // Get authenticated user using Supabase
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Pass minimal required info
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', user.id);
  // If you have role information in the user metadata, you can add it too
  if (user.user_metadata?.role) {
    requestHeaders.set('x-user-role', user.user_metadata.role);
  }

  return NextResponse.next({
    request: { headers: requestHeaders }
  });
}

// Protected route helper
export async function getProtectedUser(request: Request) {
  const userId = request.headers.get('x-user-id');
  const userRole = request.headers.get('x-user-role');

  if (!userId) {
    throw new Error('User ID not found in request headers');
  }

  const user = await prisma.user.findUnique({ 
    where: { auth_id: userId }
  });

  return user;
} 