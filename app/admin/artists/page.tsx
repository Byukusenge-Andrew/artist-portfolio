"use client";
import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle, Edit2, Trash2, Plus } from "lucide-react";

type Artist = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  bio?: string;
  avatarUrl?: string;
};

export default function ArtistsAdminPage() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", bio: "" });

  useEffect(() => {
    fetchArtists();
  }, []);

  async function fetchArtists() {
    try {
      const res = await fetch("/api/artists");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setArtists(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch artists");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      setError("");
      if (selectedId && isEditing) {
        const res = await fetch(`/api/artists/${selectedId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error("Failed to update");
      } else {
        const res = await fetch("/api/artists", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error("Failed to create");
      }
      await fetchArtists();
      setIsEditing(false);
      setSelectedId(null);
      setFormData({ name: "", email: "", phone: "", bio: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this artist?")) return;
    try {
      const res = await fetch(`/api/artists/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      await fetchArtists();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  const editingArtist: Artist | null = selectedId ? artists.find(a => a.id === selectedId) ?? null : null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Artist Management</h1>
        <button
          onClick={() => {
            setIsEditing(true);
            setSelectedId(null);
            setFormData({ name: "", email: "", phone: "", bio: "" });
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-teal-700 hover:to-emerald-700 transition-all"
        >
          <Plus className="h-5 w-5" />
          Add Artist
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* List */}
          <div className="lg:col-span-1 space-y-3">
            {artists.map(artist => (
              <button
                key={artist.id}
                onClick={() => {
                  setSelectedId(artist.id);
                  setFormData({
                    name: artist.name,
                    email: artist.email || "",
                    phone: artist.phone || "",
                    bio: artist.bio || "",
                  });
                  setIsEditing(false);
                }}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  selectedId === artist.id
                    ? "border-teal-500 bg-teal-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <h3 className="font-semibold text-gray-900">{artist.name}</h3>
                {artist.email && (
                  <p className="text-xs text-gray-600 mt-1">{artist.email}</p>
                )}
              </button>
            ))}
          </div>

          {/* Editor */}
          {isEditing && (
            <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6 sticky top-8 h-fit">
              <h2 className="text-xl font-bold mb-6">
                {selectedId ? `Edit ${editingArtist?.name || "Artist"}` : "New Artist"}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={5}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100 resize-vertical"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleSave}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-teal-700 hover:to-emerald-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setSelectedId(null);
                    }}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* View */}
          {selectedId && !isEditing && editingArtist && (
            <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6 sticky top-8 h-fit">
              <div className="flex items-start justify-between mb-6">
                <h2 className="text-xl font-bold">{editingArtist.name}</h2>
                <button
                title="Edit"
                  onClick={() => {
                    setFormData({
                      name: editingArtist.name,
                      email: editingArtist.email || "",
                      phone: editingArtist.phone || "",
                      bio: editingArtist.bio || "",
                    });
                    setIsEditing(true);
                  }}
                  className="p-2 text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all"
                >
                  <Edit2 className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                {editingArtist.email && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase">Email</p>
                    <p className="text-gray-900 mt-1">{editingArtist.email}</p>
                  </div>
                )}

                {editingArtist.phone && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase">Phone</p>
                    <p className="text-gray-900 mt-1">{editingArtist.phone}</p>
                  </div>
                )}

                {editingArtist.bio && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase">Bio</p>
                    <p className="text-gray-900 mt-1 whitespace-pre-wrap">{editingArtist.bio}</p>
                  </div>
                )}
              </div>

              <button
                onClick={() => handleDelete(editingArtist.id)}
                className="mt-6 w-full px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition-all flex items-center justify-center gap-2"
              >
                <Trash2 className="h-5 w-5" />
                Delete Artist
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
