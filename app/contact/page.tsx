import type { Metadata } from "next";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Have questions, feedback, or want to collaborate? Get in touch with the Artelier team or reach out to our featured artists.",
};

export default function ContactPage() {
  return <ContactClient />;
}
