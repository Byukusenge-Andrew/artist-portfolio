// components/ArtistProfile.tsx
"use client";

import { Palette } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

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
        <Link href={`/site/artist/${artist.id}`} className="block mb-6 group">
            <div className="p-5 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-100 dark:border-purple-800 transition-all hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md">
                <div className="flex items-center gap-4 mb-3">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-purple-200 dark:border-purple-700 bg-white dark:bg-gray-800 flex-shrink-0">
                        {artist.avatarUrl ? (
                            <Image
                                src={artist.avatarUrl}
                                alt={artist.name}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-purple-200 dark:bg-purple-800 flex items-center justify-center">
                                <Palette className="size-8 text-purple-600 dark:text-purple-400" />
                            </div>
                        )}
                    </div>
                    <div>
                        <div className="text-sm text-purple-700 dark:text-purple-400 font-medium mb-1">View Artist Profile</div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors">{artist.name}</h3>
                    </div>
                </div>
                {artist.bio && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-2">{artist.bio}</p>
                )}
            </div>
        </Link>
    );
}
