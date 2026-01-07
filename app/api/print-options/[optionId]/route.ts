import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  priceCents: z.number().int().positive().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: { optionId: string } }
) {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("admin_session")?.value === "1";

  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = updateSchema.parse(body);

    const option = await prisma.printOption.update({
      where: { id: params.optionId },
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
  { params }: { params: { optionId: string } }
) {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("admin_session")?.value === "1";

  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.printOption.delete({
      where: { id: params.optionId },
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
