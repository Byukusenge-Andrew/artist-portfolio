"use client";

import { useCart } from "@/contexts/CartContext";
import { X, Minus, Plus, ShoppingBag, ArrowRight, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ShoppingCartProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ShoppingCart({ isOpen, onClose }: ShoppingCartProps) {
    const { items, removeItem, updateQuantity, totalItems, totalPrice, clearCart } = useCart();
    const router = useRouter();

    const handleCheckout = () => {
        onClose();
        router.push("/order/request");
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop Overlay */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                style={{ zIndex: 9998 }}
                onClick={onClose}
            />

            {/* Cart Sidebar */}
            <div
                className="fixed top-0 right-0 h-screen w-full sm:w-[min(480px,90vw)] bg-white shadow-2xl"
                style={{ zIndex: 9999 }}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-white">
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-lg">
                                <ShoppingBag className="size-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Shopping Cart</h2>
                                <p className="text-sm text-gray-500">
                                    {totalItems} {totalItems === 1 ? "item" : "items"}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            aria-label="Close cart"
                        >
                            <X className="size-5 text-gray-600" />
                        </button>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-4 bg-white">
                        {items.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center py-12">
                                <div className="p-4 bg-gray-100 rounded-full mb-4">
                                    <ShoppingBag className="size-12 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Your cart is empty
                                </h3>
                                <p className="text-gray-600 mb-6">Add some artworks to get started!</p>
                                <Link
                                    href="/site/galleries"
                                    onClick={onClose}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-lg hover:from-teal-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl"
                                >
                                    Browse Galleries
                                    <ArrowRight className="size-4" />
                                </Link>
                            </div>
                        ) : (
                            <>
                                {items.map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-teal-200 transition-colors"
                                    >
                                        {/* Image */}
                                        <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
                                            <Image
                                                src={item.imageUrl}
                                                alt={item.title}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-sm sm:text-base text-gray-900 truncate mb-1">
                                                {item.title}
                                            </h3>
                                            <p className="text-sm text-gray-600 mb-2">
                                                {item.productType === "ORIGINAL" && "Original Painting"}
                                                {item.productType === "PRINT" && "Print"}
                                                {item.productType === "COMMISSION" && "Commission"}
                                            </p>
                                            <div className="flex items-center gap-3">
                                                {/* Quantity Controls */}
                                                <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-300 p-0.5">
                                                    <button
                                                        onClick={() => updateQuantity(index, item.quantity - 1)}
                                                        disabled={item.quantity <= 1}
                                                        className="p-2 sm:p-2.5 hover:bg-gray-100 rounded-l-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
                                                    >
                                                        <Minus className="size-4" />
                                                    </button>
                                                    <span className="text-sm font-medium min-w-[32px] text-center">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => updateQuantity(index, item.quantity + 1)}
                                                        className="p-2 sm:p-2.5 hover:bg-gray-100 rounded-r-lg transition-colors touch-manipulation"
                                                    >
                                                        <Plus className="size-4" />
                                                    </button>
                                                </div>
                                                <span className="text-sm font-bold text-teal-700">
                                                    RWF {(item.price * item.quantity).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Remove Button */}
                                        <button
                                            onClick={() => removeItem(index)}
                                            className="p-2 sm:p-2.5 hover:bg-red-50 rounded-lg transition-colors self-start touch-manipulation"
                                            aria-label="Remove item"
                                        >
                                            <Trash2 className="size-4 text-red-600" />
                                        </button>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    {items.length > 0 && (
                        <div className="border-t border-gray-200 p-4 sm:p-6 space-y-3 sm:space-y-4 bg-gray-50">
                            {/* Total */}
                            <div className="flex items-center justify-between text-lg">
                                <span className="font-semibold text-gray-900">Total</span>
                                <span className="font-bold text-2xl text-teal-700">
                                    RWF {totalPrice.toLocaleString()}
                                </span>
                            </div>

                            {/* Buttons */}
                            <div className="space-y-2">
                                <button
                                    onClick={handleCheckout}
                                    className="w-full py-3.5 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-teal-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                                >
                                    Request Order
                                    <ArrowRight className="size-5" />
                                </button>
                                <button
                                    onClick={clearCart}
                                    className="w-full py-2.5 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                                >
                                    Clear Cart
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
