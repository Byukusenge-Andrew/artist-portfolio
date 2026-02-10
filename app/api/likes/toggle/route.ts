import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/authorization";
import { z } from "zod";

const toggleLikeSchema = z.object({
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
    const parsed = toggleLikeSchema.safeParse(json);

    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { artworkId, artistId } = parsed.data;

    // Check if like exists
    const existingLike = await prisma.like.findFirst({
        where: {
            userId: user.userId,
            artworkId: artworkId || undefined,
            artistId: artistId || undefined,
        },
    });

    if (existingLike) {
        // Unlike
        await prisma.like.delete({
            where: { id: existingLike.id },
        });
        return NextResponse.json({ liked: false });
    } else {
        // Like
        await prisma.like.create({
            data: {
                userId: user.userId,
                artworkId,
                artistId,
            },
        });
        return NextResponse.json({ liked: true });
    }
}
