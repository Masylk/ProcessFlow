// lib/prisma.ts
import { isPreview } from '@/app/utils/isPreview';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };

let prisma: PrismaClient;

// In production, don't use the global object to prevent memory leaks
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // In non-production, use global to avoid multiple instances during hot-reloading
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient();
  }
  prisma = globalForPrisma.prisma;
}

export default prisma;
