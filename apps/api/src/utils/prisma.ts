import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

/**
 * Singleton Prisma client instance for TiDB Serverless (MySQL-compatible).
 *
 * Prisma 7 requires a driver adapter — we use @prisma/adapter-mariadb
 * since TiDB speaks the MySQL wire protocol. The constructor accepts
 * a mariadb PoolConfig or a raw connection string.
 *
 * Prevents multiple connections during hot-reload in development.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: InstanceType<typeof PrismaClient> | undefined;
};

function createPrismaClient(): InstanceType<typeof PrismaClient> {
  const connectionString = process.env["DATABASE_URL"] ?? "";
  const adapter = new PrismaMariaDb(connectionString);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env["NODE_ENV"] !== "production") {
  globalForPrisma.prisma = prisma;
}
