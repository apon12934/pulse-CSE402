import { PrismaClient } from '../packages/db/node_modules/@prisma/client/index.js';
const prisma = new PrismaClient();

async function main() {
  const tasks = await prisma.task.findMany({
    where: { startTime: { gte: new Date('2026-08-16'), lt: new Date('2026-08-18') } },
    select: { title: true, startTime: true, templateTaskId: true }
  });
  console.log(tasks);
}
main().catch(console.error).finally(() => prisma.$disconnect());
