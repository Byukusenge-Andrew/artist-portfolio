"use client";

import { useFavorites } from "@/contexts/FavoritesContext";
import { ArtworkCard } from "@/components/ArtworkCard";
import Link from "next/link";
import { Heart, Palette } from "lucide-react";

type Artwork = {
    id: string;
    slug: string;
    title: string;
    imageUrl: string;
};

export default function FavoritesGrid({ initialArtworks }: { initialArtworks: Artwork[] }) {
    const { favorites, isLoading } = useFavorites();

    // Only show artworks whose IDs are still in the live context favorites list
    const visibleArtworks = initialArtworks.filter((a) => favorites.includes(a.id));

    if (isLoading) {
        return (
            <div className="text-center py-20 text-gray-400">
                Loading favorites…
            </div>
        );
    }

    if (visibleArtworks.length === 0) {
        return (
            <div className="text-center py-20 bg-gray-50 dark:bg-[#1a1a24] rounded-3xl animate-scale-in transition-colors">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl mb-6 shadow-lg">
                    <Heart className="size-10 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No favorites yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8">Start exploring and save your favorite artworks</p>
                <Link
                    href="/site/galleries"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-lg hover:from-teal-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                >
                    <Palette className="size-5" />
                    Explore Galleries
                </Link>
            </div>
        );
    }

    return (
        <>
            <div className="gallery-grid animate-fade-in-up">
                {visibleArtworks.map((artwork, idx) => (
                    <div key={artwork.id} style={{ animationDelay: `${idx * 0.05}s` }} className="animate-scale-in">
                        <ArtworkCard
                            id={artwork.id}
                            slug={artwork.slug}
                            title={artwork.title}
                            imageUrl={artwork.imageUrl}
                        />
                    </div>
                ))}
            </div>

            <div className="mt-16 text-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#1a1a24] dark:to-[#141418] rounded-3xl p-12 animate-scale-in transition-colors">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Discover More Art</h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                    Continue exploring our collection and find more pieces you&apos;ll love
                </p>
                <Link
                    href="/site/galleries"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-8 py-4 text-white font-semibold hover:from-teal-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                    <Palette className="size-5" />
                    Browse More Artworks
                </Link>
            </div>
        </>
    );
}
