import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/authorization";

// GET /api/favorites - Fetch user's favorites
export async function GET(req: NextRequest) {
    const user = await getCurrentUser(req);

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const userRecord = await prisma.user.findUnique({
            where: { id: user.userId },
            select: { favorites: true },
        });

        if (!userRecord) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Parse favorites from JSON string (handle null)
        let favoriteIds: string[] = [];
        if (userRecord.favorites) {
            try {
                favoriteIds = JSON.parse(userRecord.favorites);
            } catch {
                favoriteIds = [];
            }
        }

        // Fetch artwork details for favorites
        const artworks = await prisma.artwork.findMany({
            where: { id: { in: favoriteIds } },
            select: {
                id: true,
                slug: true,
                title: true,
                imageUrl: true,
                description: true,
            },
        });

        return NextResponse.json({ favorites: favoriteIds, artworks });
    } catch (error) {
        console.error("Error fetching favorites:", error);
        return NextResponse.json(
            { error: "Failed to fetch favorites" },
            { status: 500 }
        );
    }
}

// POST /api/favorites - Add artwork to favorites
export async function POST(req: NextRequest) {
    const user = await getCurrentUser(req);

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { artworkId } = await req.json();

        if (!artworkId) {
            return NextResponse.json(
                { error: "Artwork ID is required" },
                { status: 400 }
            );
        }

        // Verify artwork exists
        const artwork = await prisma.artwork.findUnique({
            where: { id: artworkId },
        });

        if (!artwork) {
            return NextResponse.json({ error: "Artwork not found" }, { status: 404 });
        }

        // Get current favorites
        const userRecord = await prisma.user.findUnique({
            where: { id: user.userId },
            select: { favorites: true },
        });

        let favoriteIds: string[] = [];
        try {
            favoriteIds = JSON.parse(userRecord?.favorites || "[]");
        } catch {
            favoriteIds = [];
        }

        // Add to favorites if not already there
        if (!favoriteIds.includes(artworkId)) {
            favoriteIds.push(artworkId);

            await prisma.user.update({
                where: { id: user.userId },
                data: { favorites: JSON.stringify(favoriteIds) },
            });
        }

        return NextResponse.json({ success: true, favorites: favoriteIds });
    } catch (error) {
        console.error("Error adding favorite:", error);
        return NextResponse.json(
            { error: "Failed to add favorite" },
            { status: 500 }
        );
    }
}

// DELETE /api/favorites - Remove artwork from favorites
export async function DELETE(req: NextRequest) {
    const user = await getCurrentUser(req);

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const artworkId = searchParams.get("artworkId");

        if (!artworkId) {
            return NextResponse.json(
                { error: "Artwork ID is required" },
                { status: 400 }
            );
        }

        // Get current favorites
        const userRecord = await prisma.user.findUnique({
            where: { id: user.userId },
            select: { favorites: true },
        });

        let favoriteIds: string[] = [];
        try {
            favoriteIds = JSON.parse(userRecord?.favorites || "[]");
        } catch {
            favoriteIds = [];
        }

        // Remove from favorites
        favoriteIds = favoriteIds.filter((id) => id !== artworkId);

        await prisma.user.update({
            where: { id: user.userId },
            data: { favorites: JSON.stringify(favoriteIds) },
        });

        return NextResponse.json({ success: true, favorites: favoriteIds });
    } catch (error) {
        console.error("Error removing favorite:", error);
        return NextResponse.json(
            { error: "Failed to remove favorite" },
            { status: 500 }
        );
    }
}
