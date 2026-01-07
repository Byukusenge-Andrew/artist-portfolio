"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Trash2, Plus } from "lucide-react";

type PrintOption = {
  id: string;
  name: string;
  priceCents: number;
};

export default function PrintOptionsManager({ artworkId }: { artworkId: string }) {
  const [options, setOptions] = useState<PrintOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", priceCents: "" });

  useEffect(() => {
    fetchOptions();
  }, [artworkId]);

  async function fetchOptions() {
    try {
      const res = await fetch(`/api/artworks/${artworkId}/print-options`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setOptions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch options");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddOption() {
    if (!formData.name || !formData.priceCents) {
      setError("All fields are required");
      return;
    }

    try {
      const res = await fetch(`/api/artworks/${artworkId}/print-options`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          priceCents: parseInt(formData.priceCents),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add option");
      }

      await fetchOptions();
      setFormData({ name: "", priceCents: "" });
      setShowForm(false);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add option");
    }
  }

  async function handleDeleteOption(optionId: string) {
    if (!confirm("Delete this print option?")) return;

    try {
      const res = await fetch(`/api/print-options/${optionId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete");
      await fetchOptions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  if (loading) {
    return <div className="text-gray-600">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900">Print Options</h3>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 flex gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {options.length === 0 ? (
        <p className="text-sm text-gray-600">No print options yet</p>
      ) : (
        <div className="space-y-2">
          {options.map(option => (
            <div
              key={option.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div>
                <p className="font-medium text-gray-900">{option.name}</p>
                <p className="text-sm text-gray-600">
                  ${(option.priceCents / 100).toFixed(2)}
                </p>
              </div>
              <button
              title="delete"
                onClick={() => handleDeleteOption(option.id)}
                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {showForm ? (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
          <input
            type="text"
            placeholder="e.g., 8x10 Print"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 rounded border border-gray-300 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100 text-sm"
          />
          <input
            type="number"
            placeholder="Price in dollars (e.g., 25.99)"
            value={formData.priceCents}
            onChange={(e) => {
              const dollars = parseFloat(e.target.value) || 0;
              setFormData({ ...formData, priceCents: String(dollars * 100) });
            }}
            className="w-full px-3 py-2 rounded border border-gray-300 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100 text-sm"
            step="0.01"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAddOption}
              className="flex-1 px-3 py-2 bg-teal-600 text-white rounded font-medium hover:bg-teal-700 text-sm transition-all"
            >
              Add Option
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setFormData({ name: "", priceCents: "" });
              }}
              className="flex-1 px-3 py-2 bg-gray-300 text-gray-700 rounded font-medium hover:bg-gray-400 text-sm transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-teal-500 hover:text-teal-600 transition-all flex items-center justify-center gap-2 font-medium text-sm"
        >
          <Plus className="h-4 w-4" />
          Add Print Option
        </button>
      )}
    </div>
  );
}
