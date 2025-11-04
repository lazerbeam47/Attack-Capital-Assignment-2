/**
 * Prisma Client Singleton
 * 
 * Ensures only one instance of Prisma Client exists in development
 * to prevent connection pool exhaustion during hot reloading
 * 
 * @module db
 * @see https://www.prisma.io/docs/guides/performance-and-optimization/connection-management
 * @example
 * ```typescript
 * import { prisma } from '@/lib/db';
 * 
 * const users = await prisma.user.findMany();
 * const contact = await prisma.contact.create({
 *   data: { name: 'John Doe', phone: '+1234567890' }
 * });
 * ```
 */
import { PrismaClient } from "@prisma/client";

/**
 * Global type extension for Prisma Client singleton
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Singleton Prisma Client instance
 * 
 * Configuration:
 * - Development: Logs errors and warnings
 * - Production: Logs errors only
 * - Falls back to SQLite if DATABASE_URL not set
 * 
 * @constant
 * @type {PrismaClient}
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL || "file:./prisma/dev.db",
      },
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

