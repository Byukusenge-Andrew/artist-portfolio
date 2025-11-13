// components/ArtworkDeleteButton.tsx
"use client";

import { useState } from "react";
import { Trash2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

type Props = {
  artworkId: string;
  artworkTitle: string;
  onDelete?: () => void;
};

export default function ArtworkDeleteButton({ artworkId, artworkTitle, onDelete }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/artworks/${artworkId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        // Success: trigger callback + redirect
        onDelete?.();
        router.push("/galleries");
        router.refresh();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to delete artwork");
      }
    } catch (err) {
      alert("Network error. Please try again.");
    } finally {
      setIsDeleting(false);
      setIsOpen(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 text-sm font-medium"
        aria-label="Delete artwork"
      >
        <Trash2 className="size-4" />
        Delete
      </button>

      {/* Confirmation Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertCircle className="size-6" />
              <h3 className="text-lg font-semibold">Delete Artwork?</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{artworkTitle}</strong>? This action{" "}
              <span className="font-semibold text-red-600">cannot be undone</span>.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsOpen(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isDeleting ? (
                  <>Deleting...</>
                ) : (
                  <>
                    <Trash2 className="size-4" />
                    Delete Permanently
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}