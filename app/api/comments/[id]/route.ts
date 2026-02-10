import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/authorization";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const user = await getCurrentUser(req);
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const comment = await (prisma as any).comment.findUnique({
        where: { id },
    });

    if (!comment) {
        return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    const isAdmin = user.role === "ADMIN";
    const isOwner = user.userId === comment.userId;

    if (!isAdmin && !isOwner) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await (prisma as any).comment.delete({
        where: { id },
    });

    return NextResponse.json({ success: true });
}
