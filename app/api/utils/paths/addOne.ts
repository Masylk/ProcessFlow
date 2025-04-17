import prisma from '@/lib/prisma';

export async function addOnePath(data: any) {
  // Adjust 'Path' and 'data' type as per your Prisma schema
  return prisma.path.create({ data });
} 