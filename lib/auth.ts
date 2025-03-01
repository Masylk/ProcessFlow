import prisma from '@/lib/prisma';

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
