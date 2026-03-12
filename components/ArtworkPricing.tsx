// components/ArtworkPricing.tsx
"use client";

import { AddToCartButton } from "@/components/AddToCartButton";
import Link from "next/link";

type PrintOption = {
    id: string;
    name: string;
    price: number;
};

interface ArtworkPricingProps {
    artworkId: string;
    title: string;
    imageUrl: string;
    isOriginalAvailable: boolean;
    originalPrice?: number | null;
    printEnabled: boolean;
    printOptions: PrintOption[];
}

export default function ArtworkPricing({
    artworkId,
    title,
    imageUrl,
    isOriginalAvailable,
    originalPrice,
    printEnabled,
    printOptions,
}: ArtworkPricingProps) {
    return (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
            {isOriginalAvailable && originalPrice && (
                <div className="p-6 bg-gradient-to-br from-teal-50 via-emerald-50 to-teal-50 dark:from-teal-900/20 dark:via-emerald-900/20 dark:to-teal-900/20 rounded-xl border border-teal-100 dark:border-teal-800 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Original Artwork</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">One of a kind piece</p>
                        </div>
                        <div className="text-3xl font-bold text-teal-700 dark:text-teal-400">
                            {originalPrice.toLocaleString()} RWF
                        </div>
                    </div>
                    <AddToCartButton
                        productType="ORIGINAL"
                        artworkId={artworkId}
                        title={title}
                        imageUrl={imageUrl}
                        price={originalPrice}
                        label="Add Original to Cart"
                    />
                </div>
            )}

            {printEnabled && printOptions.length > 0 && (
                <div className="p-6 bg-white dark:bg-[#1a1a24] rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Available Prints</h3>
                    <div className="space-y-3">
                        {printOptions.map((opt) => (
                            <div
                                key={opt.id}
                                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#141418] rounded-lg hover:bg-gray-100 dark:hover:bg-[#1a1a24] transition-colors"
                            >
                                <div>
                                    <div className="font-medium text-gray-900 dark:text-gray-100">{opt.name}</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        {opt.price.toLocaleString()} RWF
                                    </div>
                                </div>
                                <AddToCartButton
                                    productType="PRINT"
                                    printOptionId={opt.id}
                                    title={`${title} - ${opt.name}`}
                                    imageUrl={imageUrl}
                                    price={opt.price}
                                    label="Add to Cart"
                                    className="text-sm px-4 py-2"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {!isOriginalAvailable && !printEnabled && (
                <div className="p-6 bg-gray-50 dark:bg-[#1a1a24] rounded-xl text-center">
                    <p className="text-gray-600 dark:text-gray-400">This artwork is currently not available for purchase.</p>
                    <Link href="/site/galleries" className="inline-block mt-4 text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium">
                        Browse more artworks
                    </Link>
                </div>
            )}
        </div>
    );
}
