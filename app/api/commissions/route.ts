import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getCurrentUser } from "@/lib/authorization";
import { sendCommissionRequestEmail } from "@/lib/email";

const commissionSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  details: z.string().min(10),
});

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let whereClause = {};

    if (user.role === "ADMIN") {
      whereClause = { artistId: null };
    } else if (user.role === "ARTIST") {
      whereClause = { artistId: user.userId };
    } else {
      whereClause = { email: user.email };
    }

    const commissions = await prisma.commissionRequest.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(commissions);
  } catch (error) {
    console.error("Failed to fetch commissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch commissions" },
      { status: 500 }
    );
  }
}

const postSchema = commissionSchema.extend({
  artistId: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = postSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, details, artistId } = validated.data;

    const commission = await prisma.commissionRequest.create({
      data: {
        name,
        email,
        details,
        status: "NEW",
        artistId: artistId || null,
      },
    });

    // If the commission was directed at a specific artist, notify them by email
    if (artistId) {
      const artist = await prisma.user.findUnique({
        where: { id: artistId },
        select: { email: true, name: true },
      });

      if (artist) {
        sendCommissionRequestEmail(
          artist.email,
          artist.name || "Artist",
          { name, email, details, id: commission.id }
        ).catch((err) => console.error("Failed to send commission email to artist:", err));
      }
    }

    return NextResponse.json(commission, { status: 201 });
  } catch (error) {
    console.error("Failed to create commission:", error);
    return NextResponse.json(
      { error: "Failed to create commission request" },
      { status: 500 }
    );
  }
}
