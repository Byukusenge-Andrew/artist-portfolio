import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { User, Palette, ArrowRight } from "lucide-react";

export const revalidate = 60; // Revalidate every minute

export default async function ArtistsPage() {
    const artists = await prisma.user.findMany({
        where: {
            role: "ARTIST",
            isActive: true, // Only active artists
        },
        select: {
            id: true,
            name: true,
            bio: true,
            avatarUrl: true,
            uploadedArtworks: {
                take: 4,
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    title: true,
                    imageUrl: true,
                    slug: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-16">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">Our Featured Artists</h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    Discover the talented creators behind the exceptional artworks on Artelier.
                    Each artist brings a unique perspective and style to our collection.
                </p>
            </div>

            {artists.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 dark:bg-[#1a1a24] rounded-2xl transition-colors">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                        <Palette className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No artists found</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">Our community is growing! Check back soon for new artists.</p>
                    <Link
                        href="/auth/artist-signup"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all font-medium"
                    >
                        Join as an Artist
                    </Link>
                </div>
            ) : (
                <div className="space-y-16">
                    {artists.map((artist) => (
                        <div key={artist.id} className="bg-white dark:bg-[#1a1a24] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                            <div className="p-6 sm:p-8 flex flex-col md:flex-row gap-8 items-start">
                                {/* Artist Info */}
                                <div className="flex-shrink-0 flex flex-col items-center md:items-start text-center md:text-left md:w-64 space-y-4">
                                    <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-[#1a1a24] shadow-lg bg-gray-100 dark:bg-gray-800">
                                        {artist.avatarUrl ? (
                                            <Image
                                                src={artist.avatarUrl}
                                                alt={artist.name || "Artist"}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-100 to-emerald-100 dark:from-teal-900/40 dark:to-emerald-900/40 text-teal-600 dark:text-teal-400">
                                                <User className="w-12 h-12" />
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                                            {artist.name || "Artist"}
                                        </h2>
                                        <p className="text-sm text-teal-600 dark:text-teal-400 font-medium mt-1">
                                            {artist.uploadedArtworks.length} Artworks
                                        </p>
                                    </div>

                                    {artist.bio && (
                                        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-4 leading-relaxed">
                                            {artist.bio}
                                        </p>
                                    )}

                                    <Link
                                        href={`/site/artist/${artist.id}`} // Assuming individual artist page exists or will exist
                                        className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 transition-colors mt-auto"
                                    >
                                        View Full Profile
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>

                                {/* Artworks Grid */}
                                <div className="flex-1 min-w-0">
                                    {artist.uploadedArtworks.length > 0 ? (
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                            {artist.uploadedArtworks.map((artwork) => (
                                                <Link
                                                    key={artwork.id}
                                                    href={`/site/${artwork.slug}`}
                                                    className="group relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden block"
                                                >
                                                    <Image
                                                        src={artwork.imageUrl}
                                                        alt={artwork.title}
                                                        fill
                                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                                        sizes="(max-width: 640px) 50vw, 25vw"
                                                    />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 dark:group-hover:bg-black/40 transition-colors duration-300" />
                                                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                        <p className="text-white text-xs font-medium truncate">{artwork.title}</p>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="h-48 flex items-center justify-center bg-gray-50 dark:bg-[#141418] rounded-xl border border-dashed border-gray-200 dark:border-gray-700 text-gray-400 text-sm transition-colors">
                                            <p>No artworks uploaded yet</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
