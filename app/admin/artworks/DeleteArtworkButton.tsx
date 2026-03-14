"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function DeleteArtworkButton({ id }: { id: string }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const executeDelete = async () => {
        setIsDeleting(true);
        try {
            const res = await fetch("/api/artworks", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to delete artwork");
            }

            toast.success("Artwork deleted successfully");
            router.refresh();
        } catch (error) {
            console.error("Error deleting artwork:", error);
            toast.error(error instanceof Error ? error.message : "Failed to delete artwork");
            setIsDeleting(false); // only reset on error since success navigates away/refreshes
        }
    };

    const handleDeleteClick = () => {
        toast("Delete artwork?", {
            description: "This action cannot be undone.",
            action: {
                label: "Delete",
                onClick: () => executeDelete(),
            },
            cancel: {
                label: "Cancel",
                onClick: () => {},
            },
        });
    };

    return (
        <button
            onClick={handleDeleteClick}
            disabled={isDeleting}
            className={`p-2 rounded-lg transition-colors ${
                isDeleting 
                    ? "text-gray-400 dark:text-gray-600 cursor-not-allowed" 
                    : "text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
            }`}
            title="Delete"
        >
            {isDeleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
        </button>
    );
}
