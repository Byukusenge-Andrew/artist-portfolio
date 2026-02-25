"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Mail, Calendar, CheckCircle, XCircle, Eye } from "lucide-react";

type Commission = {
  id: string;
  name: string;
  email: string;
  details: string;
  status: "NEW" | "IN_REVIEW" | "INVOICE_SENT" | "PAID" | "REJECTED";
  createdAt: string;
};

const statusConfig: Record<Commission["status"], { label: string; color: string }> = {
  NEW: { label: "New", color: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50" },
  IN_REVIEW: { label: "In Review", color: "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800/50" },
  INVOICE_SENT: { label: "Invoice Sent", color: "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800/50" },
  PAID: { label: "Paid", color: "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50" },
  REJECTED: { label: "Rejected", color: "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50" },
};

export default function CommissionsAdminPage() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<Commission["status"] | "ALL">("ALL");
  const router = useRouter();

  useEffect(() => {
    fetchCommissions();
  }, []);

  async function fetchCommissions() {
    try {
      const res = await fetch("/api/commissions");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setCommissions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch commissions");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, status: Commission["status"]) {
    try {
      const res = await fetch(`/api/commissions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update");
      await fetchCommissions();
      setSelectedId(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update");
    }
  }

  async function deleteCommission(id: string) {
    if (!confirm("Are you sure?")) return;
    try {
      const res = await fetch(`/api/commissions/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      await fetchCommissions();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  const filtered = commissions.filter(c => filterStatus === "ALL" || c.status === filterStatus);
  const selectedCommission = commissions.find(c => c.id === selectedId);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600" />
          <p className="text-gray-600 mt-4">Loading commissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100">Commission Requests</h1>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Filter */}
      <div className="mb-6 flex gap-2 flex-wrap">
        {(["ALL", "NEW", "IN_REVIEW", "INVOICE_SENT", "PAID", "REJECTED"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${filterStatus === status
                ? "bg-teal-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
          >
            {status === "ALL" ? "All" : statusConfig[status as Commission["status"]].label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">No commissions found</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {/* List */}
          <div className="space-y-4">
            {filtered.map((commission) => (
              <button
                key={commission.id}
                onClick={() => setSelectedId(commission.id)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${selectedId === commission.id
                    ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20"
                    : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-[#1a1a24] dark:hover:border-gray-600"
                  }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{commission.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{commission.email}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(commission.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-semibold border whitespace-nowrap ${statusConfig[commission.status].color}`}>
                    {statusConfig[commission.status].label}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Detail */}
          {selectedCommission && (
            <div className="bg-white dark:bg-[#1a1a24] rounded-lg border border-gray-200 dark:border-gray-700 p-6 sticky top-8 h-fit transition-colors">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">{selectedCommission.name}</h2>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Email</label>
                  <p className="flex items-center gap-2 text-gray-900 dark:text-gray-100 mt-1">
                    <Mail className="h-4 w-4" />
                    <a href={`mailto:${selectedCommission.email}`} className="text-teal-600 dark:text-teal-400 hover:underline">
                      {selectedCommission.email}
                    </a>
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Status</label>
                  <p className={`mt-2 px-3 py-1 rounded-lg text-sm font-semibold border inline-block ${statusConfig[selectedCommission.status].color}`}>
                    {statusConfig[selectedCommission.status].label}
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Submitted</label>
                  <p className="text-gray-900 dark:text-gray-100 mt-1">
                    {new Date(selectedCommission.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Commission Details</label>
                <p className="text-gray-700 dark:text-gray-300 mt-2 whitespace-pre-wrap">{selectedCommission.details}</p>
              </div>

              {/* Status Actions */}
              <div className="space-y-2 mb-6">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Update Status</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(statusConfig).map(([status, config]) => (
                    <button
                      key={status}
                      onClick={() => updateStatus(selectedCommission.id, status as Commission["status"])}
                      className={`px-3 py-2 rounded text-xs font-semibold transition-all ${selectedCommission.status === status
                          ? `${config.color} border`
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-[#141418] dark:text-gray-300 dark:hover:bg-gray-800 dark:border-gray-700 border"
                        }`}
                    >
                      {config.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => deleteCommission(selectedCommission.id)}
                className="w-full px-4 py-2 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-transparent dark:border-red-900/50 rounded-lg font-semibold hover:bg-red-200 dark:hover:bg-red-900/40 transition-all"
              >
                Delete Request
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
