"use client";

import { useState } from "react";
import { Share2, Twitter, Facebook, Linkedin, Link2, Check } from "lucide-react";

interface ShareButtonProps {
  url: string;
  title: string;
}

export function ShareButton({ url, title }: ShareButtonProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setShowMenu(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-all duration-300 hover:shadow-md"
        aria-label="Share artwork"
      >
        <Share2 className="size-4" />
        <span className="font-medium">Share</span>
      </button>

      {showMenu && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 z-20 animate-scale-in">
            <div className="grid grid-cols-2 gap-2">
              <a
                href={shareUrls.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-3 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
              >
                <Twitter className="size-4" />
                <span className="text-sm font-medium">Twitter</span>
              </a>
              
              <a
                href={shareUrls.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-3 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors"
              >
                <Facebook className="size-4" />
                <span className="text-sm font-medium">Facebook</span>
              </a>
              
              <a
                href={shareUrls.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-3 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 transition-colors"
              >
                <Linkedin className="size-4" />
                <span className="text-sm font-medium">LinkedIn</span>
              </a>
              
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-2 px-4 py-3 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="size-4 text-green-600" />
                    <span className="text-sm font-medium text-green-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Link2 className="size-4" />
                    <span className="text-sm font-medium">Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
