import { z } from "zod";

// ─── Auth ──────────────────────────────────────────────────

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address").max(255),
  username: z.string().max(50).optional(),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
});

export const loginSchema = z.object({
  email: z.string().min(1, "Email or username is required"),
  password: z.string().min(1, "Password is required"),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1, "Name cannot be empty").max(100).optional(),
  email: z.string().email("Invalid email address").max(255).optional(),
  username: z.string().max(50).optional(),
  geminiApiKey: z.string().optional().nullable(),
  rescheduleStrategy: z.string().optional(),
});

// ─── Tasks ─────────────────────────────────────────────────

export const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().max(2000).nullable().optional(),
  type: z.enum(["Anchor", "Fluid"]),
  energyLevel: z.enum(["High", "Medium", "Low"]).optional().default("Medium"),
  priority: z.number().int().min(0).max(10).optional().default(0),
  startTime: z.string().datetime({ message: "startTime must be ISO 8601" }),
  endTime: z.string().datetime({ message: "endTime must be ISO 8601" }),
  status: z.enum(["Upcoming", "Running", "Completed", "Overdue"]).optional().default("Upcoming"),
  taskBlockId: z.string().nullable().optional(),
  recurringDays: z.array(z.number().int().min(0).max(6)).optional(),
  localStartHour: z.number().int().min(0).max(23).optional(),
  localStartMinute: z.number().int().min(0).max(59).optional(),
  localEndHour: z.number().int().min(0).max(23).optional(),
  localEndMinute: z.number().int().min(0).max(59).optional(),
  timezoneOffset: z.number().optional(),
  referenceDate: z.string().optional(),
});

export const updateTaskSchema = createTaskSchema.partial();

export const taskIdParam = z.object({
  id: z.string().min(1),
});
