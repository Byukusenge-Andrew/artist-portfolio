import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ArtworkGallery from "@/components/ArtworkGallery";

export default async function GalleryDetailPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;
  const gallery = await prisma.gallery.findUnique({
    where: { slug },
    include: {
      artworks: { include: { artwork: true } },
    },
  });

  if (!gallery) return notFound();

  const artworks = gallery.artworks.map(({ artwork }) => ({
    id: artwork.id,
    slug: artwork.slug,
    title: artwork.title,
    imageUrl: artwork.imageUrl,
    tags: artwork.tags ? (Array.isArray(artwork.tags) ? artwork.tags as string[] : []) : [],
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-3">
          {gallery.name}
        </h1>
        {gallery.description && (
          <p className="text-lg text-gray-600">{gallery.description}</p>
        )}
      </div>
      
      <ArtworkGallery artworks={artworks} />
    </div>
  );
}


