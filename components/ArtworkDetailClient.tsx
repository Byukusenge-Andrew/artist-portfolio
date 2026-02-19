// components/ArtworkDetailClient.tsx
"use client";

import FavoriteButton from "@/components/FavoriteButton";
import { ArtworkImage } from "@/components/ArtworkImage";
import { ShareButton } from "@/components/ShareButton";
import { Tag, Calendar, Palette } from "lucide-react";
import Link from "next/link";
import ArtworkDeleteButton from "@/components/ArtworkDeleteButton";
import { useRouter } from "next/navigation";
import LikeButton from "@/components/LikeButton";
import CommentSection from "@/components/CommentSection";
import ArtworkPricing from "@/components/ArtworkPricing";
import ArtistProfile from "@/components/ArtistProfile";
import RelatedArtworks from "@/components/RelatedArtworks";

type Artwork = {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  imageUrl: string;
  width?: number | null;
  height?: number | null;
  createdAt: string;
  tags: string[];
  isOriginalAvailable: boolean;
  originalPriceCents?: number | null;
  printEnabled: boolean;
  printOptions: Array<{
    id: string;
    name: string;
    priceCents: number;
  }>;
  artist?: {
    id: string;
    name: string;
    avatarUrl?: string | null;
    bio?: string | null;
  } | null;
};

type Props = {
  artwork: Artwork;
  relatedArtworks: Array<{
    id: string;
    slug: string;
    title: string;
    imageUrl: string;
  }>;
  isAdmin: boolean;
  isOwner?: boolean;
  currentUserId?: string;
  initialLikes: number;
  initialIsLiked: boolean;
};

export default function ArtworkDetailClient({
  artwork,
  relatedArtworks,
  isAdmin,
  isOwner,
  currentUserId,
  initialLikes,
  initialIsLiked,
}: Props) {
  const router = useRouter();

  const handleDelete = () => {
    router.push("/galleries");
    router.refresh();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 animate-fade-in-up">
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Admin/Owner Controls */}
        {(isAdmin || isOwner) && (
          <div className="col-span-2 flex justify-end -mt-8 mb-4 gap-2">
            <Link
              href={`/admin/artworks/${artwork.id}/edit`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              <Palette className="size-4" />
              Edit
            </Link>
            {isAdmin && (
              <ArtworkDeleteButton
                artworkId={artwork.id}
                artworkTitle={artwork.title}
                onDelete={handleDelete}
              />
            )}
          </div>
        )}

        {/* Image & Interactions */}
        <div className="space-y-4">
          <ArtworkImage imageUrl={artwork.imageUrl} title={artwork.title} />
          <div className="flex items-center gap-3">
            <LikeButton
              artworkId={artwork.id}
              initialLikes={initialLikes}
              initialIsLiked={initialIsLiked}
            />
            <FavoriteButton artworkId={artwork.id} artworkTitle={artwork.title} />
            <ShareButton
              url={`${process.env.NEXT_PUBLIC_BASE_URL || ""}/art/${artwork.slug}`}
              title={artwork.title}
            />
          </div>
          <CommentSection artworkId={artwork.id} currentUserId={currentUserId} />
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{artwork.title}</h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="size-4" />
                <span>
                  {new Date(artwork.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              {artwork.width && artwork.height && (
                <div className="flex items-center gap-2">
                  <Palette className="size-4" />
                  <span>{artwork.width} × {artwork.height} px</span>
                </div>
              )}
            </div>

            {artwork.tags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap mb-6">
                <Tag className="size-4 text-gray-500" />
                {artwork.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-gradient-to-br from-teal-50 to-emerald-50 text-teal-700 rounded-full text-sm font-medium border border-teal-100"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Artist Profile */}
            {artwork.artist && <ArtistProfile artist={artwork.artist} />}

            {artwork.description && (
              <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
                {artwork.description}
              </p>
            )}
          </div>

          {/* Pricing */}
          <ArtworkPricing
            artworkId={artwork.id}
            title={artwork.title}
            imageUrl={artwork.imageUrl}
            isOriginalAvailable={artwork.isOriginalAvailable}
            originalPriceCents={artwork.originalPriceCents}
            printEnabled={artwork.printEnabled}
            printOptions={artwork.printOptions}
          />
        </div>
      </div>

      {/* Related Artworks */}
      <RelatedArtworks artworks={relatedArtworks} />
    </div>
  );
}