// app/site/[slug]/page.tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import ArtworkDetailClient from "@/components/ArtworkDetailClient";
import { nullable } from "zod";

export default async function ArtworkDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("admin_session")?.value === "1";

  const artwork = await prisma.artwork.findUnique({
    where: { slug },
    include: { printOptions: true },
  });

  if (!artwork) return notFound();

  const tags: string[] = Array.isArray(artwork.tags) 
    ? artwork.tags.filter((t): t is string => typeof t === "string")
    : [];
  // === Related Artworks Logic (same as before) ===
  let relatedArtworks: Array<{ id: string; slug: string; title: string; imageUrl: string }> = [];

  if (tags.length > 0) {
    const allArtworks = await prisma.artwork.findMany({
      where: { id: { not: artwork.id } },
      select: { id: true, slug: true, title: true, imageUrl: true, tags: true },
      orderBy: { createdAt: "desc" },
    });

    relatedArtworks = allArtworks
      .filter((art) => {
        const artTags: string[] = Array.isArray(art.tags)
        ? art.tags.filter((t): t is string => typeof t === "string")
        : [];
        return artTags.some((tag) => tags.includes(tag ));
      })
      .slice(0, 4)
      .map((art) => ({
        id: art.id,
        slug: art.slug,
        title: art.title,
        imageUrl: art.imageUrl,
      }));
  }

  if (relatedArtworks.length === 0) {
    relatedArtworks = await prisma.artwork.findMany({
      where: { id: { not: artwork.id } },
      take: 4,
      orderBy: { createdAt: "desc" },
      select: { id: true, slug: true, title: true, imageUrl: true },
    });
  }

  // Pass only serializable data
  const clientProps = {
    artwork: {
      id: artwork.id,
      slug: artwork.slug,
      title: artwork.title,
      description: artwork.description,
      imageUrl: artwork.imageUrl,
      width: artwork.width,
      height: artwork.height,
      createdAt: artwork.createdAt.toISOString(),
      tags: Array.isArray(artwork.tags)
      ? artwork.tags.filter((t): t is string => typeof t === "string")
      : [],
      isOriginalAvailable: artwork.isOriginalAvailable,
      originalPriceCents: artwork.originalPriceCents,
      printEnabled: artwork.printEnabled,
      printOptions: artwork.printOptions.map((opt) => ({
        id: opt.id,
        name: opt.name,
        priceCents: opt.priceCents,
      })),
    },
    relatedArtworks,
    isAdmin,
  };

  return <ArtworkDetailClient {...clientProps} />;
}