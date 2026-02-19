"use client";

import Link from "next/link";
import { MoveLeft, Home, Search } from "lucide-react";
import SearchBox from "@/components/SearchBox";

export default function NotFound() {
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 animate-fade-in">
            <div className="mb-8 relative">
                <h1 className="text-9xl font-bold text-gray-100 dark:text-gray-800 select-none">404</h1>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-semibold text-gray-900 dark:text-gray-100 bg-white/80 dark:bg-[#1a1a24]/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                        Page Not Found
                    </span>
                </div>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Oops! You seem to be lost in the gallery.
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-10 text-lg">
                The artwork or page you are looking for might have been moved, deleted, or never existed to begin with.
            </p>

            <div className="w-full max-w-md mb-10">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 font-medium">Try searching for something else:</p>
                <SearchBox />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <Link
                    href="/"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                >
                    <Home className="size-5" />
                    Back to Home
                </Link>
                <button
                    onClick={() => window.history.back()}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-[#1a1a24] rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-300"
                >
                    <MoveLeft className="size-5" />
                    Go Back
                </button>
            </div>

            <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700 w-full max-w-2xl px-4 flex flex-col sm:flex-row justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>Need help? <Link href="/contact" className="text-teal-600 dark:text-teal-400 hover:underline">Contact Support</Link></span>
                <div className="mt-2 sm:mt-0 space-x-4">
                    <Link href="/site/galleries" className="hover:text-teal-600 transition-colors">Galleries</Link>
                    <Link href="/site/artists" className="hover:text-teal-600 transition-colors">Artists</Link>
                </div>
            </div>
        </div>
    );
}
