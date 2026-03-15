import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ArtworkCard } from "@/components/ArtworkCard";
import Stories from "@/components/Stories";
import FeedCard from "@/components/FeedCard";
import { Star, ShoppingBag, Heart, Users, Sparkles, TrendingUp, Palette } from "lucide-react";
import Image from "next/image";
import { Analytics } from "@vercel/analytics/next"
import { getTopArtists } from "@/lib/queries/artists";

export default async function Home() {
  const latest = await prisma.artwork.findMany({
    orderBy: { createdAt: "desc" },
    take: 12,
    include: {
      uploader: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          bio: true,
        },
      },
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
    },
  });

  // Trending: rank by likes + comments (true engagement, not recency)
  const allWithEngagement = await prisma.artwork.findMany({
    take: 50,
    include: {
      uploader: {
        select: { id: true, name: true, avatarUrl: true, bio: true },
      },
      _count: { select: { likes: true, comments: true } },
    },
  });

  const trending = [...allWithEngagement]
    .sort((a, b) => (b._count.likes + b._count.comments) - (a._count.likes + a._count.comments))
    .filter((a) => a._count.likes + a._count.comments > 0)
    .slice(0, 3);

  // Optional: artist list, if the model/migration is applied
  let artists: Array<{ name: string; avatarUrl: string | null }> = [];
  try {
    artists = await prisma.artist.findMany({
      orderBy: { createdAt: "desc" },
      take: 12,
      select: { name: true, avatarUrl: true },
    });
  } catch {
    artists = [];
  }

  const topArtists = await getTopArtists(6);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl my-6 sm:my-8 lg:my-10 animate-fade-in ">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500 via-emerald-500 to-cyan-600 dark:from-teal-700 dark:via-emerald-800 dark:to-cyan-900 opacity-90"></div>
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative z-10 p-6 sm:p-8 lg:p-16 grid gap-6 sm:gap-8 md:grid-cols-2 items-center">
          <div className="text-white space-y-4 sm:space-y-6 animate-slide-in-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium border border-white/30">
              <Sparkles className="size-3 sm:size-4" />
              <span>Welcome to Artelier</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
              Discover & Collect
              <br />
              <span className="bg-gradient-to-r from-yellow-200 via-pink-200 to-purple-200 bg-clip-text text-transparent">
                Exceptional Art
              </span>
            </h1>

            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 leading-relaxed max-w-xl">
              Join a vibrant community of artists and collectors. Explore stunning artworks,
              support creators, and build your personal collection.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4">
              <Link
                href="/site/galleries"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base text-teal-700 font-semibold hover:bg-gray-50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
              >
                <Palette className="size-4 sm:size-5 group-hover:rotate-12 transition-transform" />
                Explore Galleries
              </Link>
              <Link
                href="/auth/artist-signup"
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/30 backdrop-blur-sm bg-white/10 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base text-white font-semibold hover:bg-white/20 transition-all duration-300"
              >
                <TrendingUp className="size-4 sm:size-5" />
                Become an Artist
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 sm:gap-6 lg:gap-8 pt-4 sm:pt-6 border-t border-white/20">
              <div>
                <div className="text-2xl sm:text-3xl font-bold">{(await prisma.artwork.count())}+</div>
                <div className="text-xs sm:text-sm text-white/80">Artworks</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold">{(await prisma.user.count({ where: { role: "ARTIST" } }))}+</div>
                <div className="text-xs sm:text-sm text-white/80">Artists</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold">{(await prisma.user.count({ where: { role: "USER" } }))}+</div>
                <div className="text-xs sm:text-sm text-white/80">Collectors</div>
              </div>
            </div>
          </div>

          <div className="relative h-48 sm:h-64 md:h-96 animate-scale-in">
            <div className="absolute inset-0 grid grid-cols-2 gap-3 sm:gap-4">
              {latest.slice(0, 4).map((art, idx) => (
                <div
                  key={art.id}
                  className="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl hover:scale-105 transition-transform duration-300"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <Image
                    src={art.imageUrl}
                    alt={art.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Community row (stories-like) */}
      {artists.length > 0 && (
        <div className="my-12 animate-fade-in-up">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 dark:text-gray-100">
            <span className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
              <Users className="size-5 text-white" />
            </span>
            Featured Artists
          </h2>
          <Stories artists={artists.map((a) => ({ name: a.name, avatarUrl: a.avatarUrl }))} />
        </div>
      )}

      {/* Latest Artworks */}
      <section className="my-12 animate-fade-in-up">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight dark:text-gray-100">Latest Artworks</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Discover fresh pieces from our talented artists</p>
          </div>
          <Link
            href="/site/galleries"
            className="inline-flex items-center gap-2 text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 font-medium group transition-colors"
          >
            <span>View All</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>

        {latest.length > 0 ? (
          <div className="gallery-grid">
            {latest.slice(0, 6).map((a) => (
              <ArtworkCard key={a.id} id={a.id} slug={a.slug} title={a.title} imageUrl={a.imageUrl} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 dark:bg-[#1a1a24] rounded-2xl transition-colors">
            <div className="text-6xl mb-4">🎨</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No artworks yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Be the first to upload amazing artwork!</p>
            <Link
              href="/auth/artist-signup"
              className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all"
            >
              <Sparkles className="size-5" />
              Get Started
            </Link>
          </div>
        )}
      </section>

      {/* Trending Now – ranked by likes + comments */}
      {trending.length > 0 && (
        <section className="my-12 animate-fade-in-up">
          <h2 className="text-2xl font-bold mb-6 dark:text-gray-100">Trending Now</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {trending.map((a) => (
              <FeedCard
                key={a.id}
                title={a.title}
                author={a.uploader?.name || "Featured Artist"}
                avatarUrl={a.uploader?.avatarUrl}
                imageUrl={a.imageUrl}
                likesCount={a._count.likes}
                commentsCount={a._count.comments}
              />
            ))}
          </div>
        </section>
      )}

      {/* Highest Rated Artists – below trending */}
      {topArtists.length > 0 && (
        <section className="my-12 animate-fade-in-up">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold tracking-tight dark:text-gray-100 flex items-center gap-3">
                <span className="p-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg">
                  <Star className="size-5 text-white fill-white" />
                </span>
                Highest Rated Artists
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Ranked by confirmed orders &amp; community appreciation</p>
            </div>
            <Link
              href="/site/commissions"
              className="inline-flex items-center gap-2 text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 font-medium group transition-colors"
            >
              <span>Commission an Artist</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {topArtists.map((artist, idx) => {
              const score = artist.orderCount + artist._count.profileLikes;
              const medals = ["🥇", "🥈", "🥉"];
              return (
                <div
                  key={artist.id}
                  className="group relative bg-white dark:bg-[#1a1a24] rounded-2xl border border-gray-200 dark:border-gray-700 p-5 hover:border-teal-400 dark:hover:border-teal-600 hover:shadow-lg transition-all duration-300 overflow-hidden"
                >
                  {idx < 3 && (
                    <div className="absolute top-3 right-3 text-xl" title={`Ranked #${idx + 1}`}>
                      {medals[idx]}
                    </div>
                  )}
                  {idx === 0 && (
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 pointer-events-none" />
                  )}
                  <div className="relative flex items-center gap-4 mb-4">
                    <div className="relative w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-teal-400 to-emerald-500 flex-shrink-0 border-2 border-white dark:border-gray-800 shadow-md">
                      {artist.avatarUrl ? (
                        <Image src={artist.avatarUrl} alt={artist.name || "Artist"} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Palette className="w-6 h-6 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 dark:text-gray-100 truncate">
                        {artist.name || "Anonymous Artist"}
                      </h3>
                      {artist.bio && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">{artist.bio}</p>
                      )}
                    </div>
                  </div>
                  <div className="relative flex items-center gap-4 text-sm mb-4">
                    <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                      <ShoppingBag className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{artist.orderCount}</span>
                      <span>orders</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                      <Heart className="w-4 h-4 text-pink-500" />
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{artist._count.profileLikes}</span>
                      <span>likes</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                      <Palette className="w-4 h-4 text-purple-500" />
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{artist._count.uploadedArtworks}</span>
                      <span>works</span>
                    </div>
                  </div>
                  <div className="relative flex items-center justify-between">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-full">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span className="text-xs font-bold text-amber-700 dark:text-amber-400">{score} pts</span>
                    </div>
                    <Link
                      href={`/site/commissions?artistId=${artist.id}`}
                      className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline"
                    >
                      Commission →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <div className="my-12 sm:my-16 text-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#1a1a24] dark:to-[#141418] rounded-2xl sm:rounded-3xl p-8 sm:p-10 lg:p-12 animate-scale-in transition-colors">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-teal-600 to-emerald-600 rounded-xl sm:rounded-2xl mb-4 sm:mb-6 shadow-lg">
            <Sparkles className="size-6 sm:size-7 lg:size-8 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">
            Ready to Start Your Collection?
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 px-4">
            Join thousands of art enthusiasts discovering and collecting extraordinary pieces from talented artists worldwide.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link
              href="/site/galleries"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base text-white font-semibold hover:from-teal-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Palette className="size-4 sm:size-5" />
              Explore Galleries
            </Link>
            <Link
              href="/auth/artist-signup"
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1a1a24] px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base text-gray-900 dark:text-gray-100 font-semibold hover:border-teal-600 dark:hover:border-teal-400 hover:text-teal-700 dark:hover:text-teal-400 transition-all duration-300"
            >
              <TrendingUp className="size-4 sm:size-5" />
              Join as Artist
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
