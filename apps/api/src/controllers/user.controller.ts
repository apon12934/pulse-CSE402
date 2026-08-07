import type { Request, Response } from "express";
import { prisma } from "../utils/prisma.js";
import { AppError } from "../utils/errors.js";
import bcrypt from "bcryptjs";

/**
 * PATCH /api/user/profile
 * Updates the authenticated user's profile preferences.
 */
export async function updateProfile(req: Request, res: Response): Promise<void> {
  const userId = req.userId!;
  const { name, geminiApiKey, rescheduleStrategy } = req.body as {
    name?: string;
    geminiApiKey?: string | null;
    rescheduleStrategy?: string;
  };

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(name !== undefined && { name }),
      ...(geminiApiKey !== undefined && { geminiApiKey }),
      ...(rescheduleStrategy !== undefined && { rescheduleStrategy }),
    },
    select: { id: true, name: true, email: true, tier: true, geminiApiKey: true, rescheduleStrategy: true, avatarUrl: true, createdAt: true },
  });

  res.json({ user });
}

/**
 * POST /api/user/avatar
 * Uploads an avatar image and updates the user's avatarUrl.
 */
export async function uploadAvatar(req: Request, res: Response): Promise<void> {
  const userId = req.userId!;
  
  if (!req.file) {
    res.status(400).json({ error: "No image file provided" });
    return;
  }

  // Cloudinary sets the secure URL in req.file.path
  const avatarUrl = req.file.path;

  const user = await prisma.user.update({
    where: { id: userId },
    data: { avatarUrl },
    select: { id: true, name: true, email: true, tier: true, avatarUrl: true },
  });

  res.json({ user });
}

/**
 * PATCH /api/user/password
 * Update user password.
 */
export async function updatePassword(req: Request, res: Response): Promise<void> {
  const userId = req.userId!;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new AppError(400, "currentPassword and newPassword are required");
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, "User not found");

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) throw new AppError(401, "Invalid current password");

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword }
  });

  res.json({ success: true });
}

/**
 * DELETE /api/user/account
 * Delete the entire account and all associated data.
 */
export async function deleteAccount(req: Request, res: Response): Promise<void> {
  const userId = req.userId!;

  // Prisma cascade will handle tasks, messages, etc.
  await prisma.user.delete({ where: { id: userId } });

  res.json({ success: true });
}
