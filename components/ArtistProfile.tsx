// components/ArtistProfile.tsx
"use client";

import { Palette } from "lucide-react";

interface ArtistProfileProps {
    artist: {
        id: string;
        name: string;
        avatarUrl?: string | null;
        bio?: string | null;
    };
}

export default function ArtistProfile({ artist }: ArtistProfileProps) {
    return (
        <div className="mb-6 p-5 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-100 dark:border-purple-800 transition-colors">
            <div className="flex items-center gap-4 mb-3">
                {artist.avatarUrl ? (
                    <img
                        src={artist.avatarUrl}
                        alt={artist.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-purple-200 dark:border-purple-700"
                    />
                ) : (
                    <div className="w-16 h-16 rounded-full bg-purple-200 dark:bg-purple-800 flex items-center justify-center border-2 border-purple-300 dark:border-purple-700">
                        <Palette className="size-8 text-purple-600 dark:text-purple-400" />
                    </div>
                )}
                <div>
                    <div className="text-sm text-purple-700 dark:text-purple-400 font-medium mb-1">Artist</div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{artist.name}</h3>
                </div>
            </div>
            {artist.bio && (
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{artist.bio}</p>
            )}
        </div>
    );
}
