import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { parseUserSession } from "@/lib/auth";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("user_session")?.value;

    const session = parseUserSession(sessionCookie);

    if (!session) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({ user: session });
  } catch (error) {
    console.error("Session error:", error);
    return NextResponse.json({ user: null });
  }
}
