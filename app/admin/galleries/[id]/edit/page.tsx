import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUserSession } from "@/lib/authorization";
import GalleryEditorClient from "./GalleryEditorClient";

interface EditGalleryPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditGalleryPage(props: EditGalleryPageProps) {
  const { id } = await props.params;

  const user = await getCurrentUserSession();
  if (!user || user.role !== "ADMIN") {
    redirect("/auth/login?redirect=/admin/galleries");
  }

  const [gallery, allArtworks] = await Promise.all([
    prisma.gallery.findUnique({
      where: { id },
      include: {
        artworks: {
          include: {
            artwork: {
              select: {
                id: true,
                title: true,
                slug: true,
                imageUrl: true,
                originalPrice: true,
              },
            },
          },
        },
      },
    }),
    prisma.artwork.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        imageUrl: true,
        originalPrice: true,
      },
    }),
  ]);

  if (!gallery) {
    notFound();
  }

  return <GalleryEditorClient gallery={gallery} allArtworks={allArtworks} />;
}

