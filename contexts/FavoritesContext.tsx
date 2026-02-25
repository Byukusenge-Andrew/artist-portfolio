"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { usePathname } from "next/navigation";

type FavoritesContextType = {
  favorites: string[];
  addFavorite: (artworkId: string) => Promise<void>;
  removeFavorite: (artworkId: string) => Promise<void>;
  isFavorite: (artworkId: string) => boolean;
  toggleFavorite: (artworkId: string) => Promise<void>;
  clearAllFavorites: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasUnseenFavorites: boolean;
};

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasUnseenFavorites, setHasUnseenFavorites] = useState(false);

  // Initial load
  useEffect(() => {
    setMounted(true);
    checkAuthAndLoadFavorites();
  }, []);

  // Re-sync favorites when navigating between pages
  const pathname = usePathname();
  useEffect(() => {
    if (mounted) {
      checkAuthAndLoadFavorites();
    }
    // When user visits favorites page, mark all as seen
    if (pathname === "/user/favorites") {
      setHasUnseenFavorites(false);
      localStorage.setItem("favoritesLastSeenCount", String(favorites.length));
    }
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  async function checkAuthAndLoadFavorites() {
    try {
      // Check if user is authenticated
      const sessionRes = await fetch("/api/auth/session");

      if (sessionRes.ok) {
        const sessionData = await sessionRes.json();
        const authenticated = !!sessionData.user;
        setIsAuthenticated(authenticated);

        if (authenticated) {
          // Fetch favorites from server
          const favRes = await fetch("/api/favorites");
          if (favRes.ok) {
            const data = await favRes.json();
            setFavorites(data.favorites || []);
          }
        } else {
          // Should not happen if sessionRes is ok, but clear just in case
          setFavorites([]);
        }
      } else {
        setIsAuthenticated(false);
        // For non-authenticated users, load from localStorage (read-only)
        const stored = localStorage.getItem("artwork-favorites");
        if (stored) {
          try {
            setFavorites(JSON.parse(stored));
          } catch {
            setFavorites([]);
          }
        }
      }
    } catch (error) {
      console.error("Error loading favorites:", error);
      // Fallback to localStorage
      const stored = localStorage.getItem("artwork-favorites");
      if (stored) {
        try {
          setFavorites(JSON.parse(stored));
        } catch {
          setFavorites([]);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }

  const addFavorite = async (artworkId: string) => {
    if (!isAuthenticated) {
      // Redirect to login
      window.location.href = "/auth/login?redirect=" + encodeURIComponent(window.location.pathname);
      return;
    }

    // Optimistic update
    setFavorites((prev) => {
      if (prev.includes(artworkId)) return prev;
      return [...prev, artworkId];
    });

    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artworkId }),
      });

      if (!res.ok) {
        throw new Error("Failed to add favorite");
      }

      const data = await res.json();
      setFavorites(data.favorites);
      // Mark as unseen so badge shows until user visits favorites page
      setHasUnseenFavorites(true);
      localStorage.setItem("favoritesLastSeenCount", String((data.favorites.length - 1) || 0));
    } catch (error) {
      console.error("Error adding favorite:", error);
      // Revert optimistic update
      setFavorites((prev) => prev.filter((id) => id !== artworkId));
    }
  };

  const removeFavorite = async (artworkId: string) => {
    if (!isAuthenticated) {
      return;
    }

    // Optimistic update
    setFavorites((prev) => prev.filter((id) => id !== artworkId));

    try {
      const res = await fetch(`/api/favorites?artworkId=${artworkId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to remove favorite");
      }

      const data = await res.json();
      setFavorites(data.favorites);
    } catch (error) {
      console.error("Error removing favorite:", error);
      // Revert optimistic update
      setFavorites((prev) => [...prev, artworkId]);
    }
  };

  const isFavorite = (artworkId: string) => {
    return favorites.includes(artworkId);
  };

  const toggleFavorite = async (artworkId: string) => {
    if (isFavorite(artworkId)) {
      await removeFavorite(artworkId);
    } else {
      await addFavorite(artworkId);
    }
  };

  const clearAllFavorites = () => {
    setFavorites([]);
    if (mounted && !isAuthenticated) {
      localStorage.removeItem("artwork-favorites");
    }
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addFavorite,
        removeFavorite,
        isFavorite,
        toggleFavorite,
        clearAllFavorites,
        isAuthenticated,
        isLoading,
        hasUnseenFavorites,
      }}
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
