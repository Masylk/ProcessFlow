// lib/prisma.ts
import { PrismaClient } from '@prisma/client';


let prisma: PrismaClient;

// In production, don't use the global object to prevent memory leaks
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // In non-production, use global to avoid multiple instances during hot-reloading
  if (!global.prisma) {
    global.prisma = new PrismaClient();

  }
  prisma = global.prisma;
}

export default prisma;
