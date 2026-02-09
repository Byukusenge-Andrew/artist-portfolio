"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Palette } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import PasswordStrengthIndicator from "@/components/PasswordStrengthIndicator";

export default function ArtistSignupPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    role: "ARTIST", // Set role to ARTIST
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Registration failed");
            }

            router.refresh();
            router.push(data.redirectUrl || "/artist/dashboard");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Join as an Artist"
            subtitle="Showcase and sell your artwork to art lovers worldwide"
            showBackHome={true}
        >
            {error && (
                <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 flex gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}

            <div className="mb-6 rounded-lg bg-purple-50 border border-purple-200 p-4 flex gap-3">
                <Palette className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-purple-700">
                    <p className="font-semibold mb-1">Artist Account Benefits:</p>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Upload and manage your artworks</li>
                        <li>Set prices and print options</li>
                        <li>Track orders for your artwork</li>
                        <li>Manage fulfillment and delivery</li>
                    </ul>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                        Full Name
                    </label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Doe"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all"
                        required
                        minLength={2}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                        Email Address
                    </label>
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="artist@example.com"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                        Password
                    </label>
                    <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="••••••••"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all"
                        required
                        minLength={8}
                    />
                    <PasswordStrengthIndicator password={formData.password} />
                    <p className="text-xs text-gray-500 mt-1">Must contain uppercase, lowercase, number, and be at least 8 characters</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                        Confirm Password
                    </label>
                    <input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        placeholder="••••••••"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold py-3 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? "Creating Account..." : "Create Artist Account"}
                </button>
            </form>

            <div className="mt-6 space-y-3">
                <p className="text-center text-gray-600 text-sm">
                    Already have an account?{" "}
                    <Link href="/auth/login" className="text-purple-600 hover:text-purple-700 font-medium">
                        Sign In
                    </Link>
                </p>
                <p className="text-center text-gray-600 text-sm">
                    Want to buy art instead?{" "}
                    <Link href="/auth/register" className="text-teal-600 hover:text-teal-700 font-medium">
                        Sign up as a Buyer
                    </Link>
                </p>
            </div>
        </AuthLayout>
    );
}
