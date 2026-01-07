import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  addArtworkIds: z.array(z.string()).optional(),
  removeArtworkIds: z.array(z.string()).optional(),
});

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const gallery = await prisma.gallery.findUnique({
      where: { id: params.id },
      include: {
        artworks: {
          include: { artwork: true },
        },
      },
    });

    if (!gallery) {
      return NextResponse.json({ error: "Gallery not found" }, { status: 404 });
    }

    return NextResponse.json(gallery);
  } catch (error) {
    console.error("Failed to fetch gallery:", error);
    return NextResponse.json(
      { error: "Failed to fetch gallery" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("admin_session")?.value === "1";

  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = updateSchema.parse(body);

    // Update gallery metadata
    if (validated.name || validated.description !== undefined) {
      await prisma.gallery.update({
        where: { id: params.id },
        data: {
          ...(validated.name && { name: validated.name }),
          ...(validated.description !== undefined && { description: validated.description || null }),
        },
      });
    }

    // Add artworks
    if (validated.addArtworkIds && validated.addArtworkIds.length > 0) {
      await Promise.all(
        validated.addArtworkIds.map(artworkId =>
          prisma.artworkGallery.create({
            data: { galleryId: params.id, artworkId },
          }).catch(() => {}) // Ignore duplicates
        )
      );
    }

    // Remove artworks
    if (validated.removeArtworkIds && validated.removeArtworkIds.length > 0) {
      await prisma.artworkGallery.deleteMany({
        where: {
          galleryId: params.id,
          artworkId: { in: validated.removeArtworkIds },
        },
      });
    }

    const updated = await prisma.gallery.findUnique({
      where: { id: params.id },
      include: { artworks: { include: { artwork: true } } },
    });

    revalidatePath(`/galleries/${updated?.slug}`);
    revalidatePath("/galleries");

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update gallery:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update gallery" },
      { status: 500 }
    );
  }
}
