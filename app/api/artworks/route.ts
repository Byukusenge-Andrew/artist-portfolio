import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sanitizeText } from "@/lib/sanitize";

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
  originalPrice: z.number().int().optional(),
  printEnabled: z.boolean().default(false),
  printOptions: z
    .array(
      z.object({ name: z.string().min(1), price: z.number().int() })
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

  // Only artists and admins can create artworks
  if (!user || (user.role !== "ARTIST" && user.role !== "ADMIN")) {
    return NextResponse.json(
      { error: "Artist or Admin role required to create artworks" },
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
      title: sanitizeText(data.title),
      slug: data.slug,
      description: data.description ? sanitizeText(data.description) : data.description,
      imagePublicId: data.imagePublicId,
      imageUrl: data.imageUrl,
      width: data.width,
      height: data.height,
      tags: data.tags.map(sanitizeText),
      isOriginalAvailable: data.isOriginalAvailable,
      originalPrice: data.originalPrice,
      printEnabled: data.printEnabled,
      uploadedBy: user.userId, // Track who uploaded it
      printOptions: {
        create: data.printOptions.map((opt) => ({
          name: opt.name,
          price: opt.price,
        })),
      },
    },
    include: { printOptions: true },
  });

  return NextResponse.json(created, { status: 201 });
}


