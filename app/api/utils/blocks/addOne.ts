import prisma from '@/lib/prisma';
import { PrismaClient } from '@prisma/client';
import { isVercel } from '@/app/api/utils/isVercel';

export async function addOneBlock(data: any) {
  const prisma_client = isVercel() ? new PrismaClient() : prisma;
  try {
    return await prisma_client.block.create({ data, include: { child_paths: { include: { path: true } } } });
  } finally {
    if (isVercel()) await prisma_client.$disconnect();
  }
} 