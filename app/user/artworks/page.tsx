import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { parseUserSession } from "@/lib/auth";
import { ArtworkCard } from "@/components/ArtworkCard";
import { Heart, Package } from "lucide-react";
import Link from "next/link";

export default async function UserArtworksPage() {
    const cookieStore = await cookies();
    const userSession = cookieStore.get("user_session")?.value;
    const user = await parseUserSession(userSession);

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Please login to view your artworks</h2>
                    <Link href="/auth/login" className="text-teal-600 hover:text-teal-700">
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    // Get user's favorites
    const userRecord = await prisma.user.findUnique({
        where: { id: user.userId },
        select: { favorites: true },
    });

    let favoriteIds: string[] = [];
    if (userRecord?.favorites) {
        try {
            favoriteIds = JSON.parse(userRecord.favorites);
        } catch {
            favoriteIds = [];
        }
    }

    // Fetch favorite artworks
    const favoriteArtworks = await prisma.artwork.findMany({
        where: { id: { in: favoriteIds } },
        select: {
            id: true,
            slug: true,
            title: true,
            imageUrl: true,
        },
    });

    // Get user's orders (purchased artworks)
    const orders = await prisma.order.findMany({
        where: { userId: user.userId },
        include: {
            items: {
                include: {
                    artwork: {
                        select: {
                            id: true,
                            slug: true,
                            title: true,
                            imageUrl: true,
                        },
                    },
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    // Extract unique purchased artworks (filter out null artworks)
    const purchasedArtworks = orders.flatMap((order) =>
        order.items.map((item) => item.artwork).filter((artwork): artwork is NonNullable<typeof artwork> => artwork !== null)
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
                        My Artworks
                    </h1>
                    <p className="text-xl text-gray-600">
                        Your collection of favorites and purchased pieces
                    </p>
                </div>

                {/* Favorites Section */}
                <section className="mb-16">
                    <div className="flex items-center gap-3 mb-6">
                        <Heart className="size-6 text-red-500 fill-red-500" />
                        <h2 className="text-2xl font-bold">Favorites</h2>
                        <span className="text-sm text-gray-500">({favoriteArtworks.length})</span>
                    </div>

                    {favoriteArtworks.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                            <Heart className="size-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-600">No favorites yet</p>
                            <Link
                                href="/artworks"
                                className="inline-block mt-4 text-teal-600 hover:text-teal-700 font-medium"
                            >
                                Browse Artworks
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {favoriteArtworks.map((artwork) => (
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
                </section>

                {/* Purchased Artworks Section */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <Package className="size-6 text-teal-600" />
                        <h2 className="text-2xl font-bold">Purchased Artworks</h2>
                        <span className="text-sm text-gray-500">({purchasedArtworks.length})</span>
                    </div>

                    {purchasedArtworks.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                            <Package className="size-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-600">No purchases yet</p>
                            <Link
                                href="/artworks"
                                className="inline-block mt-4 text-teal-600 hover:text-teal-700 font-medium"
                            >
                                Browse Artworks
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {purchasedArtworks.map((artwork) => (
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
                </section>
            </div>
        </div>
    );
}
