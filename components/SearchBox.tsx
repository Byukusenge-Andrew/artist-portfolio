"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Search, Loader2, ArrowRight, User, Palette } from "lucide-react";

interface SearchArtwork {
  id: string;
  title: string;
  slug: string;
  imageUrl: string;
  originalPrice?: number | null;
  isOriginalAvailable: boolean;
  printEnabled: boolean;
  uploader?: {
    name?: string | null;
  } | null;
}

interface SearchArtist {
  id: string;
  name?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
}

export default function SearchBox() {
  const [q, setQ] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ artworks: SearchArtwork[]; artists: SearchArtist[] }>({
    artworks: [],
    artists: [],
  });

  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced live search
  useEffect(() => {
    const trimmed = q.trim();
    if (trimmed.length < 2) {
      setResults({ artworks: [], artists: [] });
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
          setIsOpen(true);
        }
      } catch (err) {
        console.error("Live search failed:", err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [q]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = q.trim();
    setIsOpen(false);
    router.push(`/site/galleries${trimmed ? `?q=${encodeURIComponent(trimmed)}` : ""}`);
  }

  const hasResults = results.artworks.length > 0 || results.artists.length > 0;
  const showDropdown = isOpen && q.trim().length >= 2;

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <form onSubmit={onSubmit} className="relative w-full">
        <label htmlFor="site-search" className="sr-only">
          Search galleries
        </label>
        <div className="relative" suppressHydrationWarning>
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
            {loading ? (
              <Loader2 className="size-4 animate-spin text-teal-600 dark:text-teal-400" />
            ) : (
              <Search className="size-4" />
            )}
          </div>
          <input
            id="site-search"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              if (e.target.value.trim().length >= 2) {
                setIsOpen(true);
              }
            }}
            onFocus={() => {
              if (q.trim().length >= 2) setIsOpen(true);
            }}
            placeholder="Search artworks, styles, artists..."
            autoComplete="off"
            className="w-full rounded-xl border border-gray-200/90 dark:border-gray-700/80 pl-10 pr-4 py-2 text-sm bg-white/95 dark:bg-[#16161f]/95 dark:text-gray-100 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/70 focus:border-transparent transition-all duration-200 shadow-sm hover:border-gray-300 dark:hover:border-gray-600"
            aria-label="Search artworks and artists"
          />
        </div>
      </form>

      {/* Instant Search Results Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 dark:bg-[#181822]/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 z-50 overflow-hidden animate-scale-in">
          {loading && !hasResults ? (
            <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2">
              <Loader2 className="size-4 animate-spin text-teal-600" />
              Searching artworks and artists...
            </div>
          ) : !hasResults ? (
            <div className="p-6 text-center">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                No matching artwork or artist
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Press Enter to run a full search in the galleries
              </p>
            </div>
          ) : (
            <div className="max-h-[380px] overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800/80">
              {/* Artworks List */}
              {results.artworks.length > 0 && (
                <div className="p-2">
                  <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-400 flex items-center gap-1.5">
                    <Palette className="size-3.5" />
                    Artworks
                  </div>
                  <div className="space-y-1">
                    {results.artworks.map((art) => (
                      <Link
                        key={art.id}
                        href={`/site/${art.slug}`}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-teal-50/70 dark:hover:bg-teal-950/30 transition-colors group"
                      >
                        <div className="relative size-11 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800">
                          <Image
                            src={art.imageUrl}
                            alt={art.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform"
                            sizes="44px"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                            {art.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {art.uploader?.name ? `By ${art.uploader.name}` : "Original Artwork"}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          {art.originalPrice ? (
                            <span className="text-xs font-bold text-gray-900 dark:text-gray-100">
                              {art.originalPrice.toLocaleString()} RWF
                            </span>
                          ) : art.printEnabled ? (

                            <span className="text-[10px] uppercase font-semibold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/40 px-2 py-0.5 rounded-full">
                              Prints
                            </span>
                          ) : null}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Artists List */}
              {results.artists.length > 0 && (
                <div className="p-2">
                  <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
                    <User className="size-3.5" />
                    Artists
                  </div>
                  <div className="space-y-1">
                    {results.artists.map((artist) => (
                      <Link
                        key={artist.id}
                        href={`/site/artist/${artist.id}`}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-purple-50/70 dark:hover:bg-purple-950/30 transition-colors group"
                      >
                        <div className="relative size-10 rounded-full overflow-hidden flex-shrink-0 bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-purple-600 font-bold text-sm">
                          {artist.avatarUrl ? (
                            <Image
                              src={artist.avatarUrl}
                              alt={artist.name || "Artist"}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          ) : (
                            artist.name?.[0]?.toUpperCase() || "A"
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-purple-600 dark:group-hover:text-purple-400">
                            {artist.name}
                          </p>
                          {artist.bio && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {artist.bio}
                            </p>
                          )}
                        </div>
                        <ArrowRight className="size-4 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Full search footer */}
          <Link
            href={`/site/galleries?q=${encodeURIComponent(q.trim())}`}
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#12121a] hover:bg-teal-50 dark:hover:bg-teal-950/30 text-xs font-medium text-gray-700 dark:text-gray-300 hover:text-teal-700 dark:hover:text-teal-400 transition-colors border-t border-gray-100 dark:border-gray-800"
          >
            <span>See all gallery results for &ldquo;{q.trim()}&rdquo;</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
