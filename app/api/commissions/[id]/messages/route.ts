import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getCurrentUser } from "@/lib/authorization";

const messageSchema = z.object({
    content: z.string().min(1, "Message content is required"),
});

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser(req as any);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        // Verify the commission request exists and user has access
        const commission = await prisma.commissionRequest.findUnique({
            where: { id },
            include: { artist: true }
        });

        if (!commission) {
            return NextResponse.json({ error: "Commission not found" }, { status: 404 });
        }

        // Check if the user is the artist assigned or the customer who made the request
        // Since we don't have a userId on CommissionRequest for the customer, we can check email
        // Or just check if they are the artist. For now, since customer might not have an account,
        // we assume the user must be the assigned artist OR an admin.
        const isArtist = commission.artistId === user.userId;
        const isAdmin = user.role === "ADMIN";

        // Check if the connected user is potentially the customer (email match)
        const isCustomer = user.email === commission.email;

        if (!isArtist && !isAdmin && !isCustomer) {
            return NextResponse.json({ error: "Unauthorized access to this commission" }, { status: 403 });
        }

        const body = await req.json();
        const { content } = messageSchema.parse(body);

        const message = await prisma.commissionMessage.create({
            data: {
                content,
                commissionRequestId: id,
                senderId: user.userId,
            },
            include: {
                sender: {
                    select: {
                        name: true,
                        email: true,
                        avatarUrl: true,
                        role: true,
                    }
                }
            }
        });

        return NextResponse.json(message, { status: 201 });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: (error as any).errors[0].message }, { status: 400 });
        }
        console.error("Failed to send message:", error);
        return NextResponse.json(
            { error: "Failed to send message" },
            { status: 500 }
        );
    }
}

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser(req as any);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        // Verify access
        const commission = await prisma.commissionRequest.findUnique({
            where: { id },
        });

        if (!commission) {
            return NextResponse.json({ error: "Commission not found" }, { status: 404 });
        }

        const isArtist = commission.artistId === user.userId;
        const isAdmin = user.role === "ADMIN";
        const isCustomer = user.email === commission.email;

        if (!isArtist && !isAdmin && !isCustomer) {
            return NextResponse.json({ error: "Unauthorized access to this commission" }, { status: 403 });
        }

        const messages = await prisma.commissionMessage.findMany({
            where: { commissionRequestId: id },
            orderBy: { createdAt: "asc" },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatarUrl: true,
                        role: true,
                    }
                }
            }
        });

        return NextResponse.json(messages);
    } catch (error: any) {
        console.error("Failed to fetch messages:", error);
        return NextResponse.json(
            { error: "Failed to fetch messages" },
            { status: 500 }
        );
    }
}
