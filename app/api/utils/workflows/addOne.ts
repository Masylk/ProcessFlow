import prisma from '@/lib/prisma';
import { PrismaClient } from '@prisma/client';
import { isVercel } from '@/app/api/utils/isVercel';

export async function addOneWorkflow(data: any) {
  const prisma_client = isVercel() ? new PrismaClient() : prisma;
  if (!prisma_client) {
    throw new Error('Prisma client not initialized');
  }
  try {
    return await prisma_client.workflow.create({ data });
  } finally {
    if (isVercel()) await prisma_client.$disconnect();
  }
} 