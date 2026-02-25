"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle, CheckCircle } from "lucide-react";

const commissionSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  details: z.string().min(10, "Please provide at least 10 characters of details"),
});

type CommissionFormData = z.infer<typeof commissionSchema>;

export default function CommissionRequestForm({ artistId }: { artistId?: string }) {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <div className="bg-white dark:bg-[#1a1a24] rounded-xl border border-gray-200 dark:border-gray-700 p-8 shadow-sm transition-colors">
      <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">Commission Request</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">Tell us about your vision and we&apos;ll get in touch to discuss pricing and timeline.</p>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

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
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-semibold py-3 rounded-lg hover:from-teal-700 hover:to-emerald-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Submitting..." : "Submit Commission Request"}
        </button>
      </form>
    </div>
  );
}
