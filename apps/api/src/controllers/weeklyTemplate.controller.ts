import type { Request, Response } from "express";
import { prisma } from "../utils/prisma.js";
import { AppError } from "../utils/errors.js";

const WEEKS_TO_GENERATE = 4;

/**
 * Build Task instances for a template task across N weeks starting from today.
 */
function generateInstancesForTemplate(
  template: { id: string; userId: string; dayOfWeek: number; startHour: number; startMinute: number; endHour: number; endMinute: number; title: string; type: string; energyLevel: string; priority: number },
  weeksAhead: number,
): Array<{ userId: string; title: string; type: string; energyLevel: string; priority: number; startTime: Date; endTime: Date; status: string; templateTaskId: string }> {
  const instances = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let w = 0; w < weeksAhead; w++) {
    const weekOffset = w * 7;
    
    // Find the next occurrence of this dayOfWeek from today + weekOffset
    const base = new Date(today);
    base.setDate(today.getDate() + weekOffset);
    
    const diff = (template.dayOfWeek - base.getDay() + 7) % 7;
    const targetDate = new Date(base);
    targetDate.setDate(base.getDate() + diff);

    // Skip dates in the past
    if (targetDate < today && w === 0) continue;

    const startTime = new Date(targetDate);
    startTime.setHours(template.startHour, template.startMinute, 0, 0);

    const endTime = new Date(targetDate);
    endTime.setHours(template.endHour, template.endMinute, 0, 0);

    instances.push({
      userId: template.userId,
      title: template.title,
      type: template.type,
      energyLevel: template.energyLevel,
      priority: template.priority,
      startTime,
      endTime,
      status: "Upcoming",
      templateTaskId: template.id,
    });
  }

  return instances;
}

/**
 * GET /api/weekly-template
 * Get the user's full weekly template (all TemplateTasks, grouped by day).
 */
export async function getWeeklyTemplate(req: Request, res: Response): Promise<void> {
  const userId = req.userId!;
  const templates = await prisma.templateTask.findMany({
    where: { userId },
    orderBy: [{ dayOfWeek: "asc" }, { startHour: "asc" }, { startMinute: "asc" }],
  });
  res.json({ templates });
}

/**
 * POST /api/weekly-template/generate
 * Takes a Gemini-generated weekly schedule and:
 * 1. Clears the user's existing template
 * 2. Creates TemplateTask records
 * 3. Generates Task instances for the next N weeks
 */
export async function generateWeeklyTemplate(req: Request, res: Response): Promise<void> {
  const userId = req.userId!;
  const { tasks } = req.body as {
    tasks: Array<{
      title: string;
      type: string;
      energyLevel: string;
      priority: number;
      dayOfWeek: number;
      startHour: number;
      startMinute: number;
      endHour: number;
      endMinute: number;
    }>;
  };

  if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
    throw new AppError(400, "tasks array is required");
  }

  // 1. Delete existing template
  await prisma.templateTask.deleteMany({ where: { userId } });

  // 2. Delete all future tasks to provide a clean slate for the new weekly routine
  const now = new Date();
  await prisma.task.deleteMany({
    where: {
      userId,
      startTime: { gte: now },
    },
  });

  // 3. Create new template tasks
  const createdTemplates = await Promise.all(
    tasks.map((t) =>
      prisma.templateTask.create({
        data: {
          userId,
          title: t.title,
          type: t.type as "Anchor" | "Fluid",
          energyLevel: t.energyLevel as "High" | "Medium" | "Low",
          priority: t.priority,
          dayOfWeek: t.dayOfWeek,
          startHour: t.startHour,
          startMinute: t.startMinute,
          endHour: t.endHour,
          endMinute: t.endMinute,
        },
      })
    )
  );

  // 4. Generate Task instances for next N weeks
  let totalInstances = 0;
  for (const template of createdTemplates) {
    const instances = generateInstancesForTemplate(template, WEEKS_TO_GENERATE);
    if (instances.length > 0) {
      await prisma.task.createMany({ data: instances as any });
      totalInstances += instances.length;
    }
  }

  res.status(201).json({
    templateTasks: createdTemplates.length,
    taskInstancesCreated: totalInstances,
  });
}

/**
 * PATCH /api/weekly-template/tasks/:id
 * Update a template task + regenerate all its future instances.
 */
export async function updateTemplateTask(req: Request, res: Response): Promise<void> {
  const userId = req.userId!;
  const { id } = req.params as { id: string };

  const existing = await prisma.templateTask.findFirst({ where: { id, userId } });
  if (!existing) throw new AppError(404, "Template task not found");

  const { title, type, energyLevel, priority, dayOfWeek, startHour, startMinute, endHour, endMinute } = req.body as Partial<typeof existing>;

  const updated = await prisma.templateTask.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(type !== undefined && { type: type as "Anchor" | "Fluid" }),
      ...(energyLevel !== undefined && { energyLevel: energyLevel as "High" | "Medium" | "Low" }),
      ...(priority !== undefined && { priority }),
      ...(dayOfWeek !== undefined && { dayOfWeek }),
      ...(startHour !== undefined && { startHour }),
      ...(startMinute !== undefined && { startMinute }),
      ...(endHour !== undefined && { endHour }),
      ...(endMinute !== undefined && { endMinute }),
    },
  });

  // Delete all future instances from this template
  const now = new Date();
  await prisma.task.deleteMany({
    where: { templateTaskId: id, startTime: { gte: now } },
  });

  // Regenerate instances with new values
  const instances = generateInstancesForTemplate(updated, WEEKS_TO_GENERATE);
  if (instances.length > 0) {
    await prisma.task.createMany({ data: instances as any });
  }

  res.json({ template: updated, instancesRegenerated: instances.length });
}

/**
 * DELETE /api/weekly-template/tasks/:id
 * Delete a template task and all its future instances.
 */
export async function deleteTemplateTask(req: Request, res: Response): Promise<void> {
  const userId = req.userId!;
  const { id } = req.params as { id: string };

  const existing = await prisma.templateTask.findFirst({ where: { id, userId } });
  if (!existing) throw new AppError(404, "Template task not found");

  const now = new Date();
  const { count } = await prisma.task.deleteMany({
    where: { templateTaskId: id, startTime: { gte: now } },
  });

  await prisma.templateTask.delete({ where: { id } });

  res.json({ deletedInstances: count });
}
