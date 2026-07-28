import { z } from "zod";

// ─── Auth ──────────────────────────────────────────────────

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
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
  taskBlockId: z.string().nullable().optional(),
});

export const updateTaskSchema = createTaskSchema.partial();

export const taskIdParam = z.object({
  id: z.string().min(1),
});
