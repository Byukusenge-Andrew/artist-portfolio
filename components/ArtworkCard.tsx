"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import { useFavorites } from "@/contexts/FavoritesContext";

type Props = {
  id: string;
  slug: string;
  title: string;
  imageUrl: string;
  price?: number | null;
  artistName?: string;
};

export function ArtworkCard({ id, slug, title, imageUrl, price, artistName }: Props) {
  const { isFavorite, toggleFavorite } = useFavorites();
  return (
    <Link
      key={id}
      href={`/site/${slug}`}
      className="group rounded-xl overflow-hidden border border-gray-200/60 dark:border-gray-700/40 bg-white dark:bg-[#1a1a24] shadow-sm hover:shadow-2xl dark:hover:shadow-teal-900/20 hover:border-teal-200 dark:hover:border-teal-700 transition-all duration-500 hover:-translate-y-2 h-full flex flex-col"
      aria-label={`View artwork ${title}`}
    >
      <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 overflow-hidden">
        <Image
          src={imageUrl}
          alt={title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
        />

        {/* Gradient overlay with title */}
        <div className="absolute inset-0 flex items-end opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="w-full p-4 bg-gradient-to-t from-black/70 via-black/40 to-transparent backdrop-blur-[2px]">
            <div className="flex items-center justify-between gap-3 pointer-events-auto">
              <div className="text-sm font-semibold text-white drop-shadow-lg truncate flex-1">{title}</div>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  toggleFavorite(id);
                }}
                className="group/heart inline-flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm p-2 transition-all duration-300 hover:scale-110"
                aria-label={isFavorite(id) ? `Remove ${title} from favorites` : `Add ${title} to favorites`}
              >
                <Heart
                  className={`size-4 transition-all duration-300 ${isFavorite(id)
                    ? "fill-red-500 text-red-500"
                    : "text-white group-hover/heart:fill-red-400 group-hover/heart:text-red-400"
                    }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1 gap-2">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors duration-300">
          {title}
        </h3>

        <div className="flex items-center justify-between mt-auto">
          {artistName && (
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[60%]">
              by {artistName}
            </p>
          )}

          {price !== undefined && price !== null && (
            <p className="text-sm font-bold text-teal-700 dark:text-teal-400">
              {price.toLocaleString()} RWF
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}



