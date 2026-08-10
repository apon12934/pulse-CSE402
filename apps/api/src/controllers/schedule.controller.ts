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
 * GET /api/schedule/chat/history
 * Fetch the user's persistent chat history.
 */

// --- Timezone Helpers ---
function toLocalISOString(date: Date, tzOffsetMinutes: number): string {
  if (!date) return "";
  const localMs = date.getTime() - (tzOffsetMinutes * 60000);
  const localDate = new Date(localMs);
  return localDate.toISOString().replace("Z", "");
}

function fromLocalISOStringToUTC(localStr: string, tzOffsetMinutes: number): Date {
  if (!localStr) return new Date();
  const localDate = new Date(localStr + "Z");
  return new Date(localDate.getTime() + (tzOffsetMinutes * 60000));
}
// ------------------------

export async function getChatHistory(req: Request, res: Response): Promise<void> {
  const userId = req.userId!;

  const messages = await prisma.chatMessage.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });

  const formatted = messages.map(m => {
    let text = m.content;
    let status = 'chatting';
    let tasks = undefined;
    let weeklyTasks = undefined;

    if (m.role === 'ai') {
      try {
        const parsed = JSON.parse(m.content);
        text = parsed.text || m.content;
        status = parsed.status || 'chatting';
        tasks = parsed.tasks;
        weeklyTasks = parsed.weeklyTasks;
      } catch {
        // fallback for older plain text messages
      }
    }

    return {
      id: m.id,
      role: m.role,
      text,
      status,
      tasks,
      weeklyTasks,
      timestamp: m.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
    };
  });

  res.json({ messages: formatted });
}

/**
 * DELETE /api/schedule/chat/history
 * Clear the user's persistent chat history.
 */
export async function clearChatHistory(req: Request, res: Response): Promise<void> {
  const userId = req.userId!;

  await prisma.chatMessage.deleteMany({
    where: { userId }
  });

  res.json({ success: true });
}

/**
 * POST /api/schedule/generate
 * Takes the user's tasks for a given date and asks Gemini to build an optimised timeline.
 */
export async function generateDailySchedule(req: Request, res: Response): Promise<void> {
  const userId = req.userId!;
  const { date, energyLevel, tz = 0 } = req.body as { date: string; energyLevel?: string; tz?: number };

  if (!date) throw new AppError(400, "date is required (YYYY-MM-DD)");

  const dayStartUTC = new Date(date);
  const dayStart = new Date(dayStartUTC.getTime() + (tz * 60000));
  const dayEnd = new Date(dayStart);
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
      startTime: toLocalISOString(t.startTime, tz),
      endTime: toLocalISOString(t.endTime, tz),
      energyLevel: t.energyLevel as ScheduleItem["energyLevel"],
      priority: t.priority,
      status: t.status as ScheduleItem["status"],
    }));

  const fluidTasks: ScheduleItem[] = tasks
    .filter((t) => t.type === "Fluid")
    .map((t) => ({
      title: t.title,
      type: "Fluid" as const,
      startTime: toLocalISOString(t.startTime, tz),
      endTime: toLocalISOString(t.endTime, tz),
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
          startTime: fromLocalISOStringToUTC(item.startTime, tz),
          endTime: fromLocalISOStringToUTC(item.endTime, tz),
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
  const { taskId, newEndTime, tz = 0 } = req.body as { taskId: string; newEndTime: string; tz?: number };

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
  const localMs = overrunTask.startTime.getTime() - (tz * 60000);
  const localDate = new Date(localMs);
  localDate.setUTCHours(0, 0, 0, 0);
  const dayStart = new Date(localDate.getTime() + (tz * 60000));
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
    startTime: toLocalISOString(t.startTime, tz),
    endTime: toLocalISOString(t.endTime, tz),
    energyLevel: t.energyLevel as ScheduleItem["energyLevel"],
    priority: t.priority,
    status: t.status as ScheduleItem["status"],
  }));

  const dateStr = localDate.toISOString().split("T")[0]!;
  const localNewEndTime = toLocalISOString(new Date(newEndTime), tz);
  const rescheduled = await reschedule(overrunTask.title, localNewEndTime, remainingItems, dateStr);

  // Persist rescheduled times
  const updatePromises = rescheduled.map(item => {
    const match = remaining.find(t => t.title === item.title);
    if (!match) return null;
    return prisma.task.update({
      where: { id: match.id },
      data: {
        ...(item.startTime && { startTime: fromLocalISOStringToUTC(item.startTime, tz) }),
        ...(item.endTime && { endTime: fromLocalISOStringToUTC(item.endTime, tz) }),
        status: item.status,
      },
    });
  }).filter((p): p is NonNullable<typeof p> => p !== null);

  if (updatePromises.length > 0) {
    await prisma.$transaction(updatePromises);
  }

  res.json({ rescheduled, tasksAffected: rescheduled.length });
}

/**
 * POST /api/schedule/reorder
 * Reorder tasks based on an explicit array of task IDs.
 */
