"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type FavoritesContextType = {
  favorites: string[];
  addFavorite: (artworkId: string) => void;
  removeFavorite: (artworkId: string) => void;
  isFavorite: (artworkId: string) => boolean;
  toggleFavorite: (artworkId: string) => void;
  clearAllFavorites: () => void;
};

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  // Load favorites from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("artwork-favorites");
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch {
        setFavorites([]);
      }
    }
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("artwork-favorites", JSON.stringify(favorites));
    }
  }, [favorites, mounted]);

  const addFavorite = (artworkId: string) => {
    setFavorites((prev) => {
      if (prev.includes(artworkId)) return prev;
      return [...prev, artworkId];
    });
  };

  const removeFavorite = (artworkId: string) => {
    setFavorites((prev) => prev.filter((id) => id !== artworkId));
  };

  const isFavorite = (artworkId: string) => {
    return favorites.includes(artworkId);
  };

  const toggleFavorite = (artworkId: string) => {
    if (isFavorite(artworkId)) {
      removeFavorite(artworkId);
    } else {
      addFavorite(artworkId);
    }
  };

  const clearAllFavorites = () => {
    setFavorites([]);
  };

  return (
    <FavoritesContext.Provider
      value={{ favorites, addFavorite, removeFavorite, isFavorite, toggleFavorite, clearAllFavorites }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}
