import Stripe from "stripe";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const cartSchema = z.object({
  currency: z.string().default("usd"),
  items: z.array(
    z.object({
      productType: z.enum(["ORIGINAL", "PRINT", "COMMISSION"]),
      artworkId: z.string().optional(),
      printOptionId: z.string().optional(),
      quantity: z.number().int().min(1).default(1),
    })
  ),
});

export async function POST(req: Request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-12-18.acacia",
  });

  const json = await req.json();
  const parsed = cartSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { items, currency } = parsed.data;

  // Build order draft and Stripe line items
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  const orderItemsData: Parameters<typeof prisma.orderItem.createMany>[0]["data"] = [];

  for (const item of items) {
    if (item.productType === "COMMISSION") {
      // Placeholder commission product
      const unitPriceCents = 10000; // $100 deposit example
      lineItems.push({
        quantity: item.quantity,
        price_data: {
          currency,
          product_data: { name: "Commission Deposit" },
          unit_amount: unitPriceCents,
        },
      });
      orderItemsData.push({
        productType: "COMMISSION",
        quantity: item.quantity,
        titleSnapshot: "Commission Deposit",
        imageUrlSnapshot: "",
        unitPriceCents,
      });
    } else if (item.productType === "ORIGINAL") {
      const artwork = await prisma.artwork.findUnique({ where: { id: item.artworkId! } });
      if (!artwork || !artwork.originalPriceCents) {
        return NextResponse.json({ error: "Artwork not available" }, { status: 400 });
      }
      lineItems.push({
        quantity: item.quantity,
        price_data: {
          currency,
          product_data: { name: artwork.title, images: [artwork.imageUrl] },
          unit_amount: artwork.originalPriceCents,
        },
      });
      orderItemsData.push({
        productType: "ORIGINAL",
        quantity: item.quantity,
        artworkId: artwork.id,
        titleSnapshot: artwork.title,
        imageUrlSnapshot: artwork.imageUrl,
        unitPriceCents: artwork.originalPriceCents,
      });
    } else if (item.productType === "PRINT") {
      const print = await prisma.printOption.findUnique({ where: { id: item.printOptionId! }, include: { artwork: true } });
      if (!print) {
        return NextResponse.json({ error: "Print option not found" }, { status: 400 });
      }
      lineItems.push({
        quantity: item.quantity,
        price_data: {
          currency,
          product_data: { name: `${print.artwork.title} - ${print.name}`, images: [print.artwork.imageUrl] },
          unit_amount: print.priceCents,
        },
      });
      orderItemsData.push({
        productType: "PRINT",
        quantity: item.quantity,
        artworkId: print.artworkId,
        printOptionId: print.id,
        titleSnapshot: `${print.artwork.title} - ${print.name}`,
        imageUrlSnapshot: print.artwork.imageUrl,
        unitPriceCents: print.priceCents,
      });
    }
  }

  const order = await prisma.order.create({
    data: {
      currency,
      items: { createMany: { data: orderItemsData } },
    },
    include: { items: true },
  });

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: lineItems,
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/order/success?order=${order.id}`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/order/cancel?order=${order.id}`,
    metadata: { orderId: order.id },
  });

  return NextResponse.json({ checkoutUrl: session.url, orderId: order.id });
}


