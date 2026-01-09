// app/(site)/artist/page.tsx
import { prisma } from "@/lib/prisma";
import { Mail, Phone, Palette } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default async function ArtistPage() {
  const artists = await prisma.artist.findMany({
    orderBy: { createdAt: "desc" },
  });

  const artist = artists[0]; // Primary artist

  if (!artist) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 text-center">
        <p className="text-gray-600">Artist profile coming soon...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 animate-fade-in-up">
      {/* Hero Section */}
      <div className="grid md:grid-cols-3 gap-8 items-start mb-12">
        {/* Avatar */}
        <div className="md:col-span-1">
          <div className="sticky top-8">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-teal-100 to-emerald-100 flex items-center justify-center shadow-lg">
              {artist.avatarUrl ? (
                <Image
                  src={artist.avatarUrl}
                  alt={artist.name}
                  fill
                  className="w-full h-full object-cover"
                />
              ) : (
                <Palette className="h-16 w-16 text-teal-600" />
              )}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="md:col-span-2">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
            {artist.name}
          </h1>

          {artist.bio && (
            <p className="text-lg text-gray-700 mb-6 leading-relaxed whitespace-pre-wrap">
              {artist.bio}
            </p>
          )}

          {/* Contact */}
          <div className="space-y-3">
            {artist.email && (
              <a
                href={`mailto:${artist.email}`}
                className="inline-flex items-center gap-3 px-4 py-2 bg-teal-50 border border-teal-200 rounded-lg text-teal-700 hover:bg-teal-100 transition-all"
              >
                <Mail className="h-5 w-5" />
                {artist.email}
              </a>
            )}

            {artist.phone && (
              <a
                href={`tel:${artist.phone}`}
                className="inline-flex items-center gap-3 px-4 py-2 bg-teal-50 border border-teal-200 rounded-lg text-teal-700 hover:bg-teal-100 transition-all"
              >
                <Phone className="h-5 w-5" />
                {artist.phone}
              </a>
            )}
          </div>

          {/* Dates */}
          <p className="text-sm text-gray-600 mt-8">
            Member since {new Date(artist.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Divider */}
      <hr className="my-12 border-gray-200" />

      {/* Recent Artworks */}
      <div>
        <h2 className="text-2xl font-bold mb-8">Recent Works</h2>
        <p className="text-gray-600">
          Explore all artworks in our{" "}
          <Link href="/site/galleries" className="text-teal-600 hover:text-teal-700 font-semibold">
            galleries
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
