import { prisma } from "./src/utils/prisma.js";

async function run() {
  const tasks = await prisma.task.findMany({
    where: { title: { contains: "Tuition" } },
    orderBy: { startTime: 'asc' }
  });

  for (const t of tasks) {
    console.log(`- ID: ${t.id}, Title: ${t.title}, Local Start: ${t.startTime.toLocaleString("en-US", { timeZone: "Asia/Dhaka" })}`);
  }
}
run();
