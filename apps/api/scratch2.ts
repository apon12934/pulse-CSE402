import { prisma } from "./src/utils/prisma.js";

async function run() {
  const existing = await prisma.task.findFirst({
    where: { title: { contains: "Wake up" } },
    orderBy: { startTime: 'asc' }
  });
  
  const futureTasks = await prisma.task.findMany({
    where: {
      templateTaskId: existing?.templateTaskId,
      startTime: { gt: new Date() },
      status: { notIn: ["Completed"] },
    },
  });

  const startHour = 10;
  const startMinute = 0;
  const timezoneOffset = -360;

  console.log("Future tasks count:", futureTasks.length);
  for (const fTask of futureTasks) {
    const newStart = new Date(fTask.startTime);
    if (startHour !== undefined) {
      if (timezoneOffset !== undefined) {
        const localMs = fTask.startTime.getTime() - (timezoneOffset * 60000);
        const localDate = new Date(localMs);
        localDate.setUTCHours(startHour, startMinute ?? 0, 0, 0);
        newStart.setTime(localDate.getTime() + (timezoneOffset * 60000));
      } else {
        newStart.setHours(startHour, startMinute ?? 0, 0, 0);
      }
    }
    console.log(`Original: ${fTask.startTime.toISOString()}, New: ${newStart.toISOString()}`);
  }
}
run();
