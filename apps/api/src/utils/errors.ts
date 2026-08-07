import type { Request, Response, NextFunction } from "express";

/**
 * Standardised JSON error response shape.
 * Keeps API consumers from guessing formats.
 */
export interface ApiError {
  status: number;
  message: string;
  details?: unknown;
}

/** Throw this from any controller to send a clean JSON error. */
export class AppError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }
}

/**
 * Global error handler — mount as the last middleware.
 * Catches AppError for known cases, falls back to 500 for unexpected blowups.
 */
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.status).json({
      status: err.status,
      message: err.message,
      ...(err.details ? { details: err.details } : {}),
    } satisfies ApiError);
    return;
  }

  console.log("[Unhandled Error]", err);
  res.status(500).json({
    status: 500,
    message: err instanceof Error ? err.message : "Internal server error",
    details: err instanceof Error ? err.stack : String(err)
  } satisfies ApiError);
}
