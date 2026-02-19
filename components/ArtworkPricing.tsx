// components/ArtworkPricing.tsx
"use client";

import { AddToCartButton } from "@/components/AddToCartButton";
import Link from "next/link";

type PrintOption = {
    id: string;
    name: string;
    priceCents: number;
};

interface ArtworkPricingProps {
    artworkId: string;
    title: string;
    imageUrl: string;
    isOriginalAvailable: boolean;
    originalPriceCents?: number | null;
    printEnabled: boolean;
    printOptions: PrintOption[];
}

export default function ArtworkPricing({
    artworkId,
    title,
    imageUrl,
    isOriginalAvailable,
    originalPriceCents,
    printEnabled,
    printOptions,
}: ArtworkPricingProps) {
    return (
        <div className="border-t border-gray-200 pt-6 space-y-4">
            {isOriginalAvailable && originalPriceCents && (
                <div className="p-6 bg-gradient-to-br from-teal-50 via-emerald-50 to-teal-50 rounded-xl border border-teal-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Original Artwork</h3>
                            <p className="text-sm text-gray-600">One of a kind piece</p>
                        </div>
                        <div className="text-3xl font-bold text-teal-700">
                            {(originalPriceCents / 100).toLocaleString()} RWF
                        </div>
                    </div>
                    <AddToCartButton
                        productType="ORIGINAL"
                        artworkId={artworkId}
                        title={title}
                        imageUrl={imageUrl}
                        price={originalPriceCents}
                        label="Add Original to Cart"
                    />
                </div>
            )}

            {printEnabled && printOptions.length > 0 && (
                <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Prints</h3>
                    <div className="space-y-3">
                        {printOptions.map((opt) => (
                            <div
                                key={opt.id}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <div>
                                    <div className="font-medium text-gray-900">{opt.name}</div>
                                    <div className="text-sm text-gray-600">
                                        {(opt.priceCents / 100).toLocaleString()} RWF
                                    </div>
                                </div>
                                <AddToCartButton
                                    productType="PRINT"
                                    printOptionId={opt.id}
                                    title={`${title} - ${opt.name}`}
                                    imageUrl={imageUrl}
                                    price={opt.priceCents}
                                    label="Add to Cart"
                                    className="text-sm px-4 py-2"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {!isOriginalAvailable && !printEnabled && (
                <div className="p-6 bg-gray-50 rounded-xl text-center">
                    <p className="text-gray-600">This artwork is currently not available for purchase.</p>
                    <Link href="/site/galleries" className="inline-block mt-4 text-teal-600 hover:text-teal-700 font-medium">
                        Browse more artworks
                    </Link>
                </div>
            )}
        </div>
    );
}
