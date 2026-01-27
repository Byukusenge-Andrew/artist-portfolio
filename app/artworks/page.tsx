import { prisma } from "@/lib/prisma";
import { ArtworkCard } from "@/components/ArtworkCard";
import { Palette, Filter } from "lucide-react";

export default async function ArtworksPage() {
    // Fetch all artworks
    const artworks = await prisma.artwork.findMany({
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            slug: true,
            title: true,
            imageUrl: true,
            createdAt: true,
        },
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
                {/* Header */}
                <div className="mb-12">
                    <div className="flex items-start gap-4 mb-6">
                        <div className="p-4 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl shadow-lg">
                            <Palette className="size-8 text-white" />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
                                Explore Artworks
                            </h1>
                            <p className="text-xl text-gray-600">
                                Discover exceptional pieces from talented artists
                            </p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                            <div className="size-2 bg-teal-500 rounded-full"></div>
                            <span>{artworks.length} artworks available</span>
                        </div>
                    </div>
                </div>

                {/* Artworks Grid */}
                {artworks.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-gray-200">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mb-6">
                            <Palette className="size-10 text-gray-400" />
                        </div>
                        <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                            No artworks yet
                        </h3>
                        <p className="text-gray-600">
                            Check back soon for new pieces
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {artworks.map((artwork) => (
                            <ArtworkCard
                                key={artwork.id}
                                id={artwork.id}
                                slug={artwork.slug}
                                title={artwork.title}
                                imageUrl={artwork.imageUrl}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
