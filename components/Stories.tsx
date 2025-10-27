import Image from "next/image";
import { User } from "lucide-react";

export type StoryArtist = { name: string; avatarUrl?: string | null };

export default function Stories({ artists }: { artists: StoryArtist[] }) {
  return (
    <div className="rounded-2xl border bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 p-4">
      {artists.length === 0 ? (
        <div className="text-sm text-gray-600">No artists yet</div>
      ) : (
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar">
          {artists.map((s) => (
            <div key={s.name} className="flex flex-col items-center gap-2">
              <div className="relative">
                <div className="rounded-full p-[2px] bg-gradient-to-tr from-teal-500 to-rose-400">
                  {s.avatarUrl ? (
                    <Image
                      src={s.avatarUrl}
                      alt={s.name}
                      width={60}
                      height={60}
                      className="rounded-full border-2 border-white object-cover"
                    />
                  ) : (
                    <div className="size-[60px] rounded-full bg-white border-2 border-white flex items-center justify-center text-gray-400">
                      <User className="size-5" />
                    </div>
                  )}
                </div>
              </div>
              <div className="text-xs text-gray-600 max-w-[72px] truncate">{s.name}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


