import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { User, Mail, Palette, ArrowLeft } from "lucide-react";
import { ArtworkCard } from "@/components/ArtworkCard";
import LikeButton from "@/components/LikeButton";
import CommentSection from "@/components/CommentSection";
import { cookies } from "next/headers";

export const revalidate = 60;

interface Props {
    params: Promise<{
        id: string;
    }>;
}

export default async function ArtistProfilePage({ params }: Props) {
    const { id } = await params;
    const artist = await prisma.user.findUnique({
        where: {
            id,
            role: "ARTIST",
            isActive: true,
        },
        include: {
            uploadedArtworks: {
                orderBy: { createdAt: "desc" },
                where: { deletedAt: null },
            },
        },
    });

    if (!artist) {
        notFound();
    }

    const cookieStore = await cookies();
    const userSession = cookieStore.get("user_session")?.value;
    const { parseUserSession } = await import("@/lib/auth");
    const currentUser = await parseUserSession(userSession);

    const likeCount = await prisma.like.count({ where: { artistId: artist.id } });
    const isLiked = currentUser?.userId
        ? !!(await prisma.like.findFirst({ where: { artistId: artist.id, userId: currentUser.userId } }))
        : false;

    return (
        <div className="min-h-screen bg-[#f5f5f0]">
            {/* Hero Section / Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                    <div className="mb-8">
                        <Link
                            href="/site/artists"
                            className="inline-flex items-center text-teal-600 hover:text-teal-700 font-medium transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Artists
                        </Link>
                    </div>

                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12">
                        {/* Avatar */}
                        <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-white shadow-xl bg-gray-100 flex-shrink-0">
                            {artist.avatarUrl ? (
                                <Image
                                    src={artist.avatarUrl}
                                    alt={artist.name || "Artist"}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-100 to-emerald-100 text-teal-600">
                                    <User className="w-20 h-20" />
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{artist.name || "Artist"}</h1>

                            {artist.bio && (
                                <p className="text-lg text-gray-600 max-w-2xl leading-relaxed mb-6">
                                    {artist.bio}
                                </p>
                            )}

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full border border-gray-100">
                                    <Palette className="w-4 h-4 text-teal-600" />
                                    <span>{artist.uploadedArtworks.length} Artworks</span>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full border border-gray-100">
                                    <LikeButton
                                        artistId={artist.id}
                                        initialLikes={likeCount}
                                        initialIsLiked={isLiked}
                                    />
                                </div>
                                {/* Email is kept private usually, but if public profile implies contact: */}
                                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full border border-gray-100">
                                    <Mail className="w-4 h-4 text-teal-600" />
                                    <span>Contact via Commission</span>
                                </div>
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="flex-shrink-0">
                            <Link
                                href={`/site/commissions?artistId=${artist.id}`}
                                className="inline-flex items-center justify-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-xl font-semibold hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                            >
                                <Palette className="w-5 h-5" />
                                Request Commission
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Artworks Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                    <span className="w-8 h-1 bg-teal-600 rounded-full"></span>
                    Portfolio
                </h2>

                {artist.uploadedArtworks.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                        <p className="text-gray-500 text-lg">No artworks in portfolio yet.</p>
                    </div>
                ) : (
                    <div className="gallery-grid">
                        {artist.uploadedArtworks.map((artwork: any) => (
                            <ArtworkCard
                                key={artwork.id}
                                id={artwork.id}
                                slug={artwork.slug}
                                title={artwork.title}
                                imageUrl={artwork.imageUrl}
                                price={artwork.originalPriceCents}
                                artistName={artist.name || undefined}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Comments Section */}
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                <CommentSection artistId={artist.id} currentUserId={currentUser?.userId} />
            </div>
        </div>
    );
}
