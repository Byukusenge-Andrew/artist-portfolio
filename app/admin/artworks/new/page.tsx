"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { SupabaseUpload } from "@/components/SupabaseUpload";

const schema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  imageUrl: z.string().url(),
  imagePublicId: z.string().min(1),
  isOriginalAvailable: z.boolean(),
  originalPriceCents: z.number().int().optional(),
  printEnabled: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export default function NewArtworkPage() {
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { isOriginalAvailable: true, printEnabled: false },
  });

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/artworks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, tags: [] }),
      });
      if (!res.ok) throw new Error("Failed to create");
      window.location.href = "/";
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-6">New Artwork</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Title</label>
          <input className="w-full border rounded px-3 py-2" {...register("title")} />
          {errors.title && <p className="text-sm text-red-600">{errors.title.message}</p>}
        </div>
        <div>
          <label className="block text-sm mb-1">Slug</label>
          <input className="w-full border rounded px-3 py-2" {...register("slug")} />
        </div>
        <div>
          <label className="block text-sm mb-1">Description</label>
          <textarea className="w-full border rounded px-3 py-2" rows={4} {...register("description")} />
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Image URL</label>
              <input className="w-full border rounded px-3 py-2" {...register("imageUrl")} />
              {errors.imageUrl && <p className="text-sm text-red-600">{errors.imageUrl.message}</p>}
            </div>
            <div>
              <label className="block text-sm mb-1">Image Public ID</label>
              <input className="w-full border rounded px-3 py-2" {...register("imagePublicId")} />
              {errors.imagePublicId && <p className="text-sm text-red-600">{errors.imagePublicId.message}</p>}
            </div>
          </div>
          
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-700 mb-3">Upload Image</p>
            <div className="flex flex-wrap gap-3">
              <SupabaseUpload
                label="Upload to Supabase"
                onUploaded={({ publicId, url }) => {
                  setValue("imagePublicId", publicId);
                  setValue("imageUrl", url);
                }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              If Supabase fails, the image will automatically be saved locally.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2">
            <input type="checkbox" {...register("isOriginalAvailable")} /> Original available
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" {...register("printEnabled")} /> Prints enabled
          </label>
        </div>
        <div>
          <label className="block text-sm mb-1">Original Price (cents)</label>
          <input type="number" className="w-full border rounded px-3 py-2" {...register("originalPriceCents", { valueAsNumber: true })} />
        </div>
        <button disabled={submitting} className="px-4 py-2 rounded bg-black text-white">
          {submitting ? "Saving..." : "Save"}
        </button>
      </form>
    </div>
  );
}


