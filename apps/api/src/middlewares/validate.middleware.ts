import type { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { AppError } from "../utils/errors.js";

/**
 * Returns a middleware that validates `req.body` against the given Zod schema.
 * Passes cleaned data forward or throws a 400 AppError with validation details.
 */
export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        throw new AppError(400, "Validation failed", err.flatten().fieldErrors);
      }
      throw err;
    }
  };
}
