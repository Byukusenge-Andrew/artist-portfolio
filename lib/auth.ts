import bcrypt from "bcryptjs";
import { signToken, verifyToken, JWTPayload } from "./jwt";

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
 * Check password strength
 * Returns: weak, medium, strong
 */
export function checkPasswordStrength(password: string): "weak" | "medium" | "strong" {
  if (password.length < 8) return "weak";

  let strength = 0;

  // Length check
  if (password.length >= 12) strength++;
  if (password.length >= 16) strength++;

  // Character variety checks
  if (/[a-z]/.test(password)) strength++; // lowercase
  if (/[A-Z]/.test(password)) strength++; // uppercase
  if (/[0-9]/.test(password)) strength++; // numbers
  if (/[^a-zA-Z0-9]/.test(password)) strength++; // special chars

  if (strength <= 2) return "weak";
  if (strength <= 4) return "medium";
  return "strong";
}

/**
 * Validate password meets minimum requirements
 */
export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  // Check for common weak passwords
  const commonPasswords = ["password", "12345678", "qwerty", "abc123", "password123"];
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push("This password is too common. Please choose a stronger password");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Generate secure random token for password reset
 */
export function generateResetToken(): string {
  const crypto = require("crypto");
  return crypto.randomBytes(32).toString("hex");
}

/**
 * User session interface
 */
export interface UserSession {
  userId: string;
  email: string;
  role: "USER" | "ADMIN";
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
    const payload = await verifyToken(sessionToken);
    if (payload && payload.type === "access") {
      return {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        name: payload.name,
      };
    }
  } catch {
    // Ignore JWT errors, try legacy
  }

  try {
    // Fall back to legacy base64 format for backward compatibility
    // TODO: Remove this after all users have re-authenticated
    const decoded = JSON.parse(Buffer.from(sessionToken, "base64").toString());
    return decoded;
  } catch {
    return null;
  }
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
