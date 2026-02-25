"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, Mail, Save, Loader2, LogOut } from "lucide-react";
import { SupabaseUpload } from "@/components/SupabaseUpload";

export default function UserProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    avatarUrl: "",
    role: "",
  });

  useEffect(() => {
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((data) => {
        setFormData({
          name: data.name || "",
          email: data.email || "",
          bio: data.bio || "",
          avatarUrl: data.avatarUrl || "",
          role: data.role || "",
        });
      })
      .catch(() => setError("Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  const handleUploadSuccess = async (result: { url: string }) => {
    const newUrl = result.url;
    setFormData((prev) => ({ ...prev, avatarUrl: newUrl }));
    // Auto-save avatar immediately
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formData.name, bio: formData.bio, avatarUrl: newUrl }),
      });
      if (res.ok) {
        setSuccess("Profile picture updated!");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch { /* silent — user can still Save manually */ }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formData.name, bio: formData.bio, avatarUrl: formData.avatarUrl }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update profile");
      }
      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f0] dark:bg-[#0f0f12] flex items-center justify-center transition-colors">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f0] dark:bg-[#0f0f12] py-12 transition-colors">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/user/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">My Profile</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your account details and profile picture</p>
        </div>

        <div className="bg-white dark:bg-[#1a1a24] rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden transition-colors">
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
            {/* Alerts */}
            {error && (
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-sm">
                {typeof error === "object" ? JSON.stringify(error) : error}
              </div>
            )}
            {success && (
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/50 text-green-700 dark:text-green-400 text-sm">
                {success}
              </div>
            )}

            {/* Avatar */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">Profile Picture</h3>
              <div className="flex items-center gap-6">
                <div className="relative h-20 w-20 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 flex-shrink-0">
                  {formData.avatarUrl ? (
                    <Image src={formData.avatarUrl} alt="Avatar" fill sizes="80px" className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-500 to-emerald-600">
                      <span className="text-2xl font-bold text-white">
                        {(formData.name || formData.email || "U")[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <SupabaseUpload
                    onUploaded={handleUploadSuccess}
                    label="Change Picture"
                    bucket="avatars"
                  />
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">JPG, PNG or GIF. Max 10MB.</p>
                </div>
              </div>
            </div>

            <hr className="border-gray-200 dark:border-gray-700" />

            {/* Name */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">Personal Information</h3>
              <div className="space-y-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Display Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      id="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#141418] text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100 dark:focus:ring-teal-900/30 transition-all"
                      placeholder="Your name"
                    />
                  </div>
                </div>

                {/* Email — read-only */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      readOnly
                      value={formData.email}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f0f12] text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">Email address cannot be changed.</p>
                </div>

                {/* Bio */}
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Bio <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    id="bio"
                    rows={3}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#141418] text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100 dark:focus:ring-teal-900/30 transition-all resize-none"
                    placeholder="A short bio about yourself..."
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>

          {/* Danger Zone */}
          <div className="px-6 sm:px-8 pb-8">
            <hr className="border-gray-200 dark:border-gray-700 mb-6" />
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">Account Actions</h3>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
