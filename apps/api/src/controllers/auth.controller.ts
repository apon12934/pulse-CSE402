import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../utils/prisma.js";
import { signToken } from "../utils/jwt.js";
import { AppError } from "../utils/errors.js";

const SALT_ROUNDS = 12;

/**
 * POST /api/auth/register
 * Creates a new user account and returns a JWT.
 */
export async function register(req: Request, res: Response): Promise<void> {
  const { name, email, username, password } = req.body as {
    name: string;
    email: string;
    username?: string;
    password: string;
  };

  // Check for existing user
  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) {
    throw new AppError(409, "An account with this email already exists");
  }

  if (username) {
    const existingUsername = await prisma.user.findUnique({ where: { username } });
    if (existingUsername) {
      throw new AppError(409, "This username is already taken");
    }
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: { name, email, username, password: hashedPassword },
    select: { id: true, name: true, email: true, username: true, tier: true, geminiApiKey: true, rescheduleStrategy: true, avatarUrl: true, createdAt: true },
  });

  const token = signToken(user.id);

  res.status(201).json({ user, token });
}

/**
 * POST /api/auth/login
 * Validates credentials and returns a JWT.
 */
export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as {
    email: string; // This can now be email or username
    password: string;
  };

  // Check email first, then username
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.findUnique({ where: { username: email } });
  }

  if (!user) {
    throw new AppError(401, "Invalid credentials");
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw new AppError(401, "Invalid credentials");
  }

  const token = signToken(user.id);

  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      tier: user.tier,
      avatarUrl: user.avatarUrl,
      geminiApiKey: user.geminiApiKey,
      rescheduleStrategy: user.rescheduleStrategy,
      createdAt: user.createdAt,
    },
    token,
  });
}

/**
 * GET /api/auth/me
 * Returns the authenticated user's profile.
 */
export async function getMe(req: Request, res: Response): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { id: true, name: true, email: true, username: true, tier: true, geminiApiKey: true, rescheduleStrategy: true, avatarUrl: true, createdAt: true },
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  res.json({ user });
}
