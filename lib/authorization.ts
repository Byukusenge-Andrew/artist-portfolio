import { NextRequest } from "next/server";
import { verifyToken } from "./jwt";
import { prisma } from "./prisma";

/**
 * Authorization error types
 */
export class UnauthorizedError extends Error {
    constructor(message: string = "Unauthorized") {
        super(message);
        this.name = "UnauthorizedError";
    }
}

export class ForbiddenError extends Error {
    constructor(message: string = "Forbidden") {
        super(message);
        this.name = "ForbiddenError";
    }
}

/**
 * Get current user from request
 */
export async function getCurrentUser(request: NextRequest | Request) {
    const userSession = request.headers.get("cookie")?.match(/user_session=([^;]+)/)?.[1];

    if (!userSession) return null;

    const payload = await verifyToken(userSession);
    if (!payload || payload.type !== "access") return null;

    return {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        name: payload.name,
    };
}

/**
 * Get current user session in Server Components
 */
import { cookies } from "next/headers";

export async function getCurrentUserSession() {
    const cookieStore = await cookies();
    const userSession = cookieStore.get("user_session")?.value;

    if (!userSession) return null;

    const payload = await verifyToken(userSession);
    if (!payload || payload.type !== "access") return null;

    return {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        name: payload.name,
    };
}

/**
 * Require authentication
 * Throws UnauthorizedError if not authenticated
 */
export async function requireAuth(request: NextRequest | Request) {
    const user = await getCurrentUser(request);
    if (!user) {
        throw new UnauthorizedError("Authentication required");
    }
    return user;
}

/**
 * Require admin role
 * Throws ForbiddenError if not admin
 */
export async function requireAdmin(request: NextRequest | Request) {
    const user = await requireAuth(request);
    if (user.role !== "ADMIN") {
        throw new ForbiddenError("Admin access required");
    }
    return user;
}

/**
 * Check if user owns a resource
 */
export async function requireOwnership(
    request: NextRequest | Request,
    resourceType: "order" | "commissionRequest" | "artwork",
    resourceId: string
) {
    const user = await requireAuth(request);

    let isOwner = false;

    switch (resourceType) {
        case "order":
            const order = await prisma.order.findUnique({
                where: { id: resourceId },
                select: { userId: true },
            });
            isOwner = order?.userId === user.userId;
            break;

        case "commissionRequest":
            const commission = await prisma.commissionRequest.findUnique({
                where: { id: resourceId },
                // CommissionRequest doesn't have a userId field in schema!
                // It has email. So we check email.
                select: { email: true },
            });
            isOwner = commission?.email === user.email;
            break;

        case "artwork":
            const artwork = await prisma.artwork.findUnique({
                where: { id: resourceId },
                select: { uploadedBy: true },
            });
            isOwner = artwork?.uploadedBy === user.userId;
            break;
    }

    if (!isOwner) {
        throw new ForbiddenError("You do not have permission to access this resource");
    }

    return user;
}

/**
 * Check if user can modify a resource
 * Admins can modify any resource, users can only modify their own
 */
export async function requireModifyPermission(
    request: NextRequest | Request,
    resourceType: "order" | "commissionRequest" | "artwork" | "gallery",
    resourceId: string
) {
    const user = await requireAuth(request);

    // Admins can modify anything
    if (user.role === "ADMIN") {
        return user;
    }

    // Regular users can only modify their own resources
    return requireOwnership(request, resourceType as any, resourceId);
}

/**
 * Verify admin is approved
 */
export async function requireApprovedAdmin(request: NextRequest | Request) {
    const user = await requireAdmin(request);

    const dbUser = await prisma.user.findUnique({
        where: { id: user.userId },
        select: { isApproved: true },
    });

    if (!dbUser?.isApproved) {
        throw new ForbiddenError("Your admin account is pending approval");
    }

    return user;
}
