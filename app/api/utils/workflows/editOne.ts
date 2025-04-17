import prisma from '@/lib/prisma';

export async function editOneWorkflow(id: number | string, data: any) {
  return prisma.workflow.update({
    where: { id: typeof id === 'string' ? parseInt(id, 10) : id },
    data,
  });
} 