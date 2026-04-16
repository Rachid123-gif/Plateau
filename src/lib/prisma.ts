import { PrismaClient } from "@prisma/client";

/**
 * Prisma singleton for serverless (Netlify Functions).
 * - `globalThis.prisma` cache prevents connection pool exhaustion
 *   during Next.js hot reload in dev.
 * - In production (AWS Lambda), each cold start creates a fresh instance
 *   which is kept warm across invocations.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
