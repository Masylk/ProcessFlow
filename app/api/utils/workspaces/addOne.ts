import prisma from '@/lib/prisma';
import { PrismaClient } from '@prisma/client';
import { isVercel } from '@/app/api/utils/isVercel';
import { checkWorkspaceName } from '@/app/utils/checkNames';

export async function addOneWorkspace(data: any) {
  const prisma_client = isVercel() ? new PrismaClient() : prisma;
  try {
    if (data.name) {
      const nameError = checkWorkspaceName(data.name);
      if (nameError) {
        throw new Error(nameError.description);
      }
    }
    return await prisma_client.workspace.create({ data });
  } finally {
    if (isVercel()) await prisma_client.$disconnect();
  }
} 