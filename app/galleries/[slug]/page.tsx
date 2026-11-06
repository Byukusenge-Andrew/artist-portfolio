import { redirect } from "next/navigation";

export default async function GallerySlugRedirect(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  redirect(`/site/galleries/${slug}`);
}

