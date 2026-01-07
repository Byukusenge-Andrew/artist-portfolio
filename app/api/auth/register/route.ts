import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword, serializeUserSession } from "@/lib/auth";
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
        { error: validation.error.errors[0].message },
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

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashPassword(password),
        name,
        role: "USER",
      },
    });

    // Create session
    const session = serializeUserSession({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const res = NextResponse.json(
      { message: "Account created successfully" },
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
