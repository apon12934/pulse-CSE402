import { prisma } from "./src/utils/prisma.js";

async function run() {
  const existing = await prisma.task.findFirst({
    where: { title: { contains: "Wake up" } }
  });
  console.log("Template Task ID:", existing?.templateTaskId);
  
  const futureTasks = await prisma.task.findMany({
    where: {
      templateTaskId: existing?.templateTaskId,
      startTime: { gt: new Date() }
    },
    orderBy: { startTime: 'asc' }
  });
  
  console.log("Future tasks count:", futureTasks.length);
  for (const t of futureTasks) {
    console.log(`- ID: ${t.id}, Local Start: ${t.startTime.toLocaleString("en-US", { timeZone: "Asia/Dhaka" })}`);
  }
}
run();
