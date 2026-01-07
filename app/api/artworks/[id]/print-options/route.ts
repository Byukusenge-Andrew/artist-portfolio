import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { z } from "zod";

const printOptionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  priceCents: z.number().int().positive("Price must be positive"),
});

export async function GET(
  req: Request,
  { params }: { params: { artworkId: string } }
) {
  try {
    const options = await prisma.printOption.findMany({
      where: { artworkId: params.artworkId },
    });
    return NextResponse.json(options);
  } catch (error) {
    console.error("Failed to fetch print options:", error);
    return NextResponse.json(
      { error: "Failed to fetch print options" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: { artworkId: string } }
) {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("admin_session")?.value === "1";

  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = printOptionSchema.parse(body);

    // Check if artwork exists
    const artwork = await prisma.artwork.findUnique({
      where: { id: params.artworkId },
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
          artworkId: params.artworkId,
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
        artworkId: params.artworkId,
        name: validated.name,
        priceCents: validated.priceCents,
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
