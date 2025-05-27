import prisma from '@/lib/prisma';
import { PrismaClient } from '@prisma/client';
import { isVercel } from '@/app/api/utils/isVercel';
import { checkWorkspaceName } from '@/app/utils/checkNames';

export async function editOneWorkspace(id: number | string, data: any) {
  const prisma_client = isVercel() ? new PrismaClient() : prisma;
  if (!prisma_client) {
    throw new Error('Prisma client not initialized');
  }
  try {
    if (data.name) {
      const nameError = checkWorkspaceName(data.name);
      if (nameError) {
        throw new Error(nameError.description);
      }
    }
    return await prisma_client.workspace.update({
      where: { id: typeof id === 'string' ? parseInt(id, 10) : id },
      data,
    });
  } finally {
    if (isVercel()) await prisma_client.$disconnect();
  }
} 