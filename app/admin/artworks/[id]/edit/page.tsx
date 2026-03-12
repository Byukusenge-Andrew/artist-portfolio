import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUserSession } from "@/lib/authorization";
import ArtworkForm from "@/components/ArtworkForm";
import type { ArtworkFormValues } from "@/components/ArtworkForm";

export default async function EditArtworkPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: artworkId } = await params;
    const user = await getCurrentUserSession();
    if (!user) return redirect("/auth/login?redirect=/admin/artworks");

    const artwork = await prisma.artwork.findUnique({
        where: { id: artworkId },
        include: { printOptions: true },
    });

    if (!artwork) return notFound();

    // Permission check: Admin or the Uploader
    const isOwner = artwork.uploadedBy === user.userId;
    const isAdmin = user.role === "ADMIN";

    if (!isAdmin && !isOwner) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-10">
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
                    You do not have permission to edit this artwork.
                </div>
            </div>
        );
    }

    // Transform data to match form schema
    const initialValues: ArtworkFormValues = {
        title: artwork.title,
        slug: artwork.slug,
        description: artwork.description || "",
        imageUrl: artwork.imageUrl,
        imagePublicId: artwork.imagePublicId,
        isOriginalAvailable: artwork.isOriginalAvailable,
        originalPrice: artwork.originalPrice || undefined,
        printEnabled: artwork.printEnabled,
        // Note: tags are not in form schema yet per previous file content, but are in db.
        // If we want to edit tags, we need to update ArtworkForm.
        // For now, we stick to the existing schema.
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-10">
            <h1 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-gray-100">Edit Artwork</h1>
            <ArtworkForm
                initialValues={initialValues}
                artworkId={artwork.id}
                isEditing
            />
        </div>
    );
}
