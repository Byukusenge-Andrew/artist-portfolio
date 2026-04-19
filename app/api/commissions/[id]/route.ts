import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { z } from "zod";

const updateSchema = z.object({
  status: z.enum(["NEW", "IN_REVIEW", "INVOICE_SENT", "PAID", "REJECTED"]),
});

import { getCurrentUser } from "@/lib/authorization";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const commission = await prisma.commissionRequest.findUnique({
      where: { id },
    });

    if (!commission) {
      return NextResponse.json(
        { error: "Commission not found" },
        { status: 404 }
      );
    }

    const user = await getCurrentUser(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check access permissions
    // Users can only view their own commissions (matched by email)
    // Admins can view all
    if (user.role !== "ADMIN" && commission.email !== user.email) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(commission);
  } catch (error) {
    console.error("Failed to fetch commission:", error);
    return NextResponse.json(
      { error: "Failed to fetch commission" },
      { status: 500 }
    );
  }
}

import { sendCommissionStatusUpdateEmail } from "@/lib/email";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser(req as any);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const commission = await prisma.commissionRequest.findUnique({
      where: { id },
    });

    if (!commission) {
      return NextResponse.json({ error: "Commission not found" }, { status: 404 });
    }

    // Admins can update any commission; Artists can only update their own
    if (user.role !== "ADMIN" && (user.role !== "ARTIST" || commission.artistId !== user.userId)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const validated = updateSchema.parse(body);

    const updatedCommission = await prisma.commissionRequest.update({
      where: { id },
      data: { status: validated.status },
    });

    // Send email notification to client if status actually changed
    if (commission.status !== validated.status) {
      sendCommissionStatusUpdateEmail(
        updatedCommission.email,
        updatedCommission.name,
        updatedCommission.status
      ).catch((err) => console.error("Failed to send commission status update email:", err));
    }

    return NextResponse.json(updatedCommission);
  } catch (error) {
    console.error("Failed to update commission:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update commission" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser(req as any);

  // Only admins can delete commissions
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.commissionRequest.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete commission:", error);
    return NextResponse.json(
      { error: "Failed to delete commission" },
      { status: 500 }
    );
  }
}
