"use client";

import { useState, useEffect, useRef } from "react";
import { Send, User as UserIcon, Loader2, MessageSquare } from "lucide-react";
import Image from "next/image";

type Message = {
    id: string;
    content: string;
    createdAt: string;
    sender: {
        id: string;
        name: string | null;
        email: string;
        avatarUrl: string | null;
        role: string;
    };
};

export default function CommissionMessages({
    commissionId,
    currentUserId,
}: {
    commissionId: string;
    currentUserId: string;
}) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const res = await fetch(`/api/commissions/${commissionId}/messages`);
                if (!res.ok) throw new Error("Failed to fetch messages");
                const data = await res.json();
                setMessages(data);
            } catch (err) {
                console.error(err);
                if (messages.length === 0) {
                    setError("Failed to load conversation");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();
        // Optional: Polling every 10 seconds for new messages
        const interval = setInterval(fetchMessages, 10000);
        return () => clearInterval(interval);
    }, [commissionId, messages.length]);

    useEffect(() => {
        // Auto-scroll to bottom when messages load
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchMessages = async () => {
        try {
            const res = await fetch(`/api/commissions/${commissionId}/messages`);
            if (!res.ok) throw new Error("Failed to fetch messages");
            const data = await res.json();
            setMessages(data);
        } catch (err) {
            console.error(err);
            if (messages.length === 0) {
                setError("Failed to load conversation");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newMessage.trim() || sending) return;

        setSending(true);
        setError("");

        try {
            const res = await fetch(`/api/commissions/${commissionId}/messages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: newMessage.trim() }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to send message");
            }

            const message = await res.json();

            // Optimistically update the UI
            setMessages(prev => [...prev, message]);
            setNewMessage("");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to send message");
            console.error(err);
        } finally {
            setSending(false);
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("en-US", {
            hour: "numeric",
            minute: "2-digit",
        }).format(date);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
        }).format(date);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-[#141418]">
                <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[500px] border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-white dark:bg-[#1a1a24] shadow-sm">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#141418]">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    Messages
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400">
                        {messages.length}
                    </span>
                </h3>
            </div>

            {/* Message History */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400">
                        <MessageSquare className="w-12 h-12 mb-3 text-gray-300 dark:text-gray-600" />
                        <p>No messages yet.</p>
                        <p className="text-sm mt-1">Send a message to start the discussion.</p>
                    </div>
                ) : (
                    messages.map((msg, idx) => {
                        const isMine = msg.sender.id === currentUserId;
                        const isFirstOfGroup = idx === 0 || messages[idx - 1].sender.id !== msg.sender.id;

                        // Check if we need a date divider
                        const prevDate = idx > 0 ? new Date(messages[idx - 1].createdAt).toDateString() : null;
                        const currDate = new Date(msg.createdAt).toDateString();
                        const showDateDivider = prevDate !== currDate;

                        return (
                            <div key={msg.id}>
                                {showDateDivider && (
                                    <div className="flex justify-center my-6">
                                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                                            {formatDate(msg.createdAt)}
                                        </span>
                                    </div>
                                )}

                                <div className={`flex gap-3 ${isMine ? "flex-row-reverse" : "flex-row"} ${isFirstOfGroup ? "mt-4" : "mt-1"}`}>
                                    {isFirstOfGroup ? (
                                        <div className="flex-shrink-0 relative w-8 h-8 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600">
                                            {msg.sender.avatarUrl ? (
                                                <Image src={msg.sender.avatarUrl} alt={msg.sender.name || "User"} fill sizes="40px" className="object-cover" />
                                            ) : (
                                                <UserIcon className="w-4 h-4 text-gray-500 dark:text-gray-400 m-auto mt-2" />
                                            )}
                                        </div>
                                    ) : (
                                        <div className="w-8 flex-shrink-0" /> // Spacer
                                    )}

                                    <div className={`flex flex-col max-w-[75%] ${isMine ? "items-end" : "items-start"}`}>
                                        {isFirstOfGroup && (
                                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 mx-1">
                                                {msg.sender.name || "User"}
                                            </span>
                                        )}
                                        <div className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}>
                                            <div
                                                className={`px-4 py-2.5 rounded-2xl whitespace-pre-wrap text-[15px] leading-relaxed relative ${isMine
                                                    ? "bg-teal-600 text-white rounded-tr-none"
                                                    : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-tl-none"
                                                    }`}
                                            >
                                                {msg.content}
                                            </div>
                                            <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 mx-1">
                                                {formatTime(msg.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a24]">
                {error && (
                    <p className="text-red-500 text-sm mb-2">{error}</p>
                )}
                <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                    <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 max-h-32 min-h-[44px] py-2.5 px-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#141418] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-600 resize-none transition-all"
                        rows={1}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage(e);
                            }
                        }}
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="p-2.5 rounded-xl bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0 h-[44px] w-[44px] flex items-center justify-center"
                    >
                        {sending ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Send className="w-5 h-5" />
                        )}
                    </button>
                </form>
                <p className="text-[10px] text-gray-400 mt-2 text-center">Press Enter to send, Shift+Enter for new line</p>
            </div>
        </div>
    );
}
