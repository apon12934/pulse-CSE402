import jwt from "jsonwebtoken";

const SECRET = process.env["JWT_SECRET"] ?? "pulse-dev-secret-change-me";
const EXPIRES_IN = "7d";

export interface JwtPayload {
  userId: string;
}

/** Sign a JWT containing the user's id. */
export function signToken(userId: string): string {
  return jwt.sign({ userId } satisfies JwtPayload, SECRET, { expiresIn: EXPIRES_IN });
}

/** Verify a JWT and return the decoded payload, or null if invalid. */
export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, SECRET) as JwtPayload;
  } catch {
    return null;
  }
}
