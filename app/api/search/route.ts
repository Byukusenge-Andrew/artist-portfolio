import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();

    if (!q || q.length < 2) {
      return NextResponse.json({ artworks: [], artists: [] });
    }

    const [artworks, artists] = await Promise.all([
      // Search active artworks
      prisma.artwork.findMany({
        where: {
          deletedAt: null,
          OR: [
            { title: { contains: q } },
            { description: { contains: q } },
          ],
        },
        take: 6,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          slug: true,
          imageUrl: true,
          originalPrice: true,
          isOriginalAvailable: true,
          printEnabled: true,
          uploader: {
            select: {
              name: true,
            },
          },
        },
      }),

      // Search registered artists
      prisma.user.findMany({
        where: {
          role: "ARTIST",
          isActive: true,
          isApproved: true,
          OR: [
            { name: { contains: q } },
            { bio: { contains: q } },
          ],
        },
        take: 3,
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          bio: true,
        },
      }),
    ]);

    return NextResponse.json({ artworks, artists });
  } catch (error) {
    console.error("Instant search error:", error);
    return NextResponse.json({ artworks: [], artists: [] }, { status: 500 });
  }
}
