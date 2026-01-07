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
    const validated = commissionSchema.safeParse(body);
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
