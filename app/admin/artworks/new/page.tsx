"use client";
import ArtworkForm from "@/components/ArtworkForm";

export default function NewArtworkPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-6">New Artwork</h1>
      <ArtworkForm />
    </div>
  );
}


