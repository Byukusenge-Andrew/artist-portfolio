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

const updateArtworkSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  slug: z.string().min(1).optional(),
  imagePublicId: z.string().min(1).optional(),
  imageUrl: z.string().url().optional(),
  isOriginalAvailable: z.boolean().optional(),
  originalPriceCents: z.number().int().optional(),
  printEnabled: z.boolean().optional(),
});

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const artwork = await prisma.artwork.findUnique({
    where: { id },
  });

  if (!artwork) {
    return NextResponse.json({ error: "Artwork not found" }, { status: 404 });
  }

  const isAdmin = user.role === "ADMIN";
  const isOwner = artwork.uploadedBy === user.userId;

  if (!isAdmin && !isOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const json = await req.json();
  const parsed = updateArtworkSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const updated = await prisma.artwork.update({
    where: { id },
    data: parsed.data,
  });

  // Revalidate
  revalidatePath("/galleries");
  revalidatePath(`/art/${updated.slug}`);
  revalidatePath("/");

  return NextResponse.json(updated);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser(req);

  // Only artists and admins can delete artworks
  if (!user || (user.role !== "ARTIST" && user.role !== "ADMIN")) {
    return NextResponse.json(
      { error: "Artist or Admin role required to delete artworks" },
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

    // 3. Verify ownership - Admin or the artist who uploaded can delete
    const isAdmin = user.role === "ADMIN";
    const isOwner = artwork.uploadedBy === user.userId;

    if (!isAdmin && !isOwner) {
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