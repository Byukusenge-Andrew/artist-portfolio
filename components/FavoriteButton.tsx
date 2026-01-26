"use client";

import { Heart } from "lucide-react";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useState } from "react";

type Props = {
  artworkId: string;
  artworkTitle: string;
};

export default function FavoriteButton({ artworkId, artworkTitle }: Props) {
  const { isFavorite, toggleFavorite, isAuthenticated, isLoading } = useFavorites();
  const [isToggling, setIsToggling] = useState(false);
  const favorited = isFavorite(artworkId);

  const handleClick = async () => {
    if (isLoading || isToggling) return;

    setIsToggling(true);
    try {
      await toggleFavorite(artworkId);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading || isToggling}
      className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-300 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${favorited
          ? "bg-gradient-to-r from-red-500 to-pink-600 text-white hover:from-red-600 hover:to-pink-700 shadow-lg"
          : "border border-gray-200 bg-white hover:bg-gray-50"
        }`}
      aria-label={favorited ? `Remove ${artworkTitle} from favorites` : `Add ${artworkTitle} to favorites`}
      title={!isAuthenticated ? "Login to save favorites" : ""}
    >
      <Heart
        className={`size-5 transition-transform duration-300 ${favorited ? "fill-white scale-110" : ""
          } ${isToggling ? "animate-pulse" : ""}`}
      />
      <span>
        {isLoading ? "Loading..." : favorited ? "Favorited" : isAuthenticated ? "Add to Favorites" : "Login to Favorite"}
      </span>
    </button>
  );
}
