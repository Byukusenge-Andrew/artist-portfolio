import { prisma } from "@/lib/prisma"; // Make sure to import prisma if not already available globally or imported
import CommissionRequestForm from "@/components/CommissionRequestForm";
import { Palette, CheckCircle, MessageSquare, Sparkles } from "lucide-react";
import Link from "next/link";

interface Props {
    searchParams: Promise<{
        artistId?: string;
    }>;
}

export default async function CommissionsPage({ searchParams }: Props) {
    const { artistId } = await searchParams;

    let artistName = "";
    if (artistId) {
        const artist = await prisma.user.findUnique({
            where: { id: artistId },
            select: { name: true }
        });
        if (artist) artistName = artist.name || "the Artist";
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
            {/* Hero Section */}
            <div className="text-center mb-16 animate-fade-in">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-600 to-emerald-600 rounded-2xl mb-6 shadow-lg">
                    <Palette className="size-8 text-white" />
                </div>
                <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4 text-gray-900 dark:text-gray-100">
                    {artistName ? `Commission ${artistName}` : "Commission Custom Art"}
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    {artistName
                        ? `Request a unique, personalized artwork from ${artistName}`
                        : "Bring your vision to life with a unique, personalized artwork created just for you"}
                </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 mb-16">
                {/* Left Column - Information */}
                <div className="space-y-8 animate-slide-in-left">
                    <div>
                        <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">How It Works</h2>
                        <div className="space-y-6">
                            {/* Step 1 */}
                            <div className="flex gap-4">
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-600 to-emerald-600 flex items-center justify-center text-white font-bold shadow-lg">
                                        1
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold mb-2 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                                        <MessageSquare className="size-5 text-teal-600 dark:text-teal-400" />
                                        Share Your Vision
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Fill out the commission request form with details about what you&apos;d like created.
                                        Include any reference images, preferred styles, sizes, and other specifications.
                                    </p>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="flex gap-4">
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-600 to-emerald-600 flex items-center justify-center text-white font-bold shadow-lg">
                                        2
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold mb-2 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                                        <Sparkles className="size-5 text-teal-600 dark:text-teal-400" />
                                        Get a Quote
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        The artist will review your request and reach out to discuss details,
                                        timeline, and provide a custom quote based on your requirements.
                                    </p>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className="flex gap-4">
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-600 to-emerald-600 flex items-center justify-center text-white font-bold shadow-lg">
                                        3
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold mb-2 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                                        <CheckCircle className="size-5 text-teal-600 dark:text-teal-400" />
                                        Receive Your Art
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Once approved and payment is confirmed, the artist will create your custom piece.
                                        You&apos;ll receive updates throughout the process and the final artwork upon completion.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Additional Info */}
                    <div className="bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50 dark:from-teal-900/20 dark:via-emerald-900/20 dark:to-cyan-900/20 rounded-2xl p-6 border border-teal-100 dark:border-teal-800/50">
                        <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">What to Include</h3>
                        <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                            <li className="flex items-start gap-2">
                                <span className="text-teal-600 dark:text-teal-400 mt-1">•</span>
                                <span>Detailed description of what you want</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-teal-600 dark:text-teal-400 mt-1">•</span>
                                <span>Preferred style, colors, and mood</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-teal-600 dark:text-teal-400 mt-1">•</span>
                                <span>Desired size and medium</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-teal-600 dark:text-teal-400 mt-1">•</span>
                                <span>Reference images (if available)</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-teal-600 dark:text-teal-400 mt-1">•</span>
                                <span>Timeline or deadline (if applicable)</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Right Column - Form */}
                <div className="animate-slide-in-right">
                    <div className="bg-white dark:bg-[#1a1a24] rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 transition-colors">
                        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
                            {artistName ? `Request for ${artistName}` : "Request a Commission"}
                        </h2>
                        <CommissionRequestForm artistId={artistId} />
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="text-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#1a1a24] dark:to-[#1a1a24] rounded-3xl p-12 transition-colors border border-transparent dark:border-gray-800 animate-scale-in">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                    Not Sure About Commissioning?
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
                    Browse our existing collection of artworks or explore curated galleries
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/site/galleries"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-8 py-4 text-white font-semibold hover:from-teal-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                        <Palette className="size-5" />
                        Explore Galleries
                    </Link>
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a1a24] px-8 py-4 text-gray-900 dark:text-gray-100 font-semibold hover:border-teal-600 dark:hover:border-teal-500 hover:text-teal-700 dark:hover:text-teal-400 transition-all duration-300"
                    >
                        Browse All Artworks
                    </Link>
                </div>
            </div>
        </div>
    );
}
