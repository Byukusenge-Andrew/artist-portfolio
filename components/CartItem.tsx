// components/CartItem.tsx
"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";

interface CartItemProps {
    index: number;
    title: string;
    imageUrl: string;
    productType: string;
    price: number;
    quantity: number;
    onUpdateQuantity: (index: number, quantity: number) => void;
    onRemove: (index: number) => void;
}

export default function CartItem({
    index,
    title,
    imageUrl,
    productType,
    price,
    quantity,
    onUpdateQuantity,
    onRemove,
}: CartItemProps) {
    const productLabel =
        productType === "ORIGINAL"
            ? "Original Painting"
            : productType === "PRINT"
                ? "Print"
                : "Commission";

    return (
        <div className="flex gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 dark:bg-[#1a1a24] rounded-xl border border-gray-200 dark:border-gray-700 hover:border-teal-200 dark:hover:border-teal-700 transition-colors">
            {/* Image */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
                <Image src={imageUrl} alt={title} fill className="object-cover" />
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-gray-100 truncate mb-1">
                    {title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{productLabel}</p>
                <div className="flex items-center gap-3">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 bg-white dark:bg-[#0f0f12] rounded-lg border border-gray-300 dark:border-gray-600 p-0.5">
                        <button
                            onClick={() => onUpdateQuantity(index, quantity - 1)}
                            disabled={quantity <= 1}
                            className="p-2 sm:p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-l-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
                        >
                            <Minus className="size-4" />
                        </button>
                        <span className="text-sm font-medium min-w-[32px] text-center">
                            {quantity}
                        </span>
                        <button
                            onClick={() => onUpdateQuantity(index, quantity + 1)}
                            className="p-2 sm:p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-r-lg transition-colors touch-manipulation"
                        >
                            <Plus className="size-4" />
                        </button>
                    </div>
                    <span className="text-sm font-bold text-teal-700 dark:text-teal-400">
                        RWF {((price * quantity) / 100).toLocaleString()}
                    </span>
                </div>
            </div>

            {/* Remove Button */}
            <button
                onClick={() => onRemove(index)}
                className="p-2 sm:p-2.5 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors self-start touch-manipulation"
                aria-label="Remove item"
            >
                <Trash2 className="size-4 text-red-600" />
            </button>
        </div>
    );
}
