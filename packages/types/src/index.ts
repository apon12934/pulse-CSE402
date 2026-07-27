/**
 * @pulse/types — Shared Type Definitions
 *
 * Cross-workspace TypeScript definitions consumed by
 * both the API and Web clients. Ensures type-safe
 * contracts across the entire Pulse ecosystem.
 */

// ─── Enums ────────────────────────────────────────

/** Distinguishes immovable events from flexible tasks. */
export enum TaskType {
  Anchor = "Anchor",
  Fluid = "Fluid",
}

/** Lifecycle status of a scheduled task. */
export enum TaskStatus {
  Upcoming = "Upcoming",
  Running = "Running",
  Completed = "Completed",
  Overdue = "Overdue",
}

/** User-reported energy state for AI scheduling optimization. */
export enum EnergyLevel {
  High = "High",
  Medium = "Medium",
  Low = "Low",
}

/** Account tier for future feature gating. */
export enum UserTier {
  Free = "Free",
  Pro = "Pro",
}

// ─── Entity Interfaces ────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  tier: UserTier;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  type: TaskType;
  status: TaskStatus;
  energyLevel: EnergyLevel;
  priority: number;
  startTime: Date;
  endTime: Date;
  taskBlockId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskBlock {
  id: string;
  userId: string;
  blockName: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DailyRoutine {
  id: string;
  userId: string;
  date: Date;
  totalAnchors: number;
  totalFluid: number;
  completedTasks: number;
  skippedTasks: number;
  createdAt: Date;
  updatedAt: Date;
}
