import prisma from '@/lib/prisma';

export async function editOneWorkspace(id: number | string, data: any) {
  return prisma.workspace.update({
    where: { id: typeof id === 'string' ? parseInt(id, 10) : id },
    data,
  });
} 