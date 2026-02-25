"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Camera, Save, ArrowLeft, Loader2, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { CloudinaryUpload } from "@/components/CloudinaryUpload";

export default function EditProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        email: "", // read-only
        bio: "",
        avatarUrl: "",
        role: "",
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            // We can fetch the current user's profile from a generic GET route 
            // but for now we can just use the auth status or a new GET /api/user/profile.
            // Let's create a quick handler or use the session.
            const res = await fetch("/api/auth/session"); // Or a dedicated profile route
            if (!res.ok) throw new Error("Failed to load profile");

            // Wait, NextAuth session endpoint or custom? We have a custom JWT system.
            // Let's fetch from the artists public API but filter by ourselves, or better yet,
            // let's use a dedicated GET /api/user/profile route we should ensure exists.

            // Actually, we can just use the `currentUser` if this was a server component.
            // Since it's client, we need a GET endpoint.
            const profileRes = await fetch("/api/user/profile");

            if (!profileRes.ok) {
                throw new Error("Failed to fetch profile data");
            }

            const data = await profileRes.json();
            setFormData({
                name: data.name || "",
                email: data.email || "",
                bio: data.bio || "",
                avatarUrl: data.avatarUrl || "",
                role: data.role || "",
            });

        } catch (err: any) {
            setError(err.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    const handleUploadSuccess = (result: { url: string }) => {
        setFormData((prev) => ({
            ...prev,
            avatarUrl: result.url,
        }));
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
                body: JSON.stringify({
                    name: formData.name,
                    bio: formData.bio,
                    avatarUrl: formData.avatarUrl,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to update profile");
            }

            setSuccess("Profile updated successfully!");
            setTimeout(() => setSuccess(""), 3000);

            // Refresh to update header/session info if necessary
            router.refresh();

        } catch (err: any) {
            setError(err.message || "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f5f5f0] dark:bg-[#0f0f12] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f5f5f0] dark:bg-[#0f0f12] py-12 transition-colors duration-300">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href={formData.role === "ARTIST" ? "/artist/dashboard" : "/user/dashboard"}
                        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        Edit Profile
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Manage your public presence and account details
                    </p>
                </div>

                <div className="bg-white dark:bg-[#1a1a24] rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden transition-colors">
                    <form onSubmit={handleSubmit} className="p-6 sm:p-8">

                        {error && (
                            <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-sm">
                                {typeof error === "object" ? JSON.stringify(error) : error}
                            </div>
                        )}

                        {success && (
                            <div className="mb-6 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/50 text-green-700 dark:text-green-400 text-sm">
                                {success}
                            </div>
                        )}

                        <div className="space-y-8">
                            {/* Avatar Section */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Profile Picture</h3>
                                <div className="flex items-center gap-6">
                                    <div className="relative h-24 w-24 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex-shrink-0">
                                        {formData.avatarUrl ? (
                                            <Image
                                                src={formData.avatarUrl}
                                                alt="Avatar"
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <User className="h-12 w-12 text-gray-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                        )}
                                    </div>

                                    <div>
                                        <CloudinaryUpload
                                            onUploaded={(res) => handleUploadSuccess(res)}
                                            label="Change Picture"
                                        />
                                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                            JPG, GIF or PNG. 1MB max.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-gray-200 dark:border-gray-800" />

                            {/* Personal Info */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Personal Information</h3>
                                <div className="grid grid-cols-1 gap-6">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Display Name
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <User className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="text"
                                                id="name"
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="block w-full pl-10 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#141418] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                                                placeholder="Your full name or artist moniker"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Email Address <span className="text-gray-400 font-normal">(Cannot be changed)</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Mail className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="email"
                                                id="email"
                                                readOnly
                                                disabled
                                                value={formData.email}
                                                className="block w-full pl-10 px-4 py-2 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-500 cursor-not-allowed transition-colors"
                                            />
                                        </div>
                                    </div>

                                    {formData.role === "ARTIST" && (
                                        <div>
                                            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Artist Bio
                                            </label>
                                            <textarea
                                                id="bio"
                                                rows={4}
                                                value={formData.bio}
                                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                                className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#141418] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors resize-none"
                                                placeholder="Tell your audience about yourself, your inspiration, and your art style..."
                                            />
                                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                                Brief description for your profile. Appears on your public artist page.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="pt-6 flex justify-end gap-3 border-t border-gray-200 dark:border-gray-800">
                                <Link
                                    href={formData.role === "ARTIST" ? "/artist/dashboard" : "/user/dashboard"}
                                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed min-w-[120px]"
                                >
                                    {saving ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
