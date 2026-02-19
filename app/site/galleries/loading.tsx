export default function GalleriesLoading() {
    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mb-6" />
            <div className="gallery-grid">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="art-card dark:border-gray-700/40">
                        <div className="aspect-[4/3] bg-gray-200 dark:bg-gray-700 animate-pulse" />
                        <div className="p-4 space-y-2">
                            <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                            <div className="h-3 w-1/2 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
