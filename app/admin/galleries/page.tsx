// app/admin/galleries/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Plus, Edit2, Images, ExternalLink, Palette } from "lucide-react";
import GalleryDeleteButton from "@/components/GalleryDeleteButton";

export default async function GalleriesAdminPage() {
  const galleries = await prisma.gallery.findMany({
    orderBy: { name: "asc" },
    include: {
      artworks: {
        include: {
          artwork: {
            select: {
              id: true,
              imageUrl: true,
              title: true,
            },
          },
        },
      },
    },
  });

  const totalArtworksInGalleries = galleries.reduce((acc, g) => acc + g.artworks.length, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50/30 dark:from-[#0f0f12] dark:to-[#1a1a24] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Header */}
        <div className="mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-4 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl shadow-lg flex-shrink-0">
              <Images className="size-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-2 text-gray-900 dark:text-gray-100">
                Gallery Management
              </h1>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
                Curate collections and group artworks into themed galleries
              </p>
            </div>
          </div>

          <Link
            href="/admin/galleries/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl font-medium hover:from-teal-700 hover:to-emerald-700 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <Plus className="size-5" />
            <span>New Gallery</span>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
          <div className="bg-white dark:bg-[#1a1a24] rounded-2xl border border-gray-200 dark:border-gray-800 p-5 transition-colors shadow-sm">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Galleries</div>
            <div className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">{galleries.length}</div>
          </div>
          <div className="bg-white dark:bg-[#1a1a24] rounded-2xl border border-gray-200 dark:border-gray-800 p-5 transition-colors shadow-sm">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Assigned Artworks</div>
            <div className="text-3xl font-extrabold text-teal-600 dark:text-teal-400">{totalArtworksInGalleries}</div>
          </div>
        </div>

        {galleries.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-[#1a1a24] rounded-3xl border border-gray-200 dark:border-gray-800 transition-colors shadow-sm">
            <div className="size-16 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto mb-4">
              <Images className="size-8" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">No galleries created yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto text-sm">
              Create your first gallery collection to categorize and highlight your artworks for collectors.
            </p>
            <Link
              href="/admin/galleries/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl font-medium hover:from-teal-700 hover:to-emerald-700 transition-all shadow-md"
            >
              <Plus className="size-5" />
              Create Gallery
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleries.map((gallery) => (
              <div
                key={gallery.id}
                className="group bg-white dark:bg-[#1a1a24] rounded-2xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg hover:border-teal-300 dark:hover:border-teal-700/60 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                      {gallery.name}
                    </h2>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200/50 dark:border-teal-800/40">
                      <Palette className="size-3" />
                      {gallery.artworks.length}
                    </span>
                  </div>

                  {gallery.description ? (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2 leading-relaxed">
                      {gallery.description}
                    </p>
                  ) : (
                    <p className="text-gray-400 dark:text-gray-500 text-xs italic mb-4">
                      No description provided
                    </p>
                  )}

                  {/* Thumbnail Previews if artworks exist */}
                  {gallery.artworks.length > 0 && (
                    <div className="flex items-center gap-2 mb-4 overflow-hidden py-1">
                      {gallery.artworks.slice(0, 4).map(({ artwork }) => (
                        <div
                          key={artwork.id}
                          className="relative size-10 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex-shrink-0"
                          title={artwork.title}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={artwork.imageUrl}
                            alt={artwork.title}
                            className="size-full object-cover"
                          />
                        </div>
                      ))}
                      {gallery.artworks.length > 4 && (
                        <div className="size-10 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-xs font-semibold text-gray-500 dark:text-gray-400">
                          +{gallery.artworks.length - 4}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2 mt-auto">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/galleries/${gallery.id}/edit`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      title="Edit gallery & manage artworks"
                    >
                      <Edit2 className="size-3.5" />
                      Manage
                    </Link>
                    <GalleryDeleteButton galleryId={gallery.id} galleryName={gallery.name} />
                  </div>

                  <Link
                    href={`/site/galleries/${gallery.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
                  >
                    <span>Public</span>
                    <ExternalLink className="size-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
