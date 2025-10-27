import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ArtworkGallery from "@/components/ArtworkGallery";
import { Palette } from "lucide-react";

export default async function GalleriesPage() {
  const galleries = await prisma.gallery.findMany({
    orderBy: { name: "asc" },
  });

  const artworks = await prisma.artwork.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      imageUrl: true,
      tags: true,
    },
  });

  const artworksList = artworks.map((artwork) => ({
    id: artwork.id,
    slug: artwork.slug,
    title: artwork.title,
    imageUrl: artwork.imageUrl,
    tags: artwork.tags ? (Array.isArray(artwork.tags) ? artwork.tags as string[] : []) : [],
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="mb-10 animate-fade-in-up">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 bg-gradient-to-br from-teal-600 to-emerald-600 rounded-xl shadow-lg">
            <Palette className="size-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Art Galleries
          </h1>
        </div>
        <p className="text-lg text-gray-600">
          Explore our curated collections and discover amazing artworks
        </p>
      </div>

      {/* Gallery Collections */}
      {galleries.length > 0 && (
        <div className="mb-12 animate-slide-in-left">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <span>Collections</span>
            <span className="text-sm font-normal text-gray-500">({galleries.length})</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleries.map((g) => (
              <Link
                key={g.id}
                href={`/galleries/${g.slug}`}
                className="group block p-6 border border-gray-200 rounded-xl hover:border-teal-300 bg-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-teal-700 transition-colors">
                    {g.name}
                  </h3>
                  <span className="text-2xl group-hover:scale-110 transition-transform">🎨</span>
                </div>
                {g.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">{g.description}</p>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* All Artworks */}
      <div className="animate-fade-in-up">
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
          <span>All Artworks</span>
          <span className="text-sm font-normal text-gray-500">({artworksList.length})</span>
        </h2>
        <ArtworkGallery artworks={artworksList} />
      </div>
    </div>
  );
}


