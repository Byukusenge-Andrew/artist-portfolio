import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { z } from "zod";

const artistSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
});

export async function GET() {
  try {
    const artists = await prisma.artist.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(artists);
  } catch (error) {
    console.error("Failed to fetch artists:", error);
    return NextResponse.json(
      { error: "Failed to fetch artists" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("admin_session")?.value === "1";

  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = artistSchema.parse(body);

    const artist = await prisma.artist.create({
      data: {
        name: validated.name,
        email: validated.email || null,
        phone: validated.phone || null,
        bio: validated.bio || null,
      },
    });

    return NextResponse.json(artist, { status: 201 });
  } catch (error) {
    console.error("Failed to create artist:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create artist" },
      { status: 500 }
    );
  }
}


