// lib/prisma.ts
import { isVercel } from '@/app/api/utils/isVercel';
import { isPreview } from '@/app/utils/isPreview';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };

let prisma: PrismaClient | undefined;

// If running on Vercel, do not create a Prisma client
if (process.env.VERCEL) {
  prisma = undefined;
} else if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // In non-production, use global to avoid multiple instances during hot-reloading
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient();
  }
  prisma = globalForPrisma.prisma;
}

if (!prisma && !isVercel()) {
  throw new Error('Prisma client not initialized');
}

export default prisma;
