import type { Request, Response } from "express";
import { prisma } from "../utils/prisma.js";
import { AppError } from "../utils/errors.js";

import { generateInstancesForTemplate } from "./weeklyTemplate.controller.js";

/**
 * POST /api/tasks
 * Create a new task for the authenticated user.
 */
export async function createTask(req: Request, res: Response): Promise<void> {
  const userId = req.userId!;
  const { 
    title, description, type, energyLevel, priority, startTime, endTime, taskBlockId,
    recurringDays, localStartHour, localStartMinute, localEndHour, localEndMinute, timezoneOffset, referenceDate
  } =
    req.body as {
      title: string;
      description?: string | null;
      type: "Anchor" | "Fluid";
      energyLevel?: "High" | "Medium" | "Low";
      priority?: number;
      startTime: string;
      endTime: string;
      taskBlockId?: string | null;
      recurringDays?: number[];
      localStartHour?: number;
      localStartMinute?: number;
      localEndHour?: number;
      localEndMinute?: number;
      timezoneOffset?: number;
      referenceDate?: string;
    };

  // If a taskBlockId is provided, verify it belongs to this user
  if (taskBlockId) {
    const block = await prisma.taskBlock.findFirst({
      where: { id: taskBlockId, userId },
    });
    if (!block) {
      throw new AppError(404, "Task block not found or does not belong to you");
    }
  }

  // Handle Recurring Tasks
  if (recurringDays && recurringDays.length > 0) {
    if (
      localStartHour === undefined || localStartMinute === undefined ||
      localEndHour === undefined || localEndMinute === undefined ||
      timezoneOffset === undefined || referenceDate === undefined
    ) {
      throw new AppError(400, "Missing required template fields for recurring task");
    }

    const createdTemplates = await Promise.all(
      recurringDays.map((dayOfWeek) =>
        prisma.templateTask.create({
          data: {
            userId,
            title,
            type,
            energyLevel: energyLevel ?? "Medium",
            priority: priority ?? 0,
            dayOfWeek,
            startHour: localStartHour,
            startMinute: localStartMinute,
            endHour: localEndHour,
            endMinute: localEndMinute,
          },
        })
      )
    );

    let allInstances: any[] = [];
    const WEEKS_TO_GENERATE = 4;
    for (const template of createdTemplates) {
      const instances = generateInstancesForTemplate(template, WEEKS_TO_GENERATE, timezoneOffset, referenceDate);
      allInstances = allInstances.concat(instances);
    }

    if (allInstances.length > 0) {
      await prisma.task.createMany({ data: allInstances });
    }

    res.status(201).json({ 
      message: "Recurring tasks created successfully", 
      templates: createdTemplates.length, 
      instances: allInstances.length 
    });
    return;
  }

  const task = await prisma.task.create({
    data: {
      userId,
      title,
      description: description ?? null,
      type,
      energyLevel: energyLevel ?? "Medium",
      priority: priority ?? 0,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      taskBlockId: taskBlockId ?? null,
    },
  });

  res.status(201).json({ task });
}

/**
 * GET /api/tasks
 * List all tasks for the authenticated user.
 * Supports optional query filters: ?status=Running&type=Anchor&date=2025-07-28
 */
export async function listTasks(req: Request, res: Response): Promise<void> {
  const userId = req.userId!;

  const where: Record<string, unknown> = { userId };

  const status = typeof req.query["status"] === "string" ? req.query["status"] : undefined;
  const type = typeof req.query["type"] === "string" ? req.query["type"] : undefined;
  const date = typeof req.query["date"] === "string" ? req.query["date"] : undefined;

  if (status) where["status"] = status;
  if (type) where["type"] = type;

  // Filter tasks by a specific date (start of day to end of day)
  if (date) {
    const tz = req.query["tz"] ? parseInt(req.query["tz"] as string) : 0;
    const dayStartUTC = new Date(date);
    const dayStart = new Date(dayStartUTC.getTime() + (tz * 60000));
    
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);
    
    where["startTime"] = { gte: dayStart, lt: dayEnd };
  }

  const tasks = await prisma.task.findMany({
    where,
    orderBy: { startTime: "asc" },
    include: { taskBlock: { select: { id: true, blockName: true } } },
  });

  res.json({ tasks, count: tasks.length });
}

/**
 * GET /api/tasks/:id
 * Get a single task by id (scoped to authenticated user).
 */
export async function getTask(req: Request, res: Response): Promise<void> {
  const userId = req.userId!;
  const id = req.params["id"] as string;

  const task = await prisma.task.findFirst({
    where: { id, userId },
    include: { taskBlock: { select: { id: true, blockName: true } } },
  });

  if (!task) {
    throw new AppError(404, "Task not found");
  }

  res.json({ task });
}

/**
 * PATCH /api/tasks/:id
 * Partially update a task (scoped to authenticated user).
 */
