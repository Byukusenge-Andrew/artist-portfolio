import type { Metadata } from "next";
import { Suspense } from "react";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Have questions, feedback, or want to collaborate? Get in touch with the Artelier team or reach out to our featured artists.",
};

export default function ContactPage() {
  return (
    <Suspense fallback={<div className="min-h-screen py-20 text-center text-sm text-gray-500">Loading contact...</div>}>
      <ContactClient />
    </Suspense>
  );
}

