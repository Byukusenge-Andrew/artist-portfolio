import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const orderRequestSchema = z.object({
    items: z.array(
        z.object({
            productType: z.enum(["ORIGINAL", "PRINT", "COMMISSION"]),
            artworkId: z.string().optional(),
            printOptionId: z.string().optional(),
            quantity: z.number().int().min(1),
            titleSnapshot: z.string(),
            imageUrlSnapshot: z.string(),
            unitPriceCents: z.number().int().min(0),
        })
    ).min(1),
    customerName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
    address: z.string().min(1),
    notes: z.string().optional(),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const validated = orderRequestSchema.parse(body);

        // Calculate total
        const totalCents = validated.items.reduce(
            (sum, item) => sum + item.unitPriceCents * item.quantity,
            0
        );

        // Create order
        const order = await prisma.order.create({
            data: {
                email: validated.email,
                customerName: validated.customerName,
                status: "PENDING",
                currency: "RWF",
                totalCents,
                items: {
                    createMany: {
                        data: validated.items.map((item) => ({
                            productType: item.productType,
                            artworkId: item.artworkId,
                            printOptionId: item.printOptionId,
                            quantity: item.quantity,
                            titleSnapshot: item.titleSnapshot,
                            imageUrlSnapshot: item.imageUrlSnapshot,
                            unitPriceCents: item.unitPriceCents,
                        })),
                    },
                },
            },
            include: {
                items: true,
            },
        });

        // TODO: Send confirmation email to customer
        // TODO: Send notification email to admin

        return NextResponse.json({
            success: true,
            orderId: order.id,
            message: "Order request submitted successfully",
        });
    } catch (error) {
        console.error("Order request error:", error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid request data", details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Failed to submit order request" },
            { status: 500 }
        );
    }
}
