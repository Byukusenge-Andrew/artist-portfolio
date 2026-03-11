import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import { getCurrentUser } from "@/lib/authorization";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let whereClause = {};

    if (user.role === "USER") {
      // Buyers: match by userId OR email (for guest/email-placed orders)
      whereClause = {
        OR: [
          { userId: user.userId },
          { email: user.email },
        ]
      };
    } else if (user.role === "ARTIST") {
      // Artists: orders containing their artworks
      whereClause = {
        items: {
          some: {
            artwork: { uploadedBy: user.userId }
          }
        }
      };
    }
    // ADMIN: no filter (sees all orders)

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        items: {
          include: {
            artwork: true,
            printOption: true
          }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
