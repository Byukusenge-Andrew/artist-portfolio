import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { z } from "zod";

const updateSchema = z.object({
  status: z.enum(["PENDING", "PAID", "FULFILLED", "CANCELED"]),
});

import { getCurrentUser } from "@/lib/authorization";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            artwork: true,
            printOption: true
          }
        }
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const user = await getCurrentUser(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check access permissions
    let hasAccess = false;

    if (user.role === "ADMIN") {
      hasAccess = true; // Admins can view all (read-only)
    } else if (user.role === "USER" && order.userId === user.userId) {
      hasAccess = true; // Buyer can view their own order
    } else if (user.role === "ARTIST") {
      // Artist can view if order has their artwork
      hasAccess = order.items.some(item => item.artwork?.uploadedBy === user.userId);
    }

    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Failed to fetch order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies();
  const user = await getCurrentUser(req as any);

  // Only artists can update orders (for fulfillment)
  // Admins are read-only, buyers cannot update
  if (!user || user.role !== "ARTIST") {
    return NextResponse.json(
      { error: "Only artists can update orders" },
      { status: 403 }
    );
  }

  try {
    const { id } = await params;

    // Verify artist owns artwork in this order
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            artwork: true
          }
        }
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const hasArtwork = order.items.some(item => item.artwork?.uploadedBy === user.userId);

    if (!hasArtwork) {
      return NextResponse.json(
        { error: "You can only update orders containing your artworks" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validated = updateSchema.parse(body);

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status: validated.status },
      include: { items: true },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Failed to update order:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}
