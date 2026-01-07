import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const gallerySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric"),
  description: z.string().optional(),
});

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("admin_session")?.value === "1";

  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = gallerySchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existing = await prisma.gallery.findUnique({
      where: { slug: validated.data.slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Gallery with this slug already exists" },
        { status: 400 }
      );
    }

    const gallery = await prisma.gallery.create({
      data: {
        name: validated.data.name,
        slug: validated.data.slug,
        description: validated.data.description || null,
      },
    });

    revalidatePath("/galleries");
    revalidatePath("/");

    return NextResponse.json(gallery, { status: 201 });
  } catch (error) {
    console.error("Failed to create gallery:", error);
    return NextResponse.json(
      { error: "Failed to create gallery" },
      { status: 500 }
    );
  }
}
