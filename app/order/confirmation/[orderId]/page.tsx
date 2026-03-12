import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CheckCircle, Package, Mail, Phone, MapPin, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getCurrentUserSession } from "@/lib/authorization";

export default async function OrderConfirmationPage({
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

    const user = await getCurrentUserSession();


    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            {/* Success Header */}
            <div className="text-center mb-12 animate-fade-in">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-6 shadow-lg animate-scale-in">
                    <CheckCircle className="size-10 text-white" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
                    Order Request Received!
                </h1>
                <p className="text-xl text-gray-600 mb-6">
                    Thank you for your interest in our artwork
                </p>
                <div className="inline-block px-6 py-3 bg-gray-100 rounded-lg">
                    <p className="text-sm text-gray-600">Order Number</p>
                    <p className="text-2xl font-bold text-teal-700">{order.id.slice(0, 8).toUpperCase()}</p>
                </div>
            </div>

       <div className="flex justify-center">
        {user == null && (
            <div className="flex gap-2 mb-6">
            <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
                Login
                <ArrowRight className="size-5" />
            </Link>
            <Link 
            href="/register"
            className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
                Register
                <ArrowRight className="size-5" />
            </Link>
            </div>
        )}
       </div>

            {/* What's Next */}
            <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl p-8 mb-8 border border-teal-100 animate-fade-in-up">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">What happens next?</h2>
                <div className="space-y-4">
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold">
                            1
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-1">We&apos;ll review your order</h3>
                            <p className="text-gray-700">Our team will review your order details and artwork availability.</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold">
                            2
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-1">We&apos;ll contact you</h3>
                            <p className="text-gray-700">We&apos;ll reach out via email or phone to confirm details and arrange payment.</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold">
                            3
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-1">Prepare & deliver</h3>
                            <p className="text-gray-700">Once payment is confirmed, we&apos;ll prepare your artwork for delivery.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 shadow-sm animate-fade-in-up">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Package className="size-5 text-teal-600" />
                    Order Summary
                </h2>

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
                                        RWF {(item.unitPrice * item.quantity).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between text-lg font-bold">
                        <span className="text-gray-900">Total</span>
                        <span className="text-2xl text-teal-700">RWF {order.total.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 shadow-sm animate-fade-in-up">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Your Contact Information</h2>
                <div className="space-y-3 text-gray-700">
                    {order.customerName && (
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 rounded-lg">
                                <Mail className="size-4 text-gray-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Name</p>
                                <p className="font-medium">{order.customerName}</p>
                            </div>
                        </div>
                    )}
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                            <Mail className="size-4 text-gray-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Email</p>
                            <p className="font-medium">{order.email}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up">
                <Link
                    href={`/order/tracking/${order.id}`}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-lg hover:from-teal-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl font-semibold"
                >
                    Track Order Status
                    <ArrowRight className="size-5" />
                </Link>
                <Link
                    href="/site/galleries"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all font-semibold"
                >
                    Continue Shopping
                </Link>
            </div>
        </div>
    );
}
