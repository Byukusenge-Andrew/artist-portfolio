import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getCurrentUser } from "@/lib/authorization";

const profileSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name is too long"),
    bio: z.string().max(500, "Bio max length is 500 characters").optional().nullable(),
    // Accept both full https:// URLs (Supabase) and relative /uploads/ paths (local fallback)
    avatarUrl: z.string().min(1).optional().nullable(),
});

export async function GET(req: Request) {
    try {
        const sessionUser = await getCurrentUser(req as any);

        if (!sessionUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: sessionUser.userId },
            select: {
                id: true,
                name: true,
                email: true,
                bio: true,
                avatarUrl: true,
                role: true,
            }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error("Failed to fetch profile:", error);
        return NextResponse.json(
            { error: "Failed to fetch profile" },
            { status: 500 }
        );
    }
}

export async function PATCH(req: Request) {
    try {
        const user = await getCurrentUser(req as any);

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const validated = profileSchema.safeParse(body);

        if (!validated.success) {
            return NextResponse.json(
                { error: validated.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const updatedUser = await prisma.user.update({
            where: { id: user.userId },
            data: {
                name: validated.data.name,
                bio: validated.data.bio || null,
                avatarUrl: validated.data.avatarUrl || null,
            },
            select: {
                id: true,
                name: true,
                email: true,
                bio: true,
                avatarUrl: true,
                role: true,
            }
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error("Failed to update profile:", error);
        return NextResponse.json(
            { error: "Failed to update profile" },
            { status: 500 }
        );
    }
}
