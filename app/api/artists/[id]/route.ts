import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getCurrentUser } from "@/lib/authorization";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  bio: z.string().optional(),
  isActive: z.boolean().optional(),
});

/**
 * @swagger
 * /api/artists/{id}:
 *   get:
 *     summary: Get single artist
 *     tags: [Artists]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Artist found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id: { type: string }
 *                 name: { type: string }
 *                 email: { type: string }
 *                 bio: { type: string }
 *                 avatarUrl: { type: string }
 *                 isActive: { type: boolean }
 *                 isApproved: { type: boolean }
 *                 createdAt: { type: string, format: date-time }
 *                 uploadedArtworks: { type: array, items: { $ref: '#/components/schemas/Artwork' } }
 *       404:
 *         description: Artist not found
 */

// GET /api/artists/[id] - Get single artist
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const artist = await prisma.user.findFirst({
      where: {
        id: id,
        role: "ARTIST"
      },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        avatarUrl: true,
        isActive: true,
        isApproved: true,
        createdAt: true,
        uploadedArtworks: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            title: true,
            slug: true,
            imageUrl: true,
          }
        }
      }
    });

    if (!artist) {
      return NextResponse.json({ error: "Artist not found" }, { status: 404 });
    }

    return NextResponse.json(artist);
  } catch (error) {
    console.error("Failed to fetch artist:", error);
    return NextResponse.json(
      { error: "Failed to fetch artist" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser(req as any);

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const validated = updateSchema.parse(body);

    const artist = await prisma.user.update({
      where: { id: id },
      data: {
        ...(validated.name && { name: validated.name }),
        ...(validated.email !== undefined && { email: validated.email }),
        ...(validated.bio !== undefined && { bio: validated.bio || null }),
        ...(validated.isActive !== undefined && { isActive: validated.isActive }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        avatarUrl: true,
        isActive: true,
        isApproved: true,
      }
    });

    return NextResponse.json(artist);
  } catch (error) {
    console.error("Failed to update artist:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update artist" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser(req as any);

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    // Check if artist exists
    const artist = await prisma.user.findFirst({
      where: { id: id, role: "ARTIST" }
    });

    if (!artist) {
      return NextResponse.json({ error: "Artist not found" }, { status: 404 });
    }

    // Instead of deleting the user entirely, which might cascade and break references,
    // we can either delete or deactivate. Let's delete the user.
    await prisma.user.delete({
      where: { id: id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete artist:", error);
    return NextResponse.json(
      { error: "Failed to delete artist" },
      { status: 500 }
    );
  }
}
