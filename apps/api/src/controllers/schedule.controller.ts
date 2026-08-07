import type { Request, Response } from "express";
import { prisma } from "../utils/prisma.js";
import { AppError } from "../utils/errors.js";
import {
  generateSchedule,
  reschedule,
  reorderSchedule,
  moveSchedule,
  converseSchedule,
  converseWeekly,
  type ScheduleItem,
} from "../services/gemini.service.js";

/**
 * POST /api/schedule/generate
 * Takes the user's tasks for a given date and asks Gemini to build an optimised timeline.
 */
export async function generateDailySchedule(req: Request, res: Response): Promise<void> {
  const userId = req.userId!;
  const { date, energyLevel } = req.body as { date: string; energyLevel?: string };

  if (!date) throw new AppError(400, "date is required (YYYY-MM-DD)");

  const dayStart = new Date(date);
  const dayEnd = new Date(date);
  dayEnd.setDate(dayEnd.getDate() + 1);

  // Fetch existing tasks for the day
  const tasks = await prisma.task.findMany({
    where: {
      userId,
      startTime: { gte: dayStart, lt: dayEnd },
    },
    orderBy: { startTime: "asc" },
  });

  const anchors: ScheduleItem[] = tasks
    .filter((t) => t.type === "Anchor")
    .map((t) => ({
      title: t.title,
      type: "Anchor" as const,
      startTime: t.startTime.toISOString(),
      endTime: t.endTime.toISOString(),
      energyLevel: t.energyLevel as ScheduleItem["energyLevel"],
      priority: t.priority,
      status: t.status as ScheduleItem["status"],
    }));

  const fluidTasks: ScheduleItem[] = tasks
    .filter((t) => t.type === "Fluid")
    .map((t) => ({
      title: t.title,
      type: "Fluid" as const,
      startTime: t.startTime.toISOString(),
      endTime: t.endTime.toISOString(),
      energyLevel: t.energyLevel as ScheduleItem["energyLevel"],
      priority: t.priority,
      status: t.status as ScheduleItem["status"],
    }));

  const schedule = await generateSchedule(anchors, fluidTasks, date, energyLevel ?? "Medium");

  // Persist the AI-generated times back to the database
  for (const item of schedule) {
    if (!item.startTime || !item.endTime) continue;

    const match = tasks.find((t) => t.title === item.title);
    if (match) {
      await prisma.task.update({
        where: { id: match.id },
        data: {
          startTime: new Date(item.startTime),
          endTime: new Date(item.endTime),
          status: item.status ?? "Upcoming",
        },
      });
    }
  }

  res.json({ schedule, tasksUpdated: schedule.length });
}

/**
 * POST /api/schedule/reschedule
 * "Domino Effect" — a task overran, recalculate the rest of the day.
 */
export async function dominoReschedule(req: Request, res: Response): Promise<void> {
  const userId = req.userId!;
  const { taskId, newEndTime } = req.body as { taskId: string; newEndTime: string };

  if (!taskId || !newEndTime) {
    throw new AppError(400, "taskId and newEndTime are required");
  }

  // Find the overrun task
  const overrunTask = await prisma.task.findFirst({ where: { id: taskId, userId } });
  if (!overrunTask) throw new AppError(404, "Task not found");

  // Update the overrun task's end time
  await prisma.task.update({
    where: { id: taskId },
    data: { endTime: new Date(newEndTime), status: "Running" },
  });

  // Get remaining tasks for the same day, after the overrun task
  const dayStart = new Date(overrunTask.startTime);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const remaining = await prisma.task.findMany({
    where: {
      userId,
      id: { not: taskId },
      startTime: { gte: overrunTask.startTime, lt: dayEnd },
    },
    orderBy: { startTime: "asc" },
  });

  const remainingItems: ScheduleItem[] = remaining.map((t) => ({
    title: t.title,
    type: t.type as ScheduleItem["type"],
    startTime: t.startTime.toISOString(),
    endTime: t.endTime.toISOString(),
    energyLevel: t.energyLevel as ScheduleItem["energyLevel"],
    priority: t.priority,
    status: t.status as ScheduleItem["status"],
  }));

  const dateStr = dayStart.toISOString().split("T")[0]!;
  const rescheduled = await reschedule(overrunTask.title, newEndTime, remainingItems, dateStr);

  // Persist rescheduled times
  for (const item of rescheduled) {
    const match = remaining.find((t) => t.title === item.title);
    if (match) {
      await prisma.task.update({
        where: { id: match.id },
        data: {
          ...(item.startTime && { startTime: new Date(item.startTime) }),
          ...(item.endTime && { endTime: new Date(item.endTime) }),
          status: item.status,
        },
      });
    }
  }

  res.json({ rescheduled, tasksAffected: rescheduled.length });
}

/**
 * POST /api/schedule/reorder
 * Reorder tasks based on an explicit array of task IDs.
 */
