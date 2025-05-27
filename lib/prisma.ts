// lib/prisma.ts
import { isPreview } from '@/app/utils/isPreview';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };

let prisma: PrismaClient | undefined;

// If running on Vercel, do not create a Prisma client
if (process.env.VERCEL) {
  // console.log('Running on Vercel, not creating Prisma client');
  prisma = new PrismaClient();
} else if (process.env.NODE_ENV === 'production') {
  // console.log('Running in production, creating Prisma client');
  prisma = new PrismaClient();
} else {
  // In non-production, use global to avoid multiple instances during hot-reloading
  if (!globalForPrisma.prisma) {
    // console.log('Creating Prisma client in non-production environment');
    globalForPrisma.prisma = new PrismaClient();
  }
  prisma = globalForPrisma.prisma;
}

if (!prisma) {
  throw new Error('Prisma client not initialized');
}

export default prisma;
