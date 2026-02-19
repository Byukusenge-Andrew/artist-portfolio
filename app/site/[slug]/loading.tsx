export default function ArtworkDetailLoading() {
    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Image skeleton */}
                <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse" />

                {/* Details skeleton */}
                <div className="space-y-6">
                    <div className="space-y-3">
                        <div className="h-8 w-3/4 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                        <div className="h-4 w-1/3 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                    </div>
                    <div className="space-y-2">
                        <div className="h-3 w-full bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                        <div className="h-3 w-5/6 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                        <div className="h-3 w-2/3 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                    </div>
                    <div className="flex gap-3">
                        <div className="h-12 w-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
                        <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
                        <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
                    </div>
                </div>
            </div>
        </div>
    );
}
