import { prisma } from "./src/utils/prisma.js";

async function run() {
  const tasks = await prisma.task.findMany({
    where: {
      title: { contains: "Wake up" }
    },
    orderBy: { startTime: 'asc' }
  });
  console.log(tasks.map(t => ({
    id: t.id,
    start: t.startTime.toISOString(),
    startLocal: t.startTime.toLocaleString("en-US", { timeZone: "Asia/Dhaka" })
  })));
}

run();
