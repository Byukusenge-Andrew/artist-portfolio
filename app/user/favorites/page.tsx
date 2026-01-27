import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { ArrowLeft, Heart, Palette } from "lucide-react";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { ArtworkCard } from "@/components/ArtworkCard";

async function getCurrentUser() {
  const cookieStore = await cookies();
  const userSession = cookieStore.get("user_session")?.value;

  if (!userSession) {
    redirect("/auth/login?redirect=/user/favorites");
  }

  try {
    const user = JSON.parse(Buffer.from(userSession, "base64").toString());
    return user;
  } catch (e) {
    redirect("/auth/login?redirect=/user/favorites");
  }
}

export default async function FavoritesPage() {
  const user = await getCurrentUser();

  let favorites: any[] = [];
  try {
    const userRecord = await prisma.user.findUnique({
      where: { id: user.userId || user.id },
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

      {/* Favorites Grid */}
      {favorites.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl animate-scale-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl mb-6 shadow-lg">
            <Heart className="size-10 text-white" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">
            No favorites yet
          </h3>
          <p className="text-gray-600 mb-8">
            Start exploring and save your favorite artworks
          </p>
          <Link
            href="/site/galleries"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-lg hover:from-teal-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
          >
            <Palette className="size-5" />
            Explore Galleries
          </Link>
        </div>
      ) : (
        <div className="gallery-grid animate-fade-in-up">
          {favorites.map((artwork, idx) => (
            <div
              key={artwork.id}
              style={{ animationDelay: `${idx * 0.05}s` }}
              className="animate-scale-in"
            >
              <ArtworkCard
                id={artwork.id}
                slug={artwork.slug}
                title={artwork.title}
                imageUrl={artwork.imageUrl}
              />
            </div>
          ))}
        </div>
      )}

      {/* CTA Section */}
      {favorites.length > 0 && (
        <div className="mt-16 text-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-12 animate-scale-in">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Discover More Art
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Continue exploring our collection and find more pieces you'll love
          </p>
          <Link
            href="/site/galleries"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-8 py-4 text-white font-semibold hover:from-teal-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <Palette className="size-5" />
            Browse More Artworks
          </Link>
        </div>
      )}
    </div>
  );
}
