"use client";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { ShoppingCart, Check } from "lucide-react";

type Props = {
  productType: "ORIGINAL" | "PRINT" | "COMMISSION";
  artworkId?: string;
  printOptionId?: string;
  title: string;
  imageUrl: string;
  price: number; // in RWF
  label?: string;
  className?: string;
};

export function AddToCartButton({
  productType,
  artworkId,
  printOptionId,
  title,
  imageUrl,
  price,
  label = "Add to Cart",
  className = "",
}: Props) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleClick = () => {
    addItem({
      productType,
      artworkId,
      printOptionId,
      quantity: 1,
      title,
      imageUrl,
      price,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <button
      onClick={handleClick}
      disabled={added}
      className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${added
        ? "bg-green-600 text-white"
        : "bg-gradient-to-r from-teal-600 to-emerald-600 text-white hover:from-teal-700 hover:to-emerald-700 shadow-lg hover:shadow-xl hover:scale-105"
        } ${className}`}
    >
      {added ? (
        <>
          <Check className="size-5" />
          Added to Cart
        </>
      ) : (
        <>
          <ShoppingCart className="size-5" />
          {label}
        </>
      )}
    </button>
  );
}

