import prisma from '@/lib/prisma';

export async function deleteOneWorkspace(id: number | string) {
  return prisma.workspace.delete({
    where: { id: typeof id === 'string' ? parseInt(id, 10) : id },
  });
} 