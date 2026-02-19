// components/RelatedArtworks.tsx
"use client";

import { ArtworkCard } from "@/components/ArtworkCard";
import { Sparkles } from "lucide-react";

interface RelatedArtworksProps {
    artworks: Array<{
        id: string;
        slug: string;
        title: string;
        imageUrl: string;
    }>;
}

export default function RelatedArtworks({ artworks }: RelatedArtworksProps) {
    if (artworks.length === 0) return null;

    return (
        <section className="mt-16 border-t border-gray-200 dark:border-gray-700 pt-12">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-gradient-to-br from-teal-600 to-emerald-600 rounded-lg">
                    <Sparkles className="size-5 text-white" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">You May Also Like</h2>
                    <p className="text-gray-600 dark:text-gray-400">Similar artworks based on style and theme</p>
                </div>
            </div>
            <div className="gallery-grid">
                {artworks.map((art) => (
                    <ArtworkCard key={art.id} id={art.id} slug={art.slug} title={art.title} imageUrl={art.imageUrl} />
                ))}
            </div>
        </section>
    );
}
