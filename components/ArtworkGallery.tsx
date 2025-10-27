"use client";

import { useState, useMemo } from "react";
import { ArtworkCard } from "./ArtworkCard";
import { Search, Filter, X } from "lucide-react";

type Artwork = {
  id: string;
  slug: string;
  title: string;
  imageUrl: string;
  tags?: string[];
};

type Props = {
  artworks: Artwork[];
};

export default function ArtworkGallery({ artworks }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"newest" | "title">("newest");

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    artworks.forEach((artwork) => {
      if (artwork.tags && Array.isArray(artwork.tags)) {
        artwork.tags.forEach((tag) => tags.add(tag));
      }
    });
    return Array.from(tags).sort();
  }, [artworks]);

  // Filter and sort artworks
  const filteredArtworks = useMemo(() => {
    let filtered = artworks;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((artwork) =>
        artwork.title.toLowerCase().includes(query)
      );
    }

    // Filter by tag
    if (selectedTag) {
      filtered = filtered.filter(
        (artwork) =>
          artwork.tags &&
          Array.isArray(artwork.tags) &&
          artwork.tags.includes(selectedTag)
      );
    }

    // Sort
    if (sortBy === "title") {
      filtered = [...filtered].sort((a, b) =>
        a.title.localeCompare(b.title)
      );
    }

    return filtered;
  }, [artworks, searchQuery, selectedTag, sortBy]);

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search artworks..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition"
              aria-label="Clear search"
            >
              <X className="size-4 text-gray-400" />
            </button>
          )}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <Filter className="size-4 text-gray-500" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "newest" | "title")}
            className="px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white transition-all"
            aria-label="Sort artworks"
          >
            <option value="newest">Newest First</option>
            <option value="title">Title A-Z</option>
          </select>
        </div>
      </div>

      {/* Tags Filter */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedTag === null
                ? "bg-teal-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedTag === tag
                  ? "bg-teal-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Showing {filteredArtworks.length} of {artworks.length} artworks
        </span>
        {(searchQuery || selectedTag) && (
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedTag(null);
            }}
            className="text-teal-600 hover:text-teal-700 font-medium"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Gallery Grid */}
      {filteredArtworks.length > 0 ? (
        <div className="gallery-grid">
          {filteredArtworks.map((artwork) => (
            <ArtworkCard
              key={artwork.id}
              id={artwork.id}
              slug={artwork.slug}
              title={artwork.title}
              imageUrl={artwork.imageUrl}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🎨</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No artworks found
          </h3>
          <p className="text-gray-600 mb-6">
            Try adjusting your search or filters
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedTag(null);
            }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
