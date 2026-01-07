// app/(admin)/galleries/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Plus, Edit2 } from "lucide-react";

export default async function GalleriesAdminPage() {
  const galleries = await prisma.gallery.findMany({
    orderBy: { name: "asc" },
    include: {
      artworks: true,
    },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Gallery Management</h1>
        <Link
          href="/admin/galleries/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-teal-700 hover:to-emerald-700 transition-all"
        >
          <Plus className="h-5 w-5" />
          New Gallery
        </Link>
      </div>

      {galleries.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600 mb-4">No galleries yet</p>
          <Link
            href="/admin/galleries/new"
            className="text-teal-600 hover:text-teal-700 font-semibold"
          >
            Create your first gallery →
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {galleries.map(gallery => (
            <div
              key={gallery.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <h2 className="text-xl font-bold text-gray-900">{gallery.name}</h2>
                <Link
                  href={`/admin/galleries/${gallery.id}/edit`}
                  className="p-2 text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all"
                  title="Edit gallery"
                >
                  <Edit2 className="h-5 w-5" />
                </Link>
              </div>

              {gallery.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{gallery.description}</p>
              )}

              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  {gallery.artworks.length} {gallery.artworks.length === 1 ? "artwork" : "artworks"}
                </p>
                <Link
                  href={`/galleries/${gallery.slug}`}
                  target="_blank"
                  className="text-sm text-teal-600 hover:text-teal-700 font-semibold"
                >
                  View →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
