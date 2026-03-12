"use client";

import { useCart } from "@/contexts/CartContext";
import { X, ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CartItem from "@/components/CartItem";

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
                className="fixed top-0 right-0 h-screen w-full sm:w-[min(480px,90vw)] bg-white dark:bg-[#0f0f12] shadow-2xl transition-colors"
                style={{ zIndex: 9999 }}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f0f12] transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-lg">
                                <ShoppingBag className="size-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">Shopping Cart</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {totalItems} {totalItems === 1 ? "item" : "items"}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                            aria-label="Close cart"
                        >
                            <X className="size-5 text-gray-600 dark:text-gray-400" />
                        </button>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-4 bg-white dark:bg-[#0f0f12] transition-colors">
                        {items.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center py-12">
                                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                                    <ShoppingBag className="size-12 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                    Your cart is empty
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">Add some artworks to get started!</p>
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
                                    <CartItem
                                        key={index}
                                        index={index}
                                        title={item.title}
                                        imageUrl={item.imageUrl}
                                        productType={item.productType}
                                        price={item.price}
                                        quantity={item.quantity}
                                        onUpdateQuantity={updateQuantity}
                                        onRemove={removeItem}
                                    />
                                ))}
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    {items.length > 0 && (
                        <div className="border-t border-gray-200 dark:border-gray-700 p-4 sm:p-6 space-y-3 sm:space-y-4 bg-gray-50 dark:bg-[#141418] transition-colors">
                            <div className="flex items-center justify-between text-lg">
                                <span className="font-semibold text-gray-900 dark:text-gray-100">Total</span>
                                <span className="font-bold text-2xl text-teal-700 dark:text-teal-400">
                                    RWF {totalPrice.toLocaleString()}
                                </span>
                            </div>
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
                                    className="w-full py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 font-medium transition-colors"
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
