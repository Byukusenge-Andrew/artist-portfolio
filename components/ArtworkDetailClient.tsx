// components/ArtworkDetailClient.tsx
"use client";

import { AddToCartButton } from "@/components/AddToCartButton";
import FavoriteButton from "@/components/FavoriteButton";
import { ArtworkImage } from "@/components/ArtworkImage";
import { ArtworkCard } from "@/components/ArtworkCard";
import { ShareButton } from "@/components/ShareButton";
import { Tag, Calendar, Palette, Sparkles } from "lucide-react";
import Link from "next/link";
import ArtworkDeleteButton from "@/components/ArtworkDeleteButton";
import { useRouter } from "next/navigation";

type Artwork = {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  imageUrl: string;
  width?: number | null;
  height?: number | null;
  createdAt: string; // ← Now string (ISO)
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

import LikeButton from "@/components/LikeButton";
import CommentSection from "@/components/CommentSection";

export default function ArtworkDetailClient({
  artwork,
  relatedArtworks,
  isAdmin,
  isOwner,
  currentUserId,
  initialLikes,
  initialIsLiked
}: Props) {
  const router = useRouter();

  const handleDelete = () => {
    router.push("/galleries");
    router.refresh();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 animate-fade-in-up">
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Admin Delete */}
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

        {/* Image */}
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
            {artwork.artist && (
              <div className="mb-6 p-5 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                <div className="flex items-center gap-4 mb-3">
                  {artwork.artist.avatarUrl ? (
                    <img
                      src={artwork.artist.avatarUrl}
                      alt={artwork.artist.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-purple-200"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-purple-200 flex items-center justify-center border-2 border-purple-300">
                      <Palette className="size-8 text-purple-600" />
                    </div>
                  )}
                  <div>
                    <div className="text-sm text-purple-700 font-medium mb-1">Artist</div>
                    <h3 className="text-lg font-bold text-gray-900">{artwork.artist.name}</h3>
                  </div>
                </div>
                {artwork.artist.bio && (
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {artwork.artist.bio}
                  </p>
                )}
              </div>
            )}

            {artwork.description && (
              <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
                {artwork.description}
              </p>
            )}
          </div>

          {/* Pricing */}
          <div className="border-t border-gray-200 pt-6 space-y-4">
            {artwork.isOriginalAvailable && artwork.originalPriceCents && (
              <div className="p-6 bg-gradient-to-br from-teal-50 via-emerald-50 to-teal-50 rounded-xl border border-teal-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Original Artwork</h3>
                    <p className="text-sm text-gray-600">One of a kind piece</p>
                  </div>
                  <div className="text-3xl font-bold text-teal-700">
                    {(artwork.originalPriceCents / 100).toLocaleString()} RWF
                  </div>
                </div>
                <AddToCartButton
                  productType="ORIGINAL"
                  artworkId={artwork.id}
                  title={artwork.title}
                  imageUrl={artwork.imageUrl}
                  price={artwork.originalPriceCents}
                  label="Add Original to Cart"
                />
              </div>
            )}

            {artwork.printEnabled && artwork.printOptions.length > 0 && (
              <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Prints</h3>
                <div className="space-y-3">
                  {artwork.printOptions.map((opt) => (
                    <div
                      key={opt.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div>
                        <div className="font-medium text-gray-900">{opt.name}</div>
                        <div className="text-sm text-gray-600">
                          {(opt.priceCents / 100).toLocaleString()} RWF
                        </div>
                      </div>
                      <AddToCartButton
                        productType="PRINT"
                        printOptionId={opt.id}
                        title={`${artwork.title} - ${opt.name}`}
                        imageUrl={artwork.imageUrl}
                        price={opt.priceCents}
                        label="Add to Cart"
                        className="text-sm px-4 py-2"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!artwork.isOriginalAvailable && !artwork.printEnabled && (
              <div className="p-6 bg-gray-50 rounded-xl text-center">
                <p className="text-gray-600">This artwork is currently not available for purchase.</p>
                <Link href="/site/galleries" className="inline-block mt-4 text-teal-600 hover:text-teal-700 font-medium">
                  Browse more artworks
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related */}
      {relatedArtworks.length > 0 && (
        <section className="mt-16 border-t border-gray-200 pt-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-gradient-to-br from-teal-600 to-emerald-600 rounded-lg">
              <Sparkles className="size-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">You May Also Like</h2>
              <p className="text-gray-600">Similar artworks based on style and theme</p>
            </div>
          </div>
          <div className="gallery-grid">
            {relatedArtworks.map((art) => (
              <ArtworkCard key={art.id} id={art.id} slug={art.slug} title={art.title} imageUrl={art.imageUrl} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}