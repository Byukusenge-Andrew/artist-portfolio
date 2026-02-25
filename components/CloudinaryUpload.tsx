"use client";
import { CldUploadWidget } from "next-cloudinary";

type Props = {
  onUploaded: (args: { publicId: string; url: string; width?: number; height?: number }) => void;
  label?: string;
};

export function CloudinaryUpload({ onUploaded, label = "Upload image" }: Props) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
  const unsignedPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UNSIGNED_PRESET || "artist_portfolio";

  if (!cloudName || !apiKey) {
    return (
      <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
        Configure Cloudinary to enable uploads: set <code>NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME</code> and <code>NEXT_PUBLIC_CLOUDINARY_API_KEY</code> in your env.
      </div>
    );
  }

  return (
    <CldUploadWidget
      {...(unsignedPreset
        ? { uploadPreset: unsignedPreset }
        : { signatureEndpoint: "/api/upload/signature" })}
      options={{ sources: ["local", "camera", "url"] }}
      onSuccess={(result) => {
        const info = result?.info as { public_id: string; secure_url: string; width?: number; height?: number } | undefined;
        if (!info) return;
        onUploaded({ publicId: info.public_id, url: info.secure_url, width: info.width, height: info.height });
      }}
    >
      {({ open }) => (
        <button type="button" onClick={() => open()} className="px-3 py-2 rounded border">
          {label}
        </button>
      )}
    </CldUploadWidget>
  );
}


