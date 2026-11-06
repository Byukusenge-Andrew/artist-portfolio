import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { parseUserSession } from "@/lib/auth";
import Link from "next/link";
import Image from "next/image";
import { Pencil, Eye, Plus, Palette, Filter, CheckCircle2, XCircle } from "lucide-react";
import { redirect } from "next/navigation";
import DeleteArtworkButton from "./DeleteArtworkButton";

interface ManageArtworksPageProps {
    searchParams?: Promise<{
        filter?: string;
    }>;
}

export default async function ManageArtworksPage(props: ManageArtworksPageProps) {
    const searchParams = await props.searchParams;
    const filter = searchParams?.filter || "all";

    const cookieStore = await cookies();
    const userSession = cookieStore.get("user_session")?.value;
    const user = await parseUserSession(userSession);

    if (!user || (user.role !== "ADMIN" && user.role !== "ARTIST")) {
        redirect("/auth/login");
    }

    // Filter for artists & availability
    const whereClause: Record<string, unknown> = {
        deletedAt: null,
    };

    if (user.role === "ARTIST") {
        whereClause.uploadedBy = user.userId;
    }

    if (filter === "available") {
        whereClause.isOriginalAvailable = true;
    } else if (filter === "sold") {
        whereClause.isOriginalAvailable = false;
    }

    // Base counts for stats (unfiltered by availability)
    const baseWhere = user.role === "ARTIST" ? { uploadedBy: user.userId, deletedAt: null } : { deletedAt: null };
    const [allArtworksCount, availableCount, soldCount, artworks] = await Promise.all([
        prisma.artwork.count({ where: baseWhere }),
        prisma.artwork.count({ where: { ...baseWhere, isOriginalAvailable: true } }),
        prisma.artwork.count({ where: { ...baseWhere, isOriginalAvailable: false } }),
        prisma.artwork.findMany({
            where: whereClause,
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                slug: true,
                title: true,
                imageUrl: true,
                originalPrice: true,
                isOriginalAvailable: true,
                createdAt: true,
                uploadedBy: true,
            },
        }),
    ]);
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50/30 dark:from-[#0f0f12] dark:to-[#1a1a24] transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
                {/* Header */}
                <div className="mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div className="p-4 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl shadow-lg flex-shrink-0">
                            <Palette className="size-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-2 text-gray-900 dark:text-gray-100">
                                Manage Artworks
                            </h1>
                            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
                                View, edit, and organize your art catalog
                            </p>
                        </div>
                    </div>

                    <Link
                        href="/admin/artworks/new"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl hover:from-teal-700 hover:to-emerald-700 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 font-medium"
                    >
                        <Plus className="size-5" />
                        <span>New Artwork</span>
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
                    <Link
                        href="/admin/artworks"
                        className={`bg-white dark:bg-[#1a1a24] rounded-2xl border p-5 transition-all hover:shadow-md ${
                            filter === "all" ? "border-teal-500 ring-2 ring-teal-500/20" : "border-gray-200 dark:border-gray-800"
                        }`}
                    >
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Artworks</div>
                        <div className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">{allArtworksCount}</div>
                    </Link>
                    <Link
                        href="/admin/artworks?filter=available"
                        className={`bg-white dark:bg-[#1a1a24] rounded-2xl border p-5 transition-all hover:shadow-md ${
                            filter === "available" ? "border-emerald-500 ring-2 ring-emerald-500/20" : "border-gray-200 dark:border-gray-800"
                        }`}
                    >
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1.5">
                            <CheckCircle2 className="size-4 text-emerald-500" />
                            Original Available
                        </div>
                        <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                            {availableCount}
                        </div>
                    </Link>
                    <Link
                        href="/admin/artworks?filter=sold"
                        className={`bg-white dark:bg-[#1a1a24] rounded-2xl border p-5 transition-all hover:shadow-md ${
                            filter === "sold" ? "border-amber-500 ring-2 ring-amber-500/20" : "border-gray-200 dark:border-gray-800"
                        }`}
                    >
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1.5">
                            <XCircle className="size-4 text-gray-400 dark:text-gray-500" />
                            Original Sold
                        </div>
                        <div className="text-3xl font-extrabold text-gray-400 dark:text-gray-500">
                            {soldCount}
                        </div>
                    </Link>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-2 mb-6">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mr-2">
                        <Filter className="size-3.5" />
                        Status:
                    </span>
                    <Link
                        href="/admin/artworks"
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            filter === "all"
                                ? "bg-teal-600 text-white shadow-sm"
                                : "bg-white dark:bg-[#1a1a24] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}
                    >
                        All ({allArtworksCount})
                    </Link>
                    <Link
                        href="/admin/artworks?filter=available"
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            filter === "available"
                                ? "bg-emerald-600 text-white shadow-sm"
                                : "bg-white dark:bg-[#1a1a24] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}
                    >
                        Available ({availableCount})
                    </Link>
                    <Link
                        href="/admin/artworks?filter=sold"
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            filter === "sold"
                                ? "bg-gray-600 text-white shadow-sm"
                                : "bg-white dark:bg-[#1a1a24] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}
                    >
                        Sold ({soldCount})
                    </Link>
                </div>

                {/* Artworks Table */}
                {artworks.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-[#1a1a24] rounded-3xl border border-gray-200 dark:border-gray-800 transition-colors shadow-sm">
                        <Palette className="size-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                            {filter !== "all" ? "No artworks match this filter" : "No artworks yet"}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm mx-auto text-sm">
                            {filter !== "all"
                                ? "Try resetting the filter or add new artworks."
                                : "Start building your portfolio by creating your first artwork."}
                        </p>
                        <Link
                            href="/admin/artworks/new"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl hover:from-teal-700 hover:to-emerald-700 transition-all font-medium shadow-md"
                        >
                            <Plus className="size-5" />
                            Create Artwork
                        </Link>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-[#1a1a24] rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden transition-colors shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50/80 dark:bg-[#141418] border-b border-gray-200 dark:border-gray-800">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                            Artwork
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                            Price (RWF)
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                            Original Status
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                            Created
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {artworks.map((artwork) => (
                                        <tr key={artwork.id} className="hover:bg-gray-50/80 dark:hover:bg-[#20202a] transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="relative size-14 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0 border border-gray-200 dark:border-gray-700">
                                                        <Image
                                                            src={artwork.imageUrl}
                                                            alt={artwork.title}
                                                            fill
                                                            className="object-cover"
                                                            sizes="56px"
                                                        />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                                                            {artwork.title}
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                            /site/{artwork.slug}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-semibold text-gray-900 dark:text-gray-100">
                                                    {artwork.originalPrice ? `${artwork.originalPrice.toLocaleString()} RWF` : "—"}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${artwork.isOriginalAvailable
                                                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60"
                                                        : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                                                        }`}
                                                >
                                                    <span className={`size-1.5 rounded-full ${artwork.isOriginalAvailable ? "bg-emerald-500" : "bg-gray-400"}`} />
                                                    {artwork.isOriginalAvailable ? "Available" : "Sold"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                                {new Date(artwork.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <Link
                                                        href={`/site/${artwork.slug}`}
                                                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded-lg transition-colors"
                                                        title="View public page"
                                                    >
                                                        <Eye className="size-4" />
                                                    </Link>
                                                    <Link
                                                        href={`/admin/artworks/${artwork.id}/edit`}
                                                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                                        title="Edit artwork"
                                                    >
                                                        <Pencil className="size-4" />
                                                    </Link>
                                                    <DeleteArtworkButton id={artwork.id} />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
