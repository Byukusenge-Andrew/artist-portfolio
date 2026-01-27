"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";

type PendingAdmin = {
    id: string;
    name: string;
    email: string;
    createdAt: string;
};

export default function PendingApprovalsPage() {
    const [pendingAdmins, setPendingAdmins] = useState<PendingAdmin[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        fetchPendingAdmins();
    }, []);

    const fetchPendingAdmins = async () => {
        try {
            const res = await fetch("/api/admin/pending-admins");
            if (!res.ok) {
                throw new Error("Failed to fetch pending admins");
            }
            const data = await res.json();
            setPendingAdmins(data.pendingAdmins || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (adminId: string) => {
        setProcessingId(adminId);
        try {
            const res = await fetch("/api/admin/approve-admin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ adminId }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to approve");
            }

            // Remove from list
            setPendingAdmins((prev) => prev.filter((admin) => admin.id !== adminId));
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to approve admin");
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (adminId: string) => {
        if (!confirm("Are you sure you want to reject this admin account? This will delete the account.")) {
            return;
        }

        setProcessingId(adminId);
        try {
            const res = await fetch(`/api/admin/approve-admin?adminId=${adminId}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to reject");
            }

            // Remove from list
            setPendingAdmins((prev) => prev.filter((admin) => admin.id !== adminId));
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to reject admin");
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
            {/* Back Button */}
            <Link
                href="/admin/dashboard"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 group transition-colors"
            >
                <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
                Back to Dashboard
            </Link>

            {/* Header */}
            <div className="mb-8">
                <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg">
                        <Clock className="size-6 text-white" />
                    </div>
                    <div className="flex-1">
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
                            Pending Admin Approvals
                        </h1>
                        <p className="text-xl text-gray-600">
                            Review and approve new admin account requests
                        </p>
                    </div>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 flex gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}

            {/* Loading State */}
            {loading ? (
                <div className="text-center py-20">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                    <p className="mt-4 text-gray-600">Loading pending admins...</p>
                </div>
            ) : pendingAdmins.length === 0 ? (
                /* Empty State */
                <div className="text-center py-20 bg-gray-50 rounded-3xl">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mb-6 shadow-lg">
                        <CheckCircle className="size-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                        All caught up!
                    </h3>
                    <p className="text-gray-600">
                        No pending admin approvals at the moment
                    </p>
                </div>
            ) : (
                /* Pending Admins List */
                <div className="space-y-4">
                    {pendingAdmins.map((admin) => (
                        <div
                            key={admin.id}
                            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                        {admin.name}
                                    </h3>
                                    <p className="text-gray-600 mb-2">{admin.email}</p>
                                    <p className="text-sm text-gray-500">
                                        Requested: {new Date(admin.createdAt).toLocaleDateString()} at{" "}
                                        {new Date(admin.createdAt).toLocaleTimeString()}
                                    </p>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleApprove(admin.id)}
                                        disabled={processingId === admin.id}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <CheckCircle className="size-4" />
                                        {processingId === admin.id ? "Approving..." : "Approve"}
                                    </button>
                                    <button
                                        onClick={() => handleReject(admin.id)}
                                        disabled={processingId === admin.id}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg hover:from-red-700 hover:to-rose-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <XCircle className="size-4" />
                                        {processingId === admin.id ? "Rejecting..." : "Reject"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
