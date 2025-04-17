import prisma from '@/lib/prisma';

export async function editOnePath(id: number | string, data: any) {
  return prisma.path.update({
    where: { id: typeof id === 'string' ? parseInt(id, 10) : id },
    data,
  });
} 