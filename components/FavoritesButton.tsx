"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useFavorites } from "@/contexts/FavoritesContext";

export default function FavoritesButton() {
  const { favorites, isAuthenticated, isLoading, hasUnseenFavorites } = useFavorites();

  // If not authenticated, redirect to login
  const href = isAuthenticated ? "/user/favorites" : "/auth/login?redirect=/user/favorites";

  return (
    <Link
      href={href}
      className="group relative inline-flex items-center gap-2 rounded-lg px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-teal-800 dark:hover:text-teal-400 hover:bg-gradient-to-br hover:from-teal-50 hover:to-emerald-50 dark:hover:from-teal-900/30 dark:hover:to-emerald-900/30 transition-all duration-300"
      aria-label="View favorites"
      title={!isAuthenticated ? "Login to view favorites" : "View favorites"}
    >
      <Heart className="size-4 group-hover:scale-110 group-hover:fill-red-400 group-hover:text-red-400 transition-all" />
      <span className="hidden sm:inline font-medium">Favorites</span>
      {/* Badge: only shown for unseen (newly added) favorites, clears on page visit */}
      {!isLoading && isAuthenticated && hasUnseenFavorites && favorites.length > 0 && (
        <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-gradient-to-r from-red-500 to-pink-600 rounded-full shadow-lg animate-scale-in">
          {favorites.length}
        </span>
      )}
    </Link>
  );
}
