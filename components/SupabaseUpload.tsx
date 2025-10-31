"use client";
import { useRef, useState } from "react";
import { supabaseConfigured } from "@/lib/supabaseClient";

type Props = {
  onUploaded: (args: { publicId: string; url: string; width?: number; height?: number }) => void;
  label?: string;
  bucket?: string;
};

export function SupabaseUpload({ onUploaded, label = "Upload image", bucket = "artworks" }: Props) {
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  if (!supabaseConfigured) {
    return (
      <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
        Configure Supabase to enable uploads: set <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in your env.
      </div>
    );
  }

  const uploadToLocal = async (file: File) => {
    setUploadStatus("Supabase failed, uploading locally...");
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/uploads/local", { method: "POST", body: form });
    if (!res.ok) throw new Error("Local upload failed");
    const data = (await res.json()) as { publicId: string; url: string };
    return data;
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setLoading(true);
    setUploadStatus("Uploading to Supabase...");
    
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("bucket", bucket);

      // Upload via server endpoint (uses service_role key, bypasses RLS)
      const uploadPromise = fetch("/api/uploads/supabase", {
        method: "POST",
        body: form,
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Upload timeout")), 30000) // 30 second timeout
      );

      const res = await Promise.race([uploadPromise, timeoutPromise]) as Response;

      if (!res.ok) {
        const errorData = (await res.json()) as { error: string };
        throw new Error(errorData.error || "Upload failed");
      }

      const data = (await res.json()) as { success: boolean; publicId: string; url: string };

      if (!data.success) {
        throw new Error("Upload failed on server");
      }

      setUploadStatus("Upload successful!");
      onUploaded({ publicId: data.publicId, url: data.url });
      
    } catch (error) {
      console.error("Supabase upload error:", error);
      
      // Fallback to local upload
      try {
        const localData = await uploadToLocal(file);
        setUploadStatus("Uploaded locally!");
        onUploaded({ publicId: localData.publicId, url: localData.url });
      } catch (localError) {
        console.error("Local upload error:", localError);
        setUploadStatus("Upload failed");
        alert("Upload failed. Please try again or contact support.");
      }
    } finally {
      setLoading(false);
      // Reset the input value to allow re-uploading the same file
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      // Clear status after 3 seconds
      setTimeout(() => setUploadStatus(""), 3000);
    }
  };

  return (
    <div className="space-y-2">
      <div className="inline-flex items-center gap-2">
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />
        <button
          type="button"
          disabled={loading}
          className="px-3 py-2 rounded border disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => inputRef.current?.click()}
        >
          {loading ? "Uploading..." : label}
        </button>
      </div>
      {uploadStatus && (
        <p className={`text-xs ${uploadStatus.includes("failed") ? "text-red-600" : uploadStatus.includes("locally") ? "text-amber-600" : "text-green-600"}`}>
          {uploadStatus}
        </p>
      )}
    </div>
  );
}


