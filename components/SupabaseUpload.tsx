"use client";
import { useRef, useState } from "react";
import { supabase, supabaseConfigured } from "@/lib/supabaseClient";

type Props = {
  onUploaded: (args: { publicId: string; url: string; width?: number; height?: number }) => void;
  label?: string;
  bucket?: string;
};

export function SupabaseUpload({ onUploaded, label = "Upload image", bucket = "artworks" }: Props) {
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  if (!supabaseConfigured) {
    return (
      <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
        Configure Supabase to enable uploads: set <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in your env.
      </div>
    );
  }

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(filePath);
      const url = publicUrlData.publicUrl;
      onUploaded({ publicId: filePath, url });
    } catch {
      alert("Upload failed");
    } finally {
      setLoading(false);
      // Reset the input value to allow re-uploading the same file
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  return (
    <div className="inline-flex items-center gap-2">
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />
      <button
        type="button"
        disabled={loading}
        className="px-3 py-2 rounded border"
        onClick={() => inputRef.current?.click()}
      >
        {loading ? "Uploading..." : label}
      </button>
    </div>
  );
}


