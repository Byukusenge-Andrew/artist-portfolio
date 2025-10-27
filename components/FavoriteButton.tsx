"use client";

import { Heart } from "lucide-react";
import { useFavorites } from "@/contexts/FavoritesContext";

type Props = {
  artworkId: string;
  artworkTitle: string;
};

export default function FavoriteButton({ artworkId, artworkTitle }: Props) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(artworkId);

  return (
    <button
      onClick={() => toggleFavorite(artworkId)}
      className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-300 hover:shadow-md ${
        favorited
          ? "bg-gradient-to-r from-red-500 to-pink-600 text-white hover:from-red-600 hover:to-pink-700 shadow-lg"
          : "border border-gray-200 bg-white hover:bg-gray-50"
      }`}
      aria-label={favorited ? `Remove ${artworkTitle} from favorites` : `Add ${artworkTitle} to favorites`}
    >
      <Heart
        className={`size-5 transition-transform duration-300 ${
          favorited ? "fill-white scale-110" : ""
        }`}
      />
      <span>{favorited ? "Favorited" : "Add to Favorites"}</span>
    </button>
  );
}
