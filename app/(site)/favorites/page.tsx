"use client";

import { useEffect, useState } from "react";
import { useFavorites } from "@/contexts/FavoritesContext";
import { ArtworkCard } from "@/components/ArtworkCard";
import { Heart, Sparkles, ArrowUpDown, Trash2 } from "lucide-react";
import Link from "next/link";

type Artwork = {
  id: string;
  slug: string;
  title: string;
  imageUrl: string;
};

type SortOption = "newest" | "oldest" | "title-asc" | "title-desc";

export default function FavoritesPage() {
  const { favorites, clearAllFavorites } = useFavorites();
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  useEffect(() => {
    async function fetchFavorites() {
      if (favorites.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/artworks");
        if (!res.ok) throw new Error("Failed to fetch");
        const allArtworks: Artwork[] = await res.json();
        
        // Filter to only favorited artworks and maintain favorites order
        const favorited = favorites
          .map(favId => allArtworks.find(art => art.id === favId))
          .filter((art): art is Artwork => art !== undefined);
        
        setArtworks(favorited);
      } catch (error) {
        console.error("Error fetching favorites:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchFavorites();
  }, [favorites]);

  // Sort artworks
  const sortedArtworks = [...artworks].sort((a, b) => {
    switch (sortBy) {
      case "oldest":
        // Oldest favorites first (earlier in favorites array)
        return favorites.indexOf(a.id) - favorites.indexOf(b.id);
      case "newest":
        // Newest favorites first (later in favorites array)
        return favorites.indexOf(b.id) - favorites.indexOf(a.id);
      case "title-asc":
        return a.title.localeCompare(b.title);
      case "title-desc":
        return b.title.localeCompare(a.title);
      default:
        return 0;
    }
  });

  const handleClearAll = () => {
    if (confirm("Are you sure you want to remove all favorites? This action cannot be undone.")) {
      clearAllFavorites();
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="animate-pulse space-y-8">
          <div className="h-10 bg-gray-200 rounded w-64"></div>
          <div className="gallery-grid">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-square bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 animate-fade-in-up">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl shadow-lg">
            <Heart className="size-6 text-white fill-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            My Favorites
          </h1>
        </div>
        <p className="text-gray-600">
          Your curated collection of artworks you love
        </p>
      </div>

      {/* Content */}
      {artworks.length > 0 ? (
        <>
          <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <span className="text-sm text-gray-600">
              {artworks.length} {artworks.length === 1 ? "artwork" : "artworks"} saved
            </span>
            
            <div className="flex items-center gap-3">
              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <ArrowUpDown className="size-4 text-gray-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                  aria-label="Sort favorites"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="title-asc">Title (A-Z)</option>
                  <option value="title-desc">Title (Z-A)</option>
                </select>
              </div>

              {/* Clear All Button */}
              <button
                onClick={handleClearAll}
                className="inline-flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
              >
                <Trash2 className="size-4" />
                Clear All
              </button>
              
              <Link
                href="/galleries"
                className="inline-flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors"
              >
                <Sparkles className="size-4" />
                Discover more
              </Link>
            </div>
          </div>
          
          <div className="gallery-grid">
            {sortedArtworks.map((artwork) => (
              <ArtworkCard
                key={artwork.id}
                id={artwork.id}
                slug={artwork.slug}
                title={artwork.title}
                imageUrl={artwork.imageUrl}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-6">
            <Heart className="size-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">
            No favorites yet
          </h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Start building your collection by clicking the heart icon on artworks you love
          </p>
          <Link
            href="/galleries"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-lg font-medium hover:from-teal-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <Sparkles className="size-5" />
            Explore Artworks
          </Link>
        </div>
      )}
    </div>
  );
}
