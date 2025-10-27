"use client";

import { X, ZoomIn, ZoomOut, Download } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";

interface ImageLightboxProps {
  src: string;
  alt: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ImageLightbox({ src, alt, isOpen, onClose }: ImageLightboxProps) {
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setZoom(1);
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center animate-fade-in"
      onClick={onClose}
    >
      {/* Controls */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setZoom(Math.max(0.5, zoom - 0.25));
          }}
          className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg transition-colors"
          aria-label="Zoom out"
        >
          <ZoomOut className="size-5 text-white" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setZoom(Math.min(3, zoom + 0.25));
          }}
          className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg transition-colors"
          aria-label="Zoom in"
        >
          <ZoomIn className="size-5 text-white" />
        </button>
        <a
          href={src}
          download
          onClick={(e) => e.stopPropagation()}
          className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg transition-colors"
          aria-label="Download"
        >
          <Download className="size-5 text-white" />
        </a>
        <button
          onClick={onClose}
          className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg transition-colors"
          aria-label="Close"
        >
          <X className="size-5 text-white" />
        </button>
      </div>

      {/* Image */}
      <div
        className="relative max-w-7xl max-h-[90vh] transition-transform duration-300"
        style={{ transform: `scale(${zoom})` }}
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={src}
          alt={alt}
          width={1200}
          height={1200}
          className="object-contain max-h-[90vh] rounded-lg"
        />
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 text-sm backdrop-blur-sm bg-white/10 px-4 py-2 rounded-full">
        Press ESC to close
      </div>
    </div>
  );
}
