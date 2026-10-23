"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  Instagram,
  Send,
  MessageSquare,
  Sparkles,
  MapPin,
  Clock,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

export default function ContactClient() {
  const searchParams = useSearchParams();
  const querySubject = searchParams.get("subject") || "General Inquiry";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: querySubject,
    message: "",
  });

  useEffect(() => {
    const s = searchParams.get("subject");
    if (s) {
      setFormData((prev) => ({ ...prev, subject: s }));
    }
  }, [searchParams]);

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.details?.[0] || data.error || "Failed to send message");
      }

      toast.success("Thank you for reaching out! We will get back to you shortly.");
      setSubmitted(true);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred while sending your message";
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50/40 via-white to-emerald-50/20 dark:from-[#0f0f12] dark:via-[#141418] dark:to-[#0f0f12] py-12 sm:py-16 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-100/70 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="size-3.5" />
            Get In Touch
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
            We&apos;d Love to <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">Hear from You</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-gray-600 dark:text-gray-400">
            Have questions about an artwork, need help with an order, or interested in collaborating? Send us a message or connect through our channels.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12">
          {/* Contact Details & Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-[#1a1a24] rounded-2xl p-6 sm:p-8 border border-teal-100 dark:border-gray-800 shadow-sm space-y-6 transition-colors">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Contact Information
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Reach out directly via email or social channels for quick inquiries and updates.
              </p>

              <div className="space-y-4">
                <a
                  href="mailto:andrebyukusenge9@gmail.com"
                  className="flex items-start gap-4 p-3.5 rounded-xl hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors group"
                >
                  <div className="p-3 rounded-lg bg-teal-100/70 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 group-hover:scale-105 transition-transform flex-shrink-0">
                    <Mail className="size-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Email Us</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      andrebyukusenge9@gmail.com
                    </p>
                  </div>
                </a>

                <a
                  href="https://www.instagram.com/by_jam_23/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 p-3.5 rounded-xl hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors group"
                >
                  <div className="p-3 rounded-lg bg-pink-100/70 dark:bg-pink-900/40 text-pink-600 dark:text-pink-400 group-hover:scale-105 transition-transform flex-shrink-0">
                    <Instagram className="size-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Instagram</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      @by_jam_23
                    </p>
                  </div>
                </a>

                <div className="flex items-start gap-4 p-3.5 rounded-xl">
                  <div className="p-3 rounded-lg bg-emerald-100/70 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                    <Clock className="size-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Response Time</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      Within 24-48 hours
                    </p>
                  </div>
                </div>
              </div>

              {/* Commission Card Callout */}
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                <div className="p-4 rounded-xl bg-gradient-to-br from-teal-500/10 to-emerald-500/10 border border-teal-500/20">
                  <h3 className="text-sm font-semibold text-teal-800 dark:text-teal-300">
                    Looking for Custom Artwork?
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Commission custom paintings or original creations directly from our verified artists.
                  </p>
                  <Link
                    href="/site/commissions"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 dark:text-teal-400 hover:text-teal-700 mt-3 group"
                  >
                    Request a Commission
                    <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-7">
            <div className="bg-white dark:bg-[#1a1a24] rounded-2xl p-6 sm:p-10 border border-teal-100 dark:border-gray-800 shadow-sm transition-colors">
              {submitted ? (
                <div className="text-center py-12 space-y-4">
                  <div className="inline-flex p-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="size-12" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Message Received!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto text-sm">
                    Thank you for reaching out. We will review your inquiry and respond to{" "}
                    <span className="font-semibold text-gray-900 dark:text-gray-200">{formData.email}</span> as soon as possible.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: "", email: "", subject: "General Inquiry", message: "" });
                    }}
                    className="mt-4 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm transition-colors"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Send Us a Message
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Your Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Jane Doe"
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#141418] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-colors text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="jane@example.com"
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#141418] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-colors text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Subject
                    </label>
                    <select
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#141418] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-colors text-sm"
                    >
                      {!["General Inquiry", "Order & Shipping Question", "Artist Application", "Commission Support", "Partnership / Collaboration"].includes(formData.subject) && (
                        <option value={formData.subject}>{formData.subject}</option>
                      )}
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Order & Shipping Question">Order & Shipping Question</option>
                      <option value="Artist Application">Artist Application</option>
                      <option value="Commission Support">Commission Support</option>
                      <option value="Partnership / Collaboration">Partnership / Collaboration</option>
                    </select>

                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      rows={5}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="How can we help you today? Please provide as much detail as possible..."
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#141418] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-colors text-sm resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      "Sending..."
                    ) : (
                      <>
                        <Send className="size-4" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* FAQs Section */}
        <div className="mt-16 pt-12 border-t border-teal-100 dark:border-gray-800">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Quick answers to common questions about buying, shipping, and commissions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="p-6 rounded-2xl bg-white dark:bg-[#1a1a24] border border-gray-200/80 dark:border-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-base mb-2">
                How do original art purchases work?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                When you purchase an original artwork, the artist is notified immediately. Original pieces are carefully packaged with certificates of authenticity and shipped directly.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-[#1a1a24] border border-gray-200/80 dark:border-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-base mb-2">
                Can I request custom sizes for prints?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Yes! Check the print options on the artwork details page or reach out via our contact form for specialized print dimensions and museum-grade finishes.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-[#1a1a24] border border-gray-200/80 dark:border-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-base mb-2">
                How does commission pricing work?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Commission prices are agreed upon between the buyer and the artist based on medium, canvas dimensions, and detail complexity. Submit a request on our Commissions page to get started.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-[#1a1a24] border border-gray-200/80 dark:border-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-base mb-2">
                Are international deliveries supported?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Yes, our logistics network provides insured international shipping with tracked delivery for both original paintings and limited-edition prints.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
