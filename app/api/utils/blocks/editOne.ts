import prisma from '@/lib/prisma';

export async function editOneBlock(id: number | string, data: any) {
  return prisma.block.update({
    where: { id: typeof id === 'string' ? parseInt(id, 10) : id },
    data,
  });
} 