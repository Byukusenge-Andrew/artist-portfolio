"use client";
import { useState } from "react";

type Props = {
  payload: any;
  label?: string;
};

export function AddToCartButton({ payload, label = "Buy" }: Props) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currency: "usd", items: [payload] }),
      });
      const data = await res.json();
      if (res.ok && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        alert("Checkout error");
      }
    } catch (e) {
      alert("Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button disabled={loading} onClick={handleClick} className="px-4 py-2 rounded bg-black text-white">
      {loading ? "Loading..." : label}
    </button>
  );
}


