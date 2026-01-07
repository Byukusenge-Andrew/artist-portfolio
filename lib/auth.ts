import crypto from "crypto";

/**
 * Hash password using SHA-256
 */
export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

/**
 * Verify password
 */
export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

/**
 * Generate secure token
 */
export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Extract user info from cookies
 */
export interface UserSession {
  userId: string;
  email: string;
  role: "USER" | "ADMIN";
}

export function parseUserSession(sessionCookie: string | undefined): UserSession | null {
  if (!sessionCookie) return null;
  try {
    return JSON.parse(Buffer.from(sessionCookie, "base64").toString());
  } catch {
    return null;
  }
}

export function serializeUserSession(session: UserSession): string {
  return Buffer.from(JSON.stringify(session)).toString("base64");
}
