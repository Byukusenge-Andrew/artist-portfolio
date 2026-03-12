import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { ArrowLeft, Users, Package, TrendingUp } from "lucide-react";
import { prisma } from "@/lib/prisma";
import AdminDashboardStats from "./AdminDashboardStats";

import { parseUserSession } from "@/lib/auth";

async function getCurrentUser() {
  const cookieStore = await cookies();
  const userSession = cookieStore.get("user_session")?.value;

  if (!userSession) {
    redirect("/admin/login");
  }

  const user = await parseUserSession(userSession);
  if (!user || user.role !== "ADMIN") {
    redirect("/auth/login"); // Redirect to user login if session exists but not admin
  }

  return user;
}

export default async function AdminDashboard() {
  const user = await getCurrentUser();

  const stats: { totalUsers: number; totalOrders: number; totalRevenue: number; totalArtworks: number } = { totalUsers: 0, totalOrders: 0, totalRevenue: 0, totalArtworks: 0 };
  let recentOrders: any[] = [];

  try {
    const users = await (prisma as any).user.count();
    
    // Only count successful orders for revenue
    const orderStats = await prisma.order.aggregate({
      where: { status: { in: ["PAID", "FULFILLED"] } },
      _sum: { total: true },
      _count: true,
    });

    // Recent orders can still show everything, or just take 5 latest
    const orders = await (prisma as any).order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { items: true, user: true },
    });

    const artworks = await prisma.artwork.count();

    Object.assign(stats, {
      totalUsers: users,
      totalOrders: orderStats._count || 0,
      totalRevenue: orderStats._sum?.total || 0,
      totalArtworks: artworks,
    });

    recentOrders = orders;
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
  }

  // Calculate last 30 days of data for charts
  const chartDataArray: any[] = [];
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [recentUsersRaw, recentOrdersRaw, recentArtworksRaw] = await Promise.all([
      prisma.user.findMany({ where: { createdAt: { gte: thirtyDaysAgo } }, select: { createdAt: true } }),
      prisma.order.findMany({ where: { status: { in: ["PAID", "FULFILLED"] }, createdAt: { gte: thirtyDaysAgo } }, select: { createdAt: true, total: true } }),
      prisma.artwork.findMany({ where: { createdAt: { gte: thirtyDaysAgo } }, select: { createdAt: true } })
    ]);

    const getDateString = (date: Date) => date.toISOString().split("T")[0];
    const grouped = new Map<string, any>();
    
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const str = getDateString(d);
      grouped.set(str, { dateRaw: str, users: 0, orders: 0, revenue: 0, artworks: 0 });
    }
    
    // Type guards since user findMany returns untyped results here
    const typedUsersRaw = recentUsersRaw as unknown as { createdAt: Date }[];
    const typedOrdersRaw = recentOrdersRaw as unknown as { createdAt: Date, total: number }[];
    const typedArtworksRaw = recentArtworksRaw as unknown as { createdAt: Date }[];

    typedUsersRaw.forEach((u) => {
      const d = getDateString(u.createdAt);
      if (grouped.has(d)) grouped.get(d).users++;
    });
    typedOrdersRaw.forEach((o) => {
      const d = getDateString(o.createdAt);
      if (grouped.has(d)) {
        grouped.get(d).orders++;
        grouped.get(d).revenue += o.total;
      }
    });
    typedArtworksRaw.forEach((a) => {
      const d = getDateString(a.createdAt);
      if (grouped.has(d)) grouped.get(d).artworks++;
    });
    
    Array.from(grouped.values()).forEach((item) => {
      const d = new Date(item.dateRaw);
      chartDataArray.push({
        ...item,
        date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      });
    });
  } catch (error) {
    console.error("Failed to compile chart data", error);
  }

  const formatPrice = (price: number) => {
    return `RWF ${price.toLocaleString()}`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f12] transition-colors">
      {/* Header */}
      <div className="bg-white dark:bg-[#1a1a24] border-b border-gray-200 dark:border-gray-700 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="flex items-center gap-2 text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 mb-4">
            <ArrowLeft className="h-5 w-5" />
            Back to Site
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Admin Dashboard</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats Grid with Interactive Charts */}
        <AdminDashboardStats stats={stats} chartData={chartDataArray} />

        {/* Management Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Link
            href="/admin/artworks"
            className="bg-white dark:bg-[#1a1a24] rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:border-teal-500 dark:hover:border-teal-600 hover:shadow-lg dark:hover:shadow-teal-900/10 transition-all"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Manage Artworks</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">Add, edit, or delete artwork listings</p>
            <span className="text-teal-600 dark:text-teal-400 font-medium text-sm">Go to Artworks →</span>
          </Link>

          <Link
            href="/admin/galleries"
            className="bg-white dark:bg-[#1a1a24] rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:border-teal-500 dark:hover:border-teal-600 hover:shadow-lg dark:hover:shadow-teal-900/10 transition-all"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Manage Galleries</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">Organize and manage art galleries</p>
            <span className="text-teal-600 dark:text-teal-400 font-medium text-sm">Go to Galleries →</span>
          </Link>

          <Link
            href="/admin/artists"
            className="bg-white dark:bg-[#1a1a24] rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:border-teal-500 dark:hover:border-teal-600 hover:shadow-lg dark:hover:shadow-teal-900/10 transition-all"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Manage Artists</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">Manage artist profiles and info</p>
            <span className="text-teal-600 dark:text-teal-400 font-medium text-sm">Go to Artists →</span>
          </Link>

          <Link
            href="/admin/orders"
            className="bg-white dark:bg-[#1a1a24] rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:border-teal-500 dark:hover:border-teal-600 hover:shadow-lg dark:hover:shadow-teal-900/10 transition-all"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">View Orders</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">Review all customer orders</p>
            <span className="text-teal-600 dark:text-teal-400 font-medium text-sm">Go to Orders →</span>
          </Link>

          <Link
            href="/admin/commissions"
            className="bg-white dark:bg-[#1a1a24] rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:border-teal-500 dark:hover:border-teal-600 hover:shadow-lg dark:hover:shadow-teal-900/10 transition-all"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Commission Requests</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">Review and manage art commissions</p>
            <span className="text-teal-600 dark:text-teal-400 font-medium text-sm">Go to Commissions →</span>
          </Link>
        </div>

        {/* Recent Orders */}
        <div className="bg-white dark:bg-[#1a1a24] rounded-lg border border-gray-200 dark:border-gray-700 transition-colors">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Recent Orders</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-[#141418] border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Order ID</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Customer</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Artwork</th>
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
                  recentOrders.map((order: any) => (
                    <tr key={order.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#141418] transition-colors">
                      <td className="px-6 py-4 text-sm font-mono text-gray-900 dark:text-gray-100">{order.id.slice(0, 8)}...</td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{order.user?.name || "Unknown"}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{order.items?.[0]?.titleSnapshot || "Deleted"}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {formatPrice(order.total || 0)}
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
      </div>
    </div>
  );
}
