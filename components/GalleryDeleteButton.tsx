// components/GalleryDeleteButton.tsx
"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Trash2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Props = {
  galleryId: string;
  galleryName: string;
  onDelete?: () => void;
  className?: string;
};

export default function GalleryDeleteButton({
  galleryId,
  galleryName,
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
      const res = await fetch(`/api/galleries/${galleryId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success(`Gallery "${galleryName}" deleted successfully`);
        onDelete?.();
        router.push("/admin/galleries");
        router.refresh();
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to delete gallery");
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
              Delete Gallery?
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Collection will be permanently removed
            </p>
          </div>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
          Are you sure you want to delete <strong className="text-gray-900 dark:text-gray-100">&ldquo;{galleryName}&rdquo;</strong>? Artworks in this gallery will not be deleted; they will remain in your general catalog.
        </p>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors shadow-sm"
          >
            <Trash2 className="size-4" />
            <span>{isDeleting ? "Deleting..." : "Delete Gallery"}</span>
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
          "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all text-xs font-medium"
        }
      >
        <Trash2 className="size-3.5" />
        <span>Delete</span>
      </button>

      {mounted && typeof document !== "undefined" && createPortal(modalContent, document.body)}
    </>
  );
}
