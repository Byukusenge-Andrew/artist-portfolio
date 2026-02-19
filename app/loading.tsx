import { Palette } from "lucide-react";

export default function GlobalLoading() {
    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center space-y-4 animate-fade-in">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg animate-pulse">
                    <Palette className="size-7 text-white" />
                </div>
                <div className="space-y-2">
                    <div className="h-2 w-48 bg-gray-200 rounded-full overflow-hidden mx-auto">
                        <div className="h-full w-1/2 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full animate-[loading_1.5s_ease-in-out_infinite]" />
                    </div>
                    <p className="text-sm text-gray-500">Loading...</p>
                </div>
            </div>
        </div>
    );
}