export async function reorderTasks(req: Request, res: Response): Promise<void> {
  const userId = req.userId!;
  const { taskIds, date } = req.body as { taskIds: string[]; date: string };

  if (!taskIds || !Array.isArray(taskIds) || !date) {
    throw new AppError(400, "taskIds array and date are required");
  }

  // Fetch all tasks for these IDs
  const tasks = await prisma.task.findMany({
    where: {
      userId,
      id: { in: taskIds },
    },
  });

  // Sort them in the exact order provided by the client
  const sortedTasks = taskIds
    .map((id) => tasks.find((t) => t.id === id))
    .filter((t): t is NonNullable<typeof t> => t !== undefined);

  if (sortedTasks.length === 0) {
    res.json({ schedule: [], tasksUpdated: 0 });
    return;
  }

  const items: ScheduleItem[] = sortedTasks.map((t) => ({
    title: t.title,
    type: t.type as ScheduleItem["type"],
    startTime: t.startTime.toISOString(),
    endTime: t.endTime.toISOString(),
    energyLevel: t.energyLevel as ScheduleItem["energyLevel"],
    priority: t.priority,
    status: t.status as ScheduleItem["status"],
  }));

  // Send to Gemini to crunch the new times
  const newSchedule = await reorderSchedule(items, date);

  // Persist the new times
  for (let i = 0; i < newSchedule.length; i++) {
    const item = newSchedule[i];
    if (!item) continue;
    
    // Because Gemini returns the array in the same order, we can map by title/index.
    // To be safe, we map by the strictly ordered sortedTasks array index.
    const originalTask = sortedTasks[i];
    if (originalTask) {
      await prisma.task.update({
        where: { id: originalTask.id },
        data: {
          ...(item.startTime && { startTime: new Date(item.startTime) }),
          ...(item.endTime && { endTime: new Date(item.endTime) }),
          status: item.status,
        },
      });
    }
  }

  res.json({ schedule: newSchedule, tasksUpdated: newSchedule.length });
}

/**
 * POST /api/schedule/move
 * Move a single task to a specific time and reschedule the rest of the day.
 */
export async function moveTask(req: Request, res: Response): Promise<void> {
  const userId = req.userId!;
  const { taskId, newStartTime, date } = req.body as { taskId: string; newStartTime: string; date: string };

  if (!taskId || !newStartTime || !date) {
    throw new AppError(400, "taskId, newStartTime, and date are required");
  }

  // 1. Find the moved task
  const taskToMove = await prisma.task.findUnique({ where: { id: taskId, userId } });
  if (!taskToMove) throw new AppError(404, "Task not found");

  // Calculate new end time based on original duration
  const originalDuration = taskToMove.endTime.getTime() - taskToMove.startTime.getTime();
  const updatedStartTime = new Date(newStartTime);
  const updatedEndTime = new Date(updatedStartTime.getTime() + originalDuration);

  // 2. Find all tasks for the day (excluding the moved one)
  const dayStart = new Date(date);
  const dayEnd = new Date(date);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const remainingTasks = await prisma.task.findMany({
    where: {
      userId,
      id: { not: taskId },
      startTime: { gte: dayStart, lt: dayEnd },
    },
    orderBy: { startTime: "asc" },
  });

  const remainingItems: ScheduleItem[] = remainingTasks.map((t) => ({
    title: t.title,
    type: t.type as ScheduleItem["type"],
    startTime: t.startTime.toISOString(),
    endTime: t.endTime.toISOString(),
    energyLevel: t.energyLevel as ScheduleItem["energyLevel"],
    priority: t.priority,
    status: t.status as ScheduleItem["status"],
  }));

  // 3. Ask Gemini to recalculate the schedule
  const movedItem = {
    title: taskToMove.title,
    newStartTime: updatedStartTime.toISOString(),
    newEndTime: updatedEndTime.toISOString()
  };

  const newSchedule = await moveSchedule(movedItem, remainingItems, date);

  // 4. Persist
  for (const item of newSchedule) {
    const originalTask = item.title === taskToMove.title 
      ? taskToMove 
      : remainingTasks.find(t => t.title === item.title);

    if (originalTask) {
      await prisma.task.update({
        where: { id: originalTask.id },
        data: {
          ...(item.startTime && { startTime: new Date(item.startTime) }),
          ...(item.endTime && { endTime: new Date(item.endTime) }),
          status: item.status,
        },
      });
    }
  }

  res.json({ schedule: newSchedule, tasksUpdated: newSchedule.length });
}

/**
 * POST /api/schedule/chat
 * Natural language input — user chats with the AI to build a drafted schedule.
 */
export async function chatSchedule(req: Request, res: Response): Promise<void> {
  const userId = req.userId!;
  const { messages, date } = req.body as { messages: { role: "user" | "model"; content: string }[]; date: string };

  if (!messages || !Array.isArray(messages)) throw new AppError(400, "messages array is required");
  if (!date) throw new AppError(400, "date is required (YYYY-MM-DD)");

  // If this is a weekly conversation:
  if (messages.some(m => m.content.toLowerCase().includes("weekly"))) {
    const parsedWeekly = await converseWeekly(messages);
    
    // If approved, we route to generateWeeklyTemplate internally by sending a POST to our own service or doing it inline
    // Actually, it's cleaner to let the frontend handle the approval and call POST /api/weekly-template/generate
    res.json({
      reply: parsedWeekly.reply,
      status: parsedWeekly.status,
      weeklyTasks: parsedWeekly.weeklyTasks ?? [],
    });
    return;
  }

  const parsed = await converseSchedule(messages, date);

  // If approved, create tasks from drafted input
  const createdTasks = [];
  if (parsed.status === "approved" && parsed.tasks) {
    for (const task of parsed.tasks) {
      let startTime: Date;
      let endTime: Date;

      if (task.fixedStartTime) {
        startTime = new Date(task.fixedStartTime);
      } else {
        // Placeholder — will be optimised by generateSchedule
        startTime = new Date(`${date}T09:00:00`);
      }
      endTime = new Date(startTime.getTime() + task.durationMinutes * 60_000);

      const created = await prisma.task.create({
        data: {
          userId,
          title: task.title,
          type: task.type,
          energyLevel: task.energyLevel,
          priority: task.priority,
          startTime,
          endTime,
          status: "Upcoming",
        },
      });
      createdTasks.push(created);
    }
  }

  res.status(201).json({
    reply: parsed.reply,
    status: parsed.status,
    tasksCreated: createdTasks.length,
    draftTasks: parsed.tasks ?? [],
    tasks: createdTasks,
  });
}
