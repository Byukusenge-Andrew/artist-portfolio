import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { ArrowLeft, Users, Package, TrendingUp } from "lucide-react";
import { prisma } from "@/lib/prisma";

async function getCurrentUser() {
  const cookieStore = await cookies();
  const userSession = cookieStore.get("user_session")?.value;
  const adminSession = cookieStore.get("admin_session")?.value;

  if (!userSession && !adminSession) {
    redirect("/admin/login");
  }

  if (userSession) {
    try {
      const user = JSON.parse(Buffer.from(userSession, "base64").toString());
      if (user.role !== "ADMIN") {
        redirect("/auth/login");
      }
      return user;
    } catch (e) {
      redirect("/admin/login");
    }
  }

  // Legacy admin session
  return { id: "admin", email: "admin@artelier.com", name: "Administrator", role: "ADMIN" };
}

export default async function AdminDashboard() {
  await getCurrentUser();

  const stats: { totalUsers: number; totalOrders: number; totalRevenue: number; totalArtworks: number } = { totalUsers: 0, totalOrders: 0, totalRevenue: 0, totalArtworks: 0 };
  const recentOrders: any[] = [];

  try {
    const users = await prisma.user.count();
    const orders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { artwork: true, user: true },
    });

    const orderStats = await prisma.order.aggregate({
      _sum: { totalCents: true },
      _count: true,
    });

    const artworks = await prisma.artwork.count();

    Object.assign(stats, {
      totalUsers: users,
      totalOrders: orderStats._count || 0,
      totalRevenue: (orderStats._sum?.totalCents || 0) / 100,
      totalArtworks: artworks,
    });

    recentOrders = orders;
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
  }

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-4">
            <ArrowLeft className="h-5 w-5" />
            Back to Site
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <Users className="h-8 w-8 text-blue-600 mb-3" />
            <p className="text-sm text-gray-600 mb-1">Total Users</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <Package className="h-8 w-8 text-emerald-600 mb-3" />
            <p className="text-sm text-gray-600 mb-1">Total Orders</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <TrendingUp className="h-8 w-8 text-green-600 mb-3" />
            <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
            <p className="text-3xl font-bold text-gray-900">{formatPrice(stats.totalRevenue)}</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <Package className="h-8 w-8 text-purple-600 mb-3" />
            <p className="text-sm text-gray-600 mb-1">Total Artworks</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalArtworks}</p>
          </div>
        </div>

        {/* Management Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Link
            href="/admin/artworks"
            className="bg-white rounded-lg border border-gray-200 p-6 hover:border-teal-500 hover:shadow-lg transition-all"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Artworks</h3>
            <p className="text-gray-600 text-sm mb-4">Add, edit, or delete artwork listings</p>
            <span className="text-teal-600 font-medium text-sm">Go to Artworks →</span>
          </Link>

          <Link
            href="/admin/galleries"
            className="bg-white rounded-lg border border-gray-200 p-6 hover:border-teal-500 hover:shadow-lg transition-all"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Galleries</h3>
            <p className="text-gray-600 text-sm mb-4">Organize and manage art galleries</p>
            <span className="text-teal-600 font-medium text-sm">Go to Galleries →</span>
          </Link>

          <Link
            href="/admin/artists"
            className="bg-white rounded-lg border border-gray-200 p-6 hover:border-teal-500 hover:shadow-lg transition-all"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Artists</h3>
            <p className="text-gray-600 text-sm mb-4">Manage artist profiles and info</p>
            <span className="text-teal-600 font-medium text-sm">Go to Artists →</span>
          </Link>

          <Link
            href="/admin/orders"
            className="bg-white rounded-lg border border-gray-200 p-6 hover:border-teal-500 hover:shadow-lg transition-all"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">View Orders</h3>
            <p className="text-gray-600 text-sm mb-4">Review all customer orders</p>
            <span className="text-teal-600 font-medium text-sm">Go to Orders →</span>
          </Link>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Order ID</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Customer</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Artwork</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Amount</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-600">
                      No orders yet
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order: any) => (
                    <tr key={order.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-mono text-gray-900">{order.id.slice(0, 8)}...</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{order.user?.name || "Unknown"}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{order.artwork?.title || "Deleted"}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        {formatPrice(order.totalPrice)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatDate(order.createdAt)}</td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
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
      </div>
    </div>
  );
}
