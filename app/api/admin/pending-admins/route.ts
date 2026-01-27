import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

// Helper to get current user from session
async function getCurrentUser() {
    const cookieStore = await cookies();
    const userSession = cookieStore.get("user_session")?.value;

    if (!userSession) {
        return null;
    }

    try {
        const user = JSON.parse(Buffer.from(userSession, "base64").toString());
        return user;
    } catch {
        return null;
    }
}

// GET /api/admin/pending-admins - Get list of pending admin approvals
export async function GET() {
    const user = await getCurrentUser();

    if (!user || user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify current user is approved
    const currentUser = await prisma.user.findUnique({
        where: { id: user.userId },
        select: { isApproved: true },
    });

    if (!currentUser?.isApproved) {
        return NextResponse.json({ error: "Your account is not approved" }, { status: 403 });
    }

    try {
        const pendingAdmins = await prisma.user.findMany({
            where: {
                role: "ADMIN",
                isApproved: false,
            },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json({ pendingAdmins });
    } catch (error) {
        console.error("Error fetching pending admins:", error);
        return NextResponse.json(
            { error: "Failed to fetch pending admins" },
            { status: 500 }
        );
    }
}
