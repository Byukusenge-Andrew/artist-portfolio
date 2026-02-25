"use client";
import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle, Edit2, Trash2, Plus, User as UserIcon, ShieldAlert } from "lucide-react";
import Image from "next/image";

type Artist = {
  id: string;
  name: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
  isActive: boolean;
  isApproved: boolean;
  createdAt: string;
  uploadedArtworks?: Array<{
    id: string;
    title: string;
    slug: string;
    imageUrl: string;
  }>;
};

export default function ArtistsAdminPage() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", bio: "", isActive: true });

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
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to update");
        }
      } else {
        const res = await fetch("/api/artists", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to create");
        }
      }
      await fetchArtists();
      setIsEditing(false);
      setSelectedId(null);
      setFormData({ name: "", email: "", bio: "", isActive: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this artist? This will permanently delete their account.")) return;
    try {
      const res = await fetch(`/api/artists/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      await fetchArtists();
      if (selectedId === id) {
        setSelectedId(null);
        setIsEditing(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  const editingArtist: Artist | null = selectedId ? artists.find(a => a.id === selectedId) ?? null : null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Artist Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage artist user accounts and profiles</p>
        </div>
        <button
          onClick={() => {
            setIsEditing(true);
            setSelectedId(null);
            setFormData({ name: "", email: "", bio: "", isActive: true });
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-teal-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg"
        >
          <Plus className="h-5 w-5" />
          Add Artist
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600" />
          <p className="mt-4 text-gray-500">Loading artists...</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* List */}
          <div className="lg:col-span-1 space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto pr-2 custom-scrollbar">
            {artists.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 dark:bg-[#1a1a24] rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                <UserIcon className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No artists found</p>
              </div>
            ) : (
              artists.map(artist => (
                <button
                  key={artist.id}
                  onClick={() => {
                    setSelectedId(artist.id);
                    setFormData({
                      name: artist.name || "",
                      email: artist.email || "",
                      bio: artist.bio || "",
                      isActive: artist.isActive,
                    });
                    setIsEditing(false);
                    setError("");
                  }}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-4 ${selectedId === artist.id
                    ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20"
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a24] hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                >
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                    {artist.avatarUrl ? (
                      <Image src={artist.avatarUrl} alt={artist.name} fill className="object-cover" />
                    ) : (
                      <UserIcon className="w-6 h-6 m-auto mt-3 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold truncate ${selectedId === artist.id ? 'text-teal-900 dark:text-teal-100' : 'text-gray-900 dark:text-gray-100'}`}>
                      {artist.name || "Unnamed"}
                    </h3>
                    <p className={`text-xs truncate mt-0.5 ${selectedId === artist.id ? 'text-teal-700 dark:text-teal-300' : 'text-gray-500 dark:text-gray-400'}`}>
                      {artist.email}
                    </p>
                    <div className="flex gap-2 mt-2">
                      {!artist.isActive && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                          Inactive
                        </span>
                      )}
                      {!artist.isApproved && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Editor */}
          {isEditing && (
            <div className="lg:col-span-2 bg-white dark:bg-[#1a1a24] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 lg:p-8 sticky top-24 h-fit transition-colors">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
                {selectedId ? (
                  <>
                    <Edit2 className="h-5 w-5 text-teal-600" />
                    Edit Artist Profile
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5 text-teal-600" />
                    Add New Artist
                  </>
                )}
              </h2>

              {!selectedId && (
                <div className="mb-6 p-4 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-900/30 rounded-lg text-sm text-teal-800 dark:text-teal-300">
                  <p className="font-medium mb-1">Creating a new artist account:</p>
                  <p>A random password will be generated for this user. They can set their own password by using the &quot;Forgot Password&quot; feature on the login page.</p>
                </div>
              )}

              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#141418] text-gray-900 dark:text-gray-100 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100 dark:focus:ring-teal-900/30 transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      disabled={!!selectedId} // Often better not to change emails directly, or do it carefully
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#141418] text-gray-900 dark:text-gray-100 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100 dark:focus:ring-teal-900/30 transition-all ${selectedId ? 'opacity-60 cursor-not-allowed' : ''}`}
                      required
                    />
                    {selectedId && <p className="text-xs text-gray-500 mt-1">Email cannot be changed after creation.</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={6}
                    placeholder="Tell us about the artist..."
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#141418] text-gray-900 dark:text-gray-100 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100 dark:focus:ring-teal-900/30 resize-vertical transition-all"
                  />
                </div>

                {selectedId && (
                  <div className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-[#141418]">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-5 h-5 text-teal-600 rounded border-gray-300 focus:ring-teal-500 dark:focus:ring-offset-gray-900"
                    />
                    <div>
                      <label htmlFor="isActive" className="font-medium text-gray-900 dark:text-gray-100 block">Active Account</label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">If unchecked, the artist will not be able to log in and their profile will be hidden.</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <button
                    onClick={handleSave}
                    disabled={!formData.name || !formData.email}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-teal-700 hover:to-emerald-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      if (!selectedId) {
                        setFormData({ name: "", email: "", bio: "", isActive: true });
                      } else if (editingArtist) {
                        setFormData({
                          name: editingArtist.name || "",
                          email: editingArtist.email || "",
                          bio: editingArtist.bio || "",
                          isActive: editingArtist.isActive,
                        });
                      }
                    }}
                    className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-[#1a1a24] border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* View */}
          {selectedId && !isEditing && editingArtist && (
            <div className="lg:col-span-2 bg-white dark:bg-[#1a1a24] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden sticky top-24 h-fit transition-colors">
              {/* Cover/Header area */}
              <div className="h-24 bg-gradient-to-r from-teal-600 to-emerald-600"></div>

              <div className="px-6 pb-6 lg:px-8 lg:pb-8 relative">
                {/* Avatar */}
                <div className="absolute -top-12 left-6 lg:left-8 w-24 h-24 rounded-full border-4 border-white dark:border-[#1a1a24] bg-gray-100 overflow-hidden shadow-md">
                  {editingArtist.avatarUrl ? (
                    <Image src={editingArtist.avatarUrl} alt={editingArtist.name} fill className="object-cover" />
                  ) : (
                    <UserIcon className="w-12 h-12 m-auto mt-5 text-gray-400" />
                  )}
                </div>

                <div className="flex justify-end pt-4 pb-2">
                  <button
                    title="Edit"
                    onClick={() => {
                      setFormData({
                        name: editingArtist.name || "",
                        email: editingArtist.email || "",
                        bio: editingArtist.bio || "",
                        isActive: editingArtist.isActive,
                      });
                      setIsEditing(true);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit Profile
                  </button>
                </div>

                <div className="mt-2">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                    {editingArtist.name || "Unnamed"}
                    {editingArtist.isApproved && (
                      <span title="Approved"><CheckCircle className="h-5 w-5 text-teal-600" /></span>
                    )}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1 font-medium">{editingArtist.email}</p>

                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${editingArtist.isActive
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                      }`}>
                      {editingArtist.isActive ? 'Active User' : 'Inactive User'}
                    </span>

                    <span className="px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 rounded-full border border-blue-100 dark:border-blue-800/30">
                      Joined {new Date(editingArtist.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {editingArtist.bio && (
                  <div className="mt-8">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-3">Biography</h3>
                    <div className="bg-gray-50 dark:bg-[#141418] p-4 lg:p-6 rounded-xl border border-gray-100 dark:border-gray-800">
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                        {editingArtist.bio}
                      </p>
                    </div>
                  </div>
                )}

                {editingArtist.uploadedArtworks && editingArtist.uploadedArtworks.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-3">
                      Uploaded Artworks ({editingArtist.uploadedArtworks.length})
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {editingArtist.uploadedArtworks.map((artwork: any) => (
                        <a
                          key={artwork.id}
                          href={`/site/${artwork.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-teal-500 dark:hover:border-teal-500 transition-all block"
                        >
                          <Image
                            src={artwork.imageUrl}
                            alt={artwork.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                            <span className="text-white text-xs font-medium truncate w-full">{artwork.title}</span>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {!editingArtist.isApproved && (
                  <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/30 rounded-lg flex items-start gap-3">
                    <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-amber-900 dark:text-amber-400">Pending Approval</h4>
                      <p className="text-sm text-amber-700 dark:text-amber-500 mt-1">
                        This artist needs to be approved before they can publish artworks.
                        You can approve them in the Pending Approvals section or toggle their Active status.
                      </p>
                    </div>
                  </div>
                )}

                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => handleDelete(editingArtist.id)}
                    className="w-full sm:w-auto px-5 py-2.5 bg-white dark:bg-[#1a1a24] text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 rounded-lg font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
