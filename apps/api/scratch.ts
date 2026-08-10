import { prisma } from "./src/utils/prisma.js";

async function run() {
  const existing = await prisma.task.findFirst({
    where: { title: { contains: "Wake up" } },
    orderBy: { startTime: 'asc' }
  });
  
  const futureTasks = await prisma.task.findMany({
    where: {
      templateTaskId: existing?.templateTaskId,
      startTime: { gt: new Date("2026-08-10T00:00:00.000Z") },
    },
    orderBy: { startTime: 'asc' }
  });

  for (const t of futureTasks) {
    console.log(`- ID: ${t.id}, Local Start: ${t.startTime.toLocaleString("en-US", { timeZone: "Asia/Dhaka" })}`);
  }
}
run();
