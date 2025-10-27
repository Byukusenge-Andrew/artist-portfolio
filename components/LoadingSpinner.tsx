"use client";

import { Loader2 } from "lucide-react";

export function LoadingSpinner({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 className="size-12 animate-spin text-teal-600 mb-4" />
      <p className="text-gray-600 font-medium">{text}</p>
    </div>
  );
}
