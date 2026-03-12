import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { z } from "zod";

const printOptionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.number().int().positive("Price must be positive"),
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: artworkId } = await params;

    const printOptions = await prisma.printOption.findMany({
      where: { artworkId },
      select: {
        id: true,
        artworkId: true,
        name: true,
        price: true,
      },
    });
    return NextResponse.json(printOptions);
  } catch (error) {
    console.error("Failed to fetch print options:", error);
    return NextResponse.json(
      { error: "Failed to fetch print options" },
      { status: 500 }
    );
  }
}

import { getCurrentUser } from "@/lib/authorization";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser(req as any);

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id: artworkId } = await params;
    const body = await req.json();
    const validated = printOptionSchema.parse(body);

    // Check if artwork exists
    const artwork = await prisma.artwork.findUnique({
      where: { id: artworkId },
    });

    if (!artwork) {
      return NextResponse.json(
        { error: "Artwork not found" },
        { status: 404 }
      );
    }

    // Check if option with same name already exists
    const existing = await prisma.printOption.findUnique({
      where: {
        artworkId_name: {
          artworkId: artworkId,
          name: validated.name,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Print option with this name already exists" },
        { status: 400 }
      );
    }

    const option = await prisma.printOption.create({
      data: {
        artworkId: artworkId,
        name: validated.name,
        price: validated.price,
      },
    });

    return NextResponse.json(option, { status: 201 });
  } catch (error) {
    console.error("Failed to create print option:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create print option" },
      { status: 500 }
    );
  }
}
