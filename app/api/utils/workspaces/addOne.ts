import prisma from '@/lib/prisma';

export async function addOneWorkspace(data: any) {
  return prisma.workspace.create({ data });
} 