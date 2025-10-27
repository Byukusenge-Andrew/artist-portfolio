import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const artistSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
  avatarPublicId: z.string().optional(),
  avatarUrl: z.string().url().optional(),
});

export async function POST(req: Request) {
  const json = await req.json();
  const parsed = artistSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const created = await prisma.artist.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      bio: data.bio,
      avatarPublicId: data.avatarPublicId,
      avatarUrl: data.avatarUrl,
    },
  });

  // Auto-login as admin by setting the session cookie
  const res = NextResponse.json(created, { status: 201 });
  res.cookies.set("admin_session", "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}

export async function GET() {
  const artists = await prisma.artist.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(artists);
}


