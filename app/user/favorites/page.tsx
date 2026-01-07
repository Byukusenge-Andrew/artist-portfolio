import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { ArrowLeft, Heart } from "lucide-react";
import { prisma } from "@/lib/prisma";

async function getCurrentUser() {
  const cookieStore = await cookies();
  const userSession = cookieStore.get("user_session")?.value;

  if (!userSession) {
    redirect("/auth/login");
  }

  try {
    const user = JSON.parse(Buffer.from(userSession, "base64").toString());
    return user;
  } catch (e) {
    redirect("/auth/login");
  }
}

export default async function FavoritesPage() {
  const user = await getCurrentUser();

  let favorites: any[] = [];
  try {
    const userRecord = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (userRecord?.favorites) {
      const favoriteIds = JSON.parse(userRecord.favorites as string);
      favorites = await prisma.artwork.findMany({
        where: { id: { in: favoriteIds } },
      });
    }
  } catch (error) {
    console.error("Failed to fetch favorites:", error);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/user/dashboard" className="flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-4">
            <ArrowLeft className="h-5 w-5" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Saved Favorites</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {(favorites as any[]).length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Saved Favorites</h2>
            <p className="text-gray-600 mb-6">Start saving your favorite artworks to view them here</p>
            <Link href="/galleries" className="inline-block bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700">
              Explore Galleries
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(favorites as any[]).map((artwork: any) => (
              <div key={artwork.id} className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-gray-200 relative overflow-hidden">
                  <img
                    src={artwork.imageUrl}
                    alt={artwork.title}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">{artwork.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{artwork.artist}</p>
                  <Link
                    href={`/art/${artwork.slug}`}
                    className="text-teal-600 hover:text-teal-700 font-medium text-sm"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
