// app/site/galleries/[slug]/page.tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ArtworkCard } from "@/components/ArtworkCard";
import { ArrowLeft, Palette } from "lucide-react";
import Link from "next/link";

export default async function GalleryDetailPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;

    const gallery = await prisma.gallery.findUnique({
        where: { slug },
        include: {
            artworks: {
                include: {
                    artwork: {
                        select: {
                            id: true,
                            slug: true,
                            title: true,
                            imageUrl: true,
                            description: true,
                            width: true,
                            height: true,
                        },
                    },
                },
            },
        },
    });

    if (!gallery) return notFound();

    const artworks = gallery.artworks.map((ag) => ag.artwork);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
            {/* Back Button */}
            <Link
                href="/site/galleries"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-teal-700 mb-8 group transition-colors"
            >
                <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
                Back to Galleries
            </Link>

            {/* Gallery Header */}
            <div className="mb-12 animate-fade-in">
                <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-gradient-to-br from-teal-600 to-emerald-600 rounded-xl shadow-lg">
                        <Palette className="size-6 text-white" />
                    </div>
                    <div className="flex-1">
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
                            {gallery.name}
                        </h1>
                        {gallery.description && (
                            <p className="text-xl text-gray-600 max-w-3xl">
                                {gallery.description}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-6 text-sm text-gray-500 mt-6 pt-6 border-t border-gray-200">
                    <span className="inline-flex items-center gap-2">
                        <span className="w-2 h-2 bg-teal-600 rounded-full"></span>
                        {artworks.length} {artworks.length === 1 ? "Artwork" : "Artworks"}
                    </span>
                    <span>
                        Updated {new Date(gallery.updatedAt).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                        })}
                    </span>
                </div>
            </div>

            {/* Artworks Grid */}
            {artworks.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-3xl animate-scale-in">
                    <div className="text-6xl mb-4">🎨</div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                        No artworks in this gallery yet
                    </h3>
                    <p className="text-gray-600 mb-8">
                        This collection is being curated. Check back soon!
                    </p>
                    <Link
                        href="/site/galleries"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all"
                    >
                        <ArrowLeft className="size-4" />
                        Browse Other Galleries
                    </Link>
                </div>
            ) : (
                <div className="gallery-grid animate-fade-in-up">
                    {artworks.map((artwork, idx) => (
                        <div
                            key={artwork.id}
                            style={{ animationDelay: `${idx * 0.05}s` }}
                            className="animate-scale-in"
                        >
                            <ArtworkCard
                                id={artwork.id}
                                slug={artwork.slug}
                                title={artwork.title}
                                imageUrl={artwork.imageUrl}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Related Galleries CTA */}
            {artworks.length > 0 && (
                <div className="mt-16 text-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-12 animate-scale-in">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        Explore More Collections
                    </h2>
                    <p className="text-lg text-gray-600 mb-8">
                        Discover other curated galleries featuring exceptional artworks
                    </p>
                    <Link
                        href="/site/galleries"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-8 py-4 text-white font-semibold hover:from-teal-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                        <Palette className="size-5" />
                        View All Galleries
                    </Link>
                </div>
            )}
        </div>
    );
}
