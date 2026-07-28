import type { Request, Response } from "express";
import { prisma } from "../utils/prisma.js";

/**
 * PATCH /api/user/profile
 * Updates the authenticated user's profile preferences.
 */
export async function updateProfile(req: Request, res: Response): Promise<void> {
  const userId = req.userId!;
  const { geminiApiKey, rescheduleStrategy } = req.body as {
    geminiApiKey?: string | null;
    rescheduleStrategy?: string;
  };

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(geminiApiKey !== undefined && { geminiApiKey }),
      ...(rescheduleStrategy !== undefined && { rescheduleStrategy }),
    },
    select: { id: true, name: true, email: true, tier: true, geminiApiKey: true, rescheduleStrategy: true, createdAt: true },
  });

  res.json({ user });
}
