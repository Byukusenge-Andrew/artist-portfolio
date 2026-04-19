import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateResetToken } from "@/lib/auth";
import { sendPasswordResetEmail } from "@/lib/email";
import { z } from "zod";

const forgotPasswordSchema = z.object({
    email: z.string().email("Invalid email"),
});

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email }
 *     responses:
 *       200:
 *         description: Password reset link sent successfully
 *       400:
 *         description: Validation error
 */

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

        // Send password reset email (non-blocking)
        sendPasswordResetEmail(
            user.email,
            user.name || "there",
            resetToken
        ).catch((err) => console.error("Failed to send reset email:", err));

        return NextResponse.json(
            { message: "If an account exists with this email, a password reset link has been sent" },
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
