import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { ArrowLeft, Clock, CheckCircle, XCircle, FileText, Image as ImageIcon, User as UserIcon } from "lucide-react";
import Image from "next/image";

import { parseUserSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CommissionMessages from "@/components/CommissionMessages";

async function getCurrentUser() {
    const cookieStore = await cookies();
    const userSession = cookieStore.get("user_session")?.value;

    if (!userSession) redirect("/auth/login");
    const user = await parseUserSession(userSession);
    if (!user) redirect("/auth/login");

    // Only users/buyers can view this page
    if (user.role === "ARTIST") redirect("/artist/dashboard");

    return user;
}

export default async function UserCommissionPage(props: { params: Promise<{ id: string }> }) {
    const user = await getCurrentUser();
    const { id } = await props.params;

    const commission = await prisma.commissionRequest.findUnique({
        where: { id },
        include: {
            artist: {
                select: {
                    name: true,
                    avatarUrl: true,
                    email: true,
                }
            }
        }
    });

    if (!commission || commission.email !== user.email) {
        redirect("/user/dashboard");
    }

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "NEW":
            case "IN_REVIEW":
                return <Clock className="w-5 h-5 text-blue-500" />;
            case "INVOICE_SENT":
            case "PAID":
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case "REJECTED":
                return <XCircle className="w-5 h-5 text-red-500" />;
            default:
                return <Clock className="w-5 h-5 text-gray-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "NEW":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
            case "IN_REVIEW":
                return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
            case "INVOICE_SENT":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
            case "PAID":
                return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
            case "REJECTED":
                return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
        }
    };

    return (
        <div className="min-h-screen bg-[#f5f5f0] dark:bg-[#0f0f12] py-12">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/user/dashboard"
                        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                Commission Request
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                For {commission.artist ? commission.artist.name : 'Unknown Artist'}
                            </p>
                        </div>
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(commission.status)}`}>
                            {getStatusIcon(commission.status)}
                            {commission.status.replace("_", " ")}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Details */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white dark:bg-[#1a1a24] rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm overflow-hidden">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-teal-600" />
                                Request Details
                            </h2>

                            <div className="space-y-4">
                                {commission.artist && (
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-[#141418] rounded-lg border border-gray-100 dark:border-gray-800">
                                        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600">
                                            {commission.artist.avatarUrl ? (
                                                <Image src={commission.artist.avatarUrl} alt={commission.artist.name || "Artist"} fill className="object-cover" />
                                            ) : (
                                                <UserIcon className="w-5 h-5 text-gray-400 m-auto mt-2.5" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Artist</p>
                                            <p className="font-semibold text-gray-900 dark:text-gray-100">{commission.artist.name}</p>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Requested On</p>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">{formatDate(commission.createdAt)}</p>
                                </div>

                                <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Description</p>
                                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                                        {commission.details}
                                    </p>
                                </div>

                                {commission.referenceImageUrl && (
                                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1.5">
                                            <ImageIcon className="w-4 h-4" />
                                            Reference Image
                                        </p>
                                        <div className="relative aspect-video rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#141418]">
                                            <Image
                                                src={commission.referenceImageUrl}
                                                alt="Reference"
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Messages */}
                    <div className="lg:col-span-2 flex flex-col h-[600px] lg:h-auto">
                        <CommissionMessages
                            commissionId={commission.id}
                            currentUserId={user.userId}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
