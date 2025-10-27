"use client";
import { useState } from "react";

type Props = {
  onUploaded: (args: {
    publicId: string;
    url: string;
    width?: number;
    height?: number;
  }) => void;
  label?: string;
};

export function LocalUpload({ onUploaded, label = "Upload from PC" }: Props) {
  const [loading, setLoading] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/uploads/local", { method: "POST", body: form });
      if (!res.ok) throw new Error("Upload failed");
      const data = (await res.json()) as { publicId: string; url: string };
      onUploaded({ publicId: data.publicId, url: data.url });
    } catch (err) {
      alert((err as Error).message || "Upload failed");
    } finally {
      setLoading(false);
      // Reset the input value to allow re-uploading the same file
      if (e.currentTarget) {
        e.currentTarget.value = "";
      }
    }
  };

  return (
    <label className="inline-flex items-center gap-2">
      <input type="file" accept="image/*" className="hidden" onChange={handleChange} />
      <button type="button" disabled={loading} className="px-3 py-2 rounded border">
        {loading ? "Uploading..." : label}
      </button>
    </label>
  );
}


