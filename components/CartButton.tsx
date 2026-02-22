"use client";

import { useCart } from "@/contexts/CartContext";
import { ShoppingBag } from "lucide-react";
import { useState } from "react";
import ShoppingCart from "./ShoppingCart";

export default function CartButton() {
    const { totalItems } = useCart();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="relative p-2 hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded-lg transition-colors group"
                aria-label="Shopping cart"
            >
                <ShoppingBag className="size-5 text-gray-700 dark:text-gray-300 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors" />
                {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-teal-600 to-emerald-600 text-white text-xs font-bold rounded-full size-5 flex items-center justify-center shadow-lg">
                        {totalItems}
                    </span>
                )}
            </button>

            <ShoppingCart isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    );
}
