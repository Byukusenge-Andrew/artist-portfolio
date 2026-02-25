"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, User } from "lucide-react";

export default function ProfilePage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f12] transition-colors">
      {/* Header */}
      <div className="bg-white dark:bg-[#1a1a24] border-b border-gray-200 dark:border-gray-800 transition-colors">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/user/dashboard" className="flex items-center gap-2 text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 mb-4 transition-colors">
            <ArrowLeft className="h-5 w-5" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Profile</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-[#1a1a24] rounded-lg border border-gray-200 dark:border-gray-800 p-8 shadow-sm transition-colors">
          <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-200 dark:border-gray-800">
            <User className="h-12 w-12 text-teal-600 dark:text-teal-400" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Profile Settings</h2>
              <p className="text-gray-600 dark:text-gray-400">Manage your account information</p>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                Email Address
              </label>
              <p className="px-4 py-2 bg-gray-50 dark:bg-[#141418] rounded-lg border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400">
                Your email address cannot be changed
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Account Actions</h3>
              <button
                onClick={handleLogout}
                disabled={loading}
                className="w-full px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors disabled:opacity-50"
              >
                {loading ? "Signing Out..." : "Sign Out"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
