import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

import { getCurrentUser } from "@/lib/authorization";
import { sendOrderStatusUpdateEmail } from "@/lib/email";


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
      hasAccess = true;
    } else if (user.role === "USER" && (order.userId === user.userId || order.email === user.email)) {
      hasAccess = true;
    } else if (user.role === "ARTIST") {
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
  const user = await getCurrentUser(req as any);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: { artwork: true }
        }
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const body = await req.json();

    // ── ARTIST: can mark a PAID order as PENDING_DELIVERY (shipped/ready) ──
    if (user.role === "ARTIST") {
      const hasArtwork = order.items.some(item => item.artwork?.uploadedBy === user.userId);

      if (!hasArtwork) {
        return NextResponse.json(
          { error: "You can only update orders containing your artworks" },
          { status: 403 }
        );
      }

      if (body.status !== "PENDING_DELIVERY") {
        return NextResponse.json(
          { error: "Artists can only mark orders as 'PENDING_DELIVERY' (shipped/ready for pickup)" },
          { status: 400 }
        );
      }

      if (!["PAID", "PENDING"].includes(order.status)) {
        return NextResponse.json(
          { error: "Only PENDING or PAID orders can be marked as shipped" },
          { status: 400 }
        );
      }

      const updated = await prisma.order.update({
        where: { id },
        data: { status: "PENDING_DELIVERY" as any },
        include: { items: true },
      });

      if (updated.status !== order.status) {
        sendOrderStatusUpdateEmail(
          updated.email,
          updated.customerName || "Customer",
          updated.id,
          updated.status
        ).catch((err) => console.error("Failed to send order status email:", err));
      }

      return NextResponse.json(updated);

    }

    // ── USER: can confirm receipt once artist has marked as PENDING_DELIVERY ──
    if (user.role === "USER") {
      const isOwner = order.userId === user.userId || order.email === user.email;

      if (!isOwner) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      if (body.status !== "FULFILLED") {
        return NextResponse.json(
          { error: "You can only confirm receipt (FULFILLED) on your orders" },
          { status: 400 }
        );
      }

      if ((order.status as any) !== "PENDING_DELIVERY") {
        return NextResponse.json(
          { error: "Order must be marked as shipped by the artist before you can confirm receipt" },
          { status: 400 }
        );
      }

      const updated = await prisma.order.update({
        where: { id },
        data: { status: "FULFILLED" },
        include: { items: true },
      });

      if (updated.status !== order.status) {
        sendOrderStatusUpdateEmail(
          updated.email,
          updated.customerName || "Customer",
          updated.id,
          updated.status
        ).catch((err) => console.error("Failed to send order status email:", err));
      }

      return NextResponse.json(updated);

    }

    // ── ADMIN: can set any status ──
    if (user.role === "ADMIN") {
      const schema = z.object({
        status: z.enum(["PENDING", "PAID", "PENDING_DELIVERY", "FULFILLED", "CANCELED"]),
      });
      const validated = schema.parse(body);

      const updated = await prisma.order.update({
        where: { id },
        data: { status: validated.status as any },
        include: { items: true },
      });

      if (updated.status !== order.status) {
        sendOrderStatusUpdateEmail(
          updated.email,
          updated.customerName || "Customer",
          updated.id,
          updated.status
        ).catch((err) => console.error("Failed to send order status email:", err));
      }

      return NextResponse.json(updated);

    }

    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  } catch (error) {
    console.error("Failed to update order:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}
