import prisma from '@/lib/prisma'; // Adjust the import path if your prisma client is elsewhere
import { PrismaClient } from '@prisma/client';
import { isVercel } from '@/app/api/utils/isVercel';

/**
 * Checks if the path with the given ID is a root path (has no parent).
 * @param id - The ID of the path to check.
 * @returns Promise<boolean> - True if the path has no parent, false otherwise.
 */
export async function IsFirstPath(id: string | number): Promise<boolean> {
  const prisma_client = isVercel() ? new PrismaClient() : prisma;
  if (!prisma_client) {
    throw new Error('Prisma client not initialized');
  }
  try {
    const path = await prisma_client.path.findUnique({
      where: { id: typeof id === 'string' ? parseInt(id, 10) : id },
      select: { parent_blocks: true },
    });

    if (!path) {
      throw new Error('Path not found');
    }

    // Adjust this check if your schema uses null/undefined for root paths
    return !path.parent_blocks || path.parent_blocks.length === 0;
  } finally {
    if (isVercel()) await prisma_client.$disconnect();
  }
} 