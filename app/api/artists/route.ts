import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { getCurrentUser } from "@/lib/authorization";

const artistSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email(),
  bio: z.string().optional(),
});

export async function GET() {
  try {
    const artists = await prisma.user.findMany({
      where: { role: "ARTIST" },
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
            originalPrice: true,
          }
        }
      },
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
  const user = await getCurrentUser(req as any);

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = artistSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Generate a secure random password for admin-created artists
    // They can reset it using forgot password flow later
    const randomPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    const artist = await prisma.user.create({
      data: {
        name: validated.name,
        email: validated.email,
        password: hashedPassword,
        bio: validated.bio || null,
        role: "ARTIST",
        isActive: true,
        isApproved: true,
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
