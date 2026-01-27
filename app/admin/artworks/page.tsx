import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { parseUserSession } from "@/lib/auth";
import Link from "next/link";
import Image from "next/image";
import { Pencil, Trash2, Eye, Plus, Palette } from "lucide-react";
import { redirect } from "next/navigation";

export default async function ManageArtworksPage() {
    const cookieStore = await cookies();
    const userSession = cookieStore.get("user_session")?.value;
    const user = parseUserSession(userSession);

    if (!user || user.role !== "ADMIN") {
        redirect("/auth/login");
    }

    // Fetch all artworks with stats
    const artworks = await prisma.artwork.findMany({
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            slug: true,
            title: true,
            imageUrl: true,
            originalPriceCents: true,
            isOriginalAvailable: true,
            createdAt: true,
        },
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
                {/* Header */}
                <div className="mb-12 flex items-start justify-between">
                    <div className="flex items-start gap-4">
                        <div className="p-4 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl shadow-lg">
                            <Palette className="size-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
                                Manage Artworks
                            </h1>
                            <p className="text-xl text-gray-600">
                                View, edit, and manage all your artworks
                            </p>
                        </div>
                    </div>

                    <Link
                        href="/admin/artworks/new"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-lg hover:from-teal-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                        <Plus className="size-5" />
                        <span className="font-medium">New Artwork</span>
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="text-sm text-gray-600 mb-1">Total Artworks</div>
                        <div className="text-3xl font-bold text-gray-900">{artworks.length}</div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="text-sm text-gray-600 mb-1">Original Available</div>
                        <div className="text-3xl font-bold text-green-600">
                            {artworks.filter((a) => a.isOriginalAvailable).length}
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="text-sm text-gray-600 mb-1">Original Sold</div>
                        <div className="text-3xl font-bold text-gray-400">
                            {artworks.filter((a) => !a.isOriginalAvailable).length}
                        </div>
                    </div>
                </div>

                {/* Artworks Table */}
                {artworks.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-gray-200">
                        <Palette className="size-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                            No artworks yet
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Start by creating your first artwork
                        </p>
                        <Link
                            href="/artworks/new"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-lg hover:from-teal-700 hover:to-emerald-700 transition-all"
                        >
                            <Plus className="size-5" />
                            Create Artwork
                        </Link>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Artwork
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Price (RWF)
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Original Status
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Created
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {artworks.map((artwork) => (
                                        <tr key={artwork.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="relative size-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                                        <Image
                                                            src={artwork.imageUrl}
                                                            alt={artwork.title}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-gray-900">
                                                            {artwork.title}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {artwork.slug}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-gray-900">
                                                    {artwork.originalPriceCents ? `${(artwork.originalPriceCents / 100).toLocaleString()} RWF` : "N/A"}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${artwork.isOriginalAvailable
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-gray-100 text-gray-700"
                                                        }`}
                                                >
                                                    {artwork.isOriginalAvailable ? "Available" : "Sold"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {new Date(artwork.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={`/art/${artwork.slug}`}
                                                        className="p-2 text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                                                        title="View"
                                                    >
                                                        <Eye className="size-4" />
                                                    </Link>
                                                    <Link
                                                        href={`/admin/artworks/${artwork.id}/edit`}
                                                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Pencil className="size-4" />
                                                    </Link>
                                                    <button
                                                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </button>
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
