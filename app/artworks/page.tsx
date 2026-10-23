import { prisma } from "@/lib/prisma";
import { ArtworkCard } from "@/components/ArtworkCard";
import { Palette, Filter, Sparkles, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import Link from "next/link";

interface ArtworksPageProps {
  searchParams?: Promise<{
    q?: string;
    filter?: string;
    sort?: string;
  }>;
}

export default async function ArtworksPage(props: ArtworksPageProps) {
  const searchParams = await props.searchParams;
  const q = searchParams?.q?.trim() || "";
  const filter = searchParams?.filter || "all";
  const sort = searchParams?.sort || "newest";

  // Build Prisma where query
  const whereClause: Record<string, unknown> = {
    deletedAt: null,
  };

  if (q) {
    whereClause.OR = [
      { title: { contains: q } },
      { description: { contains: q } },
      { uploader: { name: { contains: q } } },
    ];
  }

  if (filter === "original") {
    whereClause.isOriginalAvailable = true;
  } else if (filter === "print") {
    whereClause.printEnabled = true;
  }

  // Build Prisma orderBy query
  let orderByClause: Record<string, "asc" | "desc"> = { createdAt: "desc" };
  if (sort === "price-low") {
    orderByClause = { originalPrice: "asc" };
  } else if (sort === "price-high") {
    orderByClause = { originalPrice: "desc" };
  }

  // Fetch artworks
  const artworks = await prisma.artwork.findMany({
    where: whereClause as any,
    orderBy: orderByClause as any,
    select: {
      id: true,
      slug: true,
      title: true,
      imageUrl: true,
      originalPrice: true,
      isOriginalAvailable: true,
      printEnabled: true,
      createdAt: true,
      uploader: {
        select: {
          name: true,
        },
      },
    },
  });

  // Helper to build filter URLs
  const createUrl = (newFilter: string, newSort: string) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (newFilter !== "all") params.set("filter", newFilter);
    if (newSort !== "newest") params.set("sort", newSort);
    const qs = params.toString();
    return `/artworks${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50/40 via-white to-emerald-50/20 dark:from-[#0f0f12] dark:via-[#141418] dark:to-[#0f0f12] py-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Banner */}
        <div className="mb-10 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-100/70 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="size-3.5" />
            Curated Collections
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
            Explore All <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">Artworks</span>
          </h1>
          <p className="mt-4 text-base md:text-lg text-gray-600 dark:text-gray-400">
            Discover original paintings, canvas prints, and contemporary creations from talented local and international artists.
          </p>
        </div>

        {/* Filter and Control Bar */}
        <div className="mb-8 p-4 bg-white/90 dark:bg-[#1a1a24]/90 backdrop-blur-md rounded-2xl border border-gray-200/70 dark:border-gray-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Filter Pills */}
          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mr-1">
              <Filter className="size-3.5" />
              Filter:
            </span>
            <Link
              href={createUrl("all", sort)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                filter === "all"
                  ? "bg-teal-600 text-white shadow-sm"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              All Pieces
            </Link>
            <Link
              href={createUrl("original", sort)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                filter === "original"
                  ? "bg-teal-600 text-white shadow-sm"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              Originals Available
            </Link>
            <Link
              href={createUrl("print", sort)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                filter === "print"
                  ? "bg-teal-600 text-white shadow-sm"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              Prints Available
            </Link>
          </div>

          {/* Sort Selector & Count */}
          <div className="flex items-center justify-between w-full md:w-auto gap-4">
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              <span className="font-bold text-gray-900 dark:text-gray-200">{artworks.length}</span>{" "}
              {artworks.length === 1 ? "piece" : "pieces"}
            </div>

            <div className="flex items-center gap-2">
              <ArrowUpDown className="size-3.5 text-gray-400" />
              <div className="flex items-center gap-1 text-xs">
                <Link
                  href={createUrl(filter, "newest")}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    sort === "newest"
                      ? "font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
                >
                  Newest
                </Link>
                <span className="text-gray-300 dark:text-gray-700">|</span>
                <Link
                  href={createUrl(filter, "price-low")}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    sort === "price-low"
                      ? "font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
                >
                  Price: Low
                </Link>
                <span className="text-gray-300 dark:text-gray-700">|</span>
                <Link
                  href={createUrl(filter, "price-high")}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    sort === "price-high"
                      ? "font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
                >
                  Price: High
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Artworks Grid */}
        {artworks.length === 0 ? (
          <div className="text-center py-20 bg-white/80 dark:bg-[#1a1a24]/80 backdrop-blur-md rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-sm animate-scale-in">
            <div className="inline-flex items-center justify-center size-20 bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 rounded-3xl mb-4">
              <Palette className="size-10" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              No artworks match your criteria
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto text-sm mb-6">
              Try adjusting your search terms or filter selection to discover more pieces.
            </p>
            <Link
              href="/artworks"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl shadow-md transition-colors"
            >
              Reset Filters
            </Link>
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
                price={artwork.originalPrice}
                artistName={artwork.uploader?.name || undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
