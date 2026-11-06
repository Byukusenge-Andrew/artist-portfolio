// app/site/galleries/[slug]/page.tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ArtworkCard } from "@/components/ArtworkCard";
import { ArrowLeft, Palette, Sparkles } from "lucide-react";
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
                            originalPrice: true,
                            width: true,
                            height: true,
                            uploader: {
                                select: {
                                    name: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    if (!gallery) return notFound();

    const artworks = gallery.artworks.map((ag) => ag.artwork);

    return (
        <div className="min-h-screen bg-gradient-to-b from-teal-50/30 via-white to-emerald-50/20 dark:from-[#0f0f12] dark:via-[#141418] dark:to-[#0f0f12] py-12 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Button */}
                <Link
                    href="/site/galleries"
                    className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-teal-700 dark:hover:text-teal-300 mb-8 group transition-colors"
                >
                    <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Galleries
                </Link>

                {/* Gallery Header */}
                <div className="mb-12 animate-fade-in bg-white/80 dark:bg-[#1a1a24]/80 backdrop-blur-md rounded-3xl border border-gray-200/80 dark:border-gray-800 p-8 sm:p-10 shadow-sm transition-colors">
                    <div className="flex flex-col sm:flex-row items-start gap-5 mb-6">
                        <div className="p-4 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl shadow-lg flex-shrink-0 text-white">
                            <Palette className="size-7" />
                        </div>
                        <div className="flex-1">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100/70 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 text-xs font-semibold uppercase tracking-wider mb-3">
                                <Sparkles className="size-3" />
                                Curated Collection
                            </div>
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 mb-3">
                                {gallery.name}
                            </h1>
                            {gallery.description && (
                                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-3xl leading-relaxed">
                                    {gallery.description}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-6 text-xs sm:text-sm text-gray-500 dark:text-gray-400 pt-6 border-t border-gray-100 dark:border-gray-800">
                        <span className="inline-flex items-center gap-2 font-medium text-gray-700 dark:text-gray-300">
                            <span className="size-2 bg-teal-500 rounded-full animate-pulse" />
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
                    <div className="text-center py-20 bg-white dark:bg-[#1a1a24] rounded-3xl border border-gray-200 dark:border-gray-800 animate-scale-in transition-colors shadow-sm">
                        <div className="size-16 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto mb-4">
                            <Palette className="size-8" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                            No artworks in this gallery yet
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto text-sm">
                            This collection is currently being curated. Check back soon or browse our other galleries!
                        </p>
                        <Link
                            href="/site/galleries"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-teal-700 hover:to-emerald-700 transition-all shadow-md"
                        >
                            <ArrowLeft className="size-4" />
                            Browse Other Galleries
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in-up">
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
                                    price={artwork.originalPrice}
                                    artistName={artwork.uploader?.name || undefined}
                                />
                            </div>
                        ))}
                    </div>
                )}

                {/* Related Galleries CTA */}
                {artworks.length > 0 && (
                    <div className="mt-20 text-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#1a1a24] dark:to-[#141418] rounded-3xl p-10 sm:p-14 animate-scale-in border border-gray-200/60 dark:border-gray-800 transition-colors">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                            Explore More Collections
                        </h2>
                        <p className="text-base text-gray-600 dark:text-gray-400 mb-8 max-w-xl mx-auto">
                            Discover other curated galleries featuring exceptional artworks from contemporary artists
                        </p>
                        <Link
                            href="/site/galleries"
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-8 py-3.5 text-white font-semibold hover:from-teal-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-sm"
                        >
                            <Palette className="size-4" />
                            View All Galleries
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
