import prisma from '@/lib/prisma';
import { PrismaClient } from '@prisma/client';
import { isVercel } from '@/app/api/utils/isVercel';

export async function editOneBlock(id: number | string, data: any) {
  const prisma_client = isVercel() ? new PrismaClient() : prisma;
  try {
    return await prisma_client.block.update({
      where: { id: typeof id === 'string' ? parseInt(id, 10) : id },
      data,
    });
  } finally {
    if (isVercel()) await prisma_client.$disconnect();
  }
} 