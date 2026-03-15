import { prisma } from "../prisma";

export type TopArtist = {
  id: string;
  name: string | null;
  avatarUrl: string | null;
  bio: string | null;
  _count: { profileLikes: number; uploadedArtworks: number };
  orderCount: number;
};

export async function getTopArtists(limit = 6): Promise<TopArtist[]> {
  const topArtistsMetrics = await prisma.$queryRaw<{ id: string; orderCount: bigint; profileLikes: bigint }[]>`
    SELECT 
      u.id,
      CAST((SELECT COUNT(*) FROM \`Like\` l WHERE l.artistId = u.id) AS SIGNED) as profileLikes,
      CAST(
        (
          SELECT COUNT(DISTINCT o.id) 
          FROM \`Order\` o
          JOIN OrderItem oi ON o.id = oi.orderId
          JOIN Artwork a ON oi.artworkId = a.id
          WHERE o.status IN ('PAID', 'FULFILLED') AND a.uploadedBy = u.id
        ) 
      AS SIGNED) as orderCount
    FROM User u
    WHERE u.role = 'ARTIST' AND u.isActive = true
    ORDER BY (orderCount + profileLikes) DESC
    LIMIT ${limit}
  `;

  const topArtistIds = topArtistsMetrics.map((m: { id: string }) => m.id);

  const artistUsers = topArtistIds.length > 0 ? await prisma.user.findMany({
    where: { id: { in: topArtistIds } },
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      bio: true,
      _count: { select: { profileLikes: true, uploadedArtworks: true } },
    },
  }) : [];

  return topArtistsMetrics
    .map((metric: { id: string; orderCount: bigint; profileLikes: bigint }) => {
      const user = artistUsers.find((u: { id: string }) => u.id === metric.id);
      if (!user) return null;
      return {
        ...user,
        orderCount: Number(metric.orderCount),
      };
    })
    .filter((a: TopArtist | null): a is TopArtist => a !== null);
}
