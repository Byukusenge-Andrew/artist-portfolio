import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  priceCents: z.number().int().positive().optional(),
});

import { getCurrentUser } from "@/lib/authorization";

// ... existing imports

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ optionId: string }> }
) {
  const { optionId } = await params;
  const user = await getCurrentUser(req as any);

  // Require authentication
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get the print option with its artwork
    const printOption = await prisma.printOption.findUnique({
      where: { id: optionId },
      include: { artwork: true },
    });

    if (!printOption) {
      return NextResponse.json({ error: "Print option not found" }, { status: 404 });
    }

    // Artists can only update options for their own artworks
    // Admins cannot update (read-only)
    if (user.role === "ARTIST" && printOption.artwork.uploadedBy !== user.userId) {
      return NextResponse.json(
        { error: "You can only modify print options for your own artworks" },
        { status: 403 }
      );
    } else if (user.role !== "ARTIST") {
      return NextResponse.json(
        { error: "Only artists can modify print options" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validated = updateSchema.parse(body);

    const option = await prisma.printOption.update({
      where: { id: optionId },
      data: {
        ...(validated.name && { name: validated.name }),
        ...(validated.priceCents && { priceCents: validated.priceCents }),
      },
    });

    return NextResponse.json(option);
  } catch (error) {
    console.error("Failed to update print option:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update print option" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ optionId: string }> }
) {
  const { optionId } = await params;
  const user = await getCurrentUser(req as any);

  // Require authentication
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get the print option with its artwork
    const printOption = await prisma.printOption.findUnique({
      where: { id: optionId },
      include: { artwork: true },
    });

    if (!printOption) {
      return NextResponse.json({ error: "Print option not found" }, { status: 404 });
    }

    // Artists can only delete options for their own artworks
    // Admins cannot delete (read-only)
    if (user.role === "ARTIST" && printOption.artwork.uploadedBy !== user.userId) {
      return NextResponse.json(
        { error: "You can only delete print options for your own artworks" },
        { status: 403 }
      );
    } else if (user.role !== "ARTIST") {
      return NextResponse.json(
        { error: "Only artists can delete print options" },
        { status: 403 }
      );
    }

    await prisma.printOption.delete({
      where: { id: optionId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete print option:", error);
    return NextResponse.json(
      { error: "Failed to delete print option" },
      { status: 500 }
    );
  }
}
