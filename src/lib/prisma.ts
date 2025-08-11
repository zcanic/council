
import { PrismaClient } from '@prisma/client';

// Declare a global variable to hold the Prisma client instance.
// This is a workaround to prevent creating too many database connections in a development environment
// where Next.js hot-reloading can cause this file to be re-evaluated frequently.
declare global {
  var prisma: PrismaClient | undefined;
}

// Initialize the Prisma client.
// If `global.prisma` is already defined, use it; otherwise, create a new instance.
// In a production environment, `global.prisma` will always be undefined, so a new client is created.
export const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

// In a non-production environment, assign the created Prisma client to the global variable.
// This ensures that the same client instance is reused across hot reloads.
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
