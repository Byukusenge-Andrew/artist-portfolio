"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Trash2, MessageCircle } from "lucide-react";
import Image from "next/image";

type Comment = {
    id: string;
    content: string;
    createdAt: string;
    user: {
        id: string;
        name: string | null;
        avatarUrl: string | null;
    };
};

type Props = {
    artworkId?: string;
    artistId?: string;
    currentUserId?: string;
};

export default function CommentSection({ artworkId, artistId, currentUserId }: Props) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchComments = async () => {
            const params = new URLSearchParams();
            if (artworkId) params.append("artworkId", artworkId);
            if (artistId) params.append("artistId", artistId);

            const res = await fetch(`/api/comments?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setComments(data);
            }
        };
        fetchComments();
    }, [artworkId, artistId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        if (!currentUserId) {
            router.push("/auth/login");
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch("/api/comments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: newComment, artworkId, artistId }),
            });

            if (!res.ok) throw new Error("Failed to post comment");

            const comment = await res.json();
            setComments([comment, ...comments]);
            setNewComment("");
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (commentId: string) => {
        if (!confirm("Are you sure you want to delete this comment?")) return;

        try {
            const res = await fetch(`/api/comments/${commentId}`, { method: "DELETE" });
            if (res.ok) {
                setComments(comments.filter(c => c.id !== commentId));
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="mt-8 space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
                <MessageCircle className="size-5" />
                Comments ({comments.length})
            </h3>

            {/* Input */}
            <form onSubmit={handleSubmit} className="flex gap-4">
                <div className="flex-1">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder={currentUserId ? "Add a comment..." : "Login to comment"}
                        disabled={submitting}
                        className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-teal-500 outline-none resize-none min-h-[80px]"
                    />
                </div>
                <button
                    disabled={submitting || !newComment.trim()}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg h-fit hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {submitting ? "Posting..." : "Post"}
                </button>
            </form>

            {/* List */}
            <div className="space-y-6">
                {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg group">
                        <div className="shrink-0">
                            {comment.user.avatarUrl ? (
                                <img src={comment.user.avatarUrl} alt={comment.user.name || "User"} className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-bold">
                                    {(comment.user.name || "U")[0].toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                                <div className="font-semibold text-gray-900">{comment.user.name || "Anonymous"}</div>
                                <div className="text-xs text-gray-500">
                                    {new Date(comment.createdAt).toLocaleDateString()}
                                    {currentUserId === comment.user.id && (
                                        <button onClick={() => handleDelete(comment.id)} className="ml-3 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Trash2 className="size-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">{comment.content}</p>
                        </div>
                    </div>
                ))}
                {comments.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No comments yet. Be the first to share your thoughts!</p>
                )}
            </div>
        </div>
    );
}
