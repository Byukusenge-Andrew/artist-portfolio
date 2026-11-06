"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Trash2, Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";

type PrintOption = {
  id: string;
  name: string;
  price: number;
};

export default function PrintOptionsManager({ artworkId }: { artworkId: string }) {
  const [options, setOptions] = useState<PrintOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", price: "" });
  const [optionToDelete, setOptionToDelete] = useState<PrintOption | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchOptions();
  }, [artworkId]);

  async function fetchOptions() {
    try {
      const res = await fetch(`/api/artworks/${artworkId}/print-options`);
      if (!res.ok) throw new Error("Failed to fetch print options");
      const data = await res.json();
      setOptions(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch options");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddOption() {
    if (!formData.name.trim() || !formData.price.trim()) {
      toast.error("Please enter both size/name and price");
      return;
    }

    try {
      const res = await fetch(`/api/artworks/${artworkId}/print-options`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          price: parseInt(formData.price.trim(), 10),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to add print option");
      }

      await fetchOptions();
      setFormData({ name: "", price: "" });
      setShowForm(false);
      setError("");
      toast.success("Print option added successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to add print option");
    }
  }

  async function confirmDeleteOption() {
    if (!optionToDelete) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/print-options/${optionToDelete.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete print option");
      await fetchOptions();
      toast.success(`Print option "${optionToDelete.name}" deleted`);
      setOptionToDelete(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete print option");
    } finally {
      setIsDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="py-4 text-xs text-gray-500 dark:text-gray-400">
        Loading print options...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
          <Sparkles className="size-4 text-teal-600 dark:text-teal-400" />
          Print Size & Pricing Options
        </h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {options.length} {options.length === 1 ? "option" : "options"}
        </span>
      </div>

      {options.length === 0 ? (
        <p className="text-xs text-gray-500 dark:text-gray-400 italic">
          No print sizes created yet. Add options so collectors can order prints.
        </p>
      ) : (
        <div className="space-y-2">
          {options.map((option) => (
            <div
              key={option.id}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#1a1a24] rounded-xl border border-gray-200 dark:border-gray-800 transition-colors"
            >
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {option.name}
                </p>
                <p className="text-xs font-bold text-teal-700 dark:text-teal-400">
                  {option.price.toLocaleString()} RWF
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOptionToDelete(option)}
                className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                title="Delete option"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {showForm ? (
        <div className="p-4 bg-gray-50 dark:bg-[#1a1a24] rounded-xl border border-gray-200 dark:border-gray-800 space-y-3 animate-fade-in">
          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
              Print Name / Dimensions
            </label>
            <input
              type="text"
              placeholder="e.g. A3 Canvas Print (30x42cm)"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#141418] text-gray-900 dark:text-gray-100 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-xs transition-all"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
              Price (RWF)
            </label>
            <input
              type="number"
              placeholder="e.g. 25000"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#141418] text-gray-900 dark:text-gray-100 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-xs transition-all"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={handleAddOption}
              className="flex-1 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold text-xs shadow-sm transition-all"
            >
              Save Option
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setFormData({ name: "", price: "" });
              }}
              className="px-4 py-2 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="w-full px-4 py-2.5 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-400 hover:border-teal-500 hover:text-teal-600 dark:hover:text-teal-400 transition-all flex items-center justify-center gap-2 font-medium text-xs"
        >
          <Plus className="size-4" />
          <span>Add New Print Size & Price</span>
        </button>
      )}

      {/* Delete Confirmation Modal */}
      {optionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#1a1a24] border border-gray-200 dark:border-gray-800 p-6 shadow-2xl animate-scale-in">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400 mb-3">
              <AlertCircle className="size-5" />
              <h4 className="font-bold text-gray-900 dark:text-gray-100">
                Delete Print Option?
              </h4>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300 mb-5 leading-relaxed">
              Are you sure you want to delete <strong className="text-gray-900 dark:text-gray-100">{optionToDelete.name}</strong> ({optionToDelete.price.toLocaleString()} RWF)? Collectors will no longer be able to select this size.
            </p>
            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setOptionToDelete(null)}
                disabled={isDeleting}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteOption}
                disabled={isDeleting}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-700 text-white shadow-sm transition-colors"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
