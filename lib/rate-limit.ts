import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * In-memory rate limiter for development
 * For production, use Redis-backed rate limiting
 */
class InMemoryRateLimiter {
    private requests: Map<string, { count: number; resetAt: number }> = new Map();

    async limit(identifier: string, maxRequests: number, windowMs: number) {
        const now = Date.now();
        const key = identifier;
        const record = this.requests.get(key);

        // Clean up expired entries
        if (record && now > record.resetAt) {
            this.requests.delete(key);
        }

        const current = this.requests.get(key);

        if (!current) {
            this.requests.set(key, { count: 1, resetAt: now + windowMs });
            return { success: true, remaining: maxRequests - 1, reset: now + windowMs };
        }

        if (current.count >= maxRequests) {
            return { success: false, remaining: 0, reset: current.resetAt };
        }

        current.count++;
        return { success: true, remaining: maxRequests - current.count, reset: current.resetAt };
    }
}

// Use in-memory rate limiter for now
// TODO: Replace with Redis in production for distributed rate limiting
const memoryLimiter = new InMemoryRateLimiter();

/**
 * Rate limit configurations
 */
export const rateLimitConfig = {
    // Authentication endpoints
    login: { requests: 5, window: 15 * 60 * 1000 }, // 5 requests per 15 minutes
    register: { requests: 3, window: 60 * 60 * 1000 }, // 3 requests per hour
    passwordReset: { requests: 3, window: 60 * 60 * 1000 }, // 3 requests per hour

    // API endpoints
    api: { requests: 100, window: 60 * 1000 }, // 100 requests per minute
    adminApi: { requests: 50, window: 60 * 1000 }, // 50 requests per minute

    // File uploads
    upload: { requests: 10, window: 60 * 1000 }, // 10 uploads per minute
};

/**
 * Rate limit a request
 */
export async function rateLimit(
    identifier: string,
    type: keyof typeof rateLimitConfig
): Promise<{ success: boolean; remaining: number; reset: number }> {
    const config = rateLimitConfig[type];
    return memoryLimiter.limit(identifier, config.requests, config.window);
}

/**
 * Get rate limit identifier from request
 * Uses IP address or user ID
 */
export function getRateLimitIdentifier(
    request: Request,
    userId?: string
): string {
    // Prefer user ID if authenticated
    if (userId) {
        return `user:${userId}`;
    }

    // Fall back to IP address
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0] : "unknown";
    return `ip:${ip}`;
}

/**
 * Rate limit middleware helper
 */
export async function checkRateLimit(
    request: Request,
    type: keyof typeof rateLimitConfig,
    userId?: string
): Promise<{ allowed: boolean; headers: Record<string, string> }> {
    const identifier = getRateLimitIdentifier(request, userId);
    const result = await rateLimit(identifier, type);

    const headers = {
        "X-RateLimit-Limit": rateLimitConfig[type].requests.toString(),
        "X-RateLimit-Remaining": result.remaining.toString(),
        "X-RateLimit-Reset": new Date(result.reset).toISOString(),
    };

    return {
        allowed: result.success,
        headers,
    };
}
