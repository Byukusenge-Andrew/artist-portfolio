import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { ArrowLeft, Heart } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { parseUserSession } from "@/lib/auth";
import FavoritesGrid from "@/components/FavoritesGrid";

async function getCurrentUser() {
  const cookieStore = await cookies();
  const userSession = cookieStore.get("user_session")?.value;

  if (!userSession) {
    redirect("/auth/login?redirect=/user/favorites");
  }

  const user = await parseUserSession(userSession);
  if (!user) {
    redirect("/auth/login?redirect=/user/favorites");
  }
  return user;
}

export default async function FavoritesPage() {
  const user = await getCurrentUser();

  let favorites: any[] = [];
  try {
    const userRecord = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { favorites: true },
    });

    if (userRecord?.favorites) {
      const favoriteIds = JSON.parse(userRecord.favorites as string);
      favorites = await prisma.artwork.findMany({
        where: { id: { in: favoriteIds } },
        select: {
          id: true,
          slug: true,
          title: true,
          imageUrl: true,
          description: true,
        },
      });
    }
  } catch (error) {
    console.error("Failed to fetch favorites:", error);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      {/* Back Button */}
      <Link
        href="/user/dashboard"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-teal-700 mb-8 group transition-colors"
      >
        <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </Link>

      {/* Header */}
      <div className="mb-12 animate-fade-in">
        <div className="flex items-start gap-4 mb-4">
          <div className="p-3 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl shadow-lg">
            <Heart className="size-6 text-white fill-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
              My Favorites
            </h1>
            <p className="text-xl text-gray-600">
              Your curated collection of favorite artworks
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm text-gray-500 mt-6 pt-6 border-t border-gray-200">
          <span className="inline-flex items-center gap-2">
            <span className="w-2 h-2 bg-red-600 rounded-full"></span>
            {favorites.length} {favorites.length === 1 ? "Artwork" : "Artworks"}
          </span>
        </div>
      </div>

      {/* Favorites Grid — client component reacts to heart toggles instantly */}
      <FavoritesGrid initialArtworks={favorites} />
    </div>
  );
}
