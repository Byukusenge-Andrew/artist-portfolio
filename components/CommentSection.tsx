"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Trash2, MessageCircle, AlertCircle } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

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

    const [commentToDelete, setCommentToDelete] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        if (!currentUserId) {
            toast.error("Please log in to post a comment", {
                action: {
                    label: "Log In",
                    onClick: () => router.push("/auth/login"),
                },
            });
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
            toast.success("Comment posted!");
        } catch (error) {
            toast.error("Failed to post comment. Please try again.");
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    const confirmDelete = async () => {
        if (!commentToDelete) return;

        try {
            const res = await fetch(`/api/comments/${commentToDelete}`, { method: "DELETE" });
            if (res.ok) {
                setComments(comments.filter(c => c.id !== commentToDelete));
                toast.success("Comment deleted");
            } else {
                toast.error("Failed to delete comment");
            }
        } catch (error) {
            toast.error("Error deleting comment");
            console.error(error);
        } finally {
            setCommentToDelete(null);
        }
    };

    return (
        <div className="mt-8 space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2 dark:text-gray-100">
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
                        className="w-full border dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-[#1a1a24] dark:text-gray-200 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-teal-500 outline-none resize-none min-h-[80px] transition-colors"
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
                    <div key={comment.id} className="flex gap-4 p-4 bg-gray-50 dark:bg-[#1a1a24] rounded-lg group transition-colors">
                        <div className="shrink-0">
                            {comment.user.avatarUrl ? (
                                <img src={comment.user.avatarUrl} alt={comment.user.name || "User"} className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm font-bold">
                                    {(comment.user.name || "U")[0].toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                                <div className="font-semibold text-gray-900 dark:text-gray-100">{comment.user.name || "Anonymous"}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {new Date(comment.createdAt).toLocaleDateString()}
                                    {currentUserId === comment.user.id && (
                                        <button onClick={() => setCommentToDelete(comment.id)} className="ml-3 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity" title="Delete comment">
                                            <Trash2 className="size-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap text-sm">{comment.content}</p>
                        </div>
                    </div>
                ))}
                {comments.length === 0 && (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">No comments yet. Be the first to share your thoughts!</p>
                )}
            </div>

            {/* Delete Comment Modal */}
            {commentToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#1a1a24] border border-gray-200 dark:border-gray-800 p-6 shadow-2xl animate-scale-in">
                        <div className="flex items-center gap-3 text-red-600 dark:text-red-400 mb-3">
                            <AlertCircle className="size-5" />
                            <h4 className="font-bold text-gray-900 dark:text-gray-100">Delete Comment?</h4>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
                            Are you sure you want to remove your comment? This cannot be undone.
                        </p>
                        <div className="flex justify-end gap-2.5">
                            <button
                                onClick={() => setCommentToDelete(null)}
                                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white shadow-sm transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
