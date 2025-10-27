"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageLightbox } from "./ImageLightbox";
import { Expand } from "lucide-react";

interface ArtworkImageProps {
  imageUrl: string;
  title: string;
}

export function ArtworkImage({ imageUrl, title }: ArtworkImageProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  return (
    <>
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 shadow-xl group cursor-pointer"
           onClick={() => setIsLightboxOpen(true)}>
        <Image 
          src={imageUrl} 
          alt={title} 
          fill 
          className="object-cover transition-transform duration-300 group-hover:scale-105" 
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 bg-white/90 backdrop-blur-sm rounded-full shadow-lg">
            <Expand className="size-6 text-gray-900" />
          </div>
        </div>
      </div>
      
      <ImageLightbox
        src={imageUrl}
        alt={title}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
      />
    </>
  );
}
