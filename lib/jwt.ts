import { SignJWT, jwtVerify, decodeJwt, JWTPayload as JoseJWTPayload } from "jose";
import { env } from "./env";

/**
 * JWT payload interface
 */
export interface JWTPayload extends JoseJWTPayload {
    userId: string;
    email: string;
    role: "USER" | "ADMIN";
    name?: string;
    type: "access" | "refresh";
}

/**
 * Sign a JWT token (Edge compatible)
 */
export async function signToken(payload: Omit<JWTPayload, "type">, type: "access" | "refresh" = "access"): Promise<string> {
    const secret = new TextEncoder().encode(env.JWT_SECRET);
    const alg = 'HS256';

    const fullPayload = { ...payload, type };

    // Expiration time from env or default
    const expiresIn = type === "access" ? env.JWT_EXPIRES_IN : env.JWT_REFRESH_EXPIRES_IN;

    return new SignJWT(fullPayload)
        .setProtectedHeader({ alg })
        .setIssuedAt()
        .setIssuer("artelier")
        .setAudience("artelier-users")
        .setExpirationTime(expiresIn)
        .sign(secret);
}

/**
 * Verify and decode a JWT token (Edge compatible)
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
    try {
        const secret = new TextEncoder().encode(env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret, {
            issuer: "artelier",
            audience: "artelier-users",
        });

        return payload as unknown as JWTPayload;
    } catch (error) {
        // Token invalid, expired, or malformed
        return null;
    }
}

/**
 * Decode token without verification (for debugging only)
 */
export function decodeToken(token: string): JWTPayload | null {
    try {
        return decodeJwt(token) as JWTPayload;
    } catch {
        return null;
    }
}

/**
 * Generate access and refresh tokens
 */
export async function generateTokenPair(payload: Omit<JWTPayload, "type">) {
    const [accessToken, refreshToken] = await Promise.all([
        signToken(payload, "access"),
        signToken(payload, "refresh")
    ]);

    return {
        accessToken,
        refreshToken,
    };
}

/**
 * Refresh an access token using a refresh token
 */
export async function refreshAccessToken(refreshToken: string): Promise<string | null> {
    const payload = await verifyToken(refreshToken);

    if (!payload || payload.type !== "refresh") {
        return null;
    }

    // Generate new access token with same user data
    const { type, exp, iat, aud, iss, ...userPayload } = payload;

    // Cast to correct type by ensuring all required fields are present
    // The userPayload might contain extra JWT claims, so we construct a clean object
    const cleanPayload = {
        userId: userPayload.userId as string,
        email: userPayload.email as string,
        role: userPayload.role as "USER" | "ADMIN",
        name: userPayload.name as string | undefined,
    };

    return signToken(cleanPayload, "access");
}
