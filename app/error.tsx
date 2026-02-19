"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Application error:", error);
    }, [error]);

    return (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center space-y-6 animate-fade-in">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg">
                    <AlertTriangle className="size-8 text-white" />
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Something went wrong
                    </h2>
                    <p className="text-gray-600">
                        {error.message?.includes("database") || error.message?.includes("prisma")
                            ? "We're having trouble connecting to our servers. Please try again in a moment."
                            : "An unexpected error occurred. Our team has been notified."}
                    </p>
                    {error.digest && (
                        <p className="text-xs text-gray-400 mt-2 font-mono">
                            Error ID: {error.digest}
                        </p>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={reset}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-teal-700 hover:to-emerald-700 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                    >
                        <RefreshCw className="size-4" />
                        Try Again
                    </button>
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-teal-600 hover:text-teal-700 transition-all duration-300"
                    >
                        <Home className="size-4" />
                        Go Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
