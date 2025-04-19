import prisma from '@/lib/prisma';

export async function addOneBlock(data: any) {
  return prisma.block.create({ data, include: { child_paths: { include: { path: true } } } });
} 