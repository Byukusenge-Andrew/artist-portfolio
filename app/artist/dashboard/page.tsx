import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { Palette, Package, ShoppingCart, User, Upload } from "lucide-react";

import { parseUserSession } from "@/lib/auth";

async function getCurrentUser() {
    const cookieStore = await cookies();
    const userSession = cookieStore.get("user_session")?.value;

    if (!userSession) {
        redirect("/auth/artist-login?redirect=/artist/dashboard");
    }

    const user = await parseUserSession(userSession);
    if (!user) {
        redirect("/auth/artist-login?redirect=/artist/dashboard");
    }

    // Ensure only artists can access
    if (user.role !== "ARTIST") {
        redirect("/user/dashboard");
    }

    return user;
}

export default async function ArtistDashboard() {
    const user = await getCurrentUser();

    return (
        <div className="min-h-screen bg-[#f5f5f0]">
            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Welcome Section */}
                <div className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        Welcome back, {user.name}!
                    </h2>
                    <p className="text-gray-600">
                        Manage your artworks, track sales, and grow your portfolio
                    </p>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <Link
                        href="/admin/artworks/new"
                        className="bg-white p-6 rounded-lg border border-gray-200 hover:border-purple-500 hover:shadow-lg transition-all group"
                    >
                        <Upload className="h-8 w-8 text-purple-600 mb-3 group-hover:scale-110 transition-transform" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            Upload Artwork
                        </h3>
                        <p className="text-gray-600 text-sm">
                            Add new pieces to your portfolio
                        </p>
                    </Link>

                    <Link
                        href="/admin/artworks"
                        className="bg-white p-6 rounded-lg border border-gray-200 hover:border-purple-500 hover:shadow-lg transition-all group"
                    >
                        <Palette className="h-8 w-8 text-purple-600 mb-3 group-hover:scale-110 transition-transform" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            My Artworks
                        </h3>
                        <p className="text-gray-600 text-sm">
                            View and manage your portfolio
                        </p>
                    </Link>

                    <Link
                        href="/admin/orders"
                        className="bg-white p-6 rounded-lg border border-gray-200 hover:border-purple-500 hover:shadow-lg transition-all group"
                    >
                        <ShoppingCart className="h-8 w-8 text-purple-600 mb-3 group-hover:scale-110 transition-transform" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            Sales & Orders
                        </h3>
                        <p className="text-gray-600 text-sm">
                            Track your artwork sales
                        </p>
                    </Link>

                    <Link
                        href="/admin/fulfillment"
                        className="bg-white p-6 rounded-lg border border-gray-200 hover:border-purple-500 hover:shadow-lg transition-all group"
                    >
                        <Package className="h-8 w-8 text-purple-600 mb-3 group-hover:scale-110 transition-transform" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            Fulfillment
                        </h3>
                        <p className="text-gray-600 text-sm">
                            Manage order delivery
                        </p>
                    </Link>
                </div>

                {/* Account Information */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Artist Profile
                    </h3>
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
                                <span className="inline-block w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
                                Artist Account
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Account Type</p>
                            <p className="text-gray-900 font-medium capitalize">
                                {user.role.toLowerCase()}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
