"use client";
import { useState } from "react";
import { CheckCircle2, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function ConfirmReceiptButton({ orderId }: { orderId: string }) {
  const [stage, setStage] = useState<"idle" | "confirming" | "loading" | "done">("idle");

  const handleConfirm = async () => {
    setStage("loading");
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "FULFILLED" }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to confirm");
      }
      setStage("done");
      toast.success("Receipt confirmed! Order marked as fulfilled.");
      setTimeout(() => window.location.reload(), 1200);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error confirming receipt");
      setStage("idle");
    }
  };

  if (stage === "done") {
    return (
      <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-sm font-semibold">
        <CheckCircle2 className="w-4 h-4" />
        Receipt Confirmed!
      </span>
    );
  }

  if (stage === "confirming") {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          Have you received your artwork?
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setStage("idle")}
            className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-colors"
          >
            Yes, confirm
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setStage("confirming")}
      disabled={stage === "loading"}
      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
    >
      {stage === "loading" ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <CheckCircle2 className="w-4 h-4" />
      )}
      {stage === "loading" ? "Confirming…" : "Confirm Receipt"}
    </button>
  );
}
