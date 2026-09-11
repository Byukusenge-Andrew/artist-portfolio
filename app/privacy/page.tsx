import type { Metadata } from "next";
import Link from "next/link";
import { Shield, Lock, Eye, FileText, Database, UserCheck, ArrowLeft, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how Artelier collects, protects, and handles your personal information and artistic data.",
};

export default function PrivacyPage() {
  const lastUpdated = "September 2026";

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50/30 via-white to-emerald-50/20 dark:from-[#0f0f12] dark:via-[#141418] dark:to-[#0f0f12] py-12 sm:py-16 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-teal-700 dark:text-teal-400 hover:underline mb-8"
        >
          <ArrowLeft className="size-4" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="bg-white dark:bg-[#1a1a24] rounded-2xl p-8 sm:p-10 border border-teal-100 dark:border-gray-800 shadow-sm mb-8 transition-colors">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100/70 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 text-xs font-semibold uppercase tracking-wider mb-4">
            <Shield className="size-3.5" />
            Your Privacy Matters
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            Last updated: {lastUpdated}
          </p>
          <p className="mt-4 text-base text-gray-600 dark:text-gray-300 leading-relaxed">
            At Artelier, we respect your privacy and are committed to protecting the personal information you share with us. This policy outlines what data we collect, how it is used, and how we safeguard your information across our artwork marketplace and portfolio platform.
          </p>
        </div>

        {/* Content Sections */}
        <div className="bg-white dark:bg-[#1a1a24] rounded-2xl p-8 sm:p-10 border border-teal-100 dark:border-gray-800 shadow-sm space-y-10 transition-colors text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-teal-100/70 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400">
                <Database className="size-5" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                1. Information We Collect
              </h2>
            </div>
            <p>We may collect information when you use our services, create an account, purchase artwork, or commission custom pieces:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-gray-600 dark:text-gray-400">
              <li><strong>Account details:</strong> Your name, email address, password hash, and profile details (bio, avatar, artist moniker).</li>
              <li><strong>Transaction & Shipping data:</strong> Shipping address, recipient name, purchase history, and order fulfillment status.</li>
              <li><strong>Commission requests:</strong> Project requirements, reference images, and communication records between clients and artists.</li>
              <li><strong>Usage details:</strong> Browser session information, favorited artworks, and interaction analytics.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-teal-100/70 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400">
                <Eye className="size-5" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                2. How We Use Your Information
              </h2>
            </div>
            <p>We use the collected information for the following legitimate purposes:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-gray-600 dark:text-gray-400">
              <li>To provide, operate, and maintain the Artelier platform.</li>
              <li>To process artwork orders, print fulfillment, and commission deliverables.</li>
              <li>To enable authenticated accounts, personalized favorites, and order histories.</li>
              <li>To detect fraudulent activity, security issues, or unauthorized access.</li>
              <li>To communicate service notifications, order status updates, and support responses.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-teal-100/70 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400">
                <Lock className="size-5" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                3. Security & Data Protection
              </h2>
            </div>
            <p>
              We prioritize data safety and employ industry-standard encryption protocols (HTTPS/SSL), salted password hashing (bcrypt), JSON Web Tokens (JWT) with HTTP-only cookies, and Row Level Security for storage assets. We never sell or lease your personal information to third-party advertisers.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-teal-100/70 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400">
                <UserCheck className="size-5" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                4. Your Rights & Control
              </h2>
            </div>
            <p>
              You maintain full rights to access, update, or request the deletion of your account profile and uploaded content. You can manage your favorites, profile data, and contact preferences directly inside your account settings.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-teal-100/70 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400">
                <FileText className="size-5" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                5. Cookies & Local Storage
              </h2>
            </div>
            <p>
              Artelier utilizes essential cookies to maintain secure login sessions and browser local storage for guest favorite items and theme preferences (light/dark mode). You can configure your browser to reject cookies, though some platform features may become unavailable.
            </p>
          </section>

          {/* Contact Box */}
          <div className="p-6 rounded-xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Questions regarding our Privacy Policy?
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Reach out to our compliance and support team anytime.
              </p>
            </div>
            <Link
              href="/contact"
              className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs whitespace-nowrap transition-colors inline-flex items-center gap-2"
            >
              <Mail className="size-3.5" />
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
