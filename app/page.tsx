import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ArtworkCard } from "@/components/ArtworkCard";
import Stories from "@/components/Stories";
import FeedCard from "@/components/FeedCard";
import { Sparkles, TrendingUp, Palette, Users } from "lucide-react";
import Image from "next/image";

export default async function Home() {
  const latest = await prisma.artwork.findMany({
    orderBy: { createdAt: "desc" },
    take: 12,
  });
  
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

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl my-10 animate-fade-in ">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500 via-emerald-500 to-cyan-600 opacity-90"></div>
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="relative z-10 p-8 md:p-16 grid gap-8 md:grid-cols-2 items-center">
          <div className="text-white space-y-6 animate-slide-in-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-4 py-2 text-sm font-medium border border-white/30">
              <Sparkles className="size-4" />
              <span>Welcome to Artelier</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight">
              Discover & Collect
              <br />
              <span className="bg-gradient-to-r from-yellow-200 via-pink-200 to-purple-200 bg-clip-text text-transparent">
                Exceptional Art
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-white/90 leading-relaxed max-w-xl">
              Join a vibrant community of artists and collectors. Explore stunning artworks, 
              support creators, and build your personal collection.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link 
                href="/galleries" 
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-teal-700 font-semibold hover:bg-gray-50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
              >
                <Palette className="size-5 group-hover:rotate-12 transition-transform" />
                Explore Galleries
              </Link>
              <Link 
                href="/admin/signup" 
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/30 backdrop-blur-sm bg-white/10 px-8 py-4 text-white font-semibold hover:bg-white/20 transition-all duration-300"
              >
                <TrendingUp className="size-5" />
                Become an Artist
              </Link>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-8 pt-6 border-t border-white/20">
              <div>
                <div className="text-3xl font-bold">{latest.length}+</div>
                <div className="text-sm text-white/80">Artworks</div>
              </div>
              <div>
                <div className="text-3xl font-bold">{artists.length}+</div>
                <div className="text-sm text-white/80">Artists</div>
              </div>
              <div>
                <div className="text-3xl font-bold">1000+</div>
                <div className="text-sm text-white/80">Collectors</div>
              </div>
            </div>
          </div>

          <div className="relative h-64 md:h-96 animate-scale-in">
            <div className="absolute inset-0 grid grid-cols-2 gap-4">
              {latest.slice(0, 4).map((art, idx) => (
                <div 
                  key={art.id} 
                  className="relative rounded-2xl overflow-hidden shadow-2xl hover:scale-105 transition-transform duration-300"
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
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
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
            <h2 className="text-3xl font-bold tracking-tight">Latest Artworks</h2>
            <p className="text-gray-600 mt-1">Discover fresh pieces from our talented artists</p>
          </div>
          <Link 
            href="/galleries" 
            className="inline-flex items-center gap-2 text-teal-700 hover:text-teal-800 font-medium group transition-colors"
          >
            <span>View All</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
        
        {latest.length > 0 ? (
          <div className="gallery-grid">
            {latest.slice(0, 6).map((a: { id: string; slug: string; imageUrl: string; title: string }) => (
              <ArtworkCard key={a.id} id={a.id} slug={a.slug} title={a.title} imageUrl={a.imageUrl} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-2xl">
            <div className="text-6xl mb-4">🎨</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No artworks yet</h3>
            <p className="text-gray-600 mb-6">Be the first to upload amazing artwork!</p>
            <Link 
              href="/admin/signup"
              className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all"
            >
              <Sparkles className="size-5" />
              Get Started
            </Link>
          </div>
        )}
      </section>

      {/* Feature cards (only show uploaded artworks; otherwise placeholder with no image) */}
      {latest.length > 2 && (
        <section className="my-12 animate-fade-in-up">
          <h2 className="text-2xl font-bold mb-6">Trending Now</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {latest.slice(0, 2).map((a: { id: string; title: string; imageUrl: string }) => (
              <FeedCard key={a.id} title={a.title} author="Featured Artist" imageUrl={a.imageUrl} />
            ))}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <div className="my-16 text-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-12 animate-scale-in">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-600 to-emerald-600 rounded-2xl mb-6 shadow-lg">
            <Sparkles className="size-8 text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Ready to Start Your Collection?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of art enthusiasts discovering and collecting extraordinary pieces from talented artists worldwide.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/galleries" 
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-8 py-4 text-white font-semibold hover:from-teal-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Palette className="size-5" />
              Explore Galleries
            </Link>
            <Link 
              href="/admin/signup" 
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-gray-300 bg-white px-8 py-4 text-gray-900 font-semibold hover:border-teal-600 hover:text-teal-700 transition-all duration-300"
            >
              <TrendingUp className="size-5" />
              Join as Artist
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
