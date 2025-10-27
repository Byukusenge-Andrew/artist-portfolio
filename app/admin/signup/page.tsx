"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LocalUpload } from "@/components/LocalUpload";
import { SupabaseUpload } from "@/components/SupabaseUpload";
import Image from "next/image";
import { useRouter } from "next/navigation";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  bio: z.string().optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

export default function SignupPage() {
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [avatarPublicId, setAvatarPublicId] = useState<string | undefined>(
    undefined
  );
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    const res = await fetch("/api/artists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: values.name,
        email: values.email || undefined,
        phone: values.phone || undefined,
        bio: values.bio || undefined,
        avatarPublicId,
        avatarUrl,
      }),
    });
    if (!res.ok) {
      type ApiError = { error?: { formErrors?: string[] } };
      const data: ApiError = await res.json().catch(() => ({} as ApiError));
      alert(
        data?.error?.formErrors?.join("\n") || "Failed to create artist"
      );
      return;
    }
    router.push("/artworks/new");
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Artist signup</h1>
      <p className="text-gray-600 mt-2">
        Create your profile to access the admin and showcase your artworks.
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-6 rounded-2xl border bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 p-6 space-y-5"
      >
        <div className="flex items-center gap-4">
          <div className="relative size-20 rounded-full overflow-hidden border bg-gray-100">
            {avatarUrl ? (
              <Image src={avatarUrl} alt="Avatar" fill className="object-cover" />
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <SupabaseUpload
              bucket="avatars"
              label={avatarUrl ? "Change avatar (Supabase)" : "Upload avatar (Supabase)"}
              onUploaded={({ publicId, url }) => {
                setAvatarPublicId(publicId);
                setAvatarUrl(url);
              }}
            />
            <LocalUpload
              label={avatarUrl ? "Change avatar (Local)" : "Upload avatar (Local)"}
              onUploaded={({ publicId, url }) => {
                setAvatarPublicId(publicId);
                setAvatarUrl(url);
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-700">Name</label>
            <input
              {...register("name")}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Your name"
            />
            {errors.name && (
              <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>
            )}
          </div>
          <div>
            <label className="text-sm text-gray-700">Contact email</label>
            <input
              {...register("email")}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="name@example.com"
              type="email"
            />
          </div>
          <div>
            <label className="text-sm text-gray-700">Phone</label>
            <input
              {...register("phone")}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="(+1) 555-555-5555"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm text-gray-700">Bio</label>
            <textarea
              {...register("bio")}
              rows={4}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Tell us about your art..."
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            disabled={isSubmitting}
            className="inline-flex items-center rounded-md bg-teal-600 px-4 py-2 text-white hover:bg-teal-700 disabled:opacity-60"
            type="submit"
          >
            {isSubmitting ? "Saving..." : "Create profile"}
          </button>
        </div>
      </form>
    </div>
  );
}


