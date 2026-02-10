import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Package, CheckCircle, Clock, XCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const statusConfig = {
    PENDING: {
        icon: Clock,
        color: "text-amber-600",
        bg: "bg-amber-50",
        border: "border-amber-200",
        label: "Pending",
        description: "We've received your order and will contact you soon",
    },
    PAID: {
        icon: CheckCircle,
        color: "text-blue-600",
        bg: "bg-blue-50",
        border: "border-blue-200",
        label: "Paid",
        description: "Payment confirmed. Preparing your order",
    },
    FULFILLED: {
        icon: CheckCircle,
        color: "text-green-600",
        bg: "bg-green-50",
        border: "border-green-200",
        label: "Fulfilled",
        description: "Your order has been completed and delivered",
    },
    CANCELED: {
        icon: XCircle,
        color: "text-red-600",
        bg: "bg-red-50",
        border: "border-red-200",
        label: "Canceled",
        description: "This order has been canceled",
    },
};

export default async function OrderTrackingPage({
    params,
}: {
    params: Promise<{ orderId: string }>;
}) {
    const { orderId } = await params;

    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true },
    });

    if (!order) {
        notFound();
    }

    const config = statusConfig[order.status];
    const StatusIcon = config.icon;

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            {/* Back Link */}
            <Link
                href="/site/galleries"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-teal-700 mb-8 group transition-colors"
            >
                <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
                Back to Galleries
            </Link>

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Order Tracking</h1>
                <p className="text-gray-600">Order #{order.id.slice(0, 8).toUpperCase()}</p>
            </div>

            {/* Status Card */}
            <div className={`${config.bg} ${config.border} border rounded-xl p-6 mb-8`}>
                <div className="flex items-start gap-4">
                    <div className={`p-3 bg-white rounded-lg ${config.border} border`}>
                        <StatusIcon className={`size-6 ${config.color}`} />
                    </div>
                    <div className="flex-1">
                        <h2 className={`text-2xl font-bold ${config.color} mb-1`}>{config.label}</h2>
                        <p className="text-gray-700">{config.description}</p>
                        <p className="text-sm text-gray-600 mt-2">
                            Ordered on {new Date(order.createdAt).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}
                        </p>
                    </div>
                </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Order Timeline</h2>
                <div className="space-y-4">
                    <div className="flex gap-4">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${order.status === "PENDING" || order.status === "PAID" || order.status === "FULFILLED"
                            ? "bg-green-100"
                            : "bg-gray-100"
                            }`}>
                            <CheckCircle className={`size-5 ${order.status === "PENDING" || order.status === "PAID" || order.status === "FULFILLED"
                                ? "text-green-600"
                                : "text-gray-400"
                                }`} />
                        </div>
                        <div className="flex-1 pb-8 border-l-2 border-gray-200 pl-6 -ml-5">
                            <h3 className="font-semibold text-gray-900">Order Received</h3>
                            <p className="text-sm text-gray-600">
                                {new Date(order.createdAt).toLocaleString()}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${order.status === "PAID" || order.status === "FULFILLED"
                            ? "bg-green-100"
                            : "bg-gray-100"
                            }`}>
                            <CheckCircle className={`size-5 ${order.status === "PAID" || order.status === "FULFILLED"
                                ? "text-green-600"
                                : "text-gray-400"
                                }`} />
                        </div>
                        <div className="flex-1 pb-8 border-l-2 border-gray-200 pl-6 -ml-5">
                            <h3 className="font-semibold text-gray-900">Payment Confirmed</h3>
                            <p className="text-sm text-gray-600">
                                {order.status === "PAID" || order.status === "FULFILLED"
                                    ? "Payment received"
                                    : "Awaiting payment confirmation"}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${order.status === "FULFILLED" ? "bg-green-100" : "bg-gray-100"
                            }`}>
                            <Package className={`size-5 ${order.status === "FULFILLED" ? "text-green-600" : "text-gray-400"
                                }`} />
                        </div>
                        <div className="flex-1 pl-6 -ml-5">
                            <h3 className="font-semibold text-gray-900">Order Fulfilled</h3>
                            <p className="text-sm text-gray-600">
                                {order.status === "FULFILLED"
                                    ? "Your order has been delivered"
                                    : "Preparing for delivery"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Order Items</h2>
                <div className="space-y-4 mb-6">
                    {order.items.map((item) => (
                        <div key={item.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                            <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
                                <Image
                                    src={item.imageUrlSnapshot}
                                    alt={item.titleSnapshot}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 mb-1">{item.titleSnapshot}</h3>
                                <p className="text-sm text-gray-600 mb-2">
                                    {item.productType === "ORIGINAL" && "Original Painting"}
                                    {item.productType === "PRINT" && "Print"}
                                    {item.productType === "COMMISSION" && "Commission"}
                                </p>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Quantity: {item.quantity}</span>
                                    <span className="font-bold text-teal-700">
                                        RWF {((item.unitPriceCents * item.quantity) / 100).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between text-lg font-bold">
                        <span className="text-gray-900">Total</span>
                        <span className="text-2xl text-teal-700">RWF {(order.totalCents / 100).toLocaleString()}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
