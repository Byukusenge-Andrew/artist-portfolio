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
};

export function ArtworkCard({ id, slug, title, imageUrl }: Props) {
  const { isFavorite, toggleFavorite } = useFavorites();
  return (
    <Link
      key={id}
      href={`/site/${slug}`}
      className="group block rounded-xl overflow-hidden border border-gray-200/60 bg-white shadow-sm hover:shadow-2xl hover:border-teal-200 transition-all duration-500 hover:-translate-y-2"
      aria-label={`View artwork ${title}`}
    >
      <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-50 overflow-hidden">
        <Image
          src={imageUrl}
          alt={title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
        />

        {/* Gradient overlay with title */}
        <div className="absolute inset-0 flex items-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-full p-4 bg-gradient-to-t from-black/70 via-black/40 to-transparent backdrop-blur-[2px]">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-white drop-shadow-lg truncate">{title}</div>
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
                  className={`size-4 transition-all duration-300 ${
                    isFavorite(id) 
                      ? "fill-red-500 text-red-500" 
                      : "text-white group-hover/heart:fill-red-400 group-hover/heart:text-red-400"
                  }`} 
                />
              </button>
            </div>
          </div>
        </div>

        {/* Top-right quick action badge */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="rounded-full bg-teal-500/90 backdrop-blur-sm px-3 py-1 text-xs font-medium text-white shadow-lg">
            View Details
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-900 truncate group-hover:text-teal-700 transition-colors duration-300">
          {title}
        </h3>
        <p className="text-xs text-gray-500 mt-1">Click to explore</p>
      </div>
    </Link>
  );
}




