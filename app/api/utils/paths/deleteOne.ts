import prisma from '@/lib/prisma';

export async function deleteOnePath(id: number | string) {
  return prisma.path.delete({
    where: { id: typeof id === 'string' ? parseInt(id, 10) : id },
  });
} 