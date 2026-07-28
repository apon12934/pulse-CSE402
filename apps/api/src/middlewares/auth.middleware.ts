import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.js";
import { AppError } from "../utils/errors.js";

/**
 * Extend Express Request to carry the authenticated userId.
 */
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

/**
 * JWT auth guard.
 * Extracts Bearer token from Authorization header, verifies it,
 * and attaches `userId` to the request object.
 */
export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    throw new AppError(401, "Missing or malformed Authorization header");
  }

  const token = header.slice(7);
  const payload = verifyToken(token);

  if (!payload) {
    throw new AppError(401, "Invalid or expired token");
  }

  req.userId = payload.userId;
  next();
}
