// lib/prisma.ts
import { isPreview } from '@/app/utils/isPreview';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };

let prisma: PrismaClient;

// In production, don't use the global object to prevent memory leaks
if (process.env.NODE_ENV === 'production') {
  console.log('creating new prisma client in production');
  prisma = new PrismaClient();
} else {
  // In non-production, use global to avoid multiple instances during hot-reloading
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient();
    console.log('creating new prisma client in non-production');
  }
  prisma = globalForPrisma.prisma;
}

export default prisma;
