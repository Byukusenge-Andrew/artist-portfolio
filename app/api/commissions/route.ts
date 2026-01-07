import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const commissionSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  details: z.string().min(10),
});

export async function GET() {
  try {
    const commissions = await prisma.commissionRequest.findMany({
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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = commissionSchema.parse(body);

    const commission = await prisma.commissionRequest.create({
      data: {
        name: validated.name,
        email: validated.email,
        details: validated.details,
        status: "NEW",
      },
    });

    return NextResponse.json(commission, { status: 201 });
  } catch (error) {
    console.error("Failed to create commission:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create commission request" },
      { status: 500 }
    );
  }
}
