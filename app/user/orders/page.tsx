import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { parseUserSession } from "@/lib/auth";
import UserOrdersList from "./UserOrdersList";

async function getCurrentUser() {
  const cookieStore = await cookies();
  const userSession = cookieStore.get("user_session")?.value;
  if (!userSession) redirect("/auth/login");
  const user = await parseUserSession(userSession);
  if (!user) redirect("/auth/login");
  return user;
}

export default async function OrdersPage() {
  const user = await getCurrentUser();

  let orders: any[] = [];
  try {
    orders = await prisma.order.findMany({
      where: {
        OR: [
          { userId: user.userId },
          { email: user.email },
        ],
      },
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
      },
    });
  } catch (error) {
    console.error("Failed to fetch orders:", error);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f12] transition-colors">
      {/* Header */}
      <div className="bg-white dark:bg-[#1a1a24] border-b border-gray-200 dark:border-gray-700 transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <Link
            href="/user/dashboard"
            className="flex items-center gap-2 text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 mb-3 transition-colors w-fit"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Orders</h1>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {orders.length} order{orders.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <UserOrdersList orders={JSON.parse(JSON.stringify(orders))} />
      </div>
    </div>
  );
}
