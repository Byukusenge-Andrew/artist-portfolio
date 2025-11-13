// app/api/artworks/[id]/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Validate ID from dynamic route
const deleteArtworkSchema = z.object({
  id: z.string().uuid(), // or z.coerce.number().int() if using numeric IDs
});

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  // 1. Validate ID
  const parsed = deleteArtworkSchema.safeParse({ id: params.id });
  if (!parsed.success) {
  
    return NextResponse.json(
      { error: "Invalid artwork ID", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { id } = parsed.data;

  try {
    // 2. Find artwork first (optional: for better error message)
    const artwork = await prisma.artwork.findUnique({
      where: { id },
      select: { id: true,
    slug: true,
    imagePublicId: true, 
    },
  });

    if (!artwork) {
      return NextResponse.json(
        { error: "Artwork not found" },
        { status: 404 }
      );
    }

    // 3. Delete the artwork (Prisma handles cascade if configured)
    await prisma.artwork.delete({
      where: { id },
    });

    // === Revalidate related pages ===
    revalidatePath("/galleries");
    revalidatePath(`/art/${artwork.slug}`);
    revalidatePath("/");

    // 4. Success response
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
  }}