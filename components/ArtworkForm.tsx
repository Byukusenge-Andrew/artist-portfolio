"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { SupabaseUpload } from "@/components/SupabaseUpload";
import { useRouter } from "next/navigation";

const schema = z.object({
    title: z.string().min(1, "Title is required"),
    slug: z.string().min(1, "Slug is required"),
    description: z.string().optional(),
    imageUrl: z.string().url("Image URL is required"),
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

export default function ArtworkForm({ initialValues, artworkId, isEditing = false }: Props) {
    const [submitting, setSubmitting] = useState(false);
    const router = useRouter();

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<ArtworkFormValues>({
        resolver: zodResolver(schema),
        defaultValues: initialValues || { isOriginalAvailable: true, printEnabled: false },
    });

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

            if (!res.ok) throw new Error(isEditing ? "Failed to update" : "Failed to create");

            router.push(isEditing ? `/art/${values.slug}` : "/");
            router.refresh();
        } catch (error) {
            console.error(error);
            alert(isEditing ? "Failed to update artwork" : "Failed to create artwork");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <label className="block text-sm mb-1 font-medium text-gray-900 dark:text-gray-100">Title</label>
                <input className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-[#141418] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 outline-none transition-all" {...register("title")} />
                {errors.title && <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.title.message}</p>}
            </div>
            <div>
                <label className="block text-sm mb-1 font-medium text-gray-900 dark:text-gray-100">Slug (URL)</label>
                <input className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-[#141418] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 outline-none transition-all" {...register("slug")} />
                {errors.slug && <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.slug.message}</p>}
            </div>
            <div>
                <label className="block text-sm mb-1 font-medium text-gray-900 dark:text-gray-100">Description</label>
                <textarea className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 h-32 bg-white dark:bg-[#141418] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 outline-none transition-all" {...register("description")} />
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm mb-1 font-medium text-gray-900 dark:text-gray-100">Image URL</label>
                        <input className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-[#141418] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 outline-none transition-all" {...register("imageUrl")} />
                        {errors.imageUrl && <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.imageUrl.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm mb-1 font-medium text-gray-900 dark:text-gray-100">Image Public ID</label>
                        <input className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-[#141418] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 outline-none transition-all" {...register("imagePublicId")} />
                        {errors.imagePublicId && <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.imagePublicId.message}</p>}
                    </div>
                </div>

                <div className="bg-gray-50 dark:bg-[#1a1a24] border border-gray-200 dark:border-gray-700 rounded-lg p-4 transition-colors">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Upload Image</p>
                    <div className="flex flex-wrap gap-3">
                        <SupabaseUpload
                            label="Upload Image"
                            onUploaded={({ publicId, url }) => {
                                setValue("imagePublicId", publicId);
                                setValue("imageUrl", url);
                            }}
                        />
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-6 p-4 bg-gray-50 dark:bg-[#1a1a24] rounded-lg border border-gray-200 dark:border-gray-700 transition-colors">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500 bg-white dark:bg-[#141418] border-gray-300 dark:border-gray-600" {...register("isOriginalAvailable")} />
                    <span className="font-medium text-gray-700 dark:text-gray-300">Original Available</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500 bg-white dark:bg-[#141418] border-gray-300 dark:border-gray-600" {...register("printEnabled")} />
                    <span className="font-medium text-gray-700 dark:text-gray-300">Prints Enabled</span>
                </label>
            </div>

            <div>
                <label className="block text-sm mb-1 font-medium text-gray-900 dark:text-gray-100">Original Price (RWF)</label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Enter price in RWF (e.g. 5000)</p>
                <input
                    type="number"
                    className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-[#141418] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                    {...register("originalPrice", {
                        setValueAs: (v) => v === "" ? undefined : parseInt(v)
                    })}
                />
            </div>

            <button
                disabled={submitting}
                className="w-full sm:w-auto px-6 py-3 rounded-lg bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-medium hover:from-teal-700 hover:to-emerald-700 shadow-md hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {submitting ? "Saving..." : isEditing ? "Update Artwork" : "Create Artwork"}
            </button>
        </form>
    );
}
