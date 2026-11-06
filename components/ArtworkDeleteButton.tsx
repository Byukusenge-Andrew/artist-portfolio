// components/ArtworkDeleteButton.tsx
"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Trash2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Props = {
  artworkId: string;
  artworkTitle: string;
  onDelete?: () => void;
  className?: string;
};

export default function ArtworkDeleteButton({
  artworkId,
  artworkTitle,
  onDelete,
  className,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/artworks/${artworkId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success(`"${artworkTitle}" was successfully deleted`);
        onDelete?.();
        router.push("/site/galleries");
        router.refresh();
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to delete artwork");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setIsDeleting(false);
      setIsOpen(false);
    }
  };

  const modalContent = isOpen && mounted ? (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={() => !isDeleting && setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-[#1a1a24] border border-gray-200 dark:border-gray-800 p-6 shadow-2xl z-10 animate-scale-in">
        <div className="flex items-center gap-3 text-red-600 dark:text-red-400 mb-4">
          <div className="p-2.5 rounded-xl bg-red-100 dark:bg-red-950/50">
            <AlertCircle className="size-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Delete Artwork?
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              This action is permanent
            </p>
          </div>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
          Are you sure you want to delete <strong className="text-gray-900 dark:text-gray-100">&ldquo;{artworkTitle}&rdquo;</strong>? This will permanently remove the piece from your portfolio, marketplace, and any assigned collections.
        </p>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold shadow-sm transition-all disabled:opacity-50"
          >
            <Trash2 className="size-4" />
            <span>{isDeleting ? "Deleting..." : "Delete Permanently"}</span>
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={
          className ||
          "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all text-sm font-medium"
        }
        aria-label="Delete artwork"
      >
        <Trash2 className="size-4" />
        <span>Delete</span>
      </button>

      {mounted && typeof document !== "undefined" && createPortal(modalContent, document.body)}
    </>
  );
}
