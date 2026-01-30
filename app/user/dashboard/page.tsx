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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">{user.email}</span>
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium"
              >
                <LogOut className="h-5 w-5" />
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user.name}!</h2>
          <p className="text-gray-600">Manage your profile, orders, and favorites</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Link
            href="/user/orders"
            className="bg-white p-6 rounded-lg border border-gray-200 hover:border-teal-500 hover:shadow-lg transition-all"
          >
            <ShoppingBag className="h-8 w-8 text-teal-600 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">My Orders</h3>
            <p className="text-gray-600">View your purchases and order history</p>
          </Link>

          <Link
            href="/user/favorites"
            className="bg-white p-6 rounded-lg border border-gray-200 hover:border-teal-500 hover:shadow-lg transition-all"
          >
            <Heart className="h-8 w-8 text-pink-600 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Saved Favorites</h3>
            <p className="text-gray-600">View and manage your favorite artworks</p>
          </Link>

          <Link
            href="/user/profile"
            className="bg-white p-6 rounded-lg border border-gray-200 hover:border-teal-500 hover:shadow-lg transition-all"
          >
            <User className="h-8 w-8 text-blue-600 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Profile</h3>
            <p className="text-gray-600">Update your account information</p>
          </Link>
        </div>

        {/* Account Status */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Name</p>
              <p className="text-gray-900 font-medium">{user.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Email</p>
              <p className="text-gray-900 font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Status</p>
              <p className="text-gray-900 font-medium">
                <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                Active
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Account Type</p>
              <p className="text-gray-900 font-medium capitalize">{user.role.toLowerCase()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
