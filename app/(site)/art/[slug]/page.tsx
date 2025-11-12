import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AddToCartButton } from "@/components/AddToCartButton";
import FavoriteButton from "@/components/FavoriteButton";
import { ArtworkImage } from "@/components/ArtworkImage";
import { ArtworkCard } from "@/components/ArtworkCard";
import { ShareButton } from "@/components/ShareButton";
import { Tag, Calendar, Palette, Sparkles } from "lucide-react";
import Link from "next/link";

export default async function ArtworkDetailPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;

  const artwork = await prisma.artwork.findUnique({
    where: { slug },
    include: { printOptions: true },
  });

  if (!artwork) return notFound();

  const tags = artwork.tags && Array.isArray(artwork.tags) ? artwork.tags as string[] : [];

  // Fetch related artworks based on tags (fallback to recent if no tag matches)
  let relatedArtworks: Array<{
    id: string;
    slug: string;
    title: string;
    imageUrl: string;
  }> = [];
  
  if (tags.length > 0) {
    // Try to find artworks with matching tags
    const allArtworks: Array<{
      id: string;
      slug: string;
      title: string;
      imageUrl: string;
      tags: unknown;
    }> = await prisma.artwork.findMany({
      where: { id: { not: artwork.id } },
      select: {
        id: true,
        slug: true,
        title: true,
        imageUrl: true,
        tags: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    
    // Filter artworks that have at least one matching tag
    relatedArtworks = allArtworks
      .filter(art => {
        const artTags = art.tags && Array.isArray(art.tags) ? art.tags as string[] : [];
        return artTags.some(tag => tags.includes(tag));
      })
      .slice(0, 4)
      .map(art => ({
        id: art.id,
        slug: art.slug,
        title: art.title,
        imageUrl: art.imageUrl,
      }));
  }
  
  // If no related artworks found, get recent ones
  if (relatedArtworks.length === 0) {
    relatedArtworks = await prisma.artwork.findMany({
      where: { id: { not: artwork.id } },
      take: 4,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        slug: true,
        title: true,
        imageUrl: true,
      }
    });
  }


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 animate-fade-in-up">
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Image Section */}
        <div className="space-y-4">
          <ArtworkImage imageUrl={artwork.imageUrl} title={artwork.title} />
          
          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <FavoriteButton artworkId={artwork.id} artworkTitle={artwork.title} />
            <ShareButton 
              url={`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/art/${artwork.slug}`}
              title={artwork.title}
            />
          </div>
        </div>

        {/* Details Section */}
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{artwork.title}</h1>
            
            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
              {artwork.createdAt && (
                <div className="flex items-center gap-2">
                  <Calendar className="size-4" />
                  <span>{new Date(artwork.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              )}
              {artwork.width && artwork.height && (
                <div className="flex items-center gap-2">
                  <Palette className="size-4" />
                  <span>{artwork.width} × {artwork.height} px</span>
                </div>
              )}
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap mb-6">
                <Tag className="size-4 text-gray-500" />
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-gradient-to-br from-teal-50 to-emerald-50 text-teal-700 rounded-full text-sm font-medium border border-teal-100"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Description */}
            {artwork.description && (
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
                  {artwork.description}
                </p>
              </div>
            )}
          </div>

          {/* Pricing Section */}
          <div className="border-t border-gray-200 pt-6 space-y-4">
            {artwork.isOriginalAvailable && artwork.originalPriceCents && (
              <div className="p-6 bg-gradient-to-br from-teal-50 via-emerald-50 to-teal-50 rounded-xl border border-teal-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Original Artwork</h3>
                    <p className="text-sm text-gray-600">One of a kind piece</p>
                  </div>
                  <div className="text-3xl font-bold text-teal-700">
                    ${(artwork.originalPriceCents / 100).toFixed(2)}
                  </div>
                </div>
                <AddToCartButton
                  payload={{ productType: "ORIGINAL", artworkId: artwork.id, quantity: 1 }}
                  label="Add Original to Cart"
                />
              </div>
            )}

            {artwork.printEnabled && artwork.printOptions.length > 0 && (
              <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Prints</h3>
                <div className="space-y-3">
                  {artwork.printOptions.map((opt) => (
                    <div key={opt.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div>
                        <div className="font-medium text-gray-900">{opt.name}</div>
                        <div className="text-sm text-gray-600">${(opt.priceCents / 100).toFixed(2)}</div>
                      </div>
                      <AddToCartButton
                        payload={{ productType: "PRINT", printOptionId: opt.id, quantity: 1 }}
                        label="Add to Cart"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!artwork.isOriginalAvailable && !artwork.printEnabled && (
              <div className="p-6 bg-gray-50 rounded-xl text-center">
                <p className="text-gray-600">This artwork is currently not available for purchase.</p>
                <Link 
                  href="/galleries" 
                  className="inline-block mt-4 text-teal-600 hover:text-teal-700 font-medium"
                >
                  Browse more artworks →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related Artworks Section */}
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
              <ArtworkCard
                key={art.id}
                id={art.id}
                slug={art.slug}
                title={art.title}
                imageUrl={art.imageUrl}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}


