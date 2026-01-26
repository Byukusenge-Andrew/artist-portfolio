import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateResetToken } from "@/lib/auth";
import { z } from "zod";

const forgotPasswordSchema = z.object({
    email: z.string().email("Invalid email"),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const validation = forgotPasswordSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: "Invalid email" },
                { status: 400 }
            );
        }

        const { email } = validation.data;

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
        });

        // Always return success to prevent email enumeration
        if (!user) {
            return NextResponse.json(
                { message: "If an account exists with this email, a password reset link has been sent" },
                { status: 200 }
            );
        }

        // Generate reset token
        const resetToken = generateResetToken();
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

        // Save token to database
        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetToken,
                resetTokenExpiry,
            },
        });

        // In production, send email with reset link
        // For now, return token in response (for testing)
        const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/reset-password/${resetToken}`;

        console.log("Password reset link:", resetUrl);

        // TODO: Send email with reset link
        // await sendPasswordResetEmail(user.email, resetUrl);

        return NextResponse.json(
            {
                message: "If an account exists with this email, a password reset link has been sent",
                // Remove this in production:
                resetUrl: process.env.NODE_ENV === "development" ? resetUrl : undefined,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Forgot password error:", error);
        return NextResponse.json(
            { error: "Failed to process request" },
            { status: 500 }
        );
    }
}
