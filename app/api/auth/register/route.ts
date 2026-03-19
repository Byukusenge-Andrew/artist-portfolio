import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, validatePassword } from "@/lib/auth";
import { signToken } from "@/lib/jwt";
import { checkRateLimit } from "@/lib/rate-limit";
import { sendVerificationEmail } from "@/lib/email";
import { z } from "zod";
import crypto from "crypto";

const registerSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  name: z.string().min(2, "Name must be at least 2 characters"),
});

export async function POST(req: Request) {
  try {
    const rateLimitResult = await checkRateLimit(req, "register");
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
        { status: 429, headers: rateLimitResult.headers }
      );
    }

    const body = await req.json();

    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, password, confirmPassword, name } = validation.data;

    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Passwords don't match" }, { status: 400 });
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.errors.join(". ") },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);

    const requestedRole = body.role as "USER" | "ARTIST" | "ADMIN" | undefined;
    let role: "USER" | "ARTIST" | "ADMIN" = "USER";
    let isApproved = true;

    if (requestedRole === "ARTIST") {
      role = "ARTIST";
    } else if (requestedRole === "ADMIN") {
      role = "ADMIN";
      const existingAdminCount = await prisma.user.count({
        where: { role: "ADMIN", isApproved: true },
      });
      isApproved = existingAdminCount === 0;
    }

    // Generate email verification token
    const emailVerifyToken = crypto.randomBytes(32).toString("hex");

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
        isApproved,
        isEmailVerified: false,
        emailVerifyToken,
      },
    });

    // Send verification email (non-blocking)
    sendVerificationEmail(email, name, emailVerifyToken).catch((err) =>
      console.error("Failed to send verification email:", err)
    );

    if (role === "ADMIN" && !isApproved) {
      return NextResponse.json(
        { message: "Admin account created. Waiting for approval.", requiresApproval: true },
        { status: 201 }
      );
    }

    const sessionToken = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name || undefined,
    });

    const url = new URL(req.url);
    const redirectParam = url.searchParams.get("redirect");
    let defaultRedirect = "/user/dashboard";
    if (role === "ARTIST") defaultRedirect = "/artist/dashboard";
    else if (role === "ADMIN") defaultRedirect = "/admin/dashboard";

    const redirectUrl = redirectParam || defaultRedirect;

    const res = NextResponse.json(
      {
        message: "Account created! Please check your email to verify your account.",
        redirectUrl,
        requiresVerification: true,
      },
      { status: 201, headers: rateLimitResult.headers }
    );

    res.cookies.set("user_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return res;
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
