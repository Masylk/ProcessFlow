// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

// Determine the environment based on NODE_ENV
const isProduction = process.env.NODE_ENV === 'production';
const environment = isProduction ? 'production' : 'staging';

// Define prisma global object for TypeScript
declare global {
  var prisma: PrismaClient | undefined;
}

// Function to create a new Prisma client
function createPrismaClient(): PrismaClient {
  const client = new PrismaClient({
    log: isProduction
      ? ['error']
      : ['query', 'error', 'warn'],
  });
  
  // Add a middleware to log connections (optional)
  client.$use(async (params, next) => {
    const before = Date.now();
    const result = await next(params);
    const after = Date.now();
    
    // Log slow queries in non-production environments
    if (!isProduction && after - before > 1000) {
      console.log(`Slow query detected: ${params.model}.${params.action} took ${after - before}ms`);
    }
    
    return result;
  });
  
  return client;
}

// Initialize the PrismaClient (singleton pattern)
let prisma: PrismaClient;

// In production, don't use the global object to prevent memory leaks
if (isProduction) {
  prisma = createPrismaClient();
} else {
  // In non-production, use global to avoid multiple instances during hot-reloading
  if (!global.prisma) {
    global.prisma = createPrismaClient();
    console.log(`🔌 Connected to ${environment} database`);
  }
  prisma = global.prisma;
}

export default prisma;
