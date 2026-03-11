"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle, CheckCircle, Users, ShieldCheck, ChevronDown } from "lucide-react";
import Image from "next/image";

const commissionSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  details: z.string().min(10, "Please provide at least 10 characters of details"),
});

type CommissionFormData = z.infer<typeof commissionSchema>;

type Artist = {
  id: string;
  name: string | null;
  avatarUrl: string | null;
};

type Props = {
  artistId?: string;
  artists?: Artist[];
};

export default function CommissionRequestForm({ artistId: initialArtistId, artists = [] }: Props) {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // "admin" = send to sys admin, "artist" = specific artist
  const [targetType, setTargetType] = useState<"admin" | "artist">(
    initialArtistId ? "artist" : "admin"
  );
  const [selectedArtistId, setSelectedArtistId] = useState<string>(initialArtistId || "");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CommissionFormData>({
    resolver: zodResolver(commissionSchema),
  });

  const onSubmit = async (data: CommissionFormData) => {
    setIsLoading(true);
    setError("");
    try {
      const artistId = targetType === "artist" && selectedArtistId ? selectedArtistId : undefined;
      const payload = { ...data, artistId };
      const res = await fetch("/api/commissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to submit commission request");
      }

      setSubmitted(true);
      reset();
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800/50 p-6 flex gap-4 transition-colors">
        <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-500 flex-shrink-0" />
        <div>
          <h3 className="font-semibold text-green-900 dark:text-green-100">Request Submitted!</h3>
          <p className="text-sm text-green-700 dark:text-green-300 mt-1">
            We&apos;ve received your commission request. We&apos;ll review it and get back to you soon at the email provided.
          </p>
        </div>
      </div>
    );
  }

  const selectedArtist = artists.find((a) => a.id === selectedArtistId);

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Target Selector */}
      <div>
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Send Commission To</p>
        <div className="grid grid-cols-2 gap-3">
          {/* Admin option */}
          <button
            type="button"
            onClick={() => setTargetType("admin")}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
              targetType === "admin"
                ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300"
                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-[#141418] text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              targetType === "admin" ? "bg-teal-500" : "bg-gray-200 dark:bg-gray-700"
            }`}>
              <ShieldCheck className={`w-5 h-5 ${targetType === "admin" ? "text-white" : "text-gray-500 dark:text-gray-300"}`} />
            </div>
            <div className="text-center">
              <p className="font-semibold text-sm">General (Admin)</p>
              <p className="text-xs opacity-70 mt-0.5">Admin will assign to an artist</p>
            </div>
          </button>

          {/* Specific Artist option */}
          <button
            type="button"
            onClick={() => setTargetType("artist")}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
              targetType === "artist"
                ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300"
                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-[#141418] text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              targetType === "artist" ? "bg-teal-500" : "bg-gray-200 dark:bg-gray-700"
            }`}>
              {targetType === "artist" && selectedArtist?.avatarUrl ? (
                <Image src={selectedArtist.avatarUrl} alt={selectedArtist.name || "Artist"} width={40} height={40} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <Users className={`w-5 h-5 ${targetType === "artist" ? "text-white" : "text-gray-500 dark:text-gray-300"}`} />
              )}
            </div>
            <div className="text-center">
              <p className="font-semibold text-sm">Specific Artist</p>
              <p className="text-xs opacity-70 mt-0.5">Choose who you&apos;d like to work with</p>
            </div>
          </button>
        </div>

        {/* Artist dropdown */}
        {targetType === "artist" && (
          <div className="mt-3 relative">
            <div className="relative">
              <select
                value={selectedArtistId}
                onChange={(e) => setSelectedArtistId(e.target.value)}
                className="w-full appearance-none px-4 py-3 pr-10 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#141418] text-gray-900 dark:text-gray-100 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100 dark:focus:ring-teal-900/30 transition-all"
              >
                <option value="">— Select an artist —</option>
                {artists.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            {targetType === "artist" && !selectedArtistId && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Please select an artist to continue</p>
            )}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            Your Name *
          </label>
          <input
            type="text"
            placeholder="John Doe"
            {...register("name")}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#141418] text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100 dark:focus:ring-teal-900/30 transition-all"
          />
          {errors.name && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            placeholder="john@example.com"
            {...register("email")}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#141418] text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100 dark:focus:ring-teal-900/30 transition-all"
          />
          {errors.email && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            Commission Details *
          </label>
          <textarea
            placeholder="Describe your commission... Include style preferences, size, colors, subject matter, deadline, and any references."
            rows={6}
            {...register("details")}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#141418] text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100 dark:focus:ring-teal-900/30 transition-all resize-vertical"
          />
          {errors.details && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.details.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || (targetType === "artist" && !selectedArtistId)}
          className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-semibold py-3 rounded-lg hover:from-teal-700 hover:to-emerald-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Submitting..." : "Submit Commission Request"}
        </button>
      </form>
    </div>
  );
}
