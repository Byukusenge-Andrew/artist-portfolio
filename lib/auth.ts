import bcrypt from "bcryptjs";
import crypto from "crypto";
import { signToken, verifyToken, JWTPayload } from "./jwt";
import { prisma } from "./prisma";

// Re-export password utilities for backward compatibility
// Note: Client components should import directly from "./password-utils" to avoid server dependencies
export { checkPasswordStrength, validatePassword } from "./password-utils";

/**
 * Hash password using bcrypt (secure for passwords)
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Verify password against bcrypt hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch {
    return false;
  }
}





/**
 * Generate secure random token for password reset
 */
export function generateResetToken(): string {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const crypto = require("crypto");
  return crypto.randomBytes(32).toString("hex");
}

/**
 * User session interface
 */
export interface UserSession {
  userId: string;
  email: string;
  role: "USER" | "ADMIN" | "ARTIST";
  name?: string;
}

/**
 * Parse user session from JWT token
 * @deprecated Use verifyToken from jwt.ts directly
 */
export async function parseUserSession(sessionToken: string | undefined): Promise<UserSession | null> {
  if (!sessionToken) return null;

  try {
    // Try JWT first (new format)
    const payload = await verifyToken(sessionToken) as JWTPayload & UserSession;
    if (payload && payload.type === "access" && payload.jti) {
      // Check if session exists and is not expired in DB
      const dbSession = await prisma.session.findUnique({
        where: { id: payload.jti }
      });

      if (dbSession && new Date() < dbSession.expiresAt) {
        return {
          userId: payload.userId,
          email: payload.email,
          role: payload.role,
          name: payload.name,
        };
      }
    }
  } catch(error) {
    console.error("Error parsing user session:", error);
    return null;
  }

  return null;
}

/**
 * Serialize user session to JWT token
 * @deprecated Use signToken from jwt.ts directly
 */
export async function serializeUserSession(session: UserSession): Promise<string> {
  return signToken({
    userId: session.userId,
    email: session.email,
    role: session.role,
    name: session.name,
  });
}
