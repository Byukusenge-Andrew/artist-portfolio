"use client";
import { useEffect, useState } from "react";
import { Eye, CheckCircle, Clock, XCircle, Package } from "lucide-react";

type OrderItem = {
  id: string;
  quantity: number;
  productType: "ORIGINAL" | "PRINT" | "COMMISSION";
  titleSnapshot: string;
  imageUrlSnapshot: string;
  unitPriceCents: number;
};

type Order = {
  id: string;
  email: string;
  customerName?: string;
  status: "PENDING" | "PAID" | "FULFILLED" | "CANCELED";
  currency: string;
  totalCents: number;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
};

const statusConfig: Record<Order["status"], { label: string; color: string; icon: any }> = {
  PENDING: { label: "Pending", color: "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800/50", icon: Clock },
  PAID: { label: "Paid", color: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50", icon: CheckCircle },
  FULFILLED: { label: "Fulfilled", color: "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50", icon: Package },
  CANCELED: { label: "Canceled", color: "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50", icon: XCircle },
};

export default function OrdersAdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<Order["status"] | "ALL">("ALL");

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      const res = await fetch("/api/orders");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setOrders(data.sort((a: Order, b: Order) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, status: Order["status"]) {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update");
      await fetchOrders();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to update");
    }
  }

  const filtered = orders.filter(o => filterStatus === "ALL" || o.status === filterStatus);
  const selectedOrder = orders.find(o => o.id === selectedId);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100">Orders</h1>

      {/* Filter */}
      <div className="mb-6 flex gap-2 flex-wrap">
        {(["ALL", "PENDING", "PAID", "FULFILLED", "CANCELED"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${filterStatus === status
              ? "bg-teal-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
          >
            {status === "ALL" ? "All" : statusConfig[status].label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-[#1a1a24] rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm transition-colors">
          <p className="text-gray-600 dark:text-gray-400">No orders found</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* List */}
          <div className="lg:col-span-2 space-y-3">
            {filtered.map(order => {
              const StatusIcon = statusConfig[order.status].icon;
              return (
                <button
                  key={order.id}
                  onClick={() => setSelectedId(order.id)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${selectedId === order.id
                    ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20"
                    : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-800 dark:bg-[#1a1a24] dark:hover:border-gray-700"
                    }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Order #{order.id.slice(-8).toUpperCase()}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-semibold border flex items-center gap-1 whitespace-nowrap ${statusConfig[order.status].color}`}>
                          <StatusIcon className="h-3 w-3" />
                          {statusConfig[order.status].label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{order.email}</p>
                      {order.customerName && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">{order.customerName}</p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                        {new Date(order.createdAt).toLocaleDateString()} • {order.items.length} {order.items.length === 1 ? "item" : "items"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-teal-600 dark:text-teal-400">
                        {(order.totalCents / 100).toLocaleString(undefined, {
                          style: "currency",
                          currency: order.currency,
                        })}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Detail */}
          {selectedOrder && (
            <div className="lg:col-span-1 bg-white dark:bg-[#1a1a24] rounded-lg border border-gray-200 dark:border-gray-800 p-6 sticky top-8 h-fit max-h-[calc(100vh-2rem)] overflow-y-auto transition-colors">
              <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">Order Details</h2>

              {/* Items */}
              <div className="mb-6">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">Items</p>
                <div className="space-y-3">
                  {selectedOrder.items.map(item => (
                    <div key={item.id} className="border border-gray-200 dark:border-gray-700 rounded p-3">
                      {item.imageUrlSnapshot && (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.imageUrlSnapshot}
                            alt={item.titleSnapshot}
                            className="w-full h-24 object-cover rounded mb-2"
                          />
                        </>
                      )}
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">{item.titleSnapshot}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {item.productType} × {item.quantity}
                      </p>
                      <p className="text-sm font-bold text-gray-900 dark:text-gray-100 mt-2">
                        {(item.unitPriceCents * item.quantity / 100).toLocaleString(undefined, {
                          style: "currency",
                          currency: selectedOrder.currency,
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="border-t border-gray-200 dark:border-gray-800 pt-4 mb-6 space-y-2">
                <div className="flex justify-between">
                  <p className="text-gray-600 dark:text-gray-400">Subtotal</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {(selectedOrder.totalCents / 100).toLocaleString(undefined, {
                      style: "currency",
                      currency: selectedOrder.currency,
                    })}
                  </p>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-800">
                  <p className="font-bold text-gray-900 dark:text-gray-100">Total</p>
                  <p className="text-lg font-bold text-teal-600 dark:text-teal-400">
                    {(selectedOrder.totalCents / 100).toLocaleString(undefined, {
                      style: "currency",
                      currency: selectedOrder.currency,
                    })}
                  </p>
                </div>
              </div>

              {/* Customer */}
              <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-800">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Customer</p>
                <p className="text-sm text-gray-900 dark:text-gray-100 font-semibold">{selectedOrder.customerName || "Guest"}</p>
                <a href={`mailto:${selectedOrder.email}`} className="text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300">
                  {selectedOrder.email}
                </a>
              </div>

              {/* Status Update */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Status</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(statusConfig).map(([status, config]) => (
                    <button
                      key={status}
                      onClick={() => updateStatus(selectedOrder.id, status as Order["status"])}
                      className={`px-2 py-2 rounded text-xs font-semibold transition-all ${selectedOrder.status === status
                        ? `${config.color} border`
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-[#141418] dark:text-gray-300 dark:hover:bg-gray-800 dark:border-gray-700 border"
                        }`}
                    >
                      {config.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Metadata */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800 space-y-2 text-xs text-gray-600 dark:text-gray-400">
                <p>Order ID: {selectedOrder.id}</p>
                <p>Created: {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                <p>Updated: {new Date(selectedOrder.updatedAt).toLocaleString()}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
