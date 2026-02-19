// app/site/galleries/page.tsx
import { prisma } from "@/lib/prisma";
import { ArtworkCard } from "@/components/ArtworkCard";
import { Palette, Sparkles, Search } from "lucide-react";
import Link from "next/link";
import Pagination from "@/components/Pagination";

const ITEMS_PER_PAGE = 12;

export default async function GalleriesPage(props: {
    searchParams?: Promise<{ q?: string; page?: string }>;
}) {
    const searchParams = await props.searchParams;
    const q = searchParams?.q || "";
    const currentPage = Math.max(1, parseInt(searchParams?.page || "1", 10) || 1);

    // Build filter based on search query
    const whereClause = q ? {
        OR: [
            { title: { contains: q } },
            { description: { contains: q } },
            { uploader: { name: { contains: q } } },
        ]
    } : {};

    // Get total count for pagination
    const totalCount = await prisma.artwork.count({ where: whereClause });
    const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));

    // Fetch paginated artworks
    const artworks = await prisma.artwork.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        skip: (currentPage - 1) * ITEMS_PER_PAGE,
        take: ITEMS_PER_PAGE,
        select: {
            id: true,
            slug: true,
            title: true,
            imageUrl: true,
            description: true,
            createdAt: true,
            originalPriceCents: true,
        },
    });

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
            {/* Hero Section */}
            <div className="text-center mb-16 animate-fade-in">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-600 to-emerald-600 rounded-2xl mb-6 shadow-lg">
                    {q ? <Search className="size-8 text-white" /> : <Palette className="size-8 text-white" />}
                </div>
                <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4">
                    {q ? "Search Results" : "Art Gallery"}
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    {q ? `Showing results for "${q}"` : "Explore our complete collection of exceptional artworks"}
                </p>

                {/* Artwork count */}
                <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-50 to-emerald-50 px-6 py-3 border border-teal-200">
                    <Sparkles className="size-5 text-teal-600" />
                    <span className="text-gray-700 font-medium">
                        {totalCount} {totalCount === 1 ? "Artwork" : "Artworks"} Found
                    </span>
                </div>
            </div>

            {/* Artworks Grid */}
            {artworks.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-3xl animate-scale-in">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                        {q ? `No artworks found for "${q}"` : "No artworks yet"}
                    </h3>
                    <p className="text-gray-600 mb-8">
                        {q ? "Try checking for typos or using different keywords" : "Check back soon for amazing artwork"}
                    </p>
                    <Link
                        href={q ? "/site/galleries" : "/"}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all"
                    >
                        {q ? (
                            <>
                                <Palette className="size-5" />
                                View All Artworks
                            </>
                        ) : (
                            <>
                                <Palette className="size-5" />
                                Back to Home
                            </>
                        )}
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
                                price={artwork.originalPriceCents ?? undefined}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                basePath="/site/galleries"
                searchQuery={q || undefined}
            />

            {/* CTA Section */}
            {artworks.length > 0 && (
                <div className="mt-20 text-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-12 animate-scale-in">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        Love What You See?
                    </h2>
                    <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                        Commission a custom piece or explore more about the artist
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/site/commissions"
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-8 py-4 text-white font-semibold hover:from-teal-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                        >
                            <Palette className="size-5" />
                            Request a Commission
                        </Link>
                        <Link
                            href="/site/artists"
                            className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-gray-300 bg-white px-8 py-4 text-gray-900 font-semibold hover:border-teal-600 hover:text-teal-700 transition-all duration-300"
                        >
                            Meet the Artists
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
