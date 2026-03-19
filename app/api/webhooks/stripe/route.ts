import Stripe from "stripe";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOrderConfirmationEmail, sendArtistOrderNotificationEmail } from "@/lib/email";

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!secret || !key) return NextResponse.json({ ok: true });

  const stripe = new Stripe(key, { apiVersion: "2025-07-30.basil" });
  const rawBody = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "no sig" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, secret);
  } catch {
    return NextResponse.json({ error: "invalid sig" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;

    if (orderId) {
      // Mark order as paid
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "PAID" },
      });

      // Fetch full order details for emails
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            include: {
              artwork: {
                include: {
                  uploader: { select: { id: true, email: true, name: true } },
                },
              },
            },
          },
        },
      });

      if (order) {
        // 1. Send order confirmation to the buyer (non-blocking)
        sendOrderConfirmationEmail({
          id: order.id,
          customerName: order.customerName,
          email: order.email,
          total: order.total,
          currency: order.currency,
          items: order.items.map((i) => ({
            titleSnapshot: i.titleSnapshot,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            productType: i.productType,
          })),
        }).catch((err) => console.error("Buyer email failed:", err));

        // 2. Group items by artist and notify each artist
        const artistItemsMap = new Map<
          string,
          { email: string; name: string; items: typeof order.items }
        >();

        for (const item of order.items) {
          const artist = item.artwork?.uploader;
          if (!artist) continue;

          if (!artistItemsMap.has(artist.id)) {
            artistItemsMap.set(artist.id, {
              email: artist.email,
              name: artist.name || "Artist",
              items: [],
            });
          }
          artistItemsMap.get(artist.id)!.items.push(item);
        }

        for (const [, artistData] of artistItemsMap) {
          sendArtistOrderNotificationEmail(
            artistData.email,
            artistData.name,
            order.id,
            artistData.items.map((i) => ({
              titleSnapshot: i.titleSnapshot,
              quantity: i.quantity,
              unitPrice: i.unitPrice,
              productType: i.productType,
              artworkTitle: i.titleSnapshot,
            })),
            order.currency
          ).catch((err) => console.error("Artist email failed:", err));
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
