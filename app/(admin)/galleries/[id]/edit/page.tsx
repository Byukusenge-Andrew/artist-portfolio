"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle, Trash2, Plus } from "lucide-react";
import Image from "next/image";

type Gallery = {
  id: string;
  name: string;
  description: string | null;
  artworks: Array<{ artworkId: string; artwork: { id: string; title: string; imageUrl: string } }>;
};

type Artwork = {
  id: string;
  title: string;
  imageUrl: string;
};

export default function EditGalleryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [galleryId, setGalleryId] = useState("");
  const [gallery, setGallery] = useState<Gallery | null>(null);
  const [allArtworks, setAllArtworks] = useState<Artwork[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedArtworkIds, setSelectedArtworkIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    params.then(({ id }) => {
      setGalleryId(id);
      fetchData(id);
    });
  }, [params]);

  async function fetchData(id: string) {
    try {
      const [galleryRes, artworksRes] = await Promise.all([
        fetch(`/api/galleries/${id}`),
        fetch("/api/artworks"),
      ]);

      if (!galleryRes.ok) throw new Error("Failed to fetch gallery");
      if (!artworksRes.ok) throw new Error("Failed to fetch artworks");

      const galleryData = await galleryRes.json();
      const artworksData = await artworksRes.json();

      setGallery(galleryData);
      setName(galleryData.name);
      setDescription(galleryData.description || "");
      setAllArtworks(artworksData);
      setSelectedArtworkIds(
        new Set(galleryData.artworks.map((ag: typeof galleryData.artworks[0]) => ag.artworkId))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const currentIds = new Set(gallery?.artworks.map(ag => ag.artworkId) || []);
      const addIds = Array.from(selectedArtworkIds).filter(id => !currentIds.has(id));
      const removeIds = Array.from(currentIds).filter(id => !selectedArtworkIds.has(id));

      const res = await fetch(`/api/galleries/${galleryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          addArtworkIds: addIds,
          removeArtworkIds: removeIds,
        }),
      });

      if (!res.ok) throw new Error("Failed to save gallery");

      const updated = await res.json();
      setGallery(updated);
      setSuccess("Gallery updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setIsSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600" />
      </div>
    );
  }

  if (!gallery) {
    return <div className="text-center py-12">Gallery not found</div>;
  }

  const unselectedArtworks = allArtworks.filter(a => !selectedArtworkIds.has(a.id));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-bold mb-8">Edit Gallery: {gallery.name}</h1>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-4 flex gap-3">
          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Settings */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4 sticky top-8">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Gallery Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100 resize-vertical"
              />
            </div>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-semibold py-2 rounded-lg hover:from-teal-700 hover:to-emerald-700 transition-all disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Artworks Management */}
        <div className="lg:col-span-2 space-y-8">
          {/* Selected Artworks */}
          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span>Gallery Artworks</span>
              <span className="text-sm font-normal text-gray-500">({selectedArtworkIds.size})</span>
            </h2>

            {selectedArtworkIds.size === 0 ? (
              <p className="text-gray-600 text-center py-8">No artworks in this gallery yet</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {allArtworks
                  .filter(a => selectedArtworkIds.has(a.id))
                  .map(artwork => (
                    <div
                      key={artwork.id}
                      className="rounded-lg border border-gray-200 overflow-hidden bg-white hover:shadow-lg transition-all"
                    >
                      <div className="relative aspect-square bg-gray-100 overflow-hidden">
                        <Image
                          src={artwork.imageUrl}
                          alt={artwork.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4 flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 line-clamp-2">{artwork.title}</h3>
                        </div>
                        <button
                        title="Delete"
                          onClick={() => {
                            const newSet = new Set(selectedArtworkIds);
                            newSet.delete(artwork.id);
                            setSelectedArtworkIds(newSet);
                          }}
                          className="text-red-600 hover:text-red-700 flex-shrink-0"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Add Artworks */}
          {unselectedArtworks.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Plus className="h-5 w-5" />
                <span>Add Artworks</span>
              </h2>

              <div className="grid sm:grid-cols-2 gap-4">
                {unselectedArtworks.map(artwork => (
                  <button
                    key={artwork.id}
                    onClick={() => {
                      const newSet = new Set(selectedArtworkIds);
                      newSet.add(artwork.id);
                      setSelectedArtworkIds(newSet);
                    }}
                    className="rounded-lg border-2 border-dashed border-gray-300 overflow-hidden bg-white hover:border-teal-500 hover:bg-teal-50 transition-all"
                  >
                    <div className="relative aspect-square bg-gray-100 overflow-hidden">
                      <img
                        src={artwork.imageUrl}
                        alt={artwork.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 line-clamp-2">{artwork.title}</h3>
                      <p className="text-xs text-gray-500 mt-2">Click to add</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
