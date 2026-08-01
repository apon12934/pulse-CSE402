import { PrismaClient } from "../generated/prisma/index.js";

const globalForPrisma = globalThis as unknown as {
  prisma: InstanceType<typeof PrismaClient> | undefined;
};

function createPrismaClient(): InstanceType<typeof PrismaClient> {
  const connectionString = process.env["DATABASE_URL"] ?? "";
  
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  return new PrismaClient();
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env["NODE_ENV"] !== "production") {
  globalForPrisma.prisma = prisma;
}
