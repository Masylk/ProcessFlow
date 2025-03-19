import prisma from '@/lib/prisma';
import { NextRequest } from 'next/server';

export async function getProtectedRoute(request: Request) {
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

/**
 * Get the active user from the request
 * @param request Next.js request object
 * @returns The user object or null if not found
 */
export async function getActiveUser(request: NextRequest | Request) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      console.warn('User ID not found in request headers');
      return null;
    }
    
    const user = await prisma.user.findUnique({ 
      where: { auth_id: userId }
    });
    
    return user;
  } catch (error) {
    console.error('Error getting active user:', error);
    return null;
  }
} 

