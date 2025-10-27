import { SkeletonCard } from "./SkeletonCard";

export function GalleryLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      {/* Header Skeleton */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-64 animate-pulse"></div>
        </div>
        <div className="h-6 bg-gray-200 rounded w-96 animate-pulse"></div>
      </div>

      {/* Collections Skeleton */}
      <div className="mb-12">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse mb-6"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-32 bg-gray-200 rounded-2xl animate-pulse"
            ></div>
          ))}
        </div>
      </div>

      {/* Gallery Grid Skeleton */}
      <div>
        <div className="h-8 bg-gray-200 rounded w-56 animate-pulse mb-6"></div>
        <div className="gallery-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
