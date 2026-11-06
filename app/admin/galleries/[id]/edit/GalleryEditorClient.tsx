"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  ExternalLink,
  Images,
  Plus,
  Trash2,
  X,
  Palette,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import GalleryDeleteButton from "@/components/GalleryDeleteButton";

interface ArtworkSummary {
  id: string;
  title: string;
  slug: string;
  imageUrl: string;
  originalPrice: number | null;
}

interface GalleryData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  artworks: Array<{
    artworkId: string;
    artwork: ArtworkSummary;
  }>;
}

interface GalleryEditorClientProps {
  gallery: GalleryData;
  allArtworks: ArtworkSummary[];
}

export default function GalleryEditorClient({
  gallery,
  allArtworks,
}: GalleryEditorClientProps) {
  const router = useRouter();

  const [name, setName] = useState(gallery.name);
  const [description, setDescription] = useState(gallery.description || "");
  const [savingDetails, setSavingDetails] = useState(false);
  const [detailsSaved, setDetailsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set of artwork IDs in this gallery
  const [assignedIds, setAssignedIds] = useState<string[]>(
    gallery.artworks.map((a) => a.artworkId)
  );
  const [updatingArtworkId, setUpdatingArtworkId] = useState<string | null>(null);

  const assignedArtworks = allArtworks.filter((a) => assignedIds.includes(a.id));
  const unassignedArtworks = allArtworks.filter((a) => !assignedIds.includes(a.id));

  // Save gallery name & description
  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingDetails(true);
    setError(null);
    setDetailsSaved(false);

    try {
      const res = await fetch(`/api/galleries/${gallery.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update gallery details");
      }

      setDetailsSaved(true);
      toast.success("Gallery details saved successfully!");
      setTimeout(() => setDetailsSaved(false), 3000);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to save details");
      toast.error(err.message || "Failed to save details");
    } finally {
      setSavingDetails(false);
    }
  };

  // Add artwork to gallery
  const handleAddArtwork = async (artworkId: string) => {
    setUpdatingArtworkId(artworkId);
    setError(null);
    try {
      const res = await fetch(`/api/galleries/${gallery.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addArtworkIds: [artworkId] }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add artwork");
      }

      setAssignedIds((prev) => [...prev, artworkId]);
      toast.success("Artwork added to this gallery");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to add artwork");
      toast.error(err.message || "Failed to add artwork");
    } finally {
      setUpdatingArtworkId(null);
    }
  };

  // Remove artwork from gallery
  const handleRemoveArtwork = async (artworkId: string) => {
    setUpdatingArtworkId(artworkId);
    setError(null);
    try {
      const res = await fetch(`/api/galleries/${gallery.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ removeArtworkIds: [artworkId] }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to remove artwork");
      }

      setAssignedIds((prev) => prev.filter((id) => id !== artworkId));
      toast.success("Artwork removed from this gallery");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to remove artwork");
      toast.error(err.message || "Failed to remove artwork");
    } finally {
      setUpdatingArtworkId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50/30 dark:from-[#0f0f12] dark:to-[#1a1a24] transition-colors py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <Link
            href="/admin/galleries"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors group"
          >
            <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
            Back to Galleries
          </Link>

          <Link
            href={`/site/galleries/${gallery.slug}`}
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-[#1a1a24] border border-gray-200 dark:border-gray-800 text-xs font-semibold text-teal-700 dark:text-teal-400 hover:border-teal-500 shadow-sm transition-all"
          >
            <span>View Public Page</span>
            <ExternalLink className="size-3.5" />
          </Link>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 p-4 text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Gallery Info Editor Form */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-[#1a1a24] rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm sticky top-24 transition-colors">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl text-white shadow-md">
                  <Images className="size-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    Gallery Details
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Edit title and description
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveDetails} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">
                    Gallery Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#141418] text-gray-900 dark:text-gray-100 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={gallery.slug}
                    disabled
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-xs cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    placeholder="Describe this collection..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#141418] text-gray-900 dark:text-gray-100 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingDetails}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm transition-all shadow-sm disabled:opacity-50"
                >
                  {detailsSaved ? (
                    <>
                      <Check className="size-4" />
                      <span>Saved!</span>
                    </>
                  ) : savingDetails ? (
                    "Saving..."
                  ) : (
                    "Save Details"
                  )}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Total Artworks:</span>
                <span className="font-bold text-gray-900 dark:text-gray-100">
                  {assignedIds.length}
                </span>
              </div>

              {/* Danger Zone: Delete Gallery */}
              <div className="mt-6 pt-6 border-t border-red-100 dark:border-red-900/30">
                <p className="text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-400 mb-2">
                  Danger Zone
                </p>
                <GalleryDeleteButton
                  galleryId={gallery.id}
                  galleryName={name}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-semibold transition-all"
                />
              </div>
            </div>
          </div>

          {/* Artworks Management */}
          <div className="lg:col-span-2 space-y-8">
            {/* Current Artworks In Gallery */}
            <div className="bg-white dark:bg-[#1a1a24] rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm transition-colors">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Palette className="size-4 text-teal-600 dark:text-teal-400" />
                  In This Gallery ({assignedArtworks.length})
                </h3>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Visible to collectors in this collection
                </span>
              </div>

              {assignedArtworks.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No artworks added to this gallery yet.
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Choose from available artworks below to add them.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {assignedArtworks.map((art) => (
                    <div
                      key={art.id}
                      className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-teal-300 dark:hover:border-teal-700/50 bg-gray-50/50 dark:bg-[#141418] transition-all group"
                    >
                      <div className="relative size-14 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-800 flex-shrink-0">
                        <Image
                          src={art.imageUrl}
                          alt={art.title}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {art.title}
                        </h4>
                        <p className="text-xs text-teal-600 dark:text-teal-400 font-medium">
                          {art.originalPrice
                            ? `${art.originalPrice.toLocaleString()} RWF`
                            : "Price not set"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveArtwork(art.id)}
                        disabled={updatingArtworkId === art.id}
                        className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                        title="Remove from this gallery"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Available Artworks to Add */}
            <div className="bg-white dark:bg-[#1a1a24] rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm transition-colors">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Sparkles className="size-4 text-emerald-600 dark:text-emerald-400" />
                  Available Artworks ({unassignedArtworks.length})
                </h3>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Click to add to this gallery
                </span>
              </div>

              {unassignedArtworks.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    All your catalog artworks are already in this gallery!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {unassignedArtworks.map((art) => (
                    <div
                      key={art.id}
                      className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#181822] hover:border-emerald-300 dark:hover:border-emerald-700/50 transition-all group"
                    >
                      <div className="relative size-14 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-800 flex-shrink-0">
                        <Image
                          src={art.imageUrl}
                          alt={art.title}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {art.title}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {art.originalPrice
                            ? `${art.originalPrice.toLocaleString()} RWF`
                            : "—"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddArtwork(art.id)}
                        disabled={updatingArtworkId === art.id}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white text-xs font-semibold transition-all border border-emerald-200 dark:border-emerald-800/60"
                        title="Add to gallery"
                      >
                        <Plus className="size-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

