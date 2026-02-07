// app/api/artworks/[id]/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Validate ID from dynamic route
const deleteArtworkSchema = z.object({
  id: z.string().uuid(), // or z.coerce.number().int() if using numeric IDs
});

import { getCurrentUser } from "@/lib/authorization";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser(req);

  // Only artists can delete artworks
  if (!user || user.role !== "ARTIST") {
    return NextResponse.json(
      { error: "Artist role required to delete artworks" },
      { status: 403 }
    );
  }

  // 1. Validate ID
  const { id: artworkId } = await params;
  const parsed = deleteArtworkSchema.safeParse({ id: artworkId });
  if (!parsed.success) {

    return NextResponse.json(
      { error: "Invalid artwork ID", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { id } = parsed.data;

  try {
    // 2. Find artwork first
    const artwork = await prisma.artwork.findUnique({
      where: { id },
      select: {
        id: true,
        slug: true,
        imagePublicId: true,
        uploadedBy: true,
      },
    });

    if (!artwork) {
      return NextResponse.json(
        { error: "Artwork not found" },
        { status: 404 }
      );
    }

    // 3. Verify ownership - only the artist who uploaded can delete
    if (artwork.uploadedBy !== user.userId) {
      return NextResponse.json(
        { error: "You can only delete your own artworks" },
        { status: 403 }
      );
    }

    // 4. Delete the artwork (Prisma handles cascade if configured)
    await prisma.artwork.delete({
      where: { id },
    });

    // === Revalidate related pages ===
    revalidatePath("/galleries");
    revalidatePath(`/art/${artwork.slug}`);
    revalidatePath("/");

    // 5. Success response
    return NextResponse.json(
      { message: "Artwork deleted successfully", id },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete artwork error:", error);
    return NextResponse.json(
      { error: "Failed to delete artwork" },
      { status: 500 }
    );
  }
}