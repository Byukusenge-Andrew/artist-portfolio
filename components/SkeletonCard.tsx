export function SkeletonCard() {
  return (
    <div className="group relative overflow-hidden rounded-2xl shadow-lg animate-pulse bg-gray-200">
      <div className="relative aspect-[3/4] bg-gray-300"></div>
      <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
        <div className="h-5 bg-gray-400/50 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-400/30 rounded w-1/2"></div>
      </div>
    </div>
  );
}
