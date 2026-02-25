import { prisma } from "@/lib/prisma";
import CommissionRequestForm from "@/components/CommissionRequestForm";
import { Palette, CheckCircle, MessageSquare, Sparkles, Clock, ArrowRight, XCircle, FileText } from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";
import { parseUserSession } from "@/lib/auth";

interface Props {
    searchParams: Promise<{
        artistId?: string;
    }>;
}

export default async function CommissionsPage({ searchParams }: Props) {
    const { artistId } = await searchParams;

    // Get current user (if logged in)
    const cookieStore = await cookies();
    const userSession = cookieStore.get("user_session")?.value;
    const currentUser = userSession ? await parseUserSession(userSession) : null;

    // Fetch the target artist name if artistId is provided
    let artistName = "";
    if (artistId) {
        const artist = await prisma.user.findUnique({
            where: { id: artistId },
            select: { name: true }
        });
        if (artist) artistName = artist.name || "the Artist";
    }

    // Fetch past commissions for logged-in users (matched by email)
    let pastCommissions: {
        id: string;
        name: string;
        details: string;
        status: string;
        createdAt: Date;
        artist: { name: string | null } | null;
    }[] = [];

    if (currentUser?.email) {
        pastCommissions = await prisma.commissionRequest.findMany({
            where: { email: currentUser.email },
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                name: true,
                details: true,
                status: true,
                createdAt: true,
                artist: { select: { name: true } },
            }
        });
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "NEW":
                return { label: "New", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400", icon: Clock };
            case "IN_REVIEW":
                return { label: "In Review", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400", icon: MessageSquare };
            case "INVOICE_SENT":
                return { label: "Invoice Sent", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400", icon: FileText };
            case "PAID":
                return { label: "Paid", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", icon: CheckCircle };
            case "REJECTED":
                return { label: "Rejected", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400", icon: XCircle };
            default:
                return { label: status, color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300", icon: Clock };
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
            {/* Hero Section */}
            <div className="text-center mb-16">
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

            {/* Past Commissions — shown when user is logged in and has made commissions */}
            {pastCommissions.length > 0 && (
                <div className="mb-14">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <MessageSquare className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                            Your Commission Requests
                        </h2>
                    </div>
                    <div className="space-y-3">
                        {pastCommissions.map((commission) => {
                            const badge = getStatusBadge(commission.status);
                            const BadgeIcon = badge.icon;
                            return (
                                <Link
                                    key={commission.id}
                                    href={`/user/commissions/${commission.id}`}
                                    className="flex items-center justify-between p-4 bg-white dark:bg-[#1a1a24] rounded-xl border border-gray-200 dark:border-gray-700 hover:border-teal-400 dark:hover:border-teal-600 hover:shadow-md transition-all group"
                                >
                                    <div className="flex-1 min-w-0 pr-4">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">
                                                For {commission.artist?.name || "Unassigned Artist"}
                                            </p>
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
                                                <BadgeIcon className="w-3 h-3" />
                                                {badge.label}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{commission.details}</p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                            {new Date(commission.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                                        </p>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 flex-shrink-0 transition-colors" />
                                </Link>
                            );
                        })}
                    </div>

                    <div className="mt-8 border-t border-gray-200 dark:border-gray-800 pt-8">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                            {artistName ? `Submit Another Request to ${artistName}` : "Submit a New Commission Request"}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                            You can have multiple commissions open at a time.
                        </p>
                    </div>
                </div>
            )}

            <div className="grid lg:grid-cols-2 gap-12 mb-16">
                {/* Left Column - Information */}
                <div className="space-y-8">
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
                <div>
                    <div className="bg-white dark:bg-[#1a1a24] rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 transition-colors">
                        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
                            {artistName ? `Request for ${artistName}` : "Request a Commission"}
                        </h2>
                        <CommissionRequestForm artistId={artistId} />
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="text-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#1a1a24] dark:to-[#1a1a24] rounded-3xl p-12 transition-colors border border-transparent dark:border-gray-800">
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
