import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/authorization";

// GET /api/admin/pending-admins - Get list of pending admin approvals
export async function GET(req: NextRequest) {
    const user = await getCurrentUser(req);

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