export async function reorderTasks(req: Request, res: Response): Promise<void> {
  const userId = req.userId!;
  const { taskIds, date, tz = 0 } = req.body as { taskIds: string[]; date: string; tz?: number };

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
    startTime: toLocalISOString(t.startTime, tz),
    endTime: toLocalISOString(t.endTime, tz),
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
          ...(item.startTime && { startTime: fromLocalISOStringToUTC(item.startTime, tz) }),
          ...(item.endTime && { endTime: fromLocalISOStringToUTC(item.endTime, tz) }),
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
  const { taskId, newStartTime, date, tz = 0 } = req.body as { taskId: string; newStartTime: string; date: string; tz?: number };

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
  const dayStartUTC = new Date(date);
  const dayStart = new Date(dayStartUTC.getTime() + (tz * 60000));
  const dayEnd = new Date(dayStart);
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
    startTime: toLocalISOString(t.startTime, tz),
    endTime: toLocalISOString(t.endTime, tz),
    energyLevel: t.energyLevel as ScheduleItem["energyLevel"],
    priority: t.priority,
    status: t.status as ScheduleItem["status"],
  }));

  // 3. Ask Gemini to recalculate the schedule
  const movedItem = {
    title: taskToMove.title,
    newStartTime: toLocalISOString(updatedStartTime, tz),
    newEndTime: toLocalISOString(updatedEndTime, tz)
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
          ...(item.startTime && { startTime: fromLocalISOStringToUTC(item.startTime, tz) }),
          ...(item.endTime && { endTime: fromLocalISOStringToUTC(item.endTime, tz) }),
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
  const { message, date, localTime } = req.body as { message: string; date: string; localTime?: string };

  if (!message) throw new AppError(400, "message is required");
  if (!date) throw new AppError(400, "date is required (YYYY-MM-DD)");

  // Save the user's message
  await prisma.chatMessage.create({
    data: {
      userId,
      role: "user",
      content: message
    }
  });

  // Fetch complete history
  const dbMessages = await prisma.chatMessage.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" }
  });

  const rawMessages = dbMessages.map(m => {
    let content = m.content;
    if (m.role === "ai") {
      try {
        const parsed = JSON.parse(content);
        content = parsed.text || content;
      } catch {}
    }
    return {
      role: m.role === "ai" ? "model" as const : "user" as const,
      content
    };
  });

  // Gemini strictly requires alternating roles (user -> model -> user)
  // Collapse consecutive messages of the same role to prevent API 400 crashes
  const messages: typeof rawMessages = [];
  for (const msg of rawMessages) {
    const last = messages[messages.length - 1];
    if (last && last.role === msg.role) {
      last.content += `\n${msg.content}`;
    } else {
      messages.push({ ...msg });
    }
  }

  // Gemini must start with a user message
  if (messages.length > 0 && messages[0]?.role === "model") {
    messages.shift();
  }

  // If this is a weekly conversation:
  if (messages.some(m => m.content.toLowerCase().includes("week"))) {
    const parsedWeekly = await converseWeekly(messages);
    
    // Save the AI's response to maintain conversation history for Gemini
    await prisma.chatMessage.create({
      data: {
        userId,
        role: "ai",
        content: JSON.stringify({
          text: parsedWeekly.reply,
          status: parsedWeekly.status,
          weeklyTasks: parsedWeekly.weeklyTasks
        })
      }
    });

    res.json({
      reply: parsedWeekly.reply,
      status: parsedWeekly.status,
      weeklyTasks: parsedWeekly.weeklyTasks ?? [],
    });
    return;
  }

  const parsed = await converseSchedule(messages, date, localTime);

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

  // Save the AI's response
  await prisma.chatMessage.create({
    data: {
      userId,
      role: "ai",
      content: JSON.stringify({
      text: parsed.reply,
      status: parsed.status,
      tasks: parsed.tasks
    })
    }
  });

  res.status(201).json({
    reply: parsed.reply,
    status: parsed.status,
    tasksCreated: createdTasks.length,
    draftTasks: parsed.tasks ?? [],
    tasks: createdTasks,
  });
}

/**
 * DELETE /api/schedule/reset-day
 * Delete all tasks for the given date and restore from the Weekly Template if it exists.
 */
export async function resetDay(req: Request, res: Response): Promise<void> {
  const userId = req.userId!;
  const date = typeof req.query["date"] === "string" ? req.query["date"] : undefined;
  const tz = req.query["tz"] ? parseInt(req.query["tz"] as string) : 0;

  if (!date) throw new AppError(400, "date query param is required (YYYY-MM-DD)");

  const dayStartUTC = new Date(date);
  const dayStart = new Date(dayStartUTC.getTime() + (tz * 60000));
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  // 1. Delete all current tasks for that date
  await prisma.task.deleteMany({
    where: {
      userId,
      startTime: { gte: dayStart, lt: dayEnd },
    },
  });

  // 2. Fetch template tasks for this day of the week
  const dayOfWeek = dayStart.getDay();
  const templates = await prisma.templateTask.findMany({
    where: { userId, dayOfWeek },
  });

  // 3. If templates exist, restore them for this specific date
  if (templates.length > 0) {
    const instancesToCreate = templates.map((template) => {
      const startTime = new Date(dayStart);
      startTime.setHours(template.startHour, template.startMinute, 0, 0);

      const endTime = new Date(dayStart);
      endTime.setHours(template.endHour, template.endMinute, 0, 0);

      return {
        userId,
        title: template.title,
        type: template.type,
        energyLevel: template.energyLevel,
        priority: template.priority,
        startTime,
        endTime,
        status: "Upcoming",
        templateTaskId: template.id,
      };
    });

    await prisma.task.createMany({ data: instancesToCreate as any });
  }

  res.json({ success: true, restored: templates.length });
}

/**
 * DELETE /api/schedule/clear-all
 * Delete all tasks for the user.
 */
export async function clearAllTasks(req: Request, res: Response): Promise<void> {
  const userId = req.userId!;

  await prisma.task.deleteMany({
    where: { userId },
  });

  res.json({ success: true });
}
