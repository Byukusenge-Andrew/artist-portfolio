import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/authorization";
import { z } from "zod";
import { sanitizeText } from "@/lib/sanitize";

const createCommentSchema = z.object({
    content: z.string().min(1).max(1000),
    artworkId: z.string().optional(),
    artistId: z.string().optional(),
}).refine(data => data.artworkId || data.artistId, {
    message: "Either artworkId or artistId is required",
});

export async function POST(req: Request) {
    const user = await getCurrentUser(req);
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await req.json();
    const parsed = createCommentSchema.safeParse(json);

    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { content, artworkId, artistId } = parsed.data;

    const comment = await prisma.comment.create({
        data: {
            content: sanitizeText(content),
            userId: user.userId,
            artworkId,
            artistId,
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    avatarUrl: true,
                },
            },
        },
    });

    return NextResponse.json(comment);
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const artworkId = searchParams.get("artworkId");
    const artistId = searchParams.get("artistId");

    if (!artworkId && !artistId) {
        return NextResponse.json({ error: "Missing artworkId or artistId" }, { status: 400 });
    }

    const comments = await prisma.comment.findMany({
        where: {
            artworkId: artworkId || undefined,
            artistId: artistId || undefined,
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    avatarUrl: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(comments);
}
