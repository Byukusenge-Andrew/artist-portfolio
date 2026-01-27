import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, serializeUserSession, validatePassword } from "@/lib/auth";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  name: z.string().min(2, "Name must be at least 2 characters"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate schema
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, password, confirmPassword, name } = validation.data;

    // Check passwords match
    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords don't match" },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.errors.join(". ") },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    // Hash password (now async with bcrypt)
    const hashedPassword = await hashPassword(password);

    // Check if this is the first admin (auto-approve first admin)
    const isAdminSignup = body.role === "ADMIN";
    let isApproved = true; // Regular users are auto-approved

    if (isAdminSignup) {
      const existingAdminCount = await prisma.user.count({
        where: {
          role: "ADMIN",
          isApproved: true,
        },
      });
      isApproved = existingAdminCount === 0; // First admin is auto-approved
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: isAdminSignup ? "ADMIN" : "USER",
        isApproved,
      },
    });

    // If admin needs approval, don't create session
    if (isAdminSignup && !isApproved) {
      return NextResponse.json(
        {
          message: "Admin account created. Waiting for approval from an existing admin.",
          requiresApproval: true,
        },
        { status: 201 }
      );
    }

    // Create session
    const session = serializeUserSession({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name || undefined,
    });

    // Get redirect URL from query params
    const url = new URL(req.url);
    const redirectUrl = url.searchParams.get("redirect") || "/user/dashboard";

    const res = NextResponse.json(
      {
        message: "Account created successfully",
        redirectUrl,
      },
      { status: 201 }
    );

    res.cookies.set("user_session", session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return res;
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}
