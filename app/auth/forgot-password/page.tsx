"use client";
import { useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle, ArrowLeft, ExternalLink, Copy, Check } from "lucide-react";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [resetUrl, setResetUrl] = useState("");
    const [copied, setCopied] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to send reset email");
            }

            setSuccess(true);
            if (data.resetUrl) {
                setResetUrl(data.resetUrl);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to send reset email");
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = async () => {
        await navigator.clipboard.writeText(resetUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Extract the path portion to use as Next.js Link href
    const resetPath = resetUrl
        ? resetUrl.replace(/^https?:\/\/[^/]+/, "")
        : "";

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-[#0f0f12] dark:to-[#141418] flex items-center justify-center px-4 sm:px-6 transition-colors">
                <div className="w-full max-w-md bg-white dark:bg-[#1a1a24] rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl p-8 sm:p-10 transition-colors">
                    <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 text-center">Check Your Email</h2>
                    <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                        If an account exists with this email, we&apos;ve sent password reset instructions.
                    </p>

                    {/* Dev Mode Banner */}
                    {resetUrl && (
                        <div className="mb-6 rounded-xl border border-amber-300 dark:border-amber-600 bg-amber-50 dark:bg-amber-900/20 overflow-hidden">
                            <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-800/30 border-b border-amber-200 dark:border-amber-700">
                                <span className="text-xs font-bold text-amber-800 dark:text-amber-300 tracking-widest uppercase">⚠ Dev Mode — Reset Link</span>
                            </div>
                            <div className="p-4">
                                <p className="text-xs text-amber-700 dark:text-amber-400 mb-3">
                                    Email sending is not configured. Use this link to reset the password:
                                </p>
                                <div className="flex items-start gap-2">
                                    <code className="flex-1 text-xs break-all text-amber-900 dark:text-amber-200 bg-amber-100 dark:bg-amber-900/40 rounded-lg p-2 font-mono leading-relaxed">
                                        {resetUrl}
                                    </code>
                                </div>
                                <div className="flex gap-2 mt-3">
                                    <Link
                                        href={resetPath}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition-colors"
                                    >
                                        <ExternalLink className="w-3 h-3" />
                                        Open Link
                                    </Link>
                                    <button
                                        onClick={copyToClipboard}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-amber-900/40 border border-amber-300 dark:border-amber-600 text-amber-800 dark:text-amber-300 text-xs font-semibold rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/60 transition-colors"
                                    >
                                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                        {copied ? "Copied!" : "Copy"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <Link
                        href="/auth/login"
                        className="inline-flex items-center gap-2 text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium transition-colors"
                    >
                        <ArrowLeft className="size-4" />
                        Back to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-[#0f0f12] dark:to-[#141418] flex items-center justify-center px-4 sm:px-6 transition-colors">
            <div className="w-full max-w-md">
                <div className="bg-white dark:bg-[#1a1a24] rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl p-8 sm:p-10 transition-colors">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Forgot Password?</h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">
                        Enter your email and we&apos;ll send you instructions to reset your password
                    </p>

                    {error && (
                        <div className="mb-6 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 flex gap-3">
                            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#141418] text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100 dark:focus:ring-teal-900/30 transition-all"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-semibold py-3 rounded-lg hover:from-teal-700 hover:to-emerald-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Sending..." : "Send Reset Link"}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link
                            href="/auth/login"
                            className="inline-flex items-center gap-2 text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium transition-colors"
                        >
                            <ArrowLeft className="size-4" />
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
