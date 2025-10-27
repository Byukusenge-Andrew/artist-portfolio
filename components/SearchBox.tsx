"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export default function SearchBox() {
  const [q, setQ] = useState("");
  const router = useRouter();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = q.trim();
    // Navigate to galleries with query param
    router.push(`/galleries${trimmed ? `?q=${encodeURIComponent(trimmed)}` : ""}`);
  }

  return (
    <form onSubmit={onSubmit} className="relative w-full max-w-md">
      <label htmlFor="site-search" className="sr-only">Search galleries</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="size-4 text-gray-400" />
        </div>
        <input
          id="site-search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search artworks or artists..."
          className="w-full rounded-lg border border-gray-200 pl-10 pr-4 py-2 text-sm bg-white/90 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 hover:bg-white hover:shadow-sm"
          aria-label="Search galleries"
        />
      </div>
    </form>
  );
}
