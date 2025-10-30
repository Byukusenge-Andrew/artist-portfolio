"use client";
import { useState, useRef } from "react";

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
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setLoading(true);
    setUploadStatus("Uploading...");
    
    try {
      const form = new FormData();
      form.append("file", file);
      
      // Create fetch with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const res = await fetch("/api/uploads/local", { 
        method: "POST", 
        body: form,
        signal: controller.signal 
      });
      
      clearTimeout(timeoutId);
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Upload failed");
      }
      
      const data = (await res.json()) as { publicId: string; url: string };
      setUploadStatus("Upload successful!");
      onUploaded({ publicId: data.publicId, url: data.url });
      
    } catch (err) {
      console.error("Upload error:", err);
      const errorMessage = err instanceof Error ? err.message : "Upload failed";
      setUploadStatus(`Failed: ${errorMessage}`);
      
      if (errorMessage.includes("aborted")) {
        alert("Upload timed out. Please try again or use a smaller image.");
      } else {
        alert(errorMessage);
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
        <input 
          ref={inputRef}
          type="file" 
          accept="image/*" 
          className="hidden" 
          onChange={handleChange} 
        />
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
        <p className={`text-xs ${uploadStatus.includes("Failed") ? "text-red-600" : "text-green-600"}`}>
          {uploadStatus}
        </p>
      )}
    </div>
  );
}