export async function updateTask(req: Request, res: Response): Promise<void> {
  const userId = req.userId!;
  const id = req.params["id"] as string;

  // Verify ownership
  const existing = await prisma.task.findFirst({ where: { id, userId } });
  if (!existing) {
    throw new AppError(404, "Task not found");
  }

  const { title, description, type, status, energyLevel, priority, startTime, endTime, taskBlockId, applyGlobally, localStartHour, localStartMinute, localEndHour, localEndMinute, timezoneOffset } =
    req.body as {
      title?: string;
      description?: string | null;
      type?: "Anchor" | "Fluid";
      status?: "Upcoming" | "Running" | "Completed" | "Overdue";
      energyLevel?: "High" | "Medium" | "Low";
      priority?: number;
      startTime?: string;
      endTime?: string;
      taskBlockId?: string | null;
      applyGlobally?: boolean;
      localStartHour?: number;
      localStartMinute?: number;
      localEndHour?: number;
      localEndMinute?: number;
      timezoneOffset?: number;
    };

  // If switching task blocks, verify new block belongs to user
  if (taskBlockId) {
    const block = await prisma.taskBlock.findFirst({
      where: { id: taskBlockId, userId },
    });
    if (!block) {
      throw new AppError(404, "Task block not found or does not belong to you");
    }
  }

  const task = await prisma.task.update({
    where: { id: id as string },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(type !== undefined && { type }),
      ...(status !== undefined && { status }),
      ...(energyLevel !== undefined && { energyLevel }),
      ...(priority !== undefined && { priority }),
      ...(startTime !== undefined && { startTime: new Date(startTime) }),
      ...(endTime !== undefined && { endTime: new Date(endTime) }),
      ...(taskBlockId !== undefined && { taskBlockId }),
    },
  });

  if (applyGlobally && existing.templateTaskId) {
    const startHour = localStartHour ?? (startTime ? new Date(startTime).getHours() : undefined);
    const startMinute = localStartMinute ?? (startTime ? new Date(startTime).getMinutes() : undefined);
    const endHour = localEndHour ?? (endTime ? new Date(endTime).getHours() : undefined);
    const endMinute = localEndMinute ?? (endTime ? new Date(endTime).getMinutes() : undefined);

    await prisma.templateTask.update({
      where: { id: existing.templateTaskId },
      data: {
        ...(startHour !== undefined && { startHour }),
        ...(startMinute !== undefined && { startMinute }),
        ...(endHour !== undefined && { endHour }),
        ...(endMinute !== undefined && { endMinute }),
      },
    });

    // Update all future tasks belonging to this template
    // We only update tasks that haven't happened yet
    const now = new Date();
    
    // To properly shift times, we need to iterate over future tasks because they fall on different dates
    const futureTasks = await prisma.task.findMany({
      where: {
        templateTaskId: existing.templateTaskId,
        userId,
        startTime: { gt: now },
        status: { notIn: ["Completed"] }, // Don't mess with completed tasks even if they are somehow in the future
      },
    });

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
      
      const newEnd = new Date(fTask.endTime);
      if (endHour !== undefined) {
        if (timezoneOffset !== undefined) {
          const localMs = fTask.endTime.getTime() - (timezoneOffset * 60000);
          const localDate = new Date(localMs);
          localDate.setUTCHours(endHour, endMinute ?? 0, 0, 0);
          newEnd.setTime(localDate.getTime() + (timezoneOffset * 60000));
        } else {
          newEnd.setHours(endHour, endMinute ?? 0, 0, 0);
        }
      }

      await prisma.task.update({
        where: { id: fTask.id },
        data: {
          ...(title !== undefined && { title }),
          ...(type !== undefined && { type }),
          ...(energyLevel !== undefined && { energyLevel }),
          ...(priority !== undefined && { priority }),
          ...(startTime !== undefined && { startTime: newStart }),
          ...(endTime !== undefined && { endTime: newEnd }),
        }
      });
    }
  }

  res.json({ task });
}

/**
 * DELETE /api/tasks/:id
 * Delete a task (scoped to authenticated user).
 */
export async function deleteTask(req: Request, res: Response): Promise<void> {
  const userId = req.userId!;
  const id = req.params["id"] as string;

  const existing = await prisma.task.findFirst({ where: { id, userId } });
  if (!existing) {
    throw new AppError(404, "Task not found");
  }

  await prisma.task.delete({ where: { id } });

  res.status(204).send();
}

/**
 * DELETE /api/tasks
 * Delete ALL tasks for the authenticated user on a given date.
 * Requires ?date=YYYY-MM-DD query param.
 */
export async function deleteAllTasksForDate(req: Request, res: Response): Promise<void> {
  const userId = req.userId!;
  const date = typeof req.query["date"] === "string" ? req.query["date"] : undefined;

  if (!date) throw new AppError(400, "date query param is required (YYYY-MM-DD)");

  const dayStart = new Date(date);
  const dayEnd = new Date(date);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const { count } = await prisma.task.deleteMany({
    where: {
      userId,
      startTime: { gte: dayStart, lt: dayEnd },
    },
  });

  res.json({ deleted: count });
}
