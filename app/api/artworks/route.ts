import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const createArtworkSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  slug: z.string().min(1),
  imagePublicId: z.string().min(1),
  imageUrl: z.string().url(),
  width: z.number().optional(),
  height: z.number().optional(),
  tags: z.array(z.string()).default([]),
  isOriginalAvailable: z.boolean().default(true),
  originalPriceCents: z.number().int().optional(),
  printEnabled: z.boolean().default(false),
  printOptions: z
    .array(
      z.object({ name: z.string().min(1), priceCents: z.number().int() })
    )
    .default([]),
});

export async function GET() {
  const artworks = await prisma.artwork.findMany({
    include: { printOptions: true, galleries: { include: { gallery: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(artworks);
}

import { getCurrentUser } from "@/lib/authorization";

export async function POST(req: Request) {
  const user = await getCurrentUser(req);

  // Only artists can create artworks
  if (!user || user.role !== "ARTIST") {
    return NextResponse.json(
      { error: "Artist role required to create artworks" },
      { status: 403 }
    );
  }

  const json = await req.json();
  const parsed = createArtworkSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const data = parsed.data;

  const created = await prisma.artwork.create({
    data: {
      title: data.title,
      slug: data.slug,
      description: data.description,
      imagePublicId: data.imagePublicId,
      imageUrl: data.imageUrl,
      width: data.width,
      height: data.height,
      tags: data.tags,
      isOriginalAvailable: data.isOriginalAvailable,
      originalPriceCents: data.originalPriceCents,
      printEnabled: data.printEnabled,
      uploadedBy: user.userId, // Track who uploaded it
      printOptions: {
        create: data.printOptions.map((opt) => ({
          name: opt.name,
          priceCents: opt.priceCents,
        })),
      },
    },
    include: { printOptions: true },
  });

  return NextResponse.json(created, { status: 201 });
}


