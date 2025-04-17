import prisma from '@/lib/prisma';

export async function deleteOneWorkflow(id: number | string) {
  return prisma.workflow.delete({
    where: { id: typeof id === 'string' ? parseInt(id, 10) : id },
  });
} 