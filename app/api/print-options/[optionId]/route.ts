import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  priceCents: z.number().int().positive().optional(),
});

import { getCurrentUser } from "@/lib/authorization";

// ... existing imports

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ optionId: string }> }
) {
  const { optionId } = await params;
  const user = await getCurrentUser(req as any);
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = updateSchema.parse(body);

    const option = await prisma.printOption.update({
      where: { id: optionId },
      data: {
        ...(validated.name && { name: validated.name }),
        ...(validated.priceCents && { priceCents: validated.priceCents }),
      },
    });

    return NextResponse.json(option);
  } catch (error) {
    console.error("Failed to update print option:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update print option" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ optionId: string }> }
) {
  const { optionId } = await params;
  const user = await getCurrentUser(req as any);
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.printOption.delete({
      where: { id: optionId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete print option:", error);
    return NextResponse.json(
      { error: "Failed to delete print option" },
      { status: 500 }
    );
  }
}
