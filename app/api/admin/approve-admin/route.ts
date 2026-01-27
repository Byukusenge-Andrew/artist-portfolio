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

// POST /api/admin/approve-admin - Approve a pending admin account
export async function POST(req: NextRequest) {
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
        const { adminId } = await req.json();

        if (!adminId) {
            return NextResponse.json(
                { error: "Admin ID is required" },
                { status: 400 }
            );
        }

        // Verify the user exists and is an unapproved admin
        const adminToApprove = await prisma.user.findUnique({
            where: { id: adminId },
        });

        if (!adminToApprove) {
            return NextResponse.json({ error: "Admin not found" }, { status: 404 });
        }

        if (adminToApprove.role !== "ADMIN") {
            return NextResponse.json({ error: "User is not an admin" }, { status: 400 });
        }

        if (adminToApprove.isApproved) {
            return NextResponse.json({ error: "Admin is already approved" }, { status: 400 });
        }

        // Approve the admin
        await prisma.user.update({
            where: { id: adminId },
            data: {
                isApproved: true,
                approvedBy: user.userId,
                approvedAt: new Date(),
            },
        });

        return NextResponse.json({
            success: true,
            message: "Admin approved successfully",
        });
    } catch (error) {
        console.error("Error approving admin:", error);
        return NextResponse.json(
            { error: "Failed to approve admin" },
            { status: 500 }
        );
    }
}

// DELETE /api/admin/approve-admin - Reject a pending admin account
export async function DELETE(req: NextRequest) {
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
        const { searchParams } = new URL(req.url);
        const adminId = searchParams.get("adminId");

        if (!adminId) {
            return NextResponse.json(
                { error: "Admin ID is required" },
                { status: 400 }
            );
        }

        // Verify the user exists and is an unapproved admin
        const adminToReject = await prisma.user.findUnique({
            where: { id: adminId },
        });

        if (!adminToReject) {
            return NextResponse.json({ error: "Admin not found" }, { status: 404 });
        }

        if (adminToReject.role !== "ADMIN") {
            return NextResponse.json({ error: "User is not an admin" }, { status: 400 });
        }

        if (adminToReject.isApproved) {
            return NextResponse.json({ error: "Cannot reject approved admin" }, { status: 400 });
        }

        // Delete the pending admin account
        await prisma.user.delete({
            where: { id: adminId },
        });

        return NextResponse.json({
            success: true,
            message: "Admin account rejected and deleted",
        });
    } catch (error) {
        console.error("Error rejecting admin:", error);
        return NextResponse.json(
            { error: "Failed to reject admin" },
            { status: 500 }
        );
    }
}
