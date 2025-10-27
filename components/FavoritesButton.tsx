"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useFavorites } from "@/contexts/FavoritesContext";

export default function FavoritesButton() {
  const { favorites } = useFavorites();

  return (
    <Link
      href="/favorites"
      className="group relative inline-flex items-center gap-2 rounded-lg px-4 py-2 text-gray-700 hover:text-teal-800 hover:bg-gradient-to-br hover:from-teal-50 hover:to-emerald-50 transition-all duration-300"
      aria-label="View favorites"
    >
      <Heart className="size-4 group-hover:scale-110 group-hover:fill-red-400 group-hover:text-red-400 transition-all" />
      <span className="hidden sm:inline font-medium">Favorites</span>
      {favorites.length > 0 && (
        <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-gradient-to-r from-red-500 to-pink-600 rounded-full shadow-lg animate-scale-in">
          {favorites.length}
        </span>
      )}
    </Link>
  );
}
