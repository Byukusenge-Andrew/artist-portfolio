export default function AdminLoading() {
    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
            <div className="h-8 w-56 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="bg-white dark:bg-[#1a1a24] rounded-2xl p-6 shadow-sm space-y-3 transition-colors">
                        <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
                        <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        <div className="h-3 w-32 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                    </div>
                ))}
            </div>
            <div className="bg-white dark:bg-[#1a1a24] rounded-2xl p-6 shadow-sm space-y-4 transition-colors">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                            <div className="h-3 w-1/4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
