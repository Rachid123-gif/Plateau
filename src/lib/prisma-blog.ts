/**
 * Blog DB helpers — uses Prisma dynamically to bypass missing types until
 * `prisma generate` is run after the DB migration.
 * After `prisma generate`, replace with direct `prisma.blogArticle` / `prisma.blogCategory` calls.
 */
import { prisma } from "@/lib/prisma";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _db: Record<string, any> = prisma as Record<string, any>;

function makeProxy(name: string) {
  return new Proxy(
    {},
    {
      get(_target, method: string) {
        return (...args: unknown[]) => _db[name][method](...args);
      },
    }
  );
}

export const blogArticle = makeProxy("blogArticle") as {
  findMany: (...args: unknown[]) => Promise<unknown>;
  findUnique: (...args: unknown[]) => Promise<unknown>;
  create: (...args: unknown[]) => Promise<unknown>;
  update: (...args: unknown[]) => Promise<unknown>;
  delete: (...args: unknown[]) => Promise<unknown>;
  count: (...args: unknown[]) => Promise<number>;
  upsert: (...args: unknown[]) => Promise<unknown>;
};

export const blogCategory = makeProxy("blogCategory") as {
  findMany: (...args: unknown[]) => Promise<unknown>;
  findUnique: (...args: unknown[]) => Promise<unknown>;
  create: (...args: unknown[]) => Promise<unknown>;
  count: (...args: unknown[]) => Promise<number>;
  upsert: (...args: unknown[]) => Promise<unknown>;
};
