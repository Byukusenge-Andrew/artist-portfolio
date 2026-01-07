import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { prisma } from "@/lib/prisma";

async function getCurrentUser() {
  const cookieStore = await cookies();
  const userSession = cookieStore.get("user_session")?.value;

  if (!userSession) {
    redirect("/auth/login");
  }

  try {
    const user = JSON.parse(Buffer.from(userSession, "base64").toString());
    return user;
  } catch (e) {
    redirect("/auth/login");
  }
}

export default async function OrdersPage() {
  const user = await getCurrentUser();

  let orders: any[] = [];
  try {
    const orderRecords = await (prisma as any).order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: { items: true },
    });
    orders = orderRecords;
  } catch (error) {
    console.error("Failed to fetch orders:", error);
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/user/dashboard" className="flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-4">
            <ArrowLeft className="h-5 w-5" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Orders Yet</h2>
            <p className="text-gray-600 mb-6">Start exploring and collecting art today</p>
            <Link href="/galleries" className="inline-block bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700">
              Shop Now
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {(orders as any[]).map((order: any) => (
              <div key={order.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {order.items?.[0]?.titleSnapshot || "Order"}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">Order ID: {order.id}</p>
                    <p className="text-sm text-gray-600">Ordered on {formatDate(order.createdAt)}</p>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-sm text-gray-600 mb-1">Amount</p>
                      <p className="text-xl font-bold text-gray-900">{formatPrice((order.totalCents || 0) / 100)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 mb-1">Status</p>
                      <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
