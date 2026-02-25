import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import Image from "next/image";
import { Palette, Package, ShoppingCart, User, Upload, TrendingUp, MessageSquare } from "lucide-react";

import { parseUserSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getCurrentUser() {
    const cookieStore = await cookies();
    const userSession = cookieStore.get("user_session")?.value;

    if (!userSession) {
        redirect("/auth/login?redirect=/artist/dashboard");
    }

    const user = await parseUserSession(userSession);
    if (!user) {
        redirect("/auth/login?redirect=/artist/dashboard");
    }

    // Ensure only artists can access
    if (user.role !== "ARTIST") {
        redirect("/user/dashboard");
    }

    return user;
}

export default async function ArtistDashboard() {
    const user = await getCurrentUser();

    // Fetch stats
    const artworkWhere = { uploadedBy: user.userId };
    const orderWhere = {
        items: {
            some: {
                artwork: { uploadedBy: user.userId }
            }
        }
    };

    const orderStats = await prisma.order.aggregate({
        where: orderWhere,
        _sum: { totalCents: true },
        _count: true,
    });

    const artworksCount = await prisma.artwork.count({
        where: artworkWhere
    });

    const recentOrders = await prisma.order.findMany({
        where: orderWhere,
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { items: true, user: true },
    });

    // Fetch direct commissions
    const commissions = await prisma.commissionRequest.findMany({
        where: { artistId: user.userId },
        orderBy: { createdAt: "desc" },
        take: 5,
    });

    const recentArtworks = await prisma.artwork.findMany({
        where: artworkWhere,
        take: 4,
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            title: true,
            slug: true,
            imageUrl: true,
            originalPriceCents: true,
        }
    });

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(price);
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    return (
        <div className="min-h-screen bg-[#f5f5f0] dark:bg-[#0f0f12] transition-colors duration-300">
            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Welcome Section */}
                <div className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        Welcome back, {user.name}!
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Manage your artworks, track sales, and grow your portfolio
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-white dark:bg-[#1a1a24] rounded-lg border border-gray-200 dark:border-gray-700 p-6 transition-colors">
                        <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400 mb-3" />
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Revenue</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                            {formatPrice((orderStats._sum.totalCents || 0) / 100)}
                        </p>
                    </div>

                    <div className="bg-white dark:bg-[#1a1a24] rounded-lg border border-gray-200 dark:border-gray-700 p-6 transition-colors">
                        <Package className="h-8 w-8 text-emerald-600 dark:text-emerald-400 mb-3" />
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Orders</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{orderStats._count}</p>
                    </div>

                    <div className="bg-white dark:bg-[#1a1a24] rounded-lg border border-gray-200 dark:border-gray-700 p-6 transition-colors">
                        <Palette className="h-8 w-8 text-purple-600 dark:text-purple-400 mb-3" />
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Artworks</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{artworksCount}</p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <Link
                        href="/admin/artworks/new"
                        className="bg-white dark:bg-[#1a1a24] p-6 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-lg transition-all group"
                    >
                        <Upload className="h-8 w-8 text-purple-600 dark:text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                            Upload Artwork
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            Add new pieces to your portfolio
                        </p>
                    </Link>

                    <Link
                        href="/admin/artworks"
                        className="bg-white dark:bg-[#1a1a24] p-6 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-lg transition-all group"
                    >
                        <Palette className="h-8 w-8 text-purple-600 dark:text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                            My Artworks
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            View and manage your portfolio
                        </p>
                    </Link>

                    <Link
                        href="/admin/orders"
                        className="bg-white dark:bg-[#1a1a24] p-6 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-lg transition-all group"
                    >
                        <ShoppingCart className="h-8 w-8 text-purple-600 dark:text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                            Sales & Orders
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            Track your artwork sales
                        </p>
                    </Link>

                    <Link
                        href="#"
                        className="bg-white dark:bg-[#1a1a24] p-6 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-lg transition-all group"
                    >
                        <User className="h-8 w-8 text-purple-600 dark:text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                            Edit Profile
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            Update your bio and details
                        </p>
                    </Link>
                </div>

                {/* Direct Commissions */}
                <div className="bg-white dark:bg-[#1a1a24] rounded-lg border border-gray-200 dark:border-gray-700 mb-12 transition-colors">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Direct Commissions</h2>
                        </div>
                        {/* Could link to a full commissions page if needed */}
                        <span className="text-sm text-gray-500 dark:text-gray-400">Recent Requests</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-[#141418] border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Requester</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Email</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Details</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Date</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {commissions.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-600 dark:text-gray-400">
                                            No commission requests yet
                                        </td>
                                    </tr>
                                ) : (
                                    commissions.map((c) => (
                                        <tr key={c.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#141418] transition-colors">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">{c.name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{c.email}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate" title={c.details}>
                                                {c.details}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{formatDate(c.createdAt)}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${c.status === 'NEW' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                                                    c.status === 'PAID' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                        'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                                                    }`}>
                                                    {c.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recent Artworks */}
                <div className="bg-white dark:bg-[#1a1a24] rounded-lg border border-gray-200 dark:border-gray-700 mb-12 transition-colors">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Palette className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Recent Artworks</h2>
                        </div>
                        <Link href="/admin/artworks" className="text-sm text-purple-600 dark:text-purple-400 font-medium hover:underline">
                            View All
                        </Link>
                    </div>
                    {recentArtworks.length === 0 ? (
                        <div className="px-6 py-8 text-center text-gray-600 dark:text-gray-400">
                            You haven&apos;t uploaded any artworks yet.
                        </div>
                    ) : (
                        <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {recentArtworks.map((artwork: any) => (
                                <Link
                                    key={artwork.id}
                                    href={`/site/artworks/${artwork.slug}`}
                                    className="group relative aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 hover:border-purple-500 transition-colors block"
                                >
                                    <div className="absolute inset-0">
                                        <Image
                                            src={artwork.imageUrl}
                                            alt={artwork.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                            sizes="(max-width: 768px) 50vw, 25vw"
                                        />
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                                        <p className="text-white font-medium truncate text-sm">{artwork.title}</p>
                                        <p className="text-white/80 text-xs mt-1">
                                            {formatPrice((artwork.originalPriceCents || 0) / 100)}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Orders */}
                <div className="bg-white dark:bg-[#1a1a24] rounded-lg border border-gray-200 dark:border-gray-700 mb-12 transition-colors">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Recent Orders</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-[#141418] border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Order ID</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Customer</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Items</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Amount</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Date</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-gray-600 dark:text-gray-400">
                                            No orders yet
                                        </td>
                                    </tr>
                                ) : (
                                    recentOrders.map((order) => (
                                        <tr key={order.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#141418] transition-colors">
                                            <td className="px-6 py-4 text-sm font-mono text-gray-900 dark:text-gray-100">{order.id.slice(0, 8)}...</td>
                                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{order.user?.name || "Guest"}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{order.items.length} items</td>
                                            <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                {formatPrice((order.totalCents || 0) / 100)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{formatDate(order.createdAt)}</td>
                                            <td className="px-6 py-4">
                                                <span className="inline-block px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-xs font-medium">
                                                    {order.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Account Information */}
                <div className="bg-white dark:bg-[#1a1a24] rounded-lg border border-gray-200 dark:border-gray-700 p-6 transition-colors">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        Artist Profile
                    </h3>
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
                                <span className="inline-block w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
                                Artist Account
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Account Type</p>
                            <p className="text-gray-900 dark:text-gray-100 font-medium capitalize">
                                {user.role.toLowerCase()}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
