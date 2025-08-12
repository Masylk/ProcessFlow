import { isVercel } from '@/app/api/utils/isVercel';
import prisma from '@/lib/prisma';
import { PrismaClient } from '@prisma/client';
import { NextRequest } from 'next/server';

export async function getProtectedRoute(request: Request) {
  const userId = request.headers.get('x-user-id');
  const userRole = request.headers.get('x-user-role');
  const prisma_client = isVercel() ? new PrismaClient() : prisma;
  if (!prisma_client) {
    throw new Error('Prisma client not initialized');
  }
  if (!userId) {
    throw new Error('User ID not found in request headers');
  }

  const user = await prisma_client.user.findUnique({ 
    where: { auth_id: userId }
  });
  if (isVercel()) await prisma_client.$disconnect();
  return user;
}

/**
 * Get the active user from the request
 * @param request Next.js request object
 * @returns The user object or null if not found
 */
export async function getActiveUser(request: NextRequest | Request) {
  const prisma_client = isVercel() ? new PrismaClient() : prisma;
  if (!prisma_client) {
    throw new Error('Prisma client not initialized');
  }
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      console.warn('User ID not found in request headers');
      return null;
    }
    
    const user = await prisma_client.user.findUnique({ 
      where: { auth_id: userId }
    });
    return user;
  } catch (error) {
    console.error('Error getting active user:', error);
    return null;
  } finally {
    if (isVercel()) await prisma_client.$disconnect();
  }
} 

