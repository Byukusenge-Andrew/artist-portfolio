import type { Metadata } from "next";
import Link from "next/link";
import { Scale, CheckCircle2, AlertTriangle, Copyright, ShoppingBag, ShieldCheck, ArrowLeft, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Review the terms and conditions governing purchases, artistic rights, commissions, and platform usage on Artelier.",
};

export default function TermsPage() {
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
            <Scale className="size-3.5" />
            Terms of Service
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
            Terms & Conditions
          </h1>
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            Last updated: {lastUpdated}
          </p>
          <p className="mt-4 text-base text-gray-600 dark:text-gray-300 leading-relaxed">
            Welcome to Artelier. By accessing or using our platform, creating an account, or placing orders for original artworks and prints, you agree to comply with and be bound by the following Terms of Service.
          </p>
        </div>

        {/* Content Sections */}
        <div className="bg-white dark:bg-[#1a1a24] rounded-2xl p-8 sm:p-10 border border-teal-100 dark:border-gray-800 shadow-sm space-y-10 transition-colors text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-teal-100/70 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400">
                <ShieldCheck className="size-5" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                1. Platform Usage & Accounts
              </h2>
            </div>
            <p>
              Users must provide accurate, complete, and current information when registering on Artelier. You are responsible for safeguarding your password and account session. You agree not to disclose your password to any third party and to notify us immediately of any unauthorized access.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-teal-100/70 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400">
                <Copyright className="size-5" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                2. Intellectual Property & Artist Rights
              </h2>
            </div>
            <p>
              Artists retain all copyrights and moral rights to their original artworks, paintings, and digital illustrations. Purchasing an original piece or print grants the buyer ownership of the physical object, not the reproduction or commercial licensing rights, unless explicitly contracted in writing.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-gray-600 dark:text-gray-400">
              <li>No unauthorized commercial duplication or reselling of digital files.</li>
              <li>Artists guarantee that all uploaded works are original creations and do not infringe third-party trademarks.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-teal-100/70 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400">
                <ShoppingBag className="size-5" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                3. Artwork Orders, Pricing & Fulfillment
              </h2>
            </div>
            <p>
              All prices are displayed in the specified currency (e.g., RWF / USD) and include detailed product descriptions. Once an order is confirmed, the artist or studio prepares the piece for dispatch. Shipping times and tracking updates will be communicated through the customer portal and email.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-teal-100/70 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400">
                <CheckCircle2 className="size-5" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                4. Custom Commission Agreements
              </h2>
            </div>
            <p>
              Commission requests submitted through the platform constitute an agreement between the patron and the artist. Project milestones, payment schedules, and revisions are agreed upon prior to final artwork completion and delivery.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-teal-100/70 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400">
                <AlertTriangle className="size-5" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                5. Limitation of Liability & Termination
              </h2>
            </div>
            <p>
              Artelier provides the marketplace service &ldquo;as is&rdquo; without warranties of any kind. We reserve the right to suspend or terminate accounts that violate community safety rules, distribute copyrighted material without authorization, or engage in fraudulent activities.
            </p>
          </section>

          {/* Contact Box */}
          <div className="p-6 rounded-xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Have questions regarding our Terms?
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Reach out to our team for clarifications or legal inquiries.
              </p>
            </div>
            <Link
              href="/contact"
              className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs whitespace-nowrap transition-colors inline-flex items-center gap-2"
            >
              <Mail className="size-3.5" />
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
