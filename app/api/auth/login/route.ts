import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, serializeUserSession } from "@/lib/auth";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string(),
  rememberMe: z.boolean().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 400 }
      );
    }

    const { email, password, rememberMe } = validation.data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check if active
    if (!user.isActive) {
      return NextResponse.json(
        { error: "Account is inactive" },
        { status: 403 }
      );
    }

    // Verify password (now async with bcrypt)
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check if admin is approved
    if (user.role === "ADMIN" && !user.isApproved) {
      return NextResponse.json(
        { error: "Your admin account is pending approval. Please wait for an existing admin to approve your account." },
        { status: 403 }
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
        message: "Login successful",
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
        redirectUrl,
      },
      { status: 200 }
    );

    // Set cookie with appropriate expiration
    const maxAge = rememberMe
      ? 60 * 60 * 24 * 30  // 30 days if "Remember Me"
      : 60 * 60 * 24 * 7;  // 7 days otherwise

    res.cookies.set("user_session", session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge,
      path: "/",
    });

    return res;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    );
  }
}
