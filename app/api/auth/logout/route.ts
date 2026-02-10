import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const url = new URL("/", req.url);
  const res = NextResponse.redirect(url);

  // Clear the cookie
  res.cookies.delete("user_session");

  return res;
}
