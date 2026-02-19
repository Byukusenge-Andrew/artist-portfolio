import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { User, LogOut, Heart, ShoppingBag } from "lucide-react";

import { parseUserSession } from "@/lib/auth";

async function getCurrentUser() {
  const cookieStore = await cookies();
  const userSession = cookieStore.get("user_session")?.value;

  if (!userSession) {
    redirect("/auth/login");
  }

  const user = await parseUserSession(userSession);
  if (!user) {
    redirect("/auth/login");
  }
  return user;
}

export default async function UserDashboard() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f12] transition-colors">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Welcome back, {user.name}!</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage your profile, orders, and favorites</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Link
            href="/user/orders"
            className="bg-white dark:bg-[#1a1a24] p-6 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-teal-500 dark:hover:border-teal-600 hover:shadow-lg dark:hover:shadow-teal-900/10 transition-all"
          >
            <ShoppingBag className="h-8 w-8 text-teal-600 dark:text-teal-400 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">My Orders</h3>
            <p className="text-gray-600 dark:text-gray-400">View your purchases and order history</p>
          </Link>

          <Link
            href="/user/favorites"
            className="bg-white dark:bg-[#1a1a24] p-6 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-teal-500 dark:hover:border-teal-600 hover:shadow-lg dark:hover:shadow-teal-900/10 transition-all"
          >
            <Heart className="h-8 w-8 text-pink-600 dark:text-pink-400 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Saved Favorites</h3>
            <p className="text-gray-600 dark:text-gray-400">View and manage your favorite artworks</p>
          </Link>

          <Link
            href="/user/profile"
            className="bg-white dark:bg-[#1a1a24] p-6 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-teal-500 dark:hover:border-teal-600 hover:shadow-lg dark:hover:shadow-teal-900/10 transition-all"
          >
            <User className="h-8 w-8 text-blue-600 dark:text-blue-400 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Profile</h3>
            <p className="text-gray-600 dark:text-gray-400">Update your account information</p>
          </Link>
        </div>

        {/* Account Status */}
        <div className="bg-white dark:bg-[#1a1a24] rounded-lg border border-gray-200 dark:border-gray-700 p-6 transition-colors">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Account Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Name</p>
              <p className="text-gray-900 dark:text-gray-100 font-medium">{user.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Email</p>
              <p className="text-gray-900 dark:text-gray-100 font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Status</p>
              <p className="text-gray-900 dark:text-gray-100 font-medium">
                <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                Active
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Account Type</p>
              <p className="text-gray-900 dark:text-gray-100 font-medium capitalize">{user.role.toLowerCase()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
