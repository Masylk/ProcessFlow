import prisma from '@/lib/prisma';
import { PrismaClient } from '@prisma/client';
import { isVercel } from '@/app/api/utils/isVercel';

export async function deleteOneWorkflow(id: number | string) {
  const prisma_client = isVercel() ? new PrismaClient() : prisma;
  try {
    return await prisma_client.workflow.delete({
      where: { id: typeof id === 'string' ? parseInt(id, 10) : id },
    });
  } finally {
    if (isVercel()) await prisma_client.$disconnect();
  }
} 