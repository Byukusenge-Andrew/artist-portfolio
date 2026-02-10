"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type Props = {
    artworkId?: string;
    artistId?: string;
    initialLikes: number;
    initialIsLiked: boolean;
};

export default function LikeButton({ artworkId, artistId, initialLikes, initialIsLiked }: Props) {
    const [likes, setLikes] = useState(initialLikes);
    const [isLiked, setIsLiked] = useState(initialIsLiked);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleToggle = async () => {
        // Optimistic update
        const prevLikes = likes;
        const prevIsLiked = isLiked;

        setIsLiked(!isLiked);
        setLikes(isLiked ? likes - 1 : likes + 1);
        setIsLoading(true);

        try {
            const res = await fetch("/api/likes/toggle", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ artworkId, artistId }),
            });

            if (res.status === 401) {
                // Revert and redirect
                setIsLiked(prevIsLiked);
                setLikes(prevLikes);
                router.push("/auth/login");
                return;
            }

            if (!res.ok) throw new Error("Failed to toggle like");

            const data = await res.json();
            // Ensure sync
            setIsLiked(data.liked);
        } catch (error) {
            // Revert on error
            setIsLiked(prevIsLiked);
            setLikes(prevLikes);
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleToggle}
            disabled={isLoading}
            className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300",
                isLiked
                    ? "text-red-500 bg-red-50 hover:bg-red-100"
                    : "text-gray-500 hover:text-red-500 hover:bg-gray-100"
            )}
        >
            <Heart className={cn("size-5 transition-transform", isLiked && "fill-current scale-110")} />
            <span className="font-medium text-sm">{likes}</span>
        </button>
    );
}
