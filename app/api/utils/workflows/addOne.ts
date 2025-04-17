import prisma from '@/lib/prisma';

export async function addOneWorkflow(data: any) {
  return prisma.workflow.create({ data });
} 