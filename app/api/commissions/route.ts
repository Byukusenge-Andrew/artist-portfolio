import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const commissionSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  details: z.string().min(10),
});

import { getCurrentUser } from "@/lib/authorization";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let whereClause = {};

    // Regular users can only see commissions with their email
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

    const commission = await prisma.commissionRequest.create({
      data: {
        name: validated.data.name,
        email: validated.data.email,
        details: validated.data.details,
        status: "NEW",
        artistId: validated.data.artistId || null,
      },
    });

    return NextResponse.json(commission, { status: 201 });
  } catch (error) {
    console.error("Failed to create commission:", error);
    return NextResponse.json(
      { error: "Failed to create commission request" },
      { status: 500 }
    );
  }
}
