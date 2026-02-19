// components/Pagination.tsx
"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    basePath: string;
    searchQuery?: string;
}

export default function Pagination({
    currentPage,
    totalPages,
    basePath,
    searchQuery,
}: PaginationProps) {
    if (totalPages <= 1) return null;

    const buildHref = (page: number) => {
        const params = new URLSearchParams();
        if (searchQuery) params.set("q", searchQuery);
        params.set("page", String(page));
        return `${basePath}?${params.toString()}`;
    };

    // Build page numbers to show (max 5, centered on current)
    const pages: number[] = [];
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, start + 4);
    for (let i = start; i <= end; i++) {
        pages.push(i);
    }

    return (
        <nav
            className="flex items-center justify-center gap-2 mt-12"
            aria-label="Pagination"
        >
            {/* Previous */}
            {currentPage > 1 ? (
                <Link
                    href={buildHref(currentPage - 1)}
                    className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#1a1a24] border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-teal-300 dark:hover:border-teal-600 transition-all"
                >
                    <ChevronLeft className="size-4" />
                    Prev
                </Link>
            ) : (
                <span className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-400 dark:text-gray-600 bg-gray-50 dark:bg-[#141418] border border-gray-200 dark:border-gray-700 rounded-lg cursor-not-allowed">
                    <ChevronLeft className="size-4" />
                    Prev
                </span>
            )}

            {/* Page Numbers */}
            {pages[0] > 1 && (
                <>
                    <Link
                        href={buildHref(1)}
                        className="inline-flex items-center justify-center w-10 h-10 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#1a1a24] border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-teal-300 dark:hover:border-teal-600 transition-all"
                    >
                        1
                    </Link>
                    {pages[0] > 2 && (
                        <span className="text-gray-400 dark:text-gray-500 px-1">…</span>
                    )}
                </>
            )}

            {pages.map((page) => (
                <Link
                    key={page}
                    href={buildHref(page)}
                    className={`inline-flex items-center justify-center w-10 h-10 text-sm font-medium rounded-lg transition-all ${page === currentPage
                        ? "bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md"
                        : "text-gray-700 dark:text-gray-300 bg-white dark:bg-[#1a1a24] border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-teal-300 dark:hover:border-teal-600"
                        }`}
                >
                    {page}
                </Link>
            ))}

            {pages[pages.length - 1] < totalPages && (
                <>
                    {pages[pages.length - 1] < totalPages - 1 && (
                        <span className="text-gray-400 dark:text-gray-500 px-1">…</span>
                    )}
                    <Link
                        href={buildHref(totalPages)}
                        className="inline-flex items-center justify-center w-10 h-10 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#1a1a24] border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-teal-300 dark:hover:border-teal-600 transition-all"
                    >
                        {totalPages}
                    </Link>
                </>
            )}

            {/* Next */}
            {currentPage < totalPages ? (
                <Link
                    href={buildHref(currentPage + 1)}
                    className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#1a1a24] border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-teal-300 dark:hover:border-teal-600 transition-all"
                >
                    Next
                    <ChevronRight className="size-4" />
                </Link>
            ) : (
                <span className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-400 dark:text-gray-600 bg-gray-50 dark:bg-[#141418] border border-gray-200 dark:border-gray-700 rounded-lg cursor-not-allowed">
                    Next
                    <ChevronRight className="size-4" />
                </span>
            )}
        </nav>
    );
}
