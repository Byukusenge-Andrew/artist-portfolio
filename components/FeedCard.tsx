import Image from "next/image";
import { Heart, MessageCircle, MoreHorizontal, Play } from "lucide-react";

type Props = {
  title: string;
  author: string;
  imageUrl?: string | null;
  isVideo?: boolean;
  likesCount?: number;
  commentsCount?: number;
};

export default function FeedCard({ title, author, imageUrl, isVideo, likesCount = 0, commentsCount = 0 }: Props) {
  return (
    <article className="rounded-2xl border bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 overflow-hidden">
      <header className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={author}
              width={36}
              height={36}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="size-9 rounded-full bg-gray-100 border" />
          )}
          <div>
            <div className="text-sm font-medium text-gray-800">{title}</div>
            <div className="text-xs text-gray-500">by {author}</div>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <MoreHorizontal className="size-5" />
        </button>
      </header>

      <div className="relative">
        <div className="relative aspect-[4/3]">
          {imageUrl ? (
            <Image src={imageUrl} alt={title} fill className="object-cover" />
          ) : (
            <div className="absolute inset-0 grid place-items-center bg-gray-50 text-gray-400 text-sm">
              No image uploaded
            </div>
          )}
        </div>
        {isVideo && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="inline-flex items-center justify-center rounded-full bg-teal-600 text-white size-14 shadow-lg/50 shadow-teal-600/30">
              <Play className="size-7" />
            </span>
          </div>
        )}
      </div>

      <footer className="p-3 flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-4">
          <button className="inline-flex items-center gap-2 hover:text-teal-700">
            <Heart className="size-4" /> {likesCount}
          </button>
          <button className="inline-flex items-center gap-2 hover:text-teal-700">
            <MessageCircle className="size-4" /> {commentsCount}
          </button>
        </div>
        <div className="text-xs">3m ago</div>
      </footer>
    </article>
  );
}


