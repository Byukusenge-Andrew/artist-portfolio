"use client";
import { useState } from "react";
import { Package, CheckCircle2, Truck, Clock, ShoppingBag, ChevronDown, ChevronUp } from "lucide-react";
import ConfirmReceiptButton from "./ConfirmReceiptButton";
import Image from "next/image";
import Link from "next/link";

type OrderItem = {
  id: string;
  titleSnapshot: string;
  imageUrlSnapshot: string;
  unitPrice: number;
  quantity: number;
  productType: string;
};

type Order = {
  id: string;
  status: string;
  total: number;
  currency: string;
  createdAt: string;
  email: string;
  customerName?: string;
  items: OrderItem[];
};

function getStatusInfo(status: string) {
  switch (status) {
    case "PENDING":
      return { label: "Pending Payment", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400", icon: Clock };
    case "PAID":
      return { label: "Paid — Awaiting Shipment", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400", icon: Package };
    case "PENDING_DELIVERY":
      return { label: "Shipped — Confirm Receipt", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400", icon: Truck };
    case "FULFILLED":
      return { label: "Fulfilled", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", icon: CheckCircle2 };
    case "CANCELED":
      return { label: "Canceled", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400", icon: ShoppingBag };
    default:
      return { label: status, color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300", icon: Clock };
  }
}

function formatPrice(amount: number, currency = "RWF") {
  if (currency === "RWF") {
    return `RWF ${amount.toLocaleString()}`;
  }
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function UserOrdersList({ orders }: { orders: Order[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (orders.length === 0) {
    return (
      <div className="text-center py-20">
        <ShoppingBag className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No Orders Yet</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Start exploring and collecting art today</p>
        <Link href="/site/galleries" className="inline-block bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors">
          Shop Now
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => {
        const statusInfo = getStatusInfo(order.status);
        const StatusIcon = statusInfo.icon;
        const isPendingDelivery = order.status === "PENDING_DELIVERY";
        const isExpanded = expandedId === order.id;

        return (
          <div
            key={order.id}
            className={`bg-white dark:bg-[#1a1a24] rounded-xl border transition-all duration-200 ${
              isPendingDelivery
                ? "border-orange-300 dark:border-orange-700 shadow-md ring-1 ring-orange-200 dark:ring-orange-900/50"
                : "border-gray-200 dark:border-gray-700"
            }`}
          >
            {/* Clickable summary row */}
            <button
              onClick={() => setExpandedId(isExpanded ? null : order.id)}
              className="w-full text-left p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/30 rounded-xl transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {order.items?.[0]?.titleSnapshot || "Order"}
                  </h3>
                  {order.items?.length > 1 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">+{order.items.length - 1} more</span>
                  )}
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">#{order.id.slice(0, 12)}…</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{formatDate(order.createdAt)}</p>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {formatPrice(order.total || 0, order.currency || "RWF")}
                  </p>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${statusInfo.color}`}>
                  <StatusIcon className="w-3.5 h-3.5" />
                  {statusInfo.label}
                </span>
                {isExpanded
                  ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
              </div>
            </button>

            {/* Expanded detail */}
            {isExpanded && (
              <div className="px-5 pb-5 border-t border-gray-100 dark:border-gray-700/50 pt-4 space-y-4">
                {/* Items */}
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/40 rounded-lg p-3">
                      {item.imageUrlSnapshot && (
                        <div className="relative w-14 h-14 rounded-md overflow-hidden flex-shrink-0 border border-gray-200 dark:border-gray-700">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={item.imageUrlSnapshot} alt={item.titleSnapshot} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">{item.titleSnapshot}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{item.productType} × {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 flex-shrink-0">
                        {formatPrice(item.unitPrice * item.quantity, order.currency)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* PENDING_DELIVERY: confirm receipt */}
                {isPendingDelivery && (
                  <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-2">
                      <Truck className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-orange-800 dark:text-orange-300">Your order has been shipped!</p>
                        <p className="text-xs text-orange-600 dark:text-orange-400 mt-0.5">
                          Confirm receipt to complete the order.
                        </p>
                      </div>
                    </div>
                    <ConfirmReceiptButton orderId={order.id} />
                  </div>
                )}

                {/* FULFILLED  */}
                {order.status === "FULFILLED" && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800/50 text-sm text-green-700 dark:text-green-400">
                    <CheckCircle2 className="w-4 h-4" />
                    You confirmed receipt of this order.
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
