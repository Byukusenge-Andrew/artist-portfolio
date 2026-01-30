// app/api/galleries/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/authorization";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser(req as any);

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Optional: Check if exists
    const gallery = await prisma.gallery.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!gallery) {
      return NextResponse.json({ error: "Gallery not found" }, { status: 404 });
    }

    // Delete cascade: GalleryLink → Gallery
    await prisma.gallery.delete({
      where: { id },
    });

    // Revalidate
    revalidatePath("/galleries");
    revalidatePath("/");

    return NextResponse.json({ message: "Gallery deleted" }, { status: 200 });
  } catch (error) {
    console.error("Delete gallery error:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}