// app/site/artist/page.tsx
import { prisma } from "@/lib/prisma";
import { Mail, Phone, Palette, Sparkles, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default async function ArtistsPage() {
    // Get all artists
    const artists = await prisma.artist.findMany({
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
            {/* Hero Section */}
            <div className="text-center mb-16 animate-fade-in">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-600 to-emerald-600 rounded-2xl mb-6 shadow-lg">
                    <Palette className="size-8 text-white" />
                </div>
                <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4">
                    Our Artists
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Meet the talented creators behind our exceptional artworks
                </p>

                {/* Artist count */}
                <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-50 to-emerald-50 px-6 py-3 border border-teal-200">
                    <Sparkles className="size-5 text-teal-600" />
                    <span className="text-gray-700 font-medium">
                        {artists.length} {artists.length === 1 ? "Artist" : "Artists"}
                    </span>
                </div>
            </div>

            {/* Artists Grid */}
            {artists.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-3xl animate-scale-in">
                    <div className="text-6xl mb-4">👨‍🎨</div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">No artists yet</h3>
                    <p className="text-gray-600 mb-8">Check back soon to meet our talented creators</p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all"
                    >
                        <Palette className="size-5" />
                        Back to Home
                    </Link>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in-up">
                    {artists.map((artist, idx) => (
                        <div
                            key={artist.id}
                            style={{ animationDelay: `${idx * 0.1}s` }}
                            className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-scale-in"
                        >
                            {/* Artist Avatar */}
                            <div className="relative h-64 bg-gradient-to-br from-teal-100 via-emerald-100 to-cyan-100 overflow-hidden">
                                {artist.avatarUrl ? (
                                    <Image
                                        src={artist.avatarUrl}
                                        alt={artist.name}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                                        sizes="(max-width: 768px) 100vw, 33vw"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-teal-600 to-emerald-600 flex items-center justify-center shadow-2xl">
                                            <User className="size-16 text-white" />
                                        </div>
                                    </div>
                                )}

                                {/* Overlay on hover */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>

                            {/* Artist Info */}
                            <div className="p-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-teal-700 transition-colors">
                                    {artist.name}
                                </h2>

                                {artist.bio && (
                                    <p className="text-gray-600 mb-4 line-clamp-3 text-sm leading-relaxed">
                                        {artist.bio}
                                    </p>
                                )}

                                {/* Contact Info */}
                                <div className="space-y-2 mb-4">
                                    {artist.email && (
                                        <a
                                            href={`mailto:${artist.email}`}
                                            className="flex items-center gap-2 text-sm text-gray-600 hover:text-teal-700 transition-colors"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <Mail className="size-4" />
                                            <span className="truncate">{artist.email}</span>
                                        </a>
                                    )}
                                    {artist.phone && (
                                        <a
                                            href={`tel:${artist.phone}`}
                                            className="flex items-center gap-2 text-sm text-gray-600 hover:text-teal-700 transition-colors"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <Phone className="size-4" />
                                            <span>{artist.phone}</span>
                                        </a>
                                    )}
                                </div>

                                {/* View Profile Button */}
                                <div className="pt-4 border-t border-gray-100">
                                    <span className="inline-flex items-center gap-2 text-teal-600 font-semibold text-sm group-hover:gap-3 transition-all">
                                        View Profile
                                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* CTA Section */}
            {artists.length > 0 && (
                <div className="mt-20 text-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-12 animate-scale-in">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        Want to Work with Our Artists?
                    </h2>
                    <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                        Commission a custom piece or explore our gallery of existing artworks
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/site/commissions"
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-8 py-4 text-white font-semibold hover:from-teal-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                        >
                            <Palette className="size-5" />
                            Request a Commission
                        </Link>
                        <Link
                            href="/site/galleries"
                            className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-gray-300 bg-white px-8 py-4 text-gray-900 font-semibold hover:border-teal-600 hover:text-teal-700 transition-all duration-300"
                        >
                            Browse Artworks
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
