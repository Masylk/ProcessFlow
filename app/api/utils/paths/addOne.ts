import prisma from '@/lib/prisma';
import { PrismaClient } from '@prisma/client';
import { isVercel } from '@/app/api/utils/isVercel';

export async function addOnePath(data: any) {
  const prisma_client = isVercel() ? new PrismaClient() : prisma;
  try {
    // Adjust 'Path' and 'data' type as per your Prisma schema
    return await prisma_client.path.create({ data });
  } finally {
    if (isVercel()) await prisma_client.$disconnect();
  }
} 