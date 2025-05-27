import { createClient } from '@/lib/supabaseServerClient';
import { NextResponse, type NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { isVercel } from '@/app/api/utils/isVercel';
import { PrismaClient } from '@prisma/client';

export async function authMiddleware(request: NextRequest) {
  const supabase = createClient();
  
  // Get authenticated user using Supabase
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('User not authenticated:', error);
    }
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

  const prisma_client = isVercel() ? new PrismaClient() : prisma;
  if (!prisma_client) {
    throw new Error('Prisma client not initialized');
  }
  const user = await prisma_client.user.findUnique({ 
    where: { auth_id: userId }
  });
  if (isVercel()) await prisma_client.$disconnect();

  return user;
} 