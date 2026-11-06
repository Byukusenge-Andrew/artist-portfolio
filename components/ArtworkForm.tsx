"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { SupabaseUpload } from "@/components/SupabaseUpload";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  Palette,
  ArrowLeft,
  Check,
  Trash2,
  AlertCircle,
  Coins,
  ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import ArtworkDeleteButton from "@/components/ArtworkDeleteButton";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  imageUrl: z.string().url("Valid image URL is required"),
  imagePublicId: z.string().min(1, "Image Public ID is required"),
  isOriginalAvailable: z.boolean(),
  originalPrice: z.number().int().optional(),
  printEnabled: z.boolean(),
});

export type ArtworkFormValues = z.infer<typeof schema>;

type Props = {
  initialValues?: ArtworkFormValues;
  artworkId?: string;
  isEditing?: boolean;
};

export default function ArtworkForm({
  initialValues,
  artworkId,
  isEditing = false,
}: Props) {
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ArtworkFormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialValues || {
      title: "",
      slug: "",
      description: "",
      imageUrl: "",
      imagePublicId: "",
      isOriginalAvailable: true,
      printEnabled: false,
    },
  });

  const currentImageUrl = watch("imageUrl");
  const currentTitle = watch("title");
  const isOriginal = watch("isOriginalAvailable");
  const isPrint = watch("printEnabled");

  // Auto slug generation on new artwork
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const titleVal = e.target.value;
    setValue("title", titleVal, { shouldValidate: true });
    if (!isEditing) {
      const slugVal = titleVal
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");
      setValue("slug", slugVal, { shouldValidate: true });
    }
  };

  const onSubmit = async (values: ArtworkFormValues) => {
    setSubmitting(true);
    try {
      const url = isEditing ? `/api/artworks/${artworkId}` : "/api/artworks";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, tags: [] }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || (isEditing ? "Failed to update artwork" : "Failed to create artwork"));
      }

      toast.success(
        isEditing
          ? `"${values.title}" updated successfully!`
          : `"${values.title}" created successfully!`
      );

      router.push(`/site/${values.slug}`);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Title & Slug */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Artwork Title *
          </label>
          <input
            {...register("title")}
            onChange={handleTitleChange}
            placeholder="e.g., Golden Sunset Over Kigali"
            className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 bg-white dark:bg-[#141418] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-sm"
          />
          {errors.title && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-1.5 flex items-center gap-1">
              <AlertCircle className="size-3.5" />
              {errors.title.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
            URL Slug *
          </label>
          <input
            {...register("slug")}
            placeholder="e.g., golden-sunset-over-kigali"
            className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 bg-white dark:bg-[#141418] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-sm"
          />
          {errors.slug && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-1.5 flex items-center gap-1">
              <AlertCircle className="size-3.5" />
              {errors.slug.message}
            </p>
          )}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Description
        </label>
        <textarea
          {...register("description")}
          rows={4}
          placeholder="Describe the medium, inspiration, size, framing, or story behind this piece..."
          className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 bg-white dark:bg-[#141418] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-sm resize-none"
        />
      </div>

      {/* Image Upload & Preview Card */}
      <div className="bg-white dark:bg-[#1a1a24] border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <ImageIcon className="size-4 text-teal-600 dark:text-teal-400" />
            Artwork Image
          </label>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            JPG, PNG, WebP supported
          </span>
        </div>

        {/* Live Preview if image URL exists */}
        {currentImageUrl && (
          <div className="relative w-full sm:w-64 h-48 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 shadow-sm">
            <Image
              src={currentImageUrl}
              alt="Artwork preview"
              fill
              className="object-cover"
              sizes="256px"
            />
            <div className="absolute bottom-2 left-2 px-2.5 py-1 bg-black/70 backdrop-blur-sm text-white text-[11px] font-medium rounded-md">
              Current Image
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4">
          <SupabaseUpload
            label={currentImageUrl ? "Replace Image" : "Upload High-Res Image"}
            onUploaded={({ publicId, url }) => {
              setValue("imagePublicId", publicId, { shouldValidate: true });
              setValue("imageUrl", url, { shouldValidate: true });
              toast.success("Image uploaded successfully!");
            }}
          />
        </div>

        {/* Hidden inputs / direct URL overrides */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Image URL</label>
            <input
              {...register("imageUrl")}
              placeholder="https://..."
              className="w-full text-xs px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#141418] text-gray-800 dark:text-gray-200 outline-none"
            />
            {errors.imageUrl && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.imageUrl.message}</p>
            )}
          </div>
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Image Public ID</label>
            <input
              {...register("imagePublicId")}
              placeholder="public-id-key"
              className="w-full text-xs px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#141418] text-gray-800 dark:text-gray-200 outline-none"
            />
            {errors.imagePublicId && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.imagePublicId.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Availability & Print Settings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label
          className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
            isOriginal
              ? "bg-teal-50/50 dark:bg-teal-950/30 border-teal-300 dark:border-teal-700"
              : "bg-white dark:bg-[#1a1a24] border-gray-200 dark:border-gray-700"
          }`}
        >
          <input
            type="checkbox"
            {...register("isOriginalAvailable")}
            className="mt-1 size-4 text-teal-600 rounded focus:ring-teal-500 bg-white dark:bg-[#141418] border-gray-300 dark:border-gray-600"
          />
          <div>
            <span className="font-semibold text-sm text-gray-900 dark:text-gray-100 block">
              Original Available for Sale
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Check if the one-of-a-kind physical original is available for collectors to purchase.
            </span>
          </div>
        </label>

        <label
          className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
            isPrint
              ? "bg-teal-50/50 dark:bg-teal-950/30 border-teal-300 dark:border-teal-700"
              : "bg-white dark:bg-[#1a1a24] border-gray-200 dark:border-gray-700"
          }`}
        >
          <input
            type="checkbox"
            {...register("printEnabled")}
            className="mt-1 size-4 text-teal-600 rounded focus:ring-teal-500 bg-white dark:bg-[#141418] border-gray-300 dark:border-gray-600"
          />
          <div>
            <span className="font-semibold text-sm text-gray-900 dark:text-gray-100 block">
              Prints Enabled
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Allow collectors to order high quality canvas or giclée prints of this piece.
            </span>
          </div>
        </label>
      </div>

      {/* Pricing Input */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1.5">
          Original Price (RWF)
        </label>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          Enter price in Rwandan Francs (e.g. 150000)
        </p>
        <div className="relative max-w-sm">
          <input
            type="number"
            placeholder="0"
            className="w-full border border-gray-200 dark:border-gray-700 rounded-xl pl-4 pr-16 py-3 bg-white dark:bg-[#141418] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-sm font-semibold"
            {...register("originalPrice", {
              setValueAs: (v) => (v === "" || isNaN(Number(v)) ? undefined : parseInt(v, 10)),
            })}
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 px-2 py-1 rounded">
            RWF
          </div>
        </div>
      </div>

      {/* Bottom Actions: Save + Cancel + Delete (if editing) */}
      <div className="pt-6 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-semibold hover:from-teal-700 hover:to-emerald-700 shadow-md hover:shadow-lg transition-all text-sm disabled:opacity-50"
          >
            <Sparkles className="size-4" />
            <span>
              {submitting
                ? "Saving..."
                : isEditing
                ? "Update Artwork"
                : "Create Artwork"}
            </span>
          </button>

          <Link
            href="/admin/artworks"
            className="px-5 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </Link>
        </div>

        {/* Delete Artwork Trigger (Available when editing) */}
        {isEditing && artworkId && (
          <div className="w-full sm:w-auto flex justify-end">
            <ArtworkDeleteButton
              artworkId={artworkId}
              artworkTitle={currentTitle || "this artwork"}
              onDelete={() => {
                router.push("/admin/artworks");
                router.refresh();
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 border border-red-200 dark:border-red-900/40 transition-all text-sm font-medium"
            />
          </div>
        )}
      </div>
    </form>
  );
}
